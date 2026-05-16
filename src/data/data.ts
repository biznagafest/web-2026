import { USE_CMS } from "astro:env/client";
import { getDataFromCms } from "./cms-data";
import { LOCALDATA } from "./local-data";
import type { Data } from "./data.type";

export const DATA: Data = USE_CMS ? await getDataFromCms() : LOCALDATA;

const REVALIDATE_MS = 60_000;
let lastRevalidatedAt = Date.now();
let inFlight: Promise<void> | null = null;

export async function ensureFreshData(): Promise<void> {
  if (!USE_CMS) return;
  if (Date.now() - lastRevalidatedAt < REVALIDATE_MS) return;
  if (inFlight) return inFlight;
  inFlight = (async () => {
    try {
      const fresh = await getDataFromCms();
      for (const key of Object.keys(DATA) as (keyof Data)[]) {
        delete (DATA as Record<string, unknown>)[key];
      }
      Object.assign(DATA, fresh);
      lastRevalidatedAt = Date.now();
    } catch (error) {
      // Keep serving the existing DATA snapshot — better stale than 500.
      // Back off briefly so a flapping CMS does not hammer every request.
      lastRevalidatedAt = Date.now() - REVALIDATE_MS + 10_000;
      console.error("[data] CMS revalidation failed, serving stale data:", error);
    } finally {
      inFlight = null;
    }
  })();
  return inFlight;
}
