import { z } from "zod";
import { ApprovedComponent } from "./approved-components.js";

const AlertTone = z.enum(["neutral", "success", "warning", "danger"]);
const BadgeTone = z.enum(["neutral", "primary", "success", "warning", "danger"]);
const ButtonVariant = z.enum(["primary", "secondary", "ghost"]);

const AlertSchema = z.object({
  tone: AlertTone,
  title: z.string(),
  body: z.string()
});

const MetricSchema = z.object({
  label: z.string(),
  value: z.string(),
  progress: z.number().min(0).max(100).optional()
});

const FieldSchema = z.object({
  label: z.string(),
  kind: z.enum(["input", "select", "textarea"]),
  placeholder: z.string().optional(),
  options: z.array(z.string()).optional(),
  rows: z.number().int().min(2).max(12).optional()
});

const BadgeCellSchema = z.object({
  text: z.string(),
  tone: BadgeTone
});

const ActionCellSchema = z.object({
  action: z.string(),
  variant: ButtonVariant.optional()
});

export const TableCell = z.union([z.string(), z.number(), z.boolean(), BadgeCellSchema, ActionCellSchema]);
export type TableCellValue = z.infer<typeof TableCell>;

export const ScreenSchema = z.object({
  alert: AlertSchema,
  metrics: z.array(MetricSchema),
  fields: z.array(FieldSchema),
  table: z.object({
    columns: z.array(z.string()),
    rows: z.array(z.array(TableCell))
  }),
  primaryAction: z.string(),
  secondaryAction: z.string()
});
export type LiveComposerScreen = z.infer<typeof ScreenSchema>;

export const LiveComposerResponse = z.object({
  title: z.string(),
  summary: z.string(),
  components: z.array(ApprovedComponent),
  unsupported: z.array(z.string()).default([]),
  screen: ScreenSchema
});
export type LiveComposerResponseBody = z.infer<typeof LiveComposerResponse>;

export function parseLiveComposerResponse(payload: unknown) {
  return LiveComposerResponse.safeParse(payload);
}
