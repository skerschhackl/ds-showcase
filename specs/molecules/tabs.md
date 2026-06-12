# Molecule: Tabs

Use `Tabs` for switching between sibling views of the same scope.

## Approved Props

- `tabs`: array of `{ id, label }`
- `active`: active tab id
- `onChange`: selection handler
- `ariaLabel`: required accessible name for the tab group
- `getTabId`: optional tab id generator
- `getPanelId`: optional panel id generator

## AI Rules

- Tabs should not be used as primary site navigation.
- Keep tab labels short.
- Do not use Tabs if all content should be visible at once.
- Use Tabs for related panels, modes, or scoped views.
- Use a clear `ariaLabel`, such as `Billing sections` or `Report views`.
- Tabs are true tabs, not segmented buttons. Generated screens must render a matching `tabpanel` with an id that matches each tab's `aria-controls`.
- The active panel should expose `role="tabpanel"` and `aria-labelledby` pointing back to the active tab.

## Related Contract

- `system/components/src/Tabs/Tabs.ai.md`
