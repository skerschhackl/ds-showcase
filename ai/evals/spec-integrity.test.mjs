import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = new URL("../..", import.meta.url).pathname;
const specsRoot = path.join(root, "specs");
const skillsRoot = path.join(root, "ai", "skills");
const docsRoot = path.join(root, "docs");

async function markdownFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const fullPath = path.join(dir, entry.name);
      return entry.isDirectory() ? markdownFiles(fullPath) : fullPath.endsWith(".md") ? [fullPath] : [];
    })
  );

  return files.flat();
}

describe("AI-readable specs", () => {
  it("keeps component contract links valid", async () => {
    const files = await markdownFiles(specsRoot);
    const brokenLinks = [];

    for (const file of files) {
      const content = await readFile(file, "utf8");
      const links = content.match(/system\/components\/src\/[A-Z][A-Za-z]+\/[A-Z][A-Za-z]+\.ai\.md/g) ?? [];

      for (const link of links) {
        if (!existsSync(path.join(root, link))) {
          brokenLinks.push(`${path.relative(root, file)} -> ${link}`);
        }
      }
    }

    expect(brokenLinks).toEqual([]);
  });

  it("keeps skill source-rule references valid", async () => {
    const files = await markdownFiles(skillsRoot);
    const brokenLinks = [];

    for (const file of files) {
      const content = await readFile(file, "utf8");
      const links = content.match(/(?:specs|system)\/[A-Za-z0-9/*._/-]+\.md/g) ?? [];

      for (const link of links) {
        if (link.includes("*")) {
          continue;
        }

        if (!existsSync(path.join(root, link))) {
          brokenLinks.push(`${path.relative(root, file)} -> ${link}`);
        }
      }
    }

    expect(brokenLinks).toEqual([]);
  });

  it("keeps human documentation references valid", async () => {
    const files = await markdownFiles(docsRoot);
    const brokenLinks = [];

    for (const file of files) {
      const content = await readFile(file, "utf8");
      const links = content.match(/(?:ai|docs|packages|specs|system)\/[A-Za-z0-9/*._/-]+(?:\.js|\.json|\.md|\.ts)?/g) ?? [];

      for (const link of links) {
        if (link.includes("*")) {
          continue;
        }

        if (!existsSync(path.join(root, link))) {
          brokenLinks.push(`${path.relative(root, file)} -> ${link}`);
        }
      }
    }

    expect(brokenLinks).toEqual([]);
  });
});
