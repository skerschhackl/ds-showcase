import { createComposerConfig, createComposerServer, loadComposerContext } from "./composerServer.mjs";

if (process.argv.includes("--check")) {
  await loadComposerContext();
  console.log("Composer server configuration is valid.");
  process.exit(0);
}

const context = await loadComposerContext();
const config = createComposerConfig();
const server = createComposerServer({ composerContext: context });

server.listen(config.port, config.host, () => {
  console.log(`AI composer listening on http://${config.host}:${config.port}`);
});
