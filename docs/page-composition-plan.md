# V2 Page Composition Plan

The current generator proves that prompts can be converted into governed UI, but it renders every result through one fixed screen shape: alert, metrics, fields, table, and actions. That works for operational screens, but it collapses broader prompts such as "Generate a flight booking landing page" into a generic workflow.

V2 keeps the existing generated-screen path intact while adding a page-composition layer beside it. The goal is not unrestricted HTML generation. The goal is to compose varied product pages from approved design-system components and known section patterns.

## Target Architecture

```text
Prompt
  -> infer intent, sections, and likely components
  -> generate or repair a page schema
  -> render known section types
  -> review component usage and unsupported gaps
```

The page schema should describe a list of governed sections rather than one fixed screen template:

```ts
page: {
  sections: PageSection[];
}
```

Initial section types:

- `hero`
- `pageHeader`
- `form`
- `cardGrid`
- `stats`
- `table`
- `alert`
- `cta`
- `tabs`

Each section is rendered by the showcase through approved components such as Card, Button, Input, Select, Badge, Alert, Table, Tabs, and Textarea. Unknown section types should fail visibly and safely.

## Migration Strategy

1. Add V2 contracts beside the existing live composer response.
2. Add a `GeneratedPage` renderer beside the existing `GeneratedScreen` renderer.
3. Make the deterministic composer emit V2 page output for representative prompts first.
4. Keep the existing live composer path and fallback behavior while V2 stabilizes.
5. Add component and section retrieval before asking Ollama for V2 pages.
6. Promote stable layout primitives into `system/components` only after the section renderer proves which patterns are reusable.

## First Proof Prompts

- "Generate a flight booking landing page"
- "Generate a billing settings page"
- "Create a team management screen"
- "Build an analytics dashboard"
- "Design an onboarding checklist"
- "Create an empty state"

## Acceptance Criteria

- A flight booking prompt renders a recognizable landing page, not a workflow table.
- Existing V1 generated-screen contracts and tests continue to pass.
- Generated V2 output uses only approved components.
- Unsupported requested patterns remain visible as governed gaps.
- Live composer failures remain explicit rather than silently presenting fallback output as live output.
