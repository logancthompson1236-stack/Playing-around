(function () {
  const { qc, je, jeMany, table, widget } = Book;

  const JAN = [
    { date: 'Jan 1', lines: [['Cash', 10000, 0], ['Common Stock', 0, 10000]], memo: 'Owner invested cash for common stock' },
    { date: 'Jan 2', lines: [['Equipment', 4800, 0], ['Cash', 0, 4800]], memo: 'Bought tutoring equipment for cash' },
    { date: 'Jan 3', lines: [['Supplies', 600, 0], ['Accounts Payable', 0, 600]], memo: 'Bought supplies on account' },
    { date: 'Jan 10', lines: [['Cash', 2500, 0], ['Service Revenue', 0, 2500]], memo: 'Tutoring for cash' },
    { date: 'Jan 15', lines: [['Accounts Receivable', 1800, 0], ['Service Revenue', 0, 1800]], memo: 'Tutoring for a school, on account' },
    { date: 'Jan 20', lines: [['Rent Expense', 1000, 0], ['Cash', 0, 1000]], memo: 'Paid January rent' },
    { date: 'Jan 25', lines: [['Accounts Payable', 400, 0], ['Cash', 0, 400]], memo: 'Paid part of the supplies bill' },
    { date: 'Jan 28', lines: [['Cash', 1000, 0], ['Accounts Receivable', 0, 1000]], memo: 'Collected from the school' },
    { date: 'Jan 30', lines: [['Salaries Expense', 1200, 0], ['Cash', 0, 1200]], memo: 'Paid assistant’s salary' },
    { date: 'Jan 31', lines: [['Dividends', 300, 0], ['Cash', 0, 300]], memo: 'Paid dividend to owner' }
  ];
  const vj = (from, to) => JAN.slice(from, to).map((e) => ({ d: e.date, lines: e.lines, memo: e.memo }));

  const LEDGER = [
    { n: 'Cash', dr: [['1', 10000], ['10', 2500], ['28', 1000]], cr: [['2', 4800], ['20', 1000], ['25', 400], ['30', 1200], ['31', 300]] },
    { n: 'Accounts Receivable', dr: [['15', 1800]], cr: [['28', 1000]] },
    { n: 'Supplies', dr: [['3', 600]], cr: [] },
    { n: 'Equipment', dr: [['2', 4800]], cr: [] },
    { n: 'Accounts Payable', dr: [['25', 400]], cr: [['3', 600]] },
    { n: 'Common Stock', dr: [], cr: [['1', 10000]] },
    { n: 'Dividends', dr: [['31', 300]], cr: [] },
    { n: 'Service Revenue', dr: [], cr: [['10', 2500], ['15', 1800]] },
    { n: 'Salaries Expense', dr: [['30', 1200]], cr: [] },
    { n: 'Rent Expense', dr: [['20', 1000]], cr: [] }
  ];
  const TB = [['Cash', 5800, ''], ['Accounts Receivable', 800, ''], ['Supplies', 600, ''], ['Equipment', 4800, ''], ['Accounts Payable', '', 200],
    ['Common Stock', '', 10000], ['Dividends', 300, ''], ['Service Revenue', '', 4300], ['Salaries Expense', 1200, ''], ['Rent Expense', 1000, '']];

  Book.chapter({
    id: 'ch04', num: 4, part: 1, short: 'Journal & trial balance',
    title: 'The Journal, the Ledger & the Trial Balance',
    blurb: 'How transactions travel from a receipt to the books: journalizing, posting, and proving that debits equal credits.',
    minutes: 30,
    objectives: [
      'List the steps of the accounting cycle',
      'Write journal entries, including compound entries, in standard form',
      'Post entries to the general ledger',
      'Prepare a trial balance and explain what it can and can’t catch'
    ],
    lesson: `
<p>In the last chapter you put debits and credits straight into T-accounts. Real bookkeeping adds one step in front: every transaction is first written in a <b>journal</b>, then copied (posted) to the accounts. This chapter walks through that flow and ends with the first check accountants run on their work.</p>

<h2>The accounting cycle</h2>
<p>The <dfn>accounting cycle</dfn> is the sequence of steps repeated every period:</p>
<ol>
<li><b>Analyze</b> each transaction (which accounts, which direction, how much).</li>
<li><b>Journalize</b>: record it in the journal.</li>
<li><b>Post</b>: transfer the journal amounts to the ledger accounts.</li>
<li>Prepare an <b>unadjusted trial balance</b>.</li>
<li><b>Adjust</b> the accounts at period end (Chapter 5).</li>
<li>Prepare an <b>adjusted trial balance</b>.</li>
<li>Prepare the <b>financial statements</b> (Chapter 6).</li>
<li><b>Close</b> the temporary accounts (Chapter 6).</li>
<li>Prepare a <b>post-closing trial balance</b>.</li>
</ol>
<p>Steps 1 through 3 happen all period long. Steps 4 through 9 happen at the end. This chapter covers steps 1 through 4.</p>

<h2>The journal</h2>
<p>The <dfn>journal</dfn> is the book of original entry: a chronological record of every transaction, with its debits and credits side by side. Recording in a journal first has real advantages. It puts the complete effect of each transaction in one place, it keeps events in date order, and it makes errors easier to find because each entry can be checked for balance before it touches any account.</p>
<p>A standard <dfn>journal entry</dfn> has four parts:</p>
<ul>
<li>The <b>date</b>.</li>
<li>The account(s) <b>debited</b>, listed first, against the left margin, with the amount in the Debit column.</li>
<li>The account(s) <b>credited</b>, listed next, indented, with the amount in the Credit column.</li>
<li>A short <b>explanation</b>.</li>
</ul>
${je([['Equipment', 4800, 0], ['Cash', 0, 4800]], { date: 'Jan 2', memo: 'Bought tutoring equipment for cash' })}
<p>The indentation isn’t decoration. It lets a reader spot the credits at a glance, and it’s a convention every accountant follows.</p>

<h3>Compound entries</h3>
<p>Some transactions affect three or more accounts. A <dfn>compound entry</dfn> has more than one debit, more than one credit, or both. Suppose Brightside buys $6,000 of furniture, paying $1,500 in cash and signing a note for the rest:</p>
${je([['Equipment', 6000, 0], ['Cash', 0, 1500], ['Notes Payable', 0, 4500]], { date: 'Feb 4', memo: 'Bought furniture: $1,500 cash, the rest on a note' })}
<p>Total debits ($6,000) still equal total credits ($1,500 + $4,500).</p>

${qc({ type: 'je', q: 'A customer pays $500 in cash for a tutoring session and is billed $300 for a second session delivered the same day. Record one compound entry.', opts: ['Cash', 'Accounts Receivable', 'Service Revenue', 'Unearned Revenue', 'Accounts Payable'], answer: [['Cash', 500, 0], ['Accounts Receivable', 300, 0], ['Service Revenue', 0, 800]], explain: '<p>Both sessions are earned today, so revenue is $800. $500 arrived as cash and $300 is owed: two debits, one credit.</p>' })}

<h3>Brightside’s January journal</h3>
<p>Here is the complete journal for the ten transactions you analyzed in Chapter 2.</p>
${jeMany(JAN)}

<h2>Posting to the ledger</h2>
<p>The <dfn>general ledger</dfn> is the collection of all of a company’s accounts. <dfn>Posting</dfn> is transferring each journal amount to the matching ledger account: debits to the debit side, credits to the credit side. Accountants write a <b>posting reference</b> in both places (the journal page number in the account, and the account number in the journal) so anyone can trace an amount back to its source and see that nothing was posted twice.</p>
<p>Software posts automatically the moment an entry is saved, but the logic is unchanged. When you look at an account in any accounting system, you are looking at a ledger built by posting.</p>

<h2>The trial balance</h2>
<p>A <dfn>trial balance</dfn> lists every ledger account and its balance at a point in time, with debit balances in one column and credit balances in the other. If the two column totals agree, the ledger is mathematically in balance. Brightside’s, before any month-end adjustments, looks like this:</p>
${table(['Account', 'Debit', 'Credit'], TB, { cls: 'tb', foot: ['<b>Totals</b>', 14500, 14500] })}
<p>Accounts are listed in chart-of-accounts order: assets, liabilities, equity, dividends, revenues, expenses. The trial balance is also the starting point for the financial statements.</p>

<div class="callout warn"><span class="lbl">What a trial balance can’t tell you</span>
<p>Equal totals prove only that debits equal credits. The trial balance still balances if you:</p>
<ul>
<li>forget to record a transaction at all;</li>
<li>record it twice;</li>
<li>debit or credit the wrong account (say, Supplies instead of Equipment);</li>
<li>use the wrong amount on both sides;</li>
<li>make two errors that happen to cancel out.</li>
</ul></div>

<h3>Hunting for errors</h3>
<p>When the totals don’t agree, two quick tests narrow the search:</p>
<ul>
<li><b>Divide the difference by 2.</b> If an amount was posted to the wrong side, the difference is twice that amount. A $540 difference suggests a $270 item on the wrong side.</li>
<li><b>Divide the difference by 9.</b> If the difference divides evenly by 9, look for a <i>transposition</i> (writing 1,420 as 1,240) or a <i>slide</i> (writing 360 as 36). Both always create differences divisible by 9.</li>
</ul>

<h2>Try it yourself</h2>
<p>The Ledger Lab below is loaded with Brightside’s January. Post an entry of your own, for example a $250 utility bill paid in cash, then flip to the trial balance and statements to see it flow through.</p>
${widget('lab')}
`,
    terms: [
      ['Accounting cycle', 'The repeated sequence of steps from analyzing transactions to the post-closing trial balance.'],
      ['Journal', 'The book of original entry: a chronological record of transactions showing debits and credits.'],
      ['Journal entry', 'A record of one transaction: date, accounts and amounts debited, accounts and amounts credited, and an explanation.'],
      ['Compound entry', 'A journal entry with more than one debit, more than one credit, or both.'],
      ['General ledger', 'The complete set of a company’s accounts.'],
      ['Posting', 'Transferring journal entry amounts to the ledger accounts.'],
      ['Posting reference', 'A cross-reference between journal and ledger showing where an amount came from or went.'],
      ['Trial balance', 'A list of all ledger accounts and their balances, used to prove that total debits equal total credits.'],
      ['Transposition error', 'Swapping two digits, such as 1,420 for 1,240. The resulting difference is divisible by 9.'],
      ['Slide error', 'Moving a decimal point, such as 360 for 36. The resulting difference is divisible by 9.']
    ],
    videos: [
      {
        id: 'v1', title: 'Journalizing Brightside’s month',
        summary: 'All ten January transactions written in proper journal form, with the reasoning behind each debit and credit.',
        steps: [
          { say: 'Let’s journalize Brightside’s whole month. Every entry follows the same format: date, debits first, then credits, indented, then a short explanation.', f: { k: 'je', h: 'General Journal · page 1', entries: vj(0, 5), show: 0 } },
          { say: 'January 1. The owner invests ten thousand dollars. Debit Cash, credit Common Stock.', n: 1, hi: 0 },
          { say: 'January 2. Equipment bought for cash: debit Equipment, credit Cash. Notice Cash appears on the credit line, indented.', n: 2, hi: 1 },
          { say: 'January 3. Supplies on account: debit Supplies, credit Accounts Payable.', n: 3, hi: 2 },
          { say: 'January 10. Tutoring for cash. The work is done, so revenue is earned: debit Cash, credit Service Revenue.', n: 4, hi: 3 },
          { say: 'January 15. Tutoring billed to a school. Still earned, still revenue, but the debit goes to Accounts Receivable.', n: 5, hi: 4 },
          { say: 'On to the second half of the month.', f: { k: 'je', h: 'General Journal · page 2', entries: vj(5, 10), show: 0 } },
          { say: 'January 20. Rent paid: debit Rent Expense, credit Cash.', n: 1, hi: 0 },
          { say: 'January 25. Paying the supplier: debit Accounts Payable to reduce what’s owed, credit Cash. No expense here.', n: 2, hi: 1 },
          { say: 'January 28. Collecting from the school: debit Cash, credit Accounts Receivable. No new revenue; it was recorded on the fifteenth.', n: 3, hi: 2 },
          { say: 'January 30. Salary paid: debit Salaries Expense, credit Cash.', n: 4, hi: 3 },
          { say: 'January 31. The dividend: debit Dividends, credit Cash. Dividends are not an expense, so they get their own account.', n: 5, hi: 4 },
          { say: 'Ten entries, each one balanced. Next, these get posted to the ledger.', hi: [] }
        ]
      },
      {
        id: 'v2', title: 'From ledger to trial balance',
        summary: 'Brightside’s ledger after posting, each account’s balance, and the trial balance that proves debits equal credits.',
        steps: [
          { say: 'Here is Brightside’s general ledger after posting all ten entries. The small numbers are the January dates, our posting references.', f: { k: 't', accts: LEDGER, check: true } },
          { say: 'Cash has three debits and five credits. Thirteen thousand five hundred in, seven thousand seven hundred out, leaving a fifty-eight hundred dollar debit balance.', hi: 'Cash' },
          { say: 'Accounts receivable: eighteen hundred billed, one thousand collected, eight hundred still owed.', hi: 'Accounts Receivable' },
          { say: 'Accounts payable: six hundred owed, four hundred paid, a two hundred dollar credit balance.', hi: 'Accounts Payable' },
          { say: 'Now list every balance in a trial balance. Debit balances go in the left column...', f: { k: 'table', h: 'Brightside Tutoring · Trial Balance · January 31', head: ['Account', 'Debit', 'Credit'], rows: TB, foot: ['Totals', 14500, 14500], hc: 1, n: 10 } },
          { say: '...credit balances in the right.', hc: 2 },
          { say: 'Total debits: fourteen thousand five hundred. Total credits: fourteen thousand five hundred. The ledger is in balance.', hi: 'foot', hc: [] },
          { say: 'But remember what a balanced trial balance can’t prove.', f: { k: 'points', h: 'Still balances if you…', items: ['Skip a transaction entirely', 'Record a transaction twice', 'Use the wrong account on the correct side', 'Use the wrong amount on both sides', 'Make two errors that cancel out'] } },
          { say: 'And when it doesn’t balance: divide the difference by two to look for an amount on the wrong side, and by nine to look for transposed digits.', f: { k: 'points', h: 'When totals disagree', items: ['Difference ÷ 2 → an amount posted to the <b>wrong side</b>?', 'Difference ÷ 9 → a <b>transposition</b> (1,420 ↔ 1,240) or <b>slide</b> (360 ↔ 36)?', 'Still stuck: re-add each column, then retrace each posting'] } }
        ]
      }
    ],
    practice: [
      { type: 'mc', lvl: 1, q: 'Which sequence is correct?', choices: ['Post, journalize, analyze, trial balance', 'Analyze, journalize, post, trial balance', 'Journalize, analyze, trial balance, post', 'Analyze, post, journalize, trial balance'], answer: 1, explain: '<p>You decide what happened (analyze), write it down (journalize), copy it to the accounts (post), then check the totals (trial balance).</p>' },
      { type: 'je', lvl: 2, q: 'A company buys a delivery van for $28,000, paying $8,000 in cash and signing a note payable for the rest. Record the entry.', opts: ['Equipment', 'Cash', 'Notes Payable', 'Accounts Payable', 'Common Stock'], answer: [['Equipment', 28000, 0], ['Cash', 0, 8000], ['Notes Payable', 0, 20000]], explain: '<p>The van (recorded in Equipment) costs $28,000 regardless of how it was paid for. Cash goes down $8,000, and the $20,000 note is a liability.</p>' },
      { type: 'je', lvl: 2, q: 'A consultant finishes a $2,000 job. The client pays $1,200 now and will pay the remaining $800 next month. Record the entry.', opts: ['Cash', 'Accounts Receivable', 'Service Revenue', 'Unearned Revenue', 'Notes Payable'], answer: [['Cash', 1200, 0], ['Accounts Receivable', 800, 0], ['Service Revenue', 0, 2000]], explain: '<p>The full $2,000 is earned now. Part arrives as cash and part becomes a receivable.</p>' },
      { type: 'je', lvl: 1, q: 'A company pays a $500 cash dividend to its stockholders. Record the entry.', opts: ['Dividends', 'Cash', 'Salaries Expense', 'Common Stock', 'Retained Earnings'], answer: [['Dividends', 500, 0], ['Cash', 0, 500]], explain: '<p>Dividends increase with a debit (DEALER). They are not an expense, so don’t use an expense account.</p>' },
      { type: 'je', lvl: 1, q: 'A company collects $650 from customers who owed it for work done last month. Record the entry.', opts: ['Cash', 'Accounts Receivable', 'Service Revenue', 'Unearned Revenue', 'Accounts Payable'], answer: [['Cash', 650, 0], ['Accounts Receivable', 0, 650]], explain: '<p>The revenue was recorded last month when the work was done. Today one asset (the receivable) turns into another (cash).</p>' },
      { type: 'num', lvl: 2, q: 'A company’s accounts have these normal balances: Cash $4,200; Accounts Receivable $1,500; Supplies $300; Equipment $9,000; Accounts Payable $1,800; Notes Payable $5,000; Common Stock $7,000; Service Revenue $4,100; Salaries Expense $1,600; Rent Expense $900; Dividends $400. What is the total of the debit column on the trial balance?', answer: 17900, unit: '$', hint: 'Which of these accounts have normal debit balances?', explain: '<p>Debit balances: Cash, Accounts Receivable, Supplies, Equipment, Salaries Expense, Rent Expense and Dividends: $4,200 + $1,500 + $300 + $9,000 + $1,600 + $900 + $400 = $17,900. The credits ($1,800 + $5,000 + $7,000 + $4,100) also total $17,900.</p>' },
      { type: 'classify', lvl: 2, q: 'Would each error make the trial balance totals disagree?', cats: ['Totals disagree', 'Still balances'], items: [['An entire transaction was never recorded', 1], ['A debit to Supplies was posted to Equipment instead', 1], ['The credit half of an entry was posted twice', 0], ['A $90 entry was recorded as $900 on both sides', 1], ['The debit half of an entry was never posted', 0]], explain: '<p>The trial balance only catches errors that make one column bigger than the other. Missing, duplicated or wrong-account entries that keep debits equal to credits slip through.</p>' },
      { type: 'num', lvl: 2, q: 'A trial balance shows debits of $46,890 and credits of $46,350. If a single amount was posted to the wrong side, what amount was it?', answer: 270, unit: '$', hint: 'An amount on the wrong side changes the difference by twice that amount.', explain: '<p>Difference = $540. Moving an amount from one column to the other creates a difference of twice the amount, so look for $540 ÷ 2 = $270.</p>' },
      { type: 'mc', lvl: 3, q: 'Credits exceed debits on a trial balance by $180. Which single error is the most likely cause?', choices: ['A $1,420 debit was posted as $1,240', 'A $1,240 debit was posted as $1,420', 'A $90 credit was posted as a debit', 'A $180 entry was never recorded'], answer: 0, hint: '$180 divides evenly by 9.', explain: '<p>$180 ÷ 9 = 20, which points to a transposition. Posting a $1,420 debit as $1,240 makes debits $180 too small, so credits exceed debits by $180. Choice B would make debits too large. Choice C would make debits exceed credits. Choice D wouldn’t unbalance anything.</p>' },
      { type: 'num', lvl: 3, q: 'A bookkeeper’s trial balance shows total debits of $61,300 and total credits of $59,900. The only error: a $700 payment on account was posted as a debit to Accounts Payable and a debit to Cash. What are the correct totals for each column?', answer: 60600, unit: '$', hint: 'Fix the Cash posting: remove the wrong debit and add the credit that belongs there.', explain: '<p>Cash got a $700 debit instead of a $700 credit. Remove it from the debit column: $61,300 − $700 = $60,600. Add the missing credit: $59,900 + $700 = $60,600. Both columns now total $60,600.</p>' }
    ],
    more: ['journal entries for beginners', 'posting to the general ledger', 'how to prepare a trial balance']
  });
})();
