# Balanced Books

An interactive textbook for learning accounting from scratch. No background needed.

Open `index.html` in any modern browser (double-clicking the file works; no server or build step). Progress is saved in that browser.

## What's inside

**14 chapters in four parts**, each with four tabs:

- **Lesson**: plain-English reading with "check yourself" questions after each big idea, plus interactive calculators.
- **Worked examples**: 28 narrated, animated walkthroughs (2 per chapter) that build journal entries, T-accounts and statements one step at a time. Play/pause, step back and forward, change speed, toggle captions and spoken narration (uses the browser's built-in speech voices).
- **Practice**: 154 graded problems with hints and full worked solutions: multiple choice, numeric answers, a journal-entry builder that checks your debits and credits, and classification drills.
- **Key terms**: every definition, also collected in the searchable **Glossary**.

| Part | Chapters |
| --- | --- |
| I. Foundations | 1 The Language of Business · 2 The Accounting Equation · 3 Debits, Credits & T-Accounts · 4 The Journal, the Ledger & the Trial Balance |
| II. The Accounting Cycle | 5 Accrual Accounting & Adjusting Entries · 6 Financial Statements & Closing the Books |
| III. Assets, Liabilities & Equity | 7 Merchandising & Inventory · 8 Cash & Receivables · 9 Long-Term Assets & Depreciation · 10 Liabilities · 11 Stockholders' Equity |
| IV. Reading the Numbers | 12 The Statement of Cash Flows · 13 Analyzing Financial Statements · 14 Costs & Decisions |

Chapters 1 to 6 follow one company, Brightside Tutoring, through its whole first accounting cycle, so each new idea builds on numbers you've already seen.

**Also included**

- **Ledger Lab**: a working double-entry system. Post journal entries and watch the T-accounts, trial balance, income statement and balance sheet update. Saved in your browser.
- **Mixed Review**: shuffled problem sets drawn from the chapters you pick.
- **Interactive widgets**: transaction-by-transaction accounting equation, cash vs. accrual comparison chart, FIFO/LIFO/average inventory calculator, depreciation scheduler, and a break-even explorer.

Examples follow U.S. GAAP. Payroll and tax rates are illustrative; check current rules before using them for a real payroll or filing.

## Layout

```
index.html           page shell; loads the scripts below in order
css/book.css         all styles (light and dark themes)
js/core.js           chapter registry, number formatting, progress storage, lesson HTML helpers
js/chapters/chNN.js  one file per chapter: lesson, key terms, worked-example scripts, practice set
js/player.js         worked-example player (animated frames, captions, narration)
js/practice.js       problem engine (multiple choice, numeric, journal entry, classify)
js/widgets.js        lesson calculators and charts
js/lab.js            Ledger Lab
js/app.js            routing, contents sidebar, chapter/glossary/review/lab pages
tests/validate.mjs   content checks
```

## Checking the content

```bash
node accounting/tests/validate.mjs
```

Verifies that every journal entry in the lessons, worked examples and answer keys has equal debits and credits, every accounting-equation frame balances, every T-account frame's balances total equal, and every practice problem is well formed.
