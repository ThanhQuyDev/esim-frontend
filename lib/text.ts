/**
 * Accent-insensitive normalisation for matching Vietnamese text
 * ("Việt Nam" -> "viet nam", "Châu Á" -> "chau a").
 *
 * `đ/Đ` has no combining form, so it is mapped explicitly after NFD.
 */
export function normalizeSearchTerm(value: string): string {
  return (value || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}
