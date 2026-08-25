// Prices are stored as whole-taka integers (BDT has no meaningful subunit in everyday use).
export function formatBDT(amount: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
}
