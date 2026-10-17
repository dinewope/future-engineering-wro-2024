import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { validateContent } from "../lib/content/validate";

const root = join(__dirname, "..", "content");
const wordsDir = join(root, "words");

const files = readdirSync(wordsDir)
  .filter((f) => f.endsWith(".json"))
  .sort()
  .map((f) => ({ slug: f.replace(/\.json$/, ""), data: JSON.parse(readFileSync(join(wordsDir, f), "utf8")) as unknown }));
const roots = JSON.parse(readFileSync(join(root, "roots.json"), "utf8")) as unknown;

const report = validateContent(files, roots);
const verbose = process.argv.includes("--verbose");

const unverified = report.words.filter((w) => !w.verified).length;
const otherWarnings = report.warnings.filter((w) => !w.endsWith("not yet verified against a dictionary"));
if (verbose) for (const w of report.warnings) console.warn(`warn  ${w}`);
else for (const w of otherWarnings) console.warn(`warn  ${w}`);

for (const e of report.errors) console.error(`error ${e}`);

console.log(
  `\n${report.words.length} words in ${files.length} files, ${report.roots.length} roots — ` +
    `${report.errors.length} error(s), ${report.warnings.length} warning(s)` +
    (unverified ? ` (${unverified} definitions unverified; --verbose to list)` : ""),
);
if (report.errors.length) process.exit(1);
