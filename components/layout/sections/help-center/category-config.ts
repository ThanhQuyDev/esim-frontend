export function getCategoryLabel(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatParent(parent: string): string {
  return parent.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
