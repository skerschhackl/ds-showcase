import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LiveComposerResponseJsonSchema } from "../dist/index.js";

const currentFile = fileURLToPath(import.meta.url);
const packageRoot = path.resolve(path.dirname(currentFile), "..");
const repoRoot = path.resolve(packageRoot, "..", "..");
const outputPath = path.join(repoRoot, "ai", "live-composer.schema.json");

await writeFile(outputPath, `${JSON.stringify(LiveComposerResponseJsonSchema, null, 2)}\n`);
console.log(`Wrote ${path.relative(repoRoot, outputPath)}`);
