# Spinner AI Contract

Use `Spinner` for short in-progress states when an action is running.

## Props

- `label`: accessible loading label
- `size`: `sm` or `md`

## Rules

- Use Spinner inside a disabled Button for action progress.
- Use skeleton surfaces for larger loading regions.
- Do not use Spinner as decoration.

## AI Generation Notes

When a workflow is waiting for a model, network, save, retry, export, or generation request, show Spinner alongside action text.
