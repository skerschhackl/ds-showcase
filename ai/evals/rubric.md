# AI UI Output Evaluation Rubric

Score each area from 1 to 5.

| Area | 1 | 3 | 5 |
| --- | --- | --- | --- |
| Component usage | Invents custom patterns | Mixes approved and ad hoc components | Uses approved components throughout |
| Token compliance | Hard-coded styles dominate | Some token use | All visual decisions map to tokens |
| Accessibility | Missing labels or status text | Basic labels, some gaps | Labels, focus, status, and structure are clear |
| Layout quality | Hard to scan | Mostly organized | Dense, balanced, and responsive |
| Content clarity | Vague or decorative | Understandable | Specific, task-oriented, and concise |
| Drift risk | Breaks system language | Minor deviations | Reinforces system conventions |

## Automated Eval Expectations

The automated cases in `ai/evals/cases.json` are intentionally stricter than a shape check. They should prove that generated UI plans can be rendered through the governed component system.

- Contract validity: live composer responses are normalized with `packages/ai-contracts`; any repair diagnostic is treated as an eval finding.
- Component discipline: required approved components must appear, forbidden components must not appear in `components`, and unsupported requests must be listed in `unsupported`.
- Token evidence: evals infer token-bearing behavior from the rendered plan, including surfaces, borders, spacing, focusable controls, and status treatments.
- Accessibility evidence: fields need visible labels, status must be conveyed as text, tables need usable structure, and actions need explicit labels.
- Prompt fidelity: required prompt terms must appear in the normalized title, summary, fields, table content, status copy, or actions.
- Render safety: unsupported components may be acknowledged as gaps, but they must not appear as rendered components.

Do not satisfy evals by adding free-form claims like `"tokens": ["spacing"]` to model output. Prefer changing the screen plan so the evidence is present in the structured response itself.
