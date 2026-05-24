import { defineConfig, envField, fontProviders } from "astro/config";
import { loadEnv } from "vite";
import node from "@astrojs/node";
import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

const SITEMAP_EXCLUDED_PATTERNS = [
  /\/api(\/|$)/,
  /\/404\/?$/,
  /\/(speaker|host|organizer|staff|sponsor)\//,
];

const env = loadEnv(process.env.NODE_ENV ?? "development", process.cwd(), "");
const cmsRemotePattern = (() => {
  if (!env.CMS_URL) return null;
  try {
    const parsed = new URL(env.CMS_URL);
    return {
      protocol: parsed.protocol.replace(":", ""),
      hostname: parsed.hostname,
      port: parsed.port || undefined,
    };
  } catch {
    return null;
  }
})();

// https://astro.build/config
export default defineConfig({
  site: "https://biznagafest.com",
  integrations: [
    preact(),
    sitemap({
      filter: (page) =>
        !SITEMAP_EXCLUDED_PATTERNS.some((pattern) => pattern.test(page)),
    }),
  ],
  output: "server",
  adapter: node({ mode: "standalone" }),
  prefetch: { prefetchAll: true, defaultStrategy: "viewport" },
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    layout: "constrained",
    remotePatterns: cmsRemotePattern ? [cmsRemotePattern] : [],
  },
  fonts: [
    {
      name: "Inter",
      cssVariable: "--font-sans",
      provider: fontProviders.local(),
      options: {
        variants: [
          {
            weight: 400,
            style: "normal",
            src: [
              "./src/assets/fonts/Inter/Inter-400-latin.woff2",
              "./src/assets/fonts/Inter/Inter-400-latin-ext.woff2",
            ],
          },
          {
            weight: 500,
            style: "normal",
            src: [
              "./src/assets/fonts/Inter/Inter-500-latin.woff2",
              "./src/assets/fonts/Inter/Inter-500-latin-ext.woff2",
            ],
          },
          {
            weight: 600,
            style: "normal",
            src: [
              "./src/assets/fonts/Inter/Inter-600-latin.woff2",
              "./src/assets/fonts/Inter/Inter-600-latin-ext.woff2",
            ],
          },
          {
            weight: 700,
            style: "normal",
            src: [
              "./src/assets/fonts/Inter/Inter-700-latin.woff2",
              "./src/assets/fonts/Inter/Inter-700-latin-ext.woff2",
            ],
          },
        ],
      },
    },
    {
      name: "Rajdhani",
      cssVariable: "--font-heading",
      provider: fontProviders.local(),
      options: {
        variants: [
          {
            weight: 500,
            style: "normal",
            src: [
              "./src/assets/fonts/Rajdhani/Rajdhani-500-latin.woff2",
              "./src/assets/fonts/Rajdhani/Rajdhani-500-latin-ext.woff2",
            ],
          },
          {
            weight: 600,
            style: "normal",
            src: [
              "./src/assets/fonts/Rajdhani/Rajdhani-600-latin.woff2",
              "./src/assets/fonts/Rajdhani/Rajdhani-600-latin-ext.woff2",
            ],
          },
          {
            weight: 700,
            style: "normal",
            src: [
              "./src/assets/fonts/Rajdhani/Rajdhani-700-latin.woff2",
              "./src/assets/fonts/Rajdhani/Rajdhani-700-latin-ext.woff2",
            ],
          },
        ],
      },
    },
    {
      name: "Press Start 2P",
      cssVariable: "--font-display",
      provider: fontProviders.local(),
      options: {
        variants: [
          {
            weight: 400,
            style: "normal",
            src: [
              "./src/assets/fonts/PressStart2P/PressStart2P-400-latin.woff2",
              "./src/assets/fonts/PressStart2P/PressStart2P-400-latin-ext.woff2",
            ],
          },
        ],
      },
    },
  ],
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
