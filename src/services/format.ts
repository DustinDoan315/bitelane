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

export function formatRating(value: number, locale = 'vi-VN'): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(value);
}
