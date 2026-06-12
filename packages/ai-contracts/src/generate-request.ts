import { z } from "zod";
import { clampAllowedComponents } from "./approved-components.js";

export const GenerateRequest = z.object({
  prompt: z.string().trim().min(1).max(4000),
  allowedComponents: z
    .array(z.string())
    .optional()
    .transform((components) => clampAllowedComponents(components))
});
export type GenerateRequestBody = z.infer<typeof GenerateRequest>;

export function parseGenerateRequest(payload: unknown) {
  return GenerateRequest.safeParse(payload);
}
