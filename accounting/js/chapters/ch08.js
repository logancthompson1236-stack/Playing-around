(function () {
  const { qc, je, jeMany, stmt, table } = Book;

  const BANK = [['Cash balance per bank statement', 8450, '$'], ['Add: Deposit in transit', 1200, 'u'], ['', 9650, ''], ['Less: Outstanding checks', 1500, 'u'], ['Adjusted cash balance', 8150, 'bd$']];
  const BOOK = [['Cash balance per books', 7923, '$'], ['Add: Note collected by bank', 480, 'iL'], ['Interest earned', 10, 'iL'], ['Error in recording check #214', 27, 'iLu'], ['', 517, ''],
    ['Less: NSF check from customer', 250, 'iL'], ['Bank service charge', 40, 'iLu'], ['', -290, 'u'], ['Adjusted cash balance', 8150, 'bd$']];
  const RECJE = [
    { date: 'Jun 30', lines: [['Cash', 480, 0], ['Notes Receivable', 0, 480]], memo: 'Note collected by bank' },
    { date: 'Jun 30', lines: [['Cash', 10, 0], ['Interest Revenue', 0, 10]], memo: 'Interest earned on account' },
    { date: 'Jun 30', lines: [['Cash', 27, 0], ['Supplies', 0, 27]], memo: 'Correct check #214: written for $69, recorded as $96' },
    { date: 'Jun 30', lines: [['Accounts Receivable', 250, 0], ['Cash', 0, 250]], memo: 'Customer’s check returned NSF' },
    { date: 'Jun 30', lines: [['Bank Service Charge Expense', 40, 0], ['Cash', 0, 40]], memo: 'June bank service charge' }
  ];
  const AGING = [['Not yet due', 30000, '1%', 300], ['1–30 days past due', 10000, '4%', 400], ['31–60 days past due', 6000, '10%', 600], ['61–90 days past due', 2500, '20%', 500], ['Over 90 days past due', 1500, '40%', 600]];

  Book.chapter({
    id: 'ch08', num: 8, part: 3, short: 'Cash & receivables',
    title: 'Cash & Receivables',
    blurb: 'Protecting cash with internal controls, reconciling the bank statement, and accounting for customers who don’t pay.',
    minutes: 35,
    objectives: [
      'Describe the main principles of internal control',
      'Prepare a bank reconciliation and record the entries it requires',
      'Estimate uncollectible accounts with the allowance method',
      'Record write-offs and recoveries, and compute interest on notes receivable'
    ],
    lesson: `
<p>Cash is the asset most easily lost, stolen or miscounted, and receivables are only worth what customers actually pay. This chapter covers the controls and the accounting that keep both honest.</p>

<h2>Internal control</h2>
<p><dfn>Internal control</dfn> is the set of policies and procedures a business uses to protect its assets, make its records reliable and encourage people to follow the rules. Most controls fall under a few principles:</p>
<ul>
<li><b>Establish responsibility.</b> Assign each task to a specific person. If two cashiers share a drawer, no one can be held accountable for a shortage.</li>
<li><b>Segregation of duties.</b> No one person should handle every part of a transaction. The employee who receives cash shouldn’t also record it, and the person who approves bills shouldn’t also write the checks.</li>
<li><b>Documentation.</b> Prenumbered receipts, invoices and checks create a trail and reveal gaps.</li>
<li><b>Physical controls.</b> Safes, locked storerooms, passwords, security cameras.</li>
<li><b>Independent verification.</b> Someone not involved in the work checks it: surprise cash counts, internal audits, and the monthly bank reconciliation.</li>
<li><b>Human resource controls.</b> Background checks, bonding employees who handle cash, required vacations (fraud often surfaces when the person hiding it is away).</li>
</ul>
<p>For cash specifically: deposit receipts intact every day, make payments by check or electronic transfer rather than with currency, and reconcile the bank account every month.</p>

<h2>The bank reconciliation</h2>
<p>The bank’s statement and the company’s Cash account rarely show the same balance at month-end, even when no one has made a mistake. Some items have reached one set of records but not the other yet. A <dfn>bank reconciliation</dfn> explains the difference and finds the true cash balance.</p>
<p>Items on the <b>bank side</b> are things the company already knows about but the bank hasn’t processed:</p>
<ul>
<li><dfn>Deposits in transit</dfn>: deposited by the company but not yet on the statement. <i>Add.</i></li>
<li><dfn>Outstanding checks</dfn>: written and recorded by the company but not yet cleared. <i>Subtract.</i></li>
<li>Bank errors.</li>
</ul>
<p>Items on the <b>book side</b> are things the bank knows about that the company learns from the statement:</p>
<ul>
<li>Collections the bank made for the company, and interest earned. <i>Add.</i></li>
<li><dfn>NSF checks</dfn> (customer checks returned for “not sufficient funds”), and bank service charges. <i>Subtract.</i></li>
<li>Errors in the company’s records.</li>
</ul>
<div class="callout example"><span class="lbl">Example: Harbor Café, June 30</span>
<p>The bank statement shows $8,450; the Cash account shows $7,923. Comparing the two turns up: a $1,200 deposit made on the evening of June 30; $1,500 of checks not yet cleared; a $480 note the bank collected for the café; $10 of interest; a $250 customer check returned NSF; a $40 service charge; and check #214 for supplies, written for $69 but recorded in the books as $96.</p></div>
${stmt('Harbor Café', 'Bank Reconciliation · June 30 · Bank side', BANK)}
${stmt('', 'Book side', BOOK)}
<p>Both sides arrive at $8,150, the true cash balance. That’s the amount that belongs on the balance sheet.</p>
<p><b>Only the book side needs journal entries.</b> Bank-side items will clear the bank on their own next month. Book-side items are things the company hasn’t recorded yet:</p>
${jeMany(RECJE)}
<p>Recording an NSF check as a receivable makes sense: the customer still owes the money.</p>

${qc({ type: 'classify', q: 'Where does each item go on the reconciliation?', cats: ['Add to bank', 'Subtract from bank', 'Add to books', 'Subtract from books'], items: [['Deposit in transit', 0], ['Outstanding check', 1], ['Interest the bank credited to the account', 2], ['Bank service charge', 3], ['Customer’s check returned NSF', 3]], explain: '<p>Ask “who doesn’t know yet?” The bank doesn’t know about deposits in transit and outstanding checks. The company doesn’t know about interest, fees and NSF checks until it reads the statement.</p>' })}

<h2>Accounts receivable and bad debts</h2>
<p>Selling on credit brings in more customers, but some of them won’t pay. Those losses are <b>bad debt expense</b> (also called uncollectible accounts expense). The question is <i>when</i> to record it.</p>
<p>The <b>direct write-off method</b> records the expense only when a specific account is declared uncollectible, often in a later year than the sale. It’s simple, but it breaks the matching principle and overstates receivables. GAAP doesn’t allow it when bad debts are material.</p>
<p>The <dfn>allowance method</dfn> estimates bad debts at the end of each period, in the same period as the related sales. Because the company doesn’t yet know <i>which</i> customers won’t pay, it can’t reduce Accounts Receivable directly. Instead it uses a contra-asset account, <dfn>Allowance for Doubtful Accounts</dfn>:</p>
${stmt('', '', [['Accounts receivable', 50000, 'L$'], ['Less: Allowance for doubtful accounts', 2400, 'Lu'], ['Net realizable value', 47600, 'b$']])}
<p>The difference, the <dfn>net realizable value</dfn> of receivables, is the amount the company actually expects to collect.</p>

<h3>Estimating the allowance</h3>
<p><b>Percentage of sales</b> (income statement approach): bad debt expense is a percentage of credit sales, based on experience. With $400,000 of credit sales and a 0.75% loss rate, bad debt expense is $3,000. The allowance’s existing balance doesn’t matter.</p>
<p><b>Percentage of receivables</b> (balance sheet approach): estimate what the allowance <i>should</i> be at year-end, then record whatever expense brings it to that target. The most refined version is an <dfn>aging schedule</dfn>, which applies higher loss rates to older balances:</p>
${table(['Age of account', 'Balance', 'Estimated uncollectible', 'Allowance needed'], AGING, { foot: ['<b>Total</b>', 50000, '', 2400], cls: 'compact' })}
<p>If the allowance already has a $600 credit balance, the adjusting entry is $2,400 − $600 = $1,800:</p>
${je([['Bad Debt Expense', 1800, 0], ['Allowance for Doubtful Accounts', 0, 1800]], { date: 'Dec 31', memo: 'Bring allowance to the $2,400 estimated by aging' })}
<p>If instead the allowance had a $300 <i>debit</i> balance (because more accounts were written off during the year than expected), the entry would be $2,400 + $300 = $2,700.</p>
<div class="callout"><span class="lbl">CECL</span>
<p>Current U.S. GAAP asks companies to estimate <i>lifetime expected</i> credit losses (the “current expected credit loss” model), using history, current conditions and forecasts. The bookkeeping is the same allowance and the same entries; the estimate simply looks further ahead.</p></div>

<h3>Writing off and recovering accounts</h3>
<p>When a specific customer is confirmed uncollectible, the account is written off against the allowance:</p>
${je([['Allowance for Doubtful Accounts', 750, 0], ['Accounts Receivable', 0, 750]], { date: 'Feb 12', memo: 'Write off R. Lowe’s account' })}
<p>No expense is recorded here; it was recorded when the allowance was estimated. Both AR and the allowance fall by $750, so net realizable value doesn’t change.</p>
<p>If the customer later pays after all, reverse the write-off and record the collection:</p>
${je([['Accounts Receivable', 750, 0], ['Allowance for Doubtful Accounts', 0, 750]], { date: 'May 3', memo: 'Reinstate R. Lowe’s account' })}
${je([['Cash', 750, 0], ['Accounts Receivable', 0, 750]], { date: 'May 3', memo: 'Collected from R. Lowe' })}

${qc({ type: 'mc', q: 'Before a $750 write-off, AR is $50,000 and the allowance is $2,400. What is net realizable value after the write-off?', choices: ['$46,850', '$47,600', '$48,350', '$49,250'], answer: 1, explain: '<p>Both accounts drop by $750: AR $49,250 − allowance $1,650 = $47,600, the same as before. A write-off under the allowance method doesn’t change net realizable value or expenses.</p>' })}

<h2>Notes receivable</h2>
<p>A <dfn>note receivable</dfn> is a written promise from a customer or borrower to pay a set amount, usually with interest, on a specific date. Interest is calculated as:</p>
<div class="formula">Interest <span class="op">=</span> Principal <span class="op">×</span> Annual rate <span class="op">×</span> Time<small>Time is a fraction of a year: months ÷ 12, or days ÷ 360 by common convention</small></div>
<p>A $10,000, 9%, four-month note earns $10,000 × 9% × 4/12 = $300. Its <b>maturity value</b>, principal plus interest, is $10,300. If the note spans year-end, the interest earned so far is accrued with an adjusting entry (debit Interest Receivable, credit Interest Revenue), just like the accrued revenues in Chapter 5.</p>
`,
    terms: [
      ['Internal control', 'Policies and procedures that protect assets, ensure reliable records and promote compliance.'],
      ['Segregation of duties', 'Dividing related tasks among different people so no one person controls a whole transaction.'],
      ['Bank reconciliation', 'A schedule explaining the difference between the bank statement balance and the book cash balance.'],
      ['Deposit in transit', 'A deposit recorded by the company but not yet on the bank statement.'],
      ['Outstanding check', 'A check recorded by the company that has not yet cleared the bank.'],
      ['NSF check', 'A check returned by the bank because the writer’s account had insufficient funds.'],
      ['Bad debt expense', 'The expense from customers who will not pay their accounts.'],
      ['Direct write-off method', 'Records bad debt expense only when an account is deemed uncollectible. Not GAAP when bad debts are material.'],
      ['Allowance method', 'Estimates bad debts each period and records them in a contra-asset allowance account.'],
      ['Allowance for Doubtful Accounts', 'A contra-asset account holding the estimated uncollectible portion of accounts receivable.'],
      ['Net realizable value (receivables)', 'Accounts receivable minus the allowance: the amount expected to be collected.'],
      ['Aging schedule', 'A table grouping receivables by how long they’ve been outstanding, with a loss rate for each group.'],
      ['Note receivable', 'A written promise from another party to pay a stated amount, usually with interest, by a set date.'],
      ['Maturity value', 'A note’s principal plus the interest due at maturity.']
    ],
    videos: [
      {
        id: 'v1', title: 'Bank reconciliation, step by step',
        summary: 'Harbor Café’s June bank statement and cash account disagree by $527. Here’s how to explain every dollar.',
        steps: [
          { say: 'Harbor Café’s bank statement says eighty-four fifty. Its books say seventy-nine twenty-three. Neither is the true cash balance yet. We’ll fix each side separately.', f: { k: 'title', eyebrow: 'Example 8.A', h: '$8,450 vs. $7,923', sub: 'Harbor Café · bank reconciliation · June 30' } },
          { say: 'Start with the bank side. Begin with the statement balance.', f: { k: 'stmt', h: 'Bank side', sub: 'Things the bank hasn’t processed yet', rows: BANK, n: 1, hi: 0 } },
          { say: 'The café dropped off twelve hundred dollars on the evening of June thirtieth. The bank hasn’t recorded it. That’s a deposit in transit: add it.', n: 3, hi: [1, 2] },
          { say: 'Fifteen hundred dollars of checks the café wrote haven’t cleared yet. Outstanding checks: subtract them.', n: 4, hi: 3 },
          { say: 'Adjusted bank balance: eighty-one fifty.', n: 5, hi: 4 },
          { say: 'Now the book side. Start with the cash account balance.', f: { k: 'stmt', h: 'Book side', sub: 'Things the café learns from the statement', rows: BOOK, n: 1, hi: 0 } },
          { say: 'The bank collected a four hundred eighty dollar note for the café and paid ten dollars of interest. And check two-fourteen was written for sixty-nine dollars but entered as ninety-six, so the books are twenty-seven dollars too low. Add all three.', n: 5, hi: [1, 2, 3, 4] },
          { say: 'A customer’s two hundred fifty dollar check bounced, and the bank charged a forty dollar fee. Subtract both.', n: 8, hi: [5, 6, 7] },
          { say: 'Adjusted book balance: eighty-one fifty. Both sides agree. That’s the cash figure for the balance sheet.', n: 9, hi: 8 },
          { say: 'Last step: journal entries, but only for the book-side items. The bank side will sort itself out when the deposit and checks clear.', f: { k: 'je', h: 'Entries from the reconciliation', entries: RECJE.map((e) => ({ d: e.date, lines: e.lines, memo: e.memo })) } }
        ]
      },
      {
        id: 'v2', title: 'The allowance method: estimate, write off, recover',
        summary: 'An aging schedule sets the allowance, a customer is written off, and later pays. Watch what changes, and what doesn’t.',
        steps: [
          { say: 'At year-end the café’s catering division has fifty thousand dollars of receivables. Not all of it will be collected. An aging schedule estimates how much won’t.', f: { k: 'table', h: 'Aging schedule · December 31', head: ['Age', 'Balance', 'Rate', 'Allowance needed'], rows: AGING, foot: ['Total', 50000, '', 2400], hc: [] } },
          { say: 'The older an account, the less likely it is to be paid. One percent of current accounts, but forty percent of those more than ninety days late.', hc: 2 },
          { say: 'Altogether, the allowance should be twenty-four hundred dollars.', hi: 'foot', hc: 3 },
          { say: 'The allowance already has a six hundred dollar credit balance. So we only need eighteen hundred more. That’s the bad debt expense for the year.', f: { k: 'split', a: { k: 'je', entries: [{ d: 'Dec 31', lines: [['Bad Debt Expense', 1800, 0], ['Allowance for Doubtful Accounts', 0, 1800]], memo: 'Adjust allowance to $2,400' }] }, b: { k: 't', accts: [{ n: 'Accounts Receivable', dr: [['Bal', 50000]] }, { n: 'Allowance for Doubtful Accounts', cr: [['Bal', 600], ['12/31', 1800]] }], hi: 'Allowance for Doubtful Accounts' } } },
          { say: 'On the balance sheet: fifty thousand of receivables, less the twenty-four hundred allowance. Net realizable value, forty-seven thousand six hundred.', f: { k: 'stmt', h: 'Receivables on the balance sheet', rows: [['Accounts receivable', 50000, 'L$'], ['Less: Allowance for doubtful accounts', 2400, 'Lu'], ['Net realizable value', 47600, 'b$']], hi: 2 } },
          { say: 'In February, a customer who owes seven hundred fifty goes out of business. Write the account off: debit the allowance, credit Accounts Receivable. No expense. That was recorded in December.', f: { k: 'split', a: { k: 'je', entries: [{ d: 'Feb 12', lines: [['Allowance for Doubtful Accounts', 750, 0], ['Accounts Receivable', 0, 750]], memo: 'Write off R. Lowe' }] }, b: { k: 't', accts: [{ n: 'Accounts Receivable', dr: [['Bal', 50000]], cr: [['2/12', 750]] }, { n: 'Allowance for Doubtful Accounts', dr: [['2/12', 750]], cr: [['Bal', 2400]] }], hi: ['Accounts Receivable', 'Allowance for Doubtful Accounts'] } } },
          { say: 'Both accounts fell by seven fifty. So net realizable value hasn’t moved: still forty-seven six. The write-off just confirms an estimate we already made.', f: { k: 'stmt', h: 'After the write-off', rows: [['Accounts receivable', 49250, 'L$'], ['Less: Allowance for doubtful accounts', 1650, 'Lu'], ['Net realizable value', 47600, 'b$']], hi: 2 } },
          { say: 'In May, surprise: the customer pays after all. Two entries. First, reverse the write-off. Then record the cash collection like any other.', f: { k: 'je', h: 'Recovery', entries: [{ d: 'May 3', lines: [['Accounts Receivable', 750, 0], ['Allowance for Doubtful Accounts', 0, 750]], memo: 'Reinstate the account' }, { d: 'May 3', lines: [['Cash', 750, 0], ['Accounts Receivable', 0, 750]], memo: 'Collect it' }] } },
          { say: 'Three things to remember. The expense is recorded when you estimate, in the period of the sales. Write-offs hit only the balance sheet. And they don’t change net realizable value.', f: { k: 'points', h: 'The allowance method in three lines', items: ['Estimate at period end → <b>Bad Debt Expense</b> in the same period as the sales', 'Write-off → allowance and receivable both fall; <b>no expense</b>', 'Net realizable value is <b>unchanged</b> by a write-off or recovery'] } }
        ]
      }
    ],
    practice: [
      { type: 'classify', lvl: 1, q: 'On which side of a bank reconciliation does each item belong?', cats: ['Bank side', 'Book side'], items: [['Deposit in transit', 0], ['Outstanding check', 0], ['NSF check from a customer', 1], ['Monthly service charge', 1], ['Interest earned on the account', 1], ['The bank charged another company’s check to this account', 0]], explain: '<p>Bank-side items are things the company recorded that the bank hasn’t yet (or got wrong). Book-side items are things the bank recorded that the company hasn’t yet (or got wrong).</p>' },
      { type: 'num', lvl: 1, q: 'The bank statement shows $12,600. Deposits in transit total $2,300 and outstanding checks total $3,150. What is the adjusted cash balance?', answer: 11750, unit: '$', explain: '<p>$12,600 + $2,300 − $3,150 = $11,750.</p>' },
      { type: 'num', lvl: 2, q: 'For the same company, the books show $11,420. The statement reveals a $35 service charge, a $420 NSF check, and a $785 electronic payment from a customer that hasn’t been recorded. What is the adjusted book balance?', answer: 11750, unit: '$', explain: '<p>$11,420 − $35 − $420 + $785 = $11,750, which agrees with the adjusted bank balance.</p>' },
      { type: 'je', lvl: 1, q: 'Record the journal entry for the $420 NSF check found during the reconciliation.', opts: ['Accounts Receivable', 'Cash', 'Bad Debt Expense', 'Bank Service Charge Expense', 'Allowance for Doubtful Accounts'], answer: [['Accounts Receivable', 420, 0], ['Cash', 0, 420]], explain: '<p>The deposit didn’t really add to cash, so reduce Cash. The customer still owes the money, so restore the receivable.</p>' },
      { type: 'mc', lvl: 1, q: 'Which practice best illustrates segregation of duties?', choices: ['Requiring employees to take vacations', 'Having the person who opens the mail and lists checks be different from the person who records them', 'Storing cash in a safe', 'Using prenumbered sales receipts'], answer: 1, explain: '<p>Separating custody of cash from recording it means one person can’t take cash and hide it in the records. The other choices are other control principles (human resource, physical, documentation).</p>' },
      { type: 'num', lvl: 1, q: 'A company estimates bad debts at 0.75% of credit sales. Credit sales this year were $400,000. What is bad debt expense?', answer: 3000, unit: '$', explain: '<p>$400,000 × 0.75% = $3,000. Under the percentage-of-sales approach, the existing allowance balance doesn’t affect the expense.</p>' },
      { type: 'num', lvl: 2, q: 'An aging schedule says the allowance should be $6,400. Before adjustment, the allowance has a $1,100 credit balance. What is bad debt expense?', answer: 5300, unit: '$', explain: '<p>Target $6,400 − existing credit $1,100 = $5,300.</p>' },
      { type: 'num', lvl: 2, q: 'Same target of $6,400, but this time the allowance has a $900 debit balance before adjustment. What is bad debt expense?', answer: 7300, unit: '$', hint: 'A debit balance means the allowance is below zero.', explain: '<p>The entry must first cover the $900 debit balance and then build $6,400 of credit: $900 + $6,400 = $7,300.</p>' },
      { type: 'je', lvl: 1, q: 'Using the allowance method, a company writes off a $1,250 account as uncollectible. Record the entry.', opts: ['Allowance for Doubtful Accounts', 'Accounts Receivable', 'Bad Debt Expense', 'Cash', 'Sales Revenue'], answer: [['Allowance for Doubtful Accounts', 1250, 0], ['Accounts Receivable', 0, 1250]], explain: '<p>The expense was already estimated. The write-off just removes the specific receivable and uses up part of the allowance.</p>' },
      { type: 'num', lvl: 1, q: 'Accounts receivable are $84,000 and the allowance for doubtful accounts is $3,700. What is the net realizable value of receivables?', answer: 80300, unit: '$', explain: '<p>$84,000 − $3,700 = $80,300.</p>' },
      { type: 'num', lvl: 2, q: 'A company accepts a $15,000, 90-day, 6% note from a customer. Using a 360-day year, how much interest will it earn?', answer: 225, unit: '$', explain: '<p>$15,000 × 6% × 90/360 = $225. Maturity value = $15,225.</p>' },
      { type: 'mc', lvl: 3, q: 'A company uses the direct write-off method even though its bad debts are material. Which principle does this most clearly violate?', choices: ['Historical cost', 'Expense recognition (matching)', 'Going concern', 'Monetary unit'], answer: 1, explain: '<p>Under direct write-off, the expense lands when the account goes bad, often a year after the sale that caused it. That fails to match the expense with the revenue it relates to.</p>' }
    ],
    more: ['bank reconciliation example', 'allowance for doubtful accounts aging method', 'internal control principles accounting']
  });
})();
