# Showcase Generator Behavior

The local generator is a deterministic demo of governed UI generation. It should make prompt interpretation visible while rendering only approved design-system primitives.

It should:

- infer a broad screen kind from prompt keywords
- honor simple count intents like "4 roles", "5 rows", "3 plans", and "six tasks"
- honor page actions like export/download and row actions like "download per member"
- flag unsupported component requests instead of pretending they rendered
- report prompt fidelity gaps when requested behavior is not present in the generated screen

It should not:

- become a general-purpose natural language UI builder
- invent unsupported components
- hide mismatches between the prompt and rendered output

Keep broad generation quality checks in evals. Keep exact local generator behavior in unit tests.
