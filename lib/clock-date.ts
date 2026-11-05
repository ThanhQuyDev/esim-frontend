const pad = (n: number) => String(n).padStart(2, "0");

/**
 * "14:15:02 05/11/2026": one way of writing a moment across the eSIM lookup and
 * the profile's eSIM tab, in the device's own time like the "this day ends at"
 * note beside it (vande-0411 #076). "—" when there is no such moment.
 */
export function clockDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const at = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(at.getTime())) return "—";
  return (
    `${pad(at.getHours())}:${pad(at.getMinutes())}:${pad(at.getSeconds())} ` +
    `${pad(at.getDate())}/${pad(at.getMonth() + 1)}/${at.getFullYear()}`
  );
}

/** "05/11/2026": the short form on the profile's lists (vande-0411 #079). */
export function dayDate(value: string | Date | null | undefined): string {
  const full = clockDate(value);
  return full === "—" ? full : full.split(" ")[1];
}
