# Sample Eval Cases

## Good Output

Prompt: Generate a team management screen.

Expected traits:

- Uses `Input` for invite email and `Select` for role.
- Uses `Table` for members.
- Uses `Badge` with text labels for active, invited, and review states.
- Includes an access review affordance.
- Keeps actions as explicit labels such as `Send invite` or `Review access`.
- Includes prompt-specific terms in structured fields, rows, or actions rather than only in prose.
- Flags unsupported requests in `unsupported` while rendering only approved components.

## Bad Output

Prompt: Generate a billing settings page.

Failure traits:

- Uses custom status pills with hard-coded colors.
- Hides invoice actions behind unclear icon-only controls.
- Omits the billing email label.
- Uses marketing copy instead of operational labels.
- Claims token compliance without rendering token-bearing primitives.
- Lists an unsupported component, such as `Modal`, in the rendered `components` array.
- Returns a partial response that needs normalization repair to be usable.
