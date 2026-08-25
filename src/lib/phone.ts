// Twilio requires E.164 (+8801XXXXXXXXX) for the `to` field, but our
// checkout form only loosely validates phone length (src/lib/definitions.ts)
// and Bangladeshi customers commonly type local formats. Normalizes the
// common cases; returns null if it can't confidently do so, rather than
// guessing and placing a call to the wrong number.
export function toE164Bangladeshi(phone: string): string | null {
  const digits = phone.replace(/[^\d+]/g, "");

  if (/^\+8801\d{9}$/.test(digits)) return digits; // already E.164
  if (/^8801\d{9}$/.test(digits)) return `+${digits}`; // missing leading +
  if (/^01\d{9}$/.test(digits)) return `+880${digits.slice(1)}`; // local format
  if (/^1\d{9}$/.test(digits)) return `+880${digits}`; // missing leading 0

  return null;
}

// Steadfast (courier) wants the opposite of Twilio: local 11-digit format
// (01XXXXXXXXX), not E.164. Same tolerant parsing, different output shape.
export function toLocalBangladeshi(phone: string): string | null {
  const digits = phone.replace(/[^\d+]/g, "");

  if (/^01\d{9}$/.test(digits)) return digits; // already local
  if (/^\+8801\d{9}$/.test(digits)) return digits.slice(3); // E.164 -> local
  if (/^8801\d{9}$/.test(digits)) return digits.slice(2); // missing leading +
  if (/^1\d{9}$/.test(digits)) return `0${digits}`; // missing leading 0

  return null;
}
