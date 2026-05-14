# gst-calc

> A production-ready CLI tool for calculating Indian GST (Goods and Services Tax) breakdowns — CGST, SGST, and IGST with reverse-calculation support.

[![npm version](https://img.shields.io/npm/v/gst-calc.svg)](https://www.npmjs.com/package/gst-calc)
[![Node.js CI](https://github.com/yourusername/gst-calc/actions/workflows/node.js.yml/badge.svg)](https://github.com/yourusername/gst-calc/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Features

- **CGST + SGST** breakdown for intra-state transactions
- **IGST** calculation for inter-state transactions
- **Reverse GST** — extract the base price from a GST-inclusive total
- **Interactive mode** — guided prompts via Inquirer.js when run without arguments
- Strict validation against official Indian GST slabs (0%, 5%, 12%, 18%, 28% …)
- Colorised terminal output via Chalk
- Proper Indian Rupee (₹) formatting using `Intl.NumberFormat`
- Fully tested with Jest

---

## Installation

### Global install (recommended)

```bash
npm install -g gst-calc
```

### Run without installing (npx)

```bash
npx gst-calc 1000 18
```

---

## Usage

```
gst-calc [options] [amount] [rate]
```

### Arguments

| Argument | Description                                                              |
|----------|--------------------------------------------------------------------------|
| `amount` | Base price in INR (or GST-inclusive total when using `--reverse`)        |
| `rate`   | GST rate as a percentage — e.g. `5`, `12`, `18`, `28`                   |

### Options

| Flag          | Description                                             |
|---------------|---------------------------------------------------------|
| `--igst`      | Calculate IGST (inter-state) instead of CGST + SGST    |
| `--reverse`   | Reverse-extract the base price from a GST-inclusive total |
| `--no-strict` | Allow custom GST rates outside the standard Indian slabs |
| `-v, --version` | Print version number                                  |
| `-h, --help`  | Show help                                               |

---

## Examples

### Standard GST (CGST + SGST)

```bash
$ gst-calc 1000 18

  ✦ GST Breakdown (Intra-State)
  ────────────────────────────────────
  Base Price :    ₹1,000.00
  GST Rate   :    18%
  ────────────────────────────────────
  CGST (9%)  :    ₹90.00
  SGST (9%)  :    ₹90.00
  ────────────────────────────────────
  Total Tax  :    ₹180.00
  Total      :    ₹1,180.00
```

### IGST mode

```bash
$ gst-calc 1000 18 --igst

  ✦ GST Breakdown (Inter-State / IGST)
  ────────────────────────────────────
  Base Price :    ₹1,000.00
  ────────────────────────────────────
  IGST (18%) :    ₹180.00
  ────────────────────────────────────
  Total      :    ₹1,180.00
```

### Reverse GST

```bash
$ gst-calc --reverse 1180 18

  ✦ Reverse GST Calculation
  ────────────────────────────────────
  GST-Incl.  :    ₹1,180.00
  GST Rate   :    18%
  ────────────────────────────────────
  Base Price :    ₹1,000.00
  GST Amount :    ₹180.00
```

### Interactive mode

```bash
$ gst-calc
# Launches guided prompts — no arguments needed
```

### Custom rate (non-standard slab)

```bash
$ gst-calc 1000 7 --no-strict
```

---

## Supported GST Slabs

| Rate  | Category                                 |
|-------|------------------------------------------|
| 0%    | Essential items, exempt goods            |
| 5%    | Packaged food, transport                 |
| 12%   | Processed food, computers                |
| 18%   | Most goods and services                  |
| 28%   | Luxury goods, cars, tobacco              |

Additional slabs like 0.1%, 0.25%, 1%, 1.5%, 3%, 6%, 7.5%, 14% are also accepted.

---

## Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/gst-calc.git
cd gst-calc

# Install dependencies
npm install

# Run the CLI locally
node bin/index.js 1000 18

# Link as a global command for local testing
npm link
gst-calc 1000 18
```

---

## Testing

```bash
# Run all tests
npm test

# Run with coverage report
npm test -- --coverage
```

Tests cover:
- CGST + SGST calculations across all standard slabs
- IGST calculations
- Reverse GST calculations
- Input validators (amount, GST rate, edge cases)
- Strict vs non-strict rate validation

---

## Project Structure

```
gst-calc/
├── bin/
│   └── index.js          # CLI entry point (Commander.js)
├── src/
│   ├── calculator.js     # Pure GST math (calculateGST, calculateIGST, reverse)
│   ├── formatter.js      # Chalk-based terminal output
│   ├── validator.js      # Input parsing and validation
│   ├── interactive.js    # Inquirer.js interactive prompts
│   └── utils.js          # Shared helpers (TTY check, exit)
├── tests/
│   └── calculator.test.js
├── .github/
│   └── workflows/
│       └── node.js.yml   # GitHub Actions CI
├── package.json
├── LICENSE
└── README.md
```

---

## npm Publish Instructions

```bash
# 1. Log in to npm
npm login

# 2. Verify package contents (dry run)
npm publish --dry-run

# 3. Publish to npm registry
npm publish

# 4. Verify it's live
npx gst-calc 1000 18
```

To release a new version:

```bash
npm version patch   # 1.0.0 → 1.0.1  (bug fix)
npm version minor   # 1.0.0 → 1.1.0  (new feature)
npm version major   # 1.0.0 → 2.0.0  (breaking change)

npm publish
git push --follow-tags
```

---

## GitHub Push Instructions

```bash
git init
git remote add origin https://github.com/yourusername/gst-calc.git
git add .
git commit -m "feat: initial release v1.0.0"
git branch -M main
git push -u origin main
```

---

## Future Improvements

- [ ] JSON output mode (`--json`) for programmatic use
- [ ] HSN/SAC code lookup with auto-fill of correct GST rate
- [ ] CSV batch processing: calculate GST for a list of items
- [ ] GST invoice PDF generation
- [ ] Cess calculation (e.g. 1% cess on luxury goods at 28% slab)
- [ ] Multi-currency support

---

## License

[MIT](LICENSE) © Rishabh Kori

