/**
 * validator.js
 * Input validation for all CLI arguments and interactive prompts.
 * Throws descriptive errors so the formatter can surface them to the user.
 */

/** Valid GST slabs in India (0 is allowed for exempt goods) */
const VALID_GST_RATES = new Set([0, 0.1, 0.25, 1, 1.5, 3, 5, 6, 7.5, 12, 14, 18, 28]);

/**
 * Parse a raw string into a finite number.
 * @param {string|number} raw
 * @param {string} fieldName - Used in error messages
 * @returns {number}
 * @throws {Error}
 */
export function parseNumeric(raw, fieldName) {
  const value = Number(raw);

  if (raw === '' || raw === null || raw === undefined) {
    throw new Error(`${fieldName} is required.`);
  }

  if (isNaN(value) || !isFinite(value)) {
    throw new Error(`${fieldName} must be a valid number. Received: "${raw}"`);
  }

  return value;
}

/**
 * Validate a base amount or total amount.
 * @param {number} amount
 * @param {string} fieldName
 * @throws {Error}
 */
export function validateAmount(amount, fieldName = 'Amount') {
  if (amount < 0) {
    throw new Error(`${fieldName} cannot be negative.`);
  }

  if (amount === 0) {
    throw new Error(`${fieldName} must be greater than zero.`);
  }
}

/**
 * Validate a GST rate.
 * Accepts standard Indian GST slabs, and also allows arbitrary rates
 * when the user explicitly opts in (non-strict mode).
 *
 * @param {number} rate
 * @param {boolean} [strict=true] - Enforce standard slabs
 * @throws {Error}
 */
export function validateGSTRate(rate, strict = true) {
  if (rate < 0) {
    throw new Error('GST rate cannot be negative.');
  }

  if (rate > 100) {
    throw new Error('GST rate cannot exceed 100%.');
  }

  if (strict && !VALID_GST_RATES.has(rate)) {
    const slabs = [...VALID_GST_RATES].join('%, ');
    throw new Error(
      `"${rate}%" is not a standard Indian GST rate.\n` +
      `Valid slabs: ${slabs}%\n` +
      `Use --no-strict to allow custom rates.`
    );
  }
}

/**
 * Convenience: parse + validate amount in one call.
 * @param {string|number} raw
 * @param {string} [fieldName]
 * @returns {number}
 */
export function parseAndValidateAmount(raw, fieldName = 'Amount') {
  const value = parseNumeric(raw, fieldName);
  validateAmount(value, fieldName);
  return value;
}

/**
 * Convenience: parse + validate GST rate in one call.
 * @param {string|number} raw
 * @param {boolean} [strict]
 * @returns {number}
 */
export function parseAndValidateRate(raw, strict = true) {
  const value = parseNumeric(raw, 'GST rate');
  validateGSTRate(value, strict);
  return value;
}
