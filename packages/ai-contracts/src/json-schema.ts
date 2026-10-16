import { z } from "zod";
import { LiveComposerResponse } from "./live-composer-response.js";
import { PageComposerResponse } from "./page-composer-response.js";

export const LiveComposerResponseJsonSchema = z.toJSONSchema(LiveComposerResponse, {
  target: "draft-2020-12"
});

export const PageComposerResponseJsonSchema = z.toJSONSchema(PageComposerResponse, {
  target: "draft-2020-12"
});
