import { defineMiddleware } from "astro:middleware";
import { ensureFreshData } from "./data/data";

const HTML_CACHE_SECONDS = 60;

export const onRequest = defineMiddleware(async (_context, next) => {
  await ensureFreshData();
  const response = await next();
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("text/html")) {
    response.headers.set(
      "Cache-Control",
      `public, max-age=${HTML_CACHE_SECONDS}`,
    );
  }
  return response;
});
