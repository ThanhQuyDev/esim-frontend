/**
 * Day headers of a chat, as Zalo does (vande-1411 #036): "Hôm nay", "Hôm qua",
 * or for an older day the time and date of its first message, centred above
 * it; each message then shows its time alone.
 */
const pad2 = (n: number) => String(n).padStart(2, "0");

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function chatDayLabel(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (dayKey(date) === dayKey(now)) return "Hôm nay";
  if (dayKey(date) === dayKey(yesterday)) return "Hôm qua";
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())} ${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
}

/** Whether a message starts a new day, so a header goes above it. */
export function startsNewDay(iso: string, previousIso?: string | null): boolean {
  if (!previousIso) return true;
  return dayKey(new Date(iso)) !== dayKey(new Date(previousIso));
}

/** "14:05": the time alone, under a day header. */
export function chatTime(iso: string): string {
  const date = new Date(iso);
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}
