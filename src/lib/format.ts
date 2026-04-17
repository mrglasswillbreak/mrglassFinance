export function formatCurrency(cents: number, currency = "USD", locale = "en-US") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function toCents(value: number) {
  return Math.round(value * 100);
}
