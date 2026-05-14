/**
 * interactive.js
 * Inquirer.js-powered interactive prompts for when the user
 * runs `gst-calc` with no arguments.
 */

import inquirer from 'inquirer';
import { calculateGST, calculateIGST, reverseCalculateGST } from './calculator.js';
import {
  printGSTBreakdown,
  printIGSTBreakdown,
  printReverseBreakdown,
  printError,
} from './formatter.js';
import { parseNumeric, validateAmount, validateGSTRate } from './validator.js';

/** Standard Indian GST slabs presented as choices */
const GST_SLAB_CHOICES = [
  { name: '0%   — Exempt goods', value: 0 },
  { name: '5%   — Essential goods', value: 5 },
  { name: '12%  — Standard goods', value: 12 },
  { name: '18%  — Most services & goods', value: 18 },
  { name: '28%  — Luxury goods', value: 28 },
  { name: 'Custom rate…', value: 'custom' },
];

/**
 * Launch the interactive GST calculator prompt flow.
 * @returns {Promise<void>}
 */
export async function runInteractiveMode() {
  console.log('');

  // Step 1: mode selection
  const { mode } = await inquirer.prompt([
    {
      type: 'list',
      name: 'mode',
      message: 'What would you like to calculate?',
      choices: [
        { name: 'Standard GST  (CGST + SGST)', value: 'standard' },
        { name: 'IGST          (Inter-state)', value: 'igst' },
        { name: 'Reverse GST   (Extract base price from total)', value: 'reverse' },
      ],
    },
  ]);

  // Step 2: amount
  const amountLabel =
    mode === 'reverse' ? 'Enter the GST-inclusive total amount (₹):' : 'Enter the base amount (₹):';

  const { rawAmount } = await inquirer.prompt([
    {
      type: 'input',
      name: 'rawAmount',
      message: amountLabel,
      validate(input) {
        try {
          const v = parseNumeric(input, 'Amount');
          validateAmount(v, 'Amount');
          return true;
        } catch (err) {
          return err.message;
        }
      },
    },
  ]);

  // Step 3: GST rate (slab selector)
  const { slabChoice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'slabChoice',
      message: 'Select GST rate:',
      choices: GST_SLAB_CHOICES,
    },
  ]);

  let gstRate = slabChoice;

  if (slabChoice === 'custom') {
    const { customRate } = await inquirer.prompt([
      {
        type: 'input',
        name: 'customRate',
        message: 'Enter custom GST rate (%):',
        validate(input) {
          try {
            const v = parseNumeric(input, 'GST rate');
            validateGSTRate(v, false); // non-strict for custom
            return true;
          } catch (err) {
            return err.message;
          }
        },
      },
    ]);
    gstRate = Number(customRate);
  }

  const amount = Number(rawAmount);

  // Compute and display
  try {
    if (mode === 'standard') {
      const result = calculateGST(amount, gstRate);
      printGSTBreakdown({ baseAmount: amount, gstRate, ...result });
    } else if (mode === 'igst') {
      const result = calculateIGST(amount, gstRate);
      printIGSTBreakdown({ baseAmount: amount, gstRate, ...result });
    } else {
      const result = reverseCalculateGST(amount, gstRate);
      printReverseBreakdown({ totalAmount: amount, gstRate, ...result });
    }
  } catch (err) {
    printError(err.message);
    process.exit(1);
  }
}
