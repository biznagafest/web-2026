// Generates a subset of the Phosphor (regular) icon webfont containing only the
// glyphs actually referenced via `ph-*` classes in `src/`. The full font ships
// ~1,500 glyphs (~147 KB); the site uses a few dozen, so subsetting it cuts the
// served font to a few KB and removes it as a bandwidth competitor during page
// load.
//
// Run with `npm run subset:icons` whenever icons are added/removed.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import subsetFont from "subset-font";

const root = path.resolve(fileURLToPath(import.meta.url), "../..");
const cssPath = path.join(
  root,
  "node_modules/@phosphor-icons/web/src/regular/style.css",
);
const srcFontPath = path.join(
  root,
  "node_modules/@phosphor-icons/web/src/regular/Phosphor.woff2",
);
const outFontPath = path.join(root, "public/fonts/Phosphor.woff2");
const srcDir = path.join(root, "src");

// Build icon-class -> codepoint map from the Phosphor regular stylesheet.
const css = fs.readFileSync(cssPath, "utf8");
const codepointByClass = new Map(
  [...css.matchAll(/\.ph\.(ph-[a-z0-9-]+):before\s*\{\s*content:\s*"\\([0-9a-fA-F]+)"/g)].map(
    (m) => [m[1], parseInt(m[2], 16)],
  ),
);

// Scan src/ for used `ph-*` classes.
const used = new Set();
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(astro|tsx?|jsx?|mdx?|html)$/.test(entry.name)) {
      const text = fs.readFileSync(full, "utf8");
      for (const m of text.matchAll(/\bph-[a-z0-9-]+/g)) used.add(m[0]);
    }
  }
};
walk(srcDir);

const codepoints = [];
const missing = [];
for (const cls of used) {
  if (codepointByClass.has(cls)) codepoints.push(codepointByClass.get(cls));
  else missing.push(cls);
}
// `missing` includes weight modifiers like `ph-bold` that aren't glyphs; only
// warn for classes that look like icon names not found in the regular set.
const realMissing = missing.filter(
  (c) => !["ph-bold", "ph-fill", "ph-light", "ph-thin", "ph-duotone"].includes(c),
);
if (realMissing.length) {
  console.warn("Icons not found in Phosphor regular set:", realMissing.join(", "));
}

const text = String.fromCodePoint(...new Set(codepoints));
const buf = fs.readFileSync(srcFontPath);
const subset = await subsetFont(buf, text, { targetFormat: "woff2" });
fs.writeFileSync(outFontPath, subset);

console.log(
  `Subset Phosphor: ${codepoints.length} glyphs, ` +
    `${(buf.length / 1024).toFixed(1)} KB -> ${(subset.length / 1024).toFixed(1)} KB`,
);
