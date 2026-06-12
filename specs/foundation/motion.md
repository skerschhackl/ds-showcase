# Foundation: Motion

Motion should clarify state and give AI-assisted surfaces a quiet sense of liveliness. It must never make dense product UI feel unstable.

## Ambient AI Motion

- Use `.ds-ai-control` only for approved AI or creative prompt controls.
- Approved use for now: the prompt textarea only.
- Do not use AI ambient motion on tables, alerts, standard cards, ordinary form fields, or dense admin UI.
- Do not use AI ambient motion on generated preview panels or hero pipeline modules unless the pattern is reapproved.
- Keep the center content stable. Do not scale, pulse, shake, or move layout.
- The AI ambient border should keep a constant spatial band around the textarea and cycle color with `filter: hue-rotate()` over `var(--ds-motion-ai-ambient-duration)`.
- Do not animate border size, inset, angle, position, or layout. The motion should read as color change, not chasing, shrinking, expanding, or breathing.
- Respect `prefers-reduced-motion: reduce` by disabling animation and keeping a static gradient border.

## General Motion Rules

- Use motion to communicate state, not decoration.
- Keep loading spinners and skeletons calm.
- Do not use fast looping gradients, bouncing, shaking, or breathing scale effects.
- Do not animate layout dimensions for interactive product UI.

## Related Tokens

- `--ds-motion-ai-ambient-duration`
- `--ds-gradient-ai-border`
- `--ds-shadow-ai-glow`
