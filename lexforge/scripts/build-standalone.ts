/**
 * Builds LexForge as a static bundle (dist/standalone/index.html + app.js) that
 * runs without a server: same components, with next/link and next/navigation
 * swapped for an in-memory router. Used to publish the app as a hosted page.
 */
import { build } from "esbuild";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = join(__dirname, "..");
const out = join(root, "dist", "standalone");
mkdirSync(out, { recursive: true });

async function main() {
  await build({
    entryPoints: [join(root, "standalone", "main.tsx")],
    outfile: join(out, "app.js"),
    bundle: true,
    minify: true,
    format: "iife",
    target: "es2020",
    jsx: "automatic",
    define: { "process.env.NODE_ENV": '"production"' },
    alias: {
      "@": root,
      "next/link": join(root, "standalone", "next-link.tsx"),
      "next/navigation": join(root, "standalone", "next-navigation.ts"),
    },
    legalComments: "none",
    logLevel: "warning",
  });

  const cssIn = readFileSync(join(root, "app", "globals.css"), "utf8");
  const css = await postcss([tailwind({ base: root, optimize: { minify: true } })]).process(cssIn, { from: join(root, "app", "globals.css") });

  // The host wraps this in its own <html>/<head>/<body> skeleton.
  const html = `<title>LexForge</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;700&display=swap">
<style>${css.css}</style>
<div id="lexforge-root" class="min-h-dvh"></div>
<script src="app.js"></script>
`;
  writeFileSync(join(out, "index.html"), html);
  console.log(`standalone build → ${out}`);
}

void main();
