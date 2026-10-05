// 17509 → "175.09"
export const formatCents = (cents: number) => (cents / 100).toFixed(2);

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
