# Tabs AI Contract

Use `Tabs` for switching between sibling views of the same scope.

## Props

- `tabs`: array of `{ id, label }`
- `active`: active tab id
- `onChange`: selection handler
- `ariaLabel`: required accessible name for the tab group
- `getTabId`: optional tab id generator
- `getPanelId`: optional panel id generator

## Rules

- Tabs should not be used as primary site navigation.
- Keep tab labels short.
- Do not use Tabs if all content should be visible at once.
- Use a clear `ariaLabel`, such as `Billing sections` or `Report views`.
- Treat Tabs as true tabs that control tab panels. The tab buttons expose `id` and `aria-controls`; generated output must render the matching `tabpanel` with an id from the same panel id rule.
- The active panel should expose `role="tabpanel"` and `aria-labelledby` pointing back to the active tab.

## AI Generation Notes

When a prompt asks for views, segments, modes, or related panels, use Tabs only if the generated screen can maintain one active view.
