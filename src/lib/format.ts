export function formatMoney(amount: number, currency: string | null) {
  const formatted = amount.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
  return currency ? `${formatted} ${currency}` : formatted;
}
