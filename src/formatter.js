/**
 * formatter.js
 * All terminal output formatting.
 * Keeps chalk and layout concerns completely out of business logic.
 */

import chalk from 'chalk';

// ── Column widths ────────────────────────────────────────────────────────────
const LABEL_WIDTH = 14;

/**
 * Format a number as an Indian-rupee currency string.
 * Uses Intl.NumberFormat for proper locale formatting.
 *
 * @param {number} value
 * @returns {string}  e.g. "₹1,180.00"
 */
export function formatINR(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Left-pad a label string to a fixed column width.
 * @param {string} label
 * @returns {string}
 */
function padLabel(label) {
  return label.padEnd(LABEL_WIDTH);
}

/**
 * Print a single key-value row.
 * @param {string} label
 * @param {string} value
 * @param {Function} [labelColor] - chalk colour fn for label
 * @param {Function} [valueColor] - chalk colour fn for value
 */
function printRow(label, value, labelColor = chalk.cyan, valueColor = chalk.white) {
  console.log(`  ${labelColor(padLabel(label))}${valueColor(value)}`);
}

/** Horizontal rule */
function printDivider() {
  console.log(chalk.gray('  ' + '─'.repeat(36)));
}

/** Blank line */
function printBlank() {
  console.log('');
}

// ── Public formatters ────────────────────────────────────────────────────────

/**
 * Print CGST + SGST breakdown to stdout.
 *
 * @param {object} params
 * @param {number} params.baseAmount
 * @param {number} params.gstRate
 * @param {number} params.halfRate
 * @param {number} params.cgst
 * @param {number} params.sgst
 * @param {number} params.totalTax
 * @param {number} params.totalAmount
 */
export function printGSTBreakdown({ baseAmount, gstRate, halfRate, cgst, sgst, totalTax, totalAmount }) {
  printBlank();
  console.log(chalk.bold.green('  ✦ GST Breakdown (Intra-State)'));
  printDivider();
  printRow('Base Price :', formatINR(baseAmount));
  printRow('GST Rate   :', `${gstRate}%`);
  printDivider();
  printRow(`CGST (${halfRate}%) :`, formatINR(cgst), chalk.yellow);
  printRow(`SGST (${halfRate}%) :`, formatINR(sgst), chalk.yellow);
  printDivider();
  printRow('Total Tax  :', formatINR(totalTax), chalk.magenta);
  printRow('Total      :', formatINR(totalAmount), chalk.bold.green, chalk.bold.green);
  printBlank();
}

/**
 * Print IGST breakdown to stdout.
 *
 * @param {object} params
 * @param {number} params.baseAmount
 * @param {number} params.gstRate
 * @param {number} params.igst
 * @param {number} params.totalAmount
 */
export function printIGSTBreakdown({ baseAmount, gstRate, igst, totalAmount }) {
  printBlank();
  console.log(chalk.bold.blue('  ✦ GST Breakdown (Inter-State / IGST)'));
  printDivider();
  printRow('Base Price :', formatINR(baseAmount));
  printDivider();
  printRow(`IGST (${gstRate}%) :`, formatINR(igst), chalk.yellow);
  printDivider();
  printRow('Total      :', formatINR(totalAmount), chalk.bold.green, chalk.bold.green);
  printBlank();
}

/**
 * Print reverse GST breakdown to stdout.
 *
 * @param {object} params
 * @param {number} params.totalAmount
 * @param {number} params.gstRate
 * @param {number} params.baseAmount
 * @param {number} params.gstAmount
 */
export function printReverseBreakdown({ totalAmount, gstRate, baseAmount, gstAmount }) {
  printBlank();
  console.log(chalk.bold.magenta('  ✦ Reverse GST Calculation'));
  printDivider();
  printRow('GST-Incl.  :', formatINR(totalAmount));
  printRow('GST Rate   :', `${gstRate}%`);
  printDivider();
  printRow('Base Price :', formatINR(baseAmount), chalk.bold.green, chalk.bold.green);
  printRow('GST Amount :', formatINR(gstAmount), chalk.yellow);
  printBlank();
}

/**
 * Print a user-friendly error message and exit.
 * @param {string} message
 */
export function printError(message) {
  console.error(chalk.bold.red('\n  ✖ Error: ') + chalk.red(message) + '\n');
}

/**
 * Print a warning without stopping execution.
 * @param {string} message
 */
export function printWarning(message) {
  console.warn(chalk.bold.yellow('\n  ⚠ Warning: ') + chalk.yellow(message) + '\n');
}
