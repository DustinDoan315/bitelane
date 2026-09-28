export function formatVndAmount(value: number): string {
  return new Intl.NumberFormat('vi-VN').format(value);
}

export function formatVnd(value: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    currencyDisplay: 'code',
    maximumFractionDigits: 0,
  }).format(value).replace(/\u00a0/g, ' ');
}

const compactVnd = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });

export function formatVndCompact(min: number, max = min): string {
  const format = (value: number) => `₫${compactVnd.format(value).toLowerCase()}`;
  return min === max ? format(min) : `${format(min)}–${format(max).replace('₫', '')}`;
}

export function formatRating(value: number, locale = 'vi-VN'): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(value);
}
