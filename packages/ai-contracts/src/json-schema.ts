import { z } from "zod";
import { LiveComposerResponse } from "./live-composer-response.js";

export const LiveComposerResponseJsonSchema = z.toJSONSchema(LiveComposerResponse, {
  target: "draft-2020-12"
});
