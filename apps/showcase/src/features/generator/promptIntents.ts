export type CountIntentKey =
  | "check"
  | "field"
  | "invoice"
  | "item"
  | "member"
  | "metric"
  | "owner"
  | "plan"
  | "retryPolicy"
  | "role"
  | "row"
  | "segment"
  | "status"
  | "task";

export type CountIntent = {
  key: CountIntentKey;
  count: number;
  label: string;
};

const countAliases: Record<CountIntentKey, string[]> = {
  check: ["checks?"],
  field: ["fields?"],
  invoice: ["invoices?"],
  item: ["items?"],
  member: ["members?", "users?", "teammates?"],
  metric: ["metrics?", "cards?"],
  owner: ["owners?"],
  plan: ["plans?"],
  retryPolicy: ["retry policies", "retry polic(?:y|ies)"],
  role: ["roles?"],
  row: ["rows?", "records?", "entries?"],
  segment: ["segments?"],
  status: ["statuses?", "states?"],
  task: ["tasks?", "steps?"]
};

const countWords: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12
};

export function extractCountIntents(prompt: string): CountIntent[] {
  const intents: CountIntent[] = [];
  const seen = new Set<CountIntentKey>();

  for (const [key, aliases] of Object.entries(countAliases) as Array<[CountIntentKey, string[]]>) {
    for (const alias of aliases) {
      const match = prompt.match(new RegExp(`\\b(\\d+|${Object.keys(countWords).join("|")})\\s+${alias}\\b`, "i"));
      const count = match ? countFromText(match[1]) : undefined;

      if (count && !seen.has(key)) {
        intents.push({ key, count, label: labelForCountIntent(key) });
        seen.add(key);
        break;
      }
    }
  }

  return intents;
}

export function getCountIntent(prompt: string, key: CountIntentKey): number | undefined {
  return extractCountIntents(prompt).find((intent) => intent.key === key)?.count;
}

function countFromText(value: string): number | undefined {
  const normalized = value.toLowerCase();
  const numericValue = Number(normalized);
  const count = Number.isInteger(numericValue) ? numericValue : countWords[normalized];

  return count && count > 0 ? count : undefined;
}

function labelForCountIntent(key: CountIntentKey) {
  const labels: Record<CountIntentKey, string> = {
    check: "checks",
    field: "fields",
    invoice: "invoices",
    item: "items",
    member: "members",
    metric: "metrics",
    owner: "owners",
    plan: "plans",
    retryPolicy: "retry policies",
    role: "roles",
    row: "rows",
    segment: "segments",
    status: "statuses",
    task: "tasks"
  };

  return labels[key];
}
