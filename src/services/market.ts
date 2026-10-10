import type { CurrencyCode } from '../types';

const euroCountries = new Set(['AT', 'BE', 'BG', 'CY', 'DE', 'EE', 'ES', 'FI', 'FR', 'GR', 'HR', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PT', 'SI', 'SK']);

export function currencyForCountry(countryCode: string): CurrencyCode | undefined {
  if (countryCode === 'VN') return 'VND';
  if (countryCode === 'GB') return 'GBP';
  if (countryCode === 'US') return 'USD';
  if (euroCountries.has(countryCode)) return 'EUR';
  return undefined;
}

export function defaultBudget(currency: CurrencyCode, countryCode = currency === 'VND' ? 'VN' : currency === 'GBP' ? 'GB' : currency === 'USD' ? 'US' : 'FR') {
  const amounts: Record<CurrencyCode, number> = { VND: 80000, GBP: 12, EUR: 15, USD: 18 };
  return { maxPerPerson: amounts[currency], currency, countryCode, dishQuery: '' };
}

export function marketLocale(countryCode: string, language: string) {
  if (countryCode === 'VN') return language === 'vi' ? 'vi-VN' : 'en-VN';
  const locales: Record<string, string> = {
    GB: 'en-GB', US: 'en-US', AT: 'de-AT', BE: 'nl-BE', BG: 'bg-BG', CY: 'el-CY', DE: 'de-DE', EE: 'et-EE',
    ES: 'es-ES', FI: 'fi-FI', FR: 'fr-FR', GR: 'el-GR', HR: 'hr-HR', IE: 'en-IE', IT: 'it-IT', LT: 'lt-LT',
    LU: 'fr-LU', LV: 'lv-LV', MT: 'en-MT', NL: 'nl-NL', PT: 'pt-PT', SI: 'sl-SI', SK: 'sk-SK',
  };
  return locales[countryCode] ?? `en-${countryCode}`;
}

export function formatMoney(amount: number, currency: CurrencyCode, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency', currency, maximumFractionDigits: currency === 'VND' ? 0 : 2,
  }).format(amount);
}

export function normalizeCurrencyAmount(amount: number, currency: CurrencyCode) {
  const digits = new Intl.NumberFormat('en-US', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits ?? 2;
  const factor = 10 ** digits;
  return Math.round((amount + Number.EPSILON) * factor) / factor;
}

export function formatMoneyCompact(amount: number, currency: CurrencyCode, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency', currency, notation: 'compact', maximumFractionDigits: 1,
  }).format(amount);
}

export function formatRouteDistance(meters: number, countryCode: string, locale: string) {
  const precision = (amount: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(amount);
  if (countryCode === 'US') return meters < 1609 ? `${Math.round(meters * 3.28084)} ft` : `${precision(meters / 1609.344)} mi`;
  if (countryCode === 'GB') return meters < 1609 ? `${Math.round(meters)} m` : `${precision(meters / 1609.344)} mi`;
  return meters < 1000 ? `${Math.round(meters)} m` : `${precision(meters / 1000)} km`;
}
