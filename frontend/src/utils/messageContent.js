const GESTURE_RULES = [
  { test: /warm\s*hug|gentle\s*hug|virtual\s*hug|big\s*hug|a\s*hug|hugs?\b/i, label: "Warm hug", type: "hug" },
  { test: /warm\s*embrace|embrace/i, label: "Warm embrace", type: "hug" },
  { test: /warm\s*smile|gentle\s*smile|soft\s*smile/i, label: "Warm smile", type: "warmth" },
  { test: /holding\s*space|here\s*for\s*you/i, label: "Here for you", type: "support" },
];

const ACTION_RE = /\*([^*]+)\*/g;

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

  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = ACTION_RE.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const text = content.slice(lastIndex, match.index);
      if (text) parts.push({ kind: "text", text });
    }
    parts.push(classifyGesture(match[1]));
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({ kind: "text", text: content.slice(lastIndex) });
  }

  return parts.length ? parts : [{ kind: "text", text: content }];
}

export function parseStreamingContent(content) {
  const closed = parseMessageContent(content.replace(/\*[^*]*$/, ""));
  const tailMatch = content.match(/\*[^*]*$/);
  if (tailMatch) {
    closed.push({ kind: "text", text: tailMatch[0] });
  }
  return closed;
}
