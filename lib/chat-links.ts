/**
 * Split a chat message into plain runs and links (#050).
 *
 * Support staff can now send a destination page straight into the chat; the
 * customer has to be able to tap it rather than copy text. Punctuation that
 * ends a sentence ("…xem ở https://esim.vn/x.") stays out of the link.
 */

export type ChatTextPart = { type: "text"; value: string } | { type: "link"; value: string };

const URL_SOURCE = "https?:\\/\\/[^\\s<>\"']+";
const TRAILING_PUNCTUATION = /[.,!?;:)\]]+$/;

export function splitChatLinks(text: string): ChatTextPart[] {
  const parts: ChatTextPart[] = [];
  let last = 0;

  // A fresh global regex per call (its `lastIndex` is state), walked with
  // `exec` — this project's TS target cannot iterate `matchAll`.
  const pattern = new RegExp(URL_SOURCE, "gi");
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    const start = match.index;
    let url = match[0];
    const trailing = url.match(TRAILING_PUNCTUATION)?.[0] ?? "";
    if (trailing) url = url.slice(0, -trailing.length);

    if (start > last) parts.push({ type: "text", value: text.slice(last, start) });
    if (url.length > "https://".length) parts.push({ type: "link", value: url });
    else parts.push({ type: "text", value: url });
    last = start + url.length;
  }

  if (last < text.length) parts.push({ type: "text", value: text.slice(last) });
  return parts;
}
