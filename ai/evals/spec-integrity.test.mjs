import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { approvedComponentNames } from "../../packages/ai-contracts/src/approved-components";

const root = new URL("../..", import.meta.url).pathname;
const specsRoot = path.join(root, "specs");
const skillsRoot = path.join(root, "ai", "skills");
const docsRoot = path.join(root, "docs");
const componentsRoot = path.join(root, "system", "components", "src");

const componentSpecLocations = {
  Alert: "specs/molecules/alert.md",
  Badge: "specs/atoms/badge.md",
  Button: "specs/atoms/button.md",
  Card: "specs/molecules/card.md",
  Input: "specs/atoms/input.md",
  Select: "specs/atoms/select.md",
  Table: "specs/molecules/table.md",
  Tabs: "specs/molecules/tabs.md",
  Textarea: "specs/atoms/textarea.md"
};

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
  it("keeps approved component contracts complete", async () => {
    const componentIndex = await readFile(path.join(componentsRoot, "index.ts"), "utf8");
    const missing = [];

    for (const component of approvedComponentNames) {
      const componentDir = path.join(componentsRoot, component);
      const requiredFiles = [
        `${component}.tsx`,
        `${component}.test.tsx`,
        `${component}.stories.tsx`,
        `${component}.ai.md`,
        "index.ts"
      ];

      for (const file of requiredFiles) {
        if (!existsSync(path.join(componentDir, file))) {
          missing.push(`${component}: missing system/components/src/${component}/${file}`);
        }
      }

      if (!componentSpecLocations[component]) {
        missing.push(`${component}: missing component spec mapping`);
      } else if (!existsSync(path.join(root, componentSpecLocations[component]))) {
        missing.push(`${component}: missing ${componentSpecLocations[component]}`);
      }

      if (!componentIndex.includes(`export * from "./${component}";`)) {
        missing.push(`${component}: missing barrel export`);
      }
    }

    expect(missing).toEqual([]);
  });

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
