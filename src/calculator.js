/**
 * calculator.js
 * Core GST calculation engine.
 * All monetary values are returned as numbers rounded to 2 decimal places.
 */

/**
 * Round a number to 2 decimal places.
 * @param {number} value
 * @returns {number}
 */
const round2 = (value) => Math.round(value * 100) / 100;

/**
 * Calculate CGST + SGST breakdown (intra-state).
 *
 * @param {number} baseAmount - Pre-tax amount in INR
 * @param {number} gstRate    - Total GST percentage (e.g. 18)
 * @returns {{ cgst: number, sgst: number, totalTax: number, totalAmount: number }}
 */
export function calculateGST(baseAmount, gstRate) {
  const halfRate = gstRate / 2;
  const cgst = round2(baseAmount * (halfRate / 100));
  const sgst = round2(baseAmount * (halfRate / 100));
  const totalTax = round2(cgst + sgst);
  const totalAmount = round2(baseAmount + totalTax);

  return { cgst, sgst, totalTax, totalAmount, halfRate };
}

/**
 * Calculate IGST breakdown (inter-state).
 *
 * @param {number} baseAmount - Pre-tax amount in INR
 * @param {number} gstRate    - Total GST percentage (e.g. 18)
 * @returns {{ igst: number, totalAmount: number }}
 */
export function calculateIGST(baseAmount, gstRate) {
  const igst = round2(baseAmount * (gstRate / 100));
  const totalAmount = round2(baseAmount + igst);

  return { igst, totalAmount };
}

/**
 * Reverse-calculate the base price from a GST-inclusive total.
 *
 * @param {number} totalAmount - GST-inclusive amount in INR
 * @param {number} gstRate     - Total GST percentage (e.g. 18)
 * @returns {{ baseAmount: number, gstAmount: number }}
 */
export function reverseCalculateGST(totalAmount, gstRate) {
  const baseAmount = round2(totalAmount / (1 + gstRate / 100));
  const gstAmount = round2(totalAmount - baseAmount);

  return { baseAmount, gstAmount };
}
