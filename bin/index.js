#!/usr/bin/env node

/**
 * bin/index.js
 * CLI entry point.  Parses arguments with Commander.js, delegates to the
 * appropriate calculation path, and prints colourised output via formatter.js.
 */

import { program } from 'commander';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { calculateGST, calculateIGST, reverseCalculateGST } from '../src/calculator.js';
import {
  printGSTBreakdown,
  printIGSTBreakdown,
  printReverseBreakdown,
  printError,
} from '../src/formatter.js';
import { parseAndValidateAmount, parseAndValidateRate } from '../src/validator.js';
import { runInteractiveMode } from '../src/interactive.js';
import { isTTY } from '../src/utils.js';

// Read version from package.json without __dirname (ESM)
const require = createRequire(import.meta.url);
const pkg = require('../package.json');

// ── CLI definition ────────────────────────────────────────────────────────────

program
  .name('gst-calc')
  .description('Indian GST calculator — CGST/SGST/IGST breakdown with reverse mode')
  .version(pkg.version, '-v, --version', 'Print version number')
  .argument('[amount]', 'Base amount in INR (or GST-inclusive amount with --reverse)')
  .argument('[rate]', 'GST rate as a percentage (e.g. 18)')
  .option('--igst', 'Calculate IGST (inter-state) instead of CGST + SGST')
  .option('--reverse', 'Reverse-calculate: extract base price from a GST-inclusive total')
  .option('--no-strict', 'Allow custom GST rates outside standard Indian slabs')
  .addHelpText(
    'after',
    `
Examples:
  $ gst-calc 1000 18                 CGST + SGST breakdown
  $ gst-calc 1000 18 --igst          IGST breakdown
  $ gst-calc --reverse 1180 18       Reverse GST — extract base price
  $ gst-calc                         Launch interactive mode
`
  )
  .action(async (amount, rate, options) => {
    // ── No arguments → interactive mode ──────────────────────────────────────
    if (amount === undefined && rate === undefined) {
      if (!isTTY()) {
        printError('No arguments supplied and stdin is not a TTY. Pass <amount> and <rate>.');
        process.exit(1);
      }
      await runInteractiveMode();
      return;
    }

    // ── Validate inputs ───────────────────────────────────────────────────────
    let parsedAmount, parsedRate;

    try {
      parsedAmount = parseAndValidateAmount(amount, options.reverse ? 'Total amount' : 'Base amount');
    } catch (err) {
      printError(err.message);
      process.exit(1);
    }

    try {
      parsedRate = parseAndValidateRate(rate, options.strict !== false);
    } catch (err) {
      printError(err.message);
      process.exit(1);
    }

    // ── Route to correct calculation ──────────────────────────────────────────
    if (options.reverse) {
      const result = reverseCalculateGST(parsedAmount, parsedRate);
      printReverseBreakdown({ totalAmount: parsedAmount, gstRate: parsedRate, ...result });
      return;
    }

    if (options.igst) {
      const result = calculateIGST(parsedAmount, parsedRate);
      printIGSTBreakdown({ baseAmount: parsedAmount, gstRate: parsedRate, ...result });
      return;
    }

    // Default: CGST + SGST
    const result = calculateGST(parsedAmount, parsedRate);
    printGSTBreakdown({ baseAmount: parsedAmount, gstRate: parsedRate, ...result });
  });

program.parseAsync(process.argv).catch((err) => {
  printError(err.message ?? 'An unexpected error occurred.');
  process.exit(1);
});
