// Kept free of dependencies, because the contact form uses this in the browser.

/**
 * Accepts the ways Kenyans write a mobile or landline-style number (07.., 01.., +254.., 254..)
 * and returns it as +254XXXXXXXXX, or null if it is not a valid Kenyan number.
 */
export function normaliseKenyanPhone(input: string): string | null {
  const digits = input.replace(/[\s\-().]/g, '');
  const match = digits.match(/^(?:\+?254|0)([17]\d{8})$/);
  return match ? `+254${match[1]}` : null;
}
