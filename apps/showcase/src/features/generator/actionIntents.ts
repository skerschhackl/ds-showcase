export type ActionIntents = {
  rowAction?: string;
  pageAction?: string;
};

export function extractActionIntents(prompt: string): ActionIntents {
  const normalized = prompt.toLowerCase();
  const pageAction = pageActionFromPrompt(normalized);
  const rowAction = rowActionFromPrompt(normalized, pageAction);

  return {
    ...(rowAction ? { rowAction } : {}),
    ...(pageAction ? { pageAction } : {})
  };
}

function rowActionFromPrompt(normalized: string, pageAction?: string) {
  const rowScopedAction = /\b(each|per|row|rows|member|members|individual|individually)\b/.test(normalized);
  const tableAction = /\b(table|list|queue|review|history|management|members|rows|records|segments?)\b/.test(normalized)
    && /\b(button|action|command|control|functionality)\b/.test(normalized);

  if (pageAction && !rowScopedAction) {
    return undefined;
  }

  if (!rowScopedAction && !tableAction) {
    return undefined;
  }

  if (/download/.test(normalized)) {
    return "Download";
  }
  if (/(delete|remove)/.test(normalized)) {
    return "Delete";
  }
  if (/archive/.test(normalized)) {
    return "Archive";
  }
  if (/approve/.test(normalized)) {
    return "Approve";
  }
  if (/export/.test(normalized)) {
    return "Export";
  }

  return undefined;
}

function pageActionFromPrompt(normalized: string) {
  if (/download\s+all\s+entries/.test(normalized)) {
    return "Download all entries";
  }
  if (/exports?\s+all\s+entries/.test(normalized)) {
    return "Export all entries";
  }
  if (/exports?\s+all\s+data\s+shown/.test(normalized)) {
    return "Export all data shown";
  }
  if (/exports?\s+all\s+data/.test(normalized)) {
    return "Export all data";
  }
  if (/download\s+all\s+(data|rows|records)/.test(normalized)) {
    return "Download all data";
  }
  if (/exports?\s+all\s+(rows|records)/.test(normalized)) {
    return "Export all data";
  }
  if (!/\b(each|per|row|rows|member|members|individual|individually)\b/.test(normalized) && /download/.test(normalized)) {
    return "Download";
  }
  if (!/\b(each|per|row|rows|member|members|individual|individually)\b/.test(normalized) && /export/.test(normalized)) {
    return "Export";
  }

  return undefined;
}
