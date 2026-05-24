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

export const DATA: Data = USE_CMS
  ? validate(await getDataFromCms(), "cms")
  : validate(LOCALDATA, "local");

const REVALIDATE_MS = 60_000;
let lastRevalidatedAt = Date.now();
let inFlight: Promise<void> | null = null;

export async function ensureFreshData(): Promise<void> {
  if (!USE_CMS) return;
  if (Date.now() - lastRevalidatedAt < REVALIDATE_MS) return;
  if (inFlight) return inFlight;
  inFlight = (async () => {
    try {
      const fresh = validate(await getDataFromCms(), "cms");
      for (const key of Object.keys(DATA) as (keyof Data)[]) {
        delete (DATA as Record<string, unknown>)[key];
      }
      Object.assign(DATA, fresh);
      lastRevalidatedAt = Date.now();
    } catch (error) {
      // Keep serving the existing DATA snapshot — better stale than 500.
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
