import { USE_CMS } from "astro:env/server";
import { getDataFromCms } from "./cms-data";
import { LOCALDATA } from "./local-data";
import { DataSchema, type Data } from "./data.schema";

function validate(input: unknown, source: "local" | "cms"): Data {
  const result = DataSchema.safeParse(input);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join(".") || "<root>"}: ${i.message}`)
      .join("; ");
    throw new Error(`[data] ${source} data failed validation: ${issues}`);
  }
  return result.data;
}

const REVALIDATE_MS = 60_000;

// Initial-load retry policy. A deploy can race the web ahead of the CMS coming
// up (both containers restarting together), so we retry briefly and then
// degrade to local data instead of throwing — a top-level throw here poisons
// the ESM module permanently and 500s every request until the next restart.
const INITIAL_RETRIES = 5;
const INITIAL_BACKOFF_MS = 1_000;
const INITIAL_BACKOFF_MAX_MS = 8_000;

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

async function loadInitialData(): Promise<{ data: Data; fromCms: boolean }> {
  if (!USE_CMS) return { data: validate(LOCALDATA, "local"), fromCms: false };

  for (let attempt = 1; attempt <= INITIAL_RETRIES; attempt++) {
    try {
      return { data: validate(await getDataFromCms(), "cms"), fromCms: true };
    } catch (error) {
      const isLast = attempt === INITIAL_RETRIES;
      console.error(
        `[data] CMS initial load failed (attempt ${attempt}/${INITIAL_RETRIES})` +
          (isLast ? ", falling back to local data:" : ", retrying:"),
        error,
      );
      if (isLast) break;
      await delay(
        Math.min(INITIAL_BACKOFF_MS * 2 ** (attempt - 1), INITIAL_BACKOFF_MAX_MS),
      );
    }
  }

  // CMS unreachable at boot — serve local now; ensureFreshData() upgrades to
  // CMS data automatically on the next request once the CMS recovers.
  return { data: validate(LOCALDATA, "local"), fromCms: false };
}

const initial = await loadInitialData();
let currentData: Data = initial.data;

// When we booted on local fallback, force the next request to revalidate
// immediately so we pick up the CMS as soon as it is healthy again.
let lastRevalidatedAt = initial.fromCms ? Date.now() : Date.now() - REVALIDATE_MS;
let inFlight: Promise<void> | null = null;

export function getData(): Data {
  return currentData;
}

export async function ensureFreshData(): Promise<void> {
  if (!USE_CMS) return;
  if (Date.now() - lastRevalidatedAt < REVALIDATE_MS) return;
  if (inFlight) return inFlight;
  inFlight = (async () => {
    try {
      currentData = validate(await getDataFromCms(), "cms");
      lastRevalidatedAt = Date.now();
    } catch (error) {
      // Keep serving the existing snapshot — better stale than 500.
      // Back off briefly so a flapping CMS does not hammer every request.
      lastRevalidatedAt = Date.now() - REVALIDATE_MS + 10_000;
      console.error(
        "[data] CMS revalidation failed, serving stale data:",
        error,
      );
    } finally {
      inFlight = null;
    }
  })();
  return inFlight;
}
