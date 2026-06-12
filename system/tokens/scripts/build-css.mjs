import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tokensPath = path.join(packageRoot, "src", "tokens.json");
const outputPath = path.join(packageRoot, "src", "styles.css");
const tokens = JSON.parse(await fs.readFile(tokensPath, "utf8"));

const toKebab = (value) =>
  value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

const cssName = (parts) => `--ds-${parts.map(toKebab).join("-")}`;

const collectVars = (value, pathParts = []) => {
  if (typeof value === "string") {
    return [[cssName(pathParts), value]];
  }

  return Object.entries(value).flatMap(([key, child]) => collectVars(child, [...pathParts, key]));
};

const pushRule = (lines, selector, variables, indent = "") => {
  lines.push(`${indent}${selector} {`);
  for (const [name, value] of variables) {
    lines.push(`${indent}  ${name}: ${value};`);
  }
  lines.push(`${indent}}`);
};

const lines = [
  "/* This file is generated from src/tokens.json. Do not edit by hand. */",
];

const baseTokens = Object.fromEntries(Object.entries(tokens).filter(([group]) => group !== "theme"));
pushRule(lines, ":root", collectVars(baseTokens));

if (tokens.theme?.light) {
  lines.push("");
  pushRule(lines, ':root[data-theme="light"]', collectVars(tokens.theme.light));
}

if (tokens.theme?.dark) {
  const darkVars = collectVars(tokens.theme.dark);

  lines.push("");
  pushRule(lines, ':root[data-theme="dark"]', darkVars);
  lines.push("");
  lines.push("@media (prefers-color-scheme: dark) {");
  pushRule(lines, ':root:not([data-theme="light"])', darkVars, "  ");
  lines.push("}");
}

await fs.writeFile(outputPath, `${lines.join("\n")}\n`);
