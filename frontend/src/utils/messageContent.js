const GESTURE_RULES = [
  { test: /warm\s*hug|gentle\s*hug|virtual\s*hug|big\s*hug|a\s*hug|hugs?\b/i, label: "Warm hug", type: "hug" },
  { test: /warm\s*embrace|embrace/i, label: "Warm embrace", type: "hug" },
  { test: /warm\s*smile|gentle\s*smile|soft\s*smile/i, label: "Warm smile", type: "warmth" },
  { test: /holding\s*space|here\s*for\s*you/i, label: "Here for you", type: "support" },
];

const ACTION_RE = /\*([^*]+)\*/g;

/** Fix common LLM list glitches: "...text. 2.\nTitle" → "...text.\n\n2. Title" */
export function normalizeAssistantFormatting(text) {
  if (!text) return "";

  let out = text;

  // "...sentence. 2.\nTitle" — number + newline BEFORE title (most common bug)
  out = out.replace(/([.!?…)"'])(\s+)(\d+)\.\s*\n\s*/g, "$1\n\n$3. ");
  // "...word 2.\nTitle" without sentence-ending punctuation
  out = out.replace(/([a-z0-9)])(\s+)(\d+)\.\s*\n\s*(?=[A-Za-z"'*])/g, "$1\n\n$3. ");
  // "...sentence. 2. Title" on one line
  out = out.replace(/([.!?…)"'])(\s+)(\d+)\.\s+(?=[A-Za-z"'*])/g, "$1\n\n$3. ");
  // Orphan trailing asterisk from broken emphasis
  out = out.replace(/\s+\*(?=\s*$)/gm, "");

  return out;
}

function classifyGesture(inner) {
  const text = inner.trim();
  for (const rule of GESTURE_RULES) {
    if (rule.test.test(text)) {
      return { kind: "gesture", label: rule.label, type: rule.type, raw: text };
    }
  }
  return { kind: "action", text };
}

export function parseMessageContent(content) {
  if (!content) return [];

  const normalized = normalizeAssistantFormatting(content);
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = ACTION_RE.exec(normalized)) !== null) {
    if (match.index > lastIndex) {
      const text = normalized.slice(lastIndex, match.index);
      if (text) parts.push({ kind: "text", text });
    }
    parts.push(classifyGesture(match[1]));
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < normalized.length) {
    parts.push({ kind: "text", text: normalized.slice(lastIndex) });
  }

  return parts.length ? parts : [{ kind: "text", text: normalized }];
}

export function parseStreamingContent(content) {
  if (!content) return [];
  const normalized = normalizeAssistantFormatting(content);
  const closed = parseMessageContent(normalized.replace(/\*[^*]*$/, ""));
  const tailMatch = normalized.match(/\*[^*]*$/);
  if (tailMatch) {
    closed.push({ kind: "text", text: tailMatch[0] });
  }
  return closed;
}
