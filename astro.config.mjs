import { defineConfig, envField } from "astro/config";
import node from "@astrojs/node";
import preact from "@astrojs/preact";

// https://astro.build/config
export default defineConfig({
  integrations: [preact()],
  output: "server",
  adapter: node({ mode: "standalone" }),
  prefetch: { prefetchAll: true, defaultStrategy: "viewport" },
  env: {
    schema: {
      USE_CMS: envField.boolean({
        default: false,
        optional: true,
        access: "public",
        context: "client",
      }),
      CMS_URL: envField.string({
        optional: true,
        access: "public",
        context: "client",
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
