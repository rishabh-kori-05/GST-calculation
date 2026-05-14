/**
 * utils.js
 * Shared utility helpers used across the project.
 */

/**
 * Check if the process is running in a TTY (interactive terminal).
 * Used to decide whether to fall back to interactive mode.
 * @returns {boolean}
 */
export function isTTY() {
  return Boolean(process.stdin.isTTY);
}

/**
 * Safely exit the process with a given code.
 * Wraps process.exit so it can be mocked in tests.
 * @param {number} [code=0]
 */
export function exit(code = 0) {
  process.exit(code);
}

/**
 * Strip trailing/leading whitespace and normalise a CLI string argument.
 * @param {string} value
 * @returns {string}
 */
export function normalise(value) {
  return String(value ?? '').trim();
}
