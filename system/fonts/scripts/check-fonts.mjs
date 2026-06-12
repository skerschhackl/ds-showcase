import { access } from "node:fs/promises";

const requiredFiles = [
  "src/styles.css",
  "src/fonts/Manrope.ttf",
  "src/fonts/HubotSans-Regular.woff2",
  "src/fonts/HubotSans-SemiBold.woff2",
  "src/fonts/HubotSans-ExtraBold.woff2",
  "src/fonts/LICENSE-Manrope.txt",
  "src/fonts/LICENSE-Hubot-Sans.txt"
];

await Promise.all(requiredFiles.map((file) => access(new URL(`../${file}`, import.meta.url))));
