import { defineMiddleware } from "astro:middleware";
import { ensureFreshData, getData } from "./data/data";

const HTML_CACHE_SECONDS = 60;

export const onRequest = defineMiddleware(async (context, next) => {
  await ensureFreshData();
  context.locals.data = getData();
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
