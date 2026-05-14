/**
 * tests/calculator.test.js
 * Unit tests for the GST calculation engine and validators.
 */

import { calculateGST, calculateIGST, reverseCalculateGST } from '../src/calculator.js';
import {
  parseNumeric,
  validateAmount,
  validateGSTRate,
  parseAndValidateAmount,
  parseAndValidateRate,
} from '../src/validator.js';

// ── calculateGST ──────────────────────────────────────────────────────────────

describe('calculateGST — CGST + SGST', () => {
  test('18% GST on ₹1000 splits into 9% CGST + 9% SGST', () => {
    const result = calculateGST(1000, 18);
    expect(result.cgst).toBe(90);
    expect(result.sgst).toBe(90);
    expect(result.totalTax).toBe(180);
    expect(result.totalAmount).toBe(1180);
    expect(result.halfRate).toBe(9);
  });

  test('5% GST on ₹500', () => {
    const result = calculateGST(500, 5);
    expect(result.cgst).toBe(12.5);
    expect(result.sgst).toBe(12.5);
    expect(result.totalTax).toBe(25);
    expect(result.totalAmount).toBe(525);
  });

  test('28% GST on ₹2000', () => {
    const result = calculateGST(2000, 28);
    expect(result.cgst).toBe(280);
    expect(result.sgst).toBe(280);
    expect(result.totalTax).toBe(560);
    expect(result.totalAmount).toBe(2560);
  });

  test('0% GST on ₹1000 (exempt goods)', () => {
    const result = calculateGST(1000, 0);
    expect(result.cgst).toBe(0);
    expect(result.sgst).toBe(0);
    expect(result.totalTax).toBe(0);
    expect(result.totalAmount).toBe(1000);
  });

  test('rounds to 2 decimal places', () => {
    const result = calculateGST(333.33, 18);
    expect(result.cgst).toBe(30);
    expect(result.totalAmount).toBe(393.33);
  });
});

// ── calculateIGST ─────────────────────────────────────────────────────────────

describe('calculateIGST — inter-state', () => {
  test('18% IGST on ₹1000', () => {
    const result = calculateIGST(1000, 18);
    expect(result.igst).toBe(180);
    expect(result.totalAmount).toBe(1180);
  });

  test('12% IGST on ₹2500', () => {
    const result = calculateIGST(2500, 12);
    expect(result.igst).toBe(300);
    expect(result.totalAmount).toBe(2800);
  });

  test('0% IGST returns same amount', () => {
    const result = calculateIGST(999, 0);
    expect(result.igst).toBe(0);
    expect(result.totalAmount).toBe(999);
  });

  test('IGST total equals CGST + SGST total', () => {
    const gst = calculateGST(1500, 18);
    const igst = calculateIGST(1500, 18);
    expect(igst.totalAmount).toBe(gst.totalAmount);
    expect(igst.igst).toBe(gst.totalTax);
  });
});

// ── reverseCalculateGST ───────────────────────────────────────────────────────

describe('reverseCalculateGST — extract base price', () => {
  test('₹1180 at 18% → base ₹1000, GST ₹180', () => {
    const result = reverseCalculateGST(1180, 18);
    expect(result.baseAmount).toBe(1000);
    expect(result.gstAmount).toBe(180);
  });

  test('₹525 at 5% → base ₹500, GST ₹25', () => {
    const result = reverseCalculateGST(525, 5);
    expect(result.baseAmount).toBe(500);
    expect(result.gstAmount).toBe(25);
  });

  test('reverse of forward calculation is identity', () => {
    const forward = calculateGST(7777, 18);
    const reverse = reverseCalculateGST(forward.totalAmount, 18);
    expect(reverse.baseAmount).toBe(7777);
    expect(reverse.gstAmount).toBe(forward.totalTax);
  });

  test('0% GST: base equals total', () => {
    const result = reverseCalculateGST(1000, 0);
    expect(result.baseAmount).toBe(1000);
    expect(result.gstAmount).toBe(0);
  });
});

// ── parseNumeric ──────────────────────────────────────────────────────────────

describe('parseNumeric', () => {
  test('parses integer string', () => {
    expect(parseNumeric('1000', 'Amount')).toBe(1000);
  });

  test('parses decimal string', () => {
    expect(parseNumeric('99.99', 'Amount')).toBe(99.99);
  });

  test('throws on empty string', () => {
    expect(() => parseNumeric('', 'Amount')).toThrow('required');
  });

  test('throws on non-numeric string', () => {
    expect(() => parseNumeric('abc', 'Amount')).toThrow('valid number');
  });

  test('throws on Infinity', () => {
    expect(() => parseNumeric(Infinity, 'Amount')).toThrow('valid number');
  });
});

// ── validateAmount ────────────────────────────────────────────────────────────

describe('validateAmount', () => {
  test('accepts positive value', () => {
    expect(() => validateAmount(500)).not.toThrow();
  });

  test('throws on zero', () => {
    expect(() => validateAmount(0)).toThrow('greater than zero');
  });

  test('throws on negative', () => {
    expect(() => validateAmount(-100)).toThrow('negative');
  });
});

// ── validateGSTRate ───────────────────────────────────────────────────────────

describe('validateGSTRate', () => {
  test('accepts standard slab 18', () => {
    expect(() => validateGSTRate(18)).not.toThrow();
  });

  test('accepts 0 (exempt)', () => {
    expect(() => validateGSTRate(0)).not.toThrow();
  });

  test('throws on negative rate', () => {
    expect(() => validateGSTRate(-5)).toThrow('negative');
  });

  test('throws on rate > 100', () => {
    expect(() => validateGSTRate(150)).toThrow('100%');
  });

  test('throws on non-standard rate in strict mode', () => {
    expect(() => validateGSTRate(17, true)).toThrow('not a standard');
  });

  test('allows non-standard rate in non-strict mode', () => {
    expect(() => validateGSTRate(17, false)).not.toThrow();
  });
});

// ── parseAndValidateAmount / parseAndValidateRate ─────────────────────────────

describe('parseAndValidateAmount', () => {
  test('returns parsed number for valid input', () => {
    expect(parseAndValidateAmount('1000')).toBe(1000);
  });

  test('throws on negative string', () => {
    expect(() => parseAndValidateAmount('-50')).toThrow('negative');
  });
});

describe('parseAndValidateRate', () => {
  test('returns parsed rate for valid slab', () => {
    expect(parseAndValidateRate('18')).toBe(18);
  });

  test('throws on non-standard rate in strict mode (default)', () => {
    expect(() => parseAndValidateRate('17')).toThrow('not a standard');
  });

  test('passes non-standard rate in non-strict mode', () => {
    expect(parseAndValidateRate('17', false)).toBe(17);
  });
});
