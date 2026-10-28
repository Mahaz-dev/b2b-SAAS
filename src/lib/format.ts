export function formatMoney(amount: number, currency: string | null) {
  const formatted = amount.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
  return currency ? `${formatted} ${currency}` : formatted;
}

export function initialsFor(name: string | null) {
  if (!name) {
    return "?";
  }
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

const avatarTones = [
  "bg-emerald-100 text-emerald-800",
  "bg-blue-100 text-blue-800",
  "bg-violet-100 text-violet-800",
  "bg-amber-100 text-amber-800",
  "bg-rose-100 text-rose-800",
  "bg-cyan-100 text-cyan-800",
];

export function avatarToneFor(name: string | null) {
  if (!name) {
    return avatarTones[0];
  }
  let sum = 0;
  for (const char of name) {
    sum += char.charCodeAt(0);
  }
  return avatarTones[sum % avatarTones.length];
}
