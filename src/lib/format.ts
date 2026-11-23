export const money = (n: number) => `${n.toFixed(0)} lei`;
export const timeUTC = (iso: string) => iso.slice(11, 16);
export const dayLabel = (iso: string) =>
  new Date(iso.slice(0, 10) + 'T12:00:00Z').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });

/** The next `n` days as YYYY-MM-DD (UTC), starting tomorrow. */
export function nextDays(n: number) {
  return Array.from({ length: n }, (_, i) => new Date(Date.now() + (i + 1) * 86_400_000).toISOString().slice(0, 10));
}
