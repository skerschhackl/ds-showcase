# Organism: Prompt Composer

The prompt composer collects user intent and triggers UI generation.

## Required Structure

- Prompt textarea.
- Example prompt chips.
- Primary `Generate UI` button.
- Secondary reset action.
- Generation status text.
- Approved AI ambient control treatment on the prompt textarea through `.ds-ai-control`.

## AI Rules

- The current textarea value is the source for generation.
- Example chips should seed the prompt; they must not override the user prompt after editing unless selected by the user.
- The generate button must disable and show loading while generation is running.
- Loading should replace the button icon with a spinner.
- The generated preview should show a skeleton while generation is running.
- Use `.ds-ai-control` for the prompt textarea only.
- Keep generated preview panels as calm product UI.
- Keep AI ambient motion slow and stable; do not scale, pulse, shake, or move content.
- Do not apply AI ambient treatment to tables, alerts, form fields, standard cards, or dense admin UI.
- Respect reduced motion by showing a static gradient border.

## Related Files

- `apps/showcase/src/main.tsx`
- `system/components/src/Button/Button.ai.md`
- `system/components/src/Spinner/Spinner.ai.md`
