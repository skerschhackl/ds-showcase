import { forwardRef, useId, type ForwardedRef, type HTMLAttributes, type ReactElement, type RefAttributes } from "react";

type TabItem<T extends string = string> = { id: T; label: string };
type TabKey = "ArrowRight" | "ArrowDown" | "ArrowLeft" | "ArrowUp" | "Home" | "End";
export type TabsProps<T extends string = string> = {
  tabs: readonly TabItem<T>[];
  active: T;
  onChange: (id: T) => void;
  ariaLabel: string;
  idPrefix?: string;
  getPanelId?: (id: T) => string;
  getTabId?: (id: T) => string;
};
export type TabPanelProps = HTMLAttributes<HTMLDivElement> & {
  active: boolean;
  labelledBy: string;
};

export function getTabSelectionForKey<T extends string>(tabs: readonly TabItem<T>[], active: T, key: string): T | undefined {
  if (!isTabKey(key) || tabs.length === 0) {
    return undefined;
  }

  const activeIndex = Math.max(0, tabs.findIndex((tab) => tab.id === active));

  if (key === "Home") {
    return tabs[0].id;
  }

  if (key === "End") {
    return tabs[tabs.length - 1].id;
  }

  const offset = key === "ArrowRight" || key === "ArrowDown" ? 1 : -1;
  const nextIndex = (activeIndex + offset + tabs.length) % tabs.length;
  return tabs[nextIndex].id;
}

export function getDefaultTabId(prefix: string, id: string) {
  return `${sanitizeIdPrefix(prefix)}-${id}-tab`;
}

export function getDefaultTabPanelId(prefix: string, id: string) {
  return `${sanitizeIdPrefix(prefix)}-${id}-panel`;
}

function TabsInner<T extends string = string>({
  tabs,
  active,
  onChange,
  ariaLabel,
  idPrefix,
  getPanelId,
  getTabId
}: TabsProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  const generatedId = useId();
  const resolvedIdPrefix = idPrefix ?? generatedId;
  const tabIdFor = getTabId ?? ((id: T) => getDefaultTabId(resolvedIdPrefix, id));
  const panelIdFor = getPanelId ?? ((id: T) => getDefaultTabPanelId(resolvedIdPrefix, id));

  return (
    <div ref={ref} className="ds-tabs" role="tablist" aria-label={ariaLabel}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className="ds-tabs__tab"
          type="button"
          role="tab"
          id={tabIdFor(tab.id)}
          aria-selected={active === tab.id}
          aria-controls={panelIdFor(tab.id)}
          tabIndex={active === tab.id ? 0 : -1}
          onClick={() => onChange(tab.id)}
          onKeyDown={(event) => {
            const nextTabId = getTabSelectionForKey(tabs, active, event.key);
            if (nextTabId) {
              event.preventDefault();
              onChange(nextTabId);
            }
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export const Tabs = forwardRef(TabsInner) as <T extends string = string>(
  props: TabsProps<T> & RefAttributes<HTMLDivElement>
) => ReactElement | null;

export const TabPanel = forwardRef<HTMLDivElement, TabPanelProps>(function TabPanel({
  active,
  labelledBy,
  className = "",
  children,
  ...props
}, ref) {
  return (
    <div
      ref={ref}
      className={`ds-tab-panel ${className}`}
      role="tabpanel"
      aria-labelledby={labelledBy}
      hidden={!active}
      tabIndex={0}
      {...props}
    >
      {children}
    </div>
  );
});

function isTabKey(key: string): key is TabKey {
  return key === "ArrowRight" || key === "ArrowDown" || key === "ArrowLeft" || key === "ArrowUp" || key === "Home" || key === "End";
}

function sanitizeIdPrefix(prefix: string) {
  return prefix.replace(/[^a-zA-Z0-9_-]/g, "");
}
