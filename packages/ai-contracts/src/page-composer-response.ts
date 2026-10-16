import { z } from "zod";
import { ApprovedComponent, clampAllowedComponents } from "./approved-components.js";
import { TableCell } from "./live-composer-response.js";

const AlertTone = z.enum(["neutral", "success", "warning", "danger"]);
const BadgeTone = z.enum(["neutral", "primary", "success", "warning", "danger"]);
const ButtonVariant = z.enum(["primary", "secondary", "ghost"]);

export const PageActionSchema = z.object({
  label: z.string(),
  variant: ButtonVariant.default("secondary")
});
export type PageAction = z.infer<typeof PageActionSchema>;

export const PageFieldSchema = z.object({
  label: z.string(),
  kind: z.enum(["input", "select", "textarea"]),
  placeholder: z.string().optional(),
  options: z.array(z.string()).optional(),
  rows: z.number().int().min(2).max(12).optional()
});
export type PageField = z.infer<typeof PageFieldSchema>;

export const PageMetricSchema = z.object({
  label: z.string(),
  value: z.string(),
  progress: z.number().min(0).max(100).optional()
});
export type PageMetric = z.infer<typeof PageMetricSchema>;

export const HeroSectionSchema = z.object({
  type: z.literal("hero"),
  eyebrow: z.string().optional(),
  title: z.string(),
  body: z.string(),
  actions: z.array(PageActionSchema).default([])
});

export const PageHeaderSectionSchema = z.object({
  type: z.literal("pageHeader"),
  eyebrow: z.string().optional(),
  title: z.string(),
  body: z.string().optional(),
  actions: z.array(PageActionSchema).default([])
});

export const FormSectionSchema = z.object({
  type: z.literal("form"),
  title: z.string().optional(),
  body: z.string().optional(),
  fields: z.array(PageFieldSchema),
  actions: z.array(PageActionSchema).default([])
});

export const CardGridSectionSchema = z.object({
  type: z.literal("cardGrid"),
  title: z.string().optional(),
  body: z.string().optional(),
  cards: z.array(z.object({
    title: z.string(),
    body: z.string(),
    badge: z.object({
      text: z.string(),
      tone: BadgeTone.default("neutral")
    }).optional(),
    action: PageActionSchema.optional()
  }))
});

export const StatsSectionSchema = z.object({
  type: z.literal("stats"),
  title: z.string().optional(),
  metrics: z.array(PageMetricSchema)
});

export const TableSectionSchema = z.object({
  type: z.literal("table"),
  title: z.string().optional(),
  body: z.string().optional(),
  columns: z.array(z.string()),
  rows: z.array(z.array(TableCell))
});

export const AlertSectionSchema = z.object({
  type: z.literal("alert"),
  tone: AlertTone,
  title: z.string(),
  body: z.string()
});

export const CtaSectionSchema = z.object({
  type: z.literal("cta"),
  title: z.string(),
  body: z.string(),
  actions: z.array(PageActionSchema).default([])
});

export const TabsSectionSchema = z.object({
  type: z.literal("tabs"),
  title: z.string().optional(),
  tabs: z.array(z.object({
    id: z.string(),
    label: z.string(),
    title: z.string(),
    body: z.string()
  })).min(1)
});

export const PageSectionSchema = z.discriminatedUnion("type", [
  HeroSectionSchema,
  PageHeaderSectionSchema,
  FormSectionSchema,
  CardGridSectionSchema,
  StatsSectionSchema,
  TableSectionSchema,
  AlertSectionSchema,
  CtaSectionSchema,
  TabsSectionSchema
]);
export type PageSection = z.infer<typeof PageSectionSchema>;

export const GeneratedPageSchema = z.object({
  sections: z.array(PageSectionSchema).min(1).max(12)
});
export type GeneratedPage = z.infer<typeof GeneratedPageSchema>;

export const PageComposerResponse = z.object({
  title: z.string(),
  summary: z.string(),
  components: z.array(ApprovedComponent),
  unsupported: z.array(z.string()).default([]),
  page: GeneratedPageSchema
});
export type PageComposerResponseBody = z.infer<typeof PageComposerResponse>;

export function parsePageComposerResponse(payload: unknown) {
  return PageComposerResponse.safeParse(repairPageComposerPayload(payload));
}

function repairPageComposerPayload(payload: unknown) {
  if (!isRecord(payload)) {
    return payload;
  }

  return {
    ...payload,
    components: clampAllowedComponents(payload.components)
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
