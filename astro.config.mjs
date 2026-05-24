import { defineConfig, envField } from "astro/config";
import node from "@astrojs/node";
import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://biznagafest.com",
  integrations: [preact(), sitemap()],
  output: "server",
  adapter: node({ mode: "standalone" }),
  prefetch: { prefetchAll: true, defaultStrategy: "viewport" },
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    layout: "constrained",
  },
  env: {
    schema: {
      USE_CMS: envField.boolean({
        default: false,
        optional: true,
        access: "public",
        context: "server",
      }),
      CMS_URL: envField.string({
        optional: true,
        access: "public",
        context: "server",
        url: true,
      }),
      RESEND_API_KEY: envField.string({
        optional: false,
        access: "secret",
        context: "server",
      }),
    },
  },
});
