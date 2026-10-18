(function () {
  const { qc, je, jeMany, table, widget, tgrid, stmt } = Book;

  const ADJ = [
    { date: 'Jan 31', lines: [['Supplies Expense', 350, 0], ['Supplies', 0, 350]], memo: 'Supplies used: $600 bought, $250 on hand' },
    { date: 'Jan 31', lines: [['Depreciation Expense', 100, 0], ['Accumulated Depreciation', 0, 100]], memo: 'January depreciation on equipment' },
    { date: 'Jan 31', lines: [['Salaries Expense', 180, 0], ['Salaries Payable', 0, 180]], memo: 'Salary earned Jan 29–31, not yet paid' },
    { date: 'Jan 31', lines: [['Accounts Receivable', 200, 0], ['Service Revenue', 0, 200]], memo: 'Tutoring done Jan 31, not yet billed' }
  ];
  const ATB = [['Cash', 5800, ''], ['Accounts Receivable', 1000, ''], ['Supplies', 250, ''], ['Equipment', 4800, ''], ['Accumulated Depreciation', '', 100],
    ['Accounts Payable', '', 200], ['Salaries Payable', '', 180], ['Common Stock', '', 10000], ['Dividends', 300, ''], ['Service Revenue', '', 4500],
    ['Salaries Expense', 1380, ''], ['Rent Expense', 1000, ''], ['Supplies Expense', 350, ''], ['Depreciation Expense', 100, '']];
  const NIREC = [['Net income before adjustments', 2100, '$'], ['Supplies used', -350, 'i'], ['Depreciation', -100, 'i'], ['Salary owed for Jan 29–31', -180, 'i'],
    ['Tutoring done but not billed', 200, 'iu'], ['Net income after adjustments', 1670, 'bd$']];

  Book.chapter({
    id: 'ch05', num: 5, part: 2, short: 'Adjusting entries',
    title: 'Accrual Accounting & Adjusting Entries',
    blurb: 'Why profit isn’t the same as cash, and the month-end entries that put revenue and expenses in the right period.',
    minutes: 35,
    objectives: [
      'Contrast cash-basis and accrual-basis accounting',
      'Explain why adjusting entries are needed at the end of every period',
      'Record adjustments for prepaid expenses, depreciation and unearned revenue (deferrals)',
      'Record adjustments for accrued revenues and accrued expenses (accruals)',
      'Prepare an adjusted trial balance'
    ],
    lesson: `
<p>So far, Brightside has recorded transactions as they happened: a check written, a bill sent, cash collected. But some of the most important economic events don’t come with a receipt. Supplies get used up a little each day. Equipment wears out. An employee works on the last three days of the month and won’t be paid until next week. This chapter is about capturing those events.</p>

<h2>Cash basis versus accrual basis</h2>
<p>Under <dfn>cash-basis accounting</dfn>, revenue is recorded when cash is received and expenses when cash is paid. It’s simple, and many very small businesses and individuals use it for taxes. But it can badly misstate how a business performed in a given period.</p>
<p>Under <dfn>accrual-basis accounting</dfn>, revenue is recorded when it is earned and expenses when they are incurred, regardless of when cash moves. This is what GAAP requires. It follows directly from two principles you met in Chapter 1: revenue recognition and expense recognition (matching).</p>
${widget('cashaccrual')}
<p>Look at the cash-basis columns: a loss in January, a big profit in February, a loss in March. Nothing that dramatic happened to the business. Cash simply arrived and left on an uneven schedule. The accrual columns show the steady business underneath.</p>

<h2>Why adjusting entries are needed</h2>
<p>The time period assumption says we report every month, quarter or year. At the end of each period, some account balances are out of date because certain events don’t trigger a transaction on their own. <dfn>Adjusting entries</dfn> are journal entries made at the end of a period to bring those accounts up to date, so that revenues and expenses land in the period they belong to.</p>
<p>Adjustments come in two families:</p>
<ul>
<li><dfn>Deferrals</dfn>: <b>cash moves first</b>, and the revenue or expense is recognized later. Prepaid expenses, depreciation and unearned revenue.</li>
<li><dfn>Accruals</dfn>: <b>the revenue or expense happens first</b>, and cash moves later. Accrued revenues and accrued expenses.</li>
</ul>
<div class="callout"><span class="lbl">Two rules that always hold</span>
<p>Every adjusting entry affects <b>one income statement account</b> (a revenue or an expense) and <b>one balance sheet account</b> (an asset or a liability). And an adjusting entry <b>never involves Cash</b>. If cash had moved, it would have been recorded as an ordinary transaction.</p></div>

<h2>Prepaid expenses</h2>
<p>A <dfn>prepaid expense</dfn> is a cost paid in advance that benefits future periods: insurance, rent, supplies. When paid, it’s recorded as an asset. As time passes and the benefit is used up, the used portion moves to expense.</p>
<p>Suppose a business pays $2,400 on January 1 for a 12-month insurance policy. On January 1 it records the asset:</p>
${je([['Prepaid Insurance', 2400, 0], ['Cash', 0, 2400]], { date: 'Jan 1', memo: 'Paid for 12 months of insurance' })}
<p>By January 31, one month of coverage ($2,400 ÷ 12 = $200) has expired. The adjusting entry moves that amount to expense:</p>
${je([['Insurance Expense', 200, 0], ['Prepaid Insurance', 0, 200]], { date: 'Jan 31', memo: 'Adjusting entry: one month of insurance used' })}
<p>Prepaid Insurance now shows $2,200, the eleven months of coverage still ahead.</p>
<p><b>Supplies</b> work the same way, except that it isn’t practical to record every pen as it’s used. Instead, the business counts what’s left at period end. Supplies used = supplies available − supplies on hand. Brightside bought $600 of supplies in January; a count on January 31 finds $250 left, so $350 was used.</p>

<h2>Depreciation</h2>
<p>Equipment, vehicles and buildings provide service for years. <dfn>Depreciation</dfn> spreads an asset’s cost over its useful life as an expense, matching the cost to the periods that benefit from it. Depreciation is an allocation of cost, not a measure of market value.</p>
<p>Brightside’s $4,800 of equipment is expected to last four years (48 months) with no value at the end, so each month carries $4,800 ÷ 48 = $100 of depreciation:</p>
${je([['Depreciation Expense', 100, 0], ['Accumulated Depreciation', 0, 100]], { date: 'Jan 31', memo: 'Adjusting entry: January depreciation' })}
<p>Notice the credit doesn’t go to Equipment directly. It goes to <dfn>Accumulated Depreciation</dfn>, a contra-asset account that builds up over the asset’s life. On the balance sheet it is subtracted from the asset’s cost, and the difference is the asset’s <dfn>book value</dfn> (or carrying value):</p>
${stmt('', '', [['Equipment', 4800, 'L'], ['Less: Accumulated depreciation', 100, 'Lu'], ['Book value', 4700, 'b']])}
<p>Keeping cost and accumulated depreciation separate shows readers both what the asset cost and how much of it has been used. Chapter 9 covers other depreciation methods.</p>

${qc({ type: 'je', q: 'On March 1 a company paid $1,800 for six months of rent in advance and recorded it as Prepaid Rent. Record the adjusting entry on March 31.', opts: ['Rent Expense', 'Prepaid Rent', 'Cash', 'Rent Payable', 'Accounts Payable'], answer: [['Rent Expense', 300, 0], ['Prepaid Rent', 0, 300]], explain: '<p>$1,800 ÷ 6 = $300 per month. One month has been used, so move $300 from the asset to the expense. No cash moves at month-end.</p>' })}

<h2>Unearned revenue</h2>
<p>Sometimes customers pay before the work is done: a gym membership, a magazine subscription, a deposit on a project. The business owes the customer the service, so the cash received is a liability called <dfn>unearned revenue</dfn> (or deferred revenue). As the work is performed, the liability shrinks and revenue is recognized.</p>
<p>On January 1 a family pays Brightside $900 for three months of weekly tutoring:</p>
${je([['Cash', 900, 0], ['Unearned Revenue', 0, 900]], { date: 'Jan 1', memo: 'Received payment for Jan–Mar tutoring in advance' })}
${je([['Unearned Revenue', 300, 0], ['Service Revenue', 0, 300]], { date: 'Jan 31', memo: 'Adjusting entry: one month of tutoring delivered' })}
<p>(To keep Brightside’s numbers simple, this family’s prepayment is left out of the trial balance used in the rest of the chapter.)</p>

<h2>Accrued revenues</h2>
<p><dfn>Accrued revenues</dfn> are revenues earned but not yet recorded or billed: work finished at month-end that hasn’t been invoiced, interest earned on a loan to someone else. The adjustment records an asset (a receivable) and the revenue.</p>
<p>Brightside tutored a student on January 31 and will bill the $200 in February. The revenue belongs in January:</p>
${je([['Accounts Receivable', 200, 0], ['Service Revenue', 0, 200]], { date: 'Jan 31', memo: 'Adjusting entry: tutoring done, not yet billed' })}

<h2>Accrued expenses</h2>
<p><dfn>Accrued expenses</dfn> are expenses incurred but not yet paid or recorded: wages earned by employees since the last payday, interest owed on a loan, utilities used. The adjustment records the expense and a liability.</p>
<div class="callout example"><span class="lbl">Example: accrued salaries</span>
<p>A company pays $1,000 for each five-day work week, every Friday. This month ends on a Wednesday. Employees have worked Monday through Wednesday, three days, earning $600 that won’t be paid until Friday. The month-end adjustment:</p>
${je([['Salaries Expense', 600, 0], ['Salaries Payable', 0, 600]], { date: 'Month end', memo: 'Adjusting entry: three days of salaries owed' })}
<p>On Friday the full $1,000 is paid. $600 settles the liability; only the $400 for Thursday and Friday is new expense:</p>
${je([['Salaries Payable', 600, 0], ['Salaries Expense', 400, 0], ['Cash', 0, 1000]], { date: 'Friday', memo: 'Paid weekly salaries' })}</div>
<p><b>Interest</b> accrues the same way. Interest = principal × annual rate × fraction of a year. A $6,000 note at 6% accrues $6,000 × 6% × 1/12 = $30 per month.</p>

${qc({ type: 'mc', q: 'A company forgets to record $900 of salaries its employees earned in the last week of December. What is the effect on the December financial statements?', choices: ['Expenses overstated, net income understated, liabilities overstated', 'Expenses understated, net income overstated, liabilities understated', 'Expenses understated, net income overstated, assets overstated', 'No effect, because the salaries will be paid in January'], answer: 1, explain: '<p>The missing entry is Salaries Expense $900 / Salaries Payable $900. Without it, expenses are too low (so net income is too high) and liabilities are too low.</p>' })}

<h2>Brightside’s month-end</h2>
<p>Back to Brightside on January 31. Four facts need adjusting entries:</p>
<ol>
<li>A count shows $250 of supplies on hand, out of $600 bought.</li>
<li>Equipment depreciates $100 a month.</li>
<li>The assistant worked January 29 through 31, earning $180 that will be paid in February.</li>
<li>A $200 session on January 31 hasn’t been billed.</li>
</ol>
${jeMany(ADJ)}
<p>After posting these, the <dfn>adjusted trial balance</dfn> lists every balance including the adjustments. It’s the source for the financial statements.</p>
${table(['Account', 'Debit', 'Credit'], ATB, { cls: 'tb', foot: ['<b>Totals</b>', 14980, 14980] })}
<p>The adjustments changed Brightside’s profit. Before adjusting, the books showed net income of $2,100. After adjusting, they show $1,670:</p>
${stmt('', 'Effect of January adjustments', NIREC)}
<p>That $430 difference isn’t a mistake in the original numbers. It’s the part of the month’s economic activity that no transaction had captured yet.</p>
`,
    terms: [
      ['Cash-basis accounting', 'Recording revenue when cash is received and expenses when cash is paid. Not allowed under GAAP for most businesses.'],
      ['Accrual-basis accounting', 'Recording revenue when earned and expenses when incurred, regardless of when cash moves. Required by GAAP.'],
      ['Adjusting entries', 'End-of-period entries that update accounts so revenues and expenses are recorded in the correct period.'],
      ['Deferral', 'An adjustment where cash moved first and the revenue or expense is recognized later.'],
      ['Accrual', 'An adjustment where the revenue or expense happened first and cash moves later.'],
      ['Prepaid expense', 'A cost paid in advance, recorded as an asset until it is used up.'],
      ['Depreciation', 'Allocating the cost of a long-lived asset to expense over its useful life.'],
      ['Accumulated depreciation', 'A contra-asset account holding all depreciation recorded on an asset to date.'],
      ['Book value', 'An asset’s cost minus its accumulated depreciation; also called carrying value.'],
      ['Unearned revenue', 'Cash received before the related goods or services are delivered. A liability until earned.'],
      ['Accrued revenue', 'Revenue earned but not yet received in cash or recorded.'],
      ['Accrued expense', 'An expense incurred but not yet paid or recorded, such as wages or interest owed.'],
      ['Adjusted trial balance', 'A trial balance prepared after posting adjusting entries; the basis for the financial statements.'],
      ['Interest', 'Principal × annual rate × fraction of a year.']
    ],
    videos: [
      {
        id: 'v1', title: 'Deferrals: paying and getting paid in advance',
        summary: 'A year of prepaid insurance and three months of prepaid tutoring, followed from the first cash payment through the month-end adjustment.',
        steps: [
          { say: 'A deferral starts with cash. Money changes hands first; the expense or revenue is recognized later, a month at a time.', f: { k: 'title', eyebrow: 'Example 5.A', h: 'Deferrals', sub: 'Prepaid insurance and unearned revenue' } },
          { say: 'On January 1, a business pays two thousand four hundred dollars for twelve months of insurance. The coverage is used up evenly over the year.', f: { k: 'tl', h: 'Prepaid insurance', pts: [{ at: 'Jan 1', l: 'Pay <b>$2,400</b> for 12 months' }, { at: 'Jan 31', l: '1 month used: $200' }, { at: 'Jun 30', l: '6 months used: $1,200' }, { at: 'Dec 31', l: 'All used: $2,400' }], hi: 0 } },
          { say: 'On the day it pays, it hasn’t used any coverage yet. So it records an asset, Prepaid Insurance, and reduces cash.', f: { k: 'split', a: { k: 'je', entries: [{ d: 'Jan 1', lines: [['Prepaid Insurance', 2400, 0], ['Cash', 0, 2400]], memo: 'Paid 12 months of insurance' }] }, b: { k: 't', accts: [{ n: 'Prepaid Insurance', dr: [['1/1', 2400]] }, { n: 'Insurance Expense' }], hi: 'Prepaid Insurance' } } },
          { say: 'At the end of January, one month of coverage, two hundred dollars, has expired.', f: { k: 'tl', h: 'Prepaid insurance', pts: [{ at: 'Jan 1', l: 'Pay $2,400 for 12 months' }, { at: 'Jan 31', l: '1 month used: <b>$200</b>' }, { at: 'Jun 30', l: '6 months used: $1,200' }, { at: 'Dec 31', l: 'All used: $2,400' }], hi: 1 } },
          { say: 'The adjusting entry moves that two hundred dollars from the asset to an expense. Debit Insurance Expense, credit Prepaid Insurance. No cash involved.', f: { k: 'split', a: { k: 'je', entries: [{ d: 'Jan 31', lines: [['Insurance Expense', 200, 0], ['Prepaid Insurance', 0, 200]], memo: 'Adjusting: one month used' }] }, b: { k: 't', accts: [{ n: 'Prepaid Insurance', dr: [['1/1', 2400]], cr: [['1/31', 200]] }, { n: 'Insurance Expense', dr: [['1/31', 200]] }], hi: ['Prepaid Insurance', 'Insurance Expense'] } } },
          { say: 'Now the balance sheet shows twenty-two hundred dollars of coverage still to come, and January’s income statement shows two hundred of insurance expense. Every month repeats the same entry.', hi: [] },
          { say: 'Unearned revenue is the mirror image. On January 1 a family pays Brightside nine hundred dollars for three months of tutoring.', f: { k: 'tl', h: 'Unearned revenue', pts: [{ at: 'Jan 1', l: 'Family prepays <b>$900</b> for Jan–Mar' }, { at: 'Jan 31', l: '1 month taught: $300 earned' }, { at: 'Feb 28', l: '$600 earned' }, { at: 'Mar 31', l: 'All $900 earned' }], hi: 0 } },
          { say: 'Brightside hasn’t taught anything yet, so it can’t record revenue. It owes the family three months of lessons: a liability, Unearned Revenue.', f: { k: 'split', a: { k: 'je', entries: [{ d: 'Jan 1', lines: [['Cash', 900, 0], ['Unearned Revenue', 0, 900]], memo: 'Received payment in advance' }] }, b: { k: 't', accts: [{ n: 'Unearned Revenue', cr: [['1/1', 900]] }, { n: 'Service Revenue' }], hi: 'Unearned Revenue' } } },
          { say: 'At the end of January, one month of lessons has been delivered. Debit Unearned Revenue to shrink the liability; credit Service Revenue for the three hundred dollars earned.', f: { k: 'split', a: { k: 'je', entries: [{ d: 'Jan 31', lines: [['Unearned Revenue', 300, 0], ['Service Revenue', 0, 300]], memo: 'Adjusting: one month earned' }] }, b: { k: 't', accts: [{ n: 'Unearned Revenue', dr: [['1/31', 300]], cr: [['1/1', 900]] }, { n: 'Service Revenue', cr: [['1/31', 300]] }], hi: ['Unearned Revenue', 'Service Revenue'] } } },
          { say: 'The pattern for every deferral: cash first, recorded on the balance sheet. Then, as time passes, an adjusting entry moves the used or earned portion to the income statement.', f: { k: 'points', h: 'The deferral pattern', items: ['Cash moves first → record an <b>asset</b> (prepaid) or a <b>liability</b> (unearned)', 'Time passes → the benefit is used or the service is delivered', 'Adjust: move that portion to an <b>expense</b> or a <b>revenue</b>', 'Never touch Cash in the adjustment'] } }
        ]
      },
      {
        id: 'v2', title: 'Accruals and Brightside’s month-end',
        summary: 'Brightside’s four January adjustments, what each does to profit, and the adjusted trial balance that results.',
        steps: [
          { say: 'It’s January 31 at Brightside. Four facts haven’t made it into the books yet.', f: { k: 'points', h: 'Month-end facts', items: ['Supplies count: <b>$250</b> on hand (bought $600)', 'Equipment wears out: <b>$100</b> of depreciation a month', 'Assistant worked Jan 29–31: <b>$180</b> earned, paid in February', 'A $200 session on Jan 31 hasn’t been billed'] } },
          { say: 'First, supplies. Six hundred available, two-fifty left, so three hundred fifty was used. Debit Supplies Expense, credit Supplies. That’s a deferral.', f: { k: 'je', h: 'Adjusting entries · January 31', entries: ADJ.map((e) => ({ d: e.date, lines: e.lines, memo: e.memo })), show: 1, hi: 0 } },
          { say: 'Second, depreciation. Debit Depreciation Expense one hundred, credit Accumulated Depreciation, the contra-asset.', n: 2, hi: 1 },
          { say: 'Third, an accrued expense. The assistant has earned one hundred eighty dollars that hasn’t been paid. Debit Salaries Expense, credit Salaries Payable, a liability.', n: 3, hi: 2 },
          { say: 'Fourth, accrued revenue. The work is done, so the revenue is earned. Debit Accounts Receivable, credit Service Revenue, two hundred dollars.', n: 4, hi: 3 },
          { say: 'Check the two rules. Every entry pairs one income statement account with one balance sheet account, and not one of them touches Cash.', hi: [0, 1, 2, 3] },
          { say: 'What did that do to profit? Before adjustments, net income was twenty-one hundred dollars.', f: { k: 'stmt', h: 'Net income, before and after', sub: 'January', rows: NIREC, n: 1, hi: 0 } },
          { say: 'Three adjustments added expenses: supplies used, depreciation, and the salary owed.', n: 5, hi: [1, 2, 3] },
          { say: 'One added revenue: the unbilled session.', hi: 4 },
          { say: 'Adjusted net income: sixteen hundred seventy dollars. That’s the number that goes on Brightside’s income statement.', n: 6, hi: 5 },
          { say: 'After posting, here is the adjusted trial balance. New accounts have appeared: Accumulated Depreciation, Salaries Payable, and two new expenses.', f: { k: 'table', h: 'Adjusted Trial Balance · January 31', head: ['Account', 'Debit', 'Credit'], rows: ATB, foot: ['Totals', 14980, 14980], hi: [4, 6, 12, 13] } },
          { say: 'And it still balances: fourteen thousand nine hundred eighty on each side. In the next chapter, this becomes Brightside’s financial statements.', hi: 'foot' }
        ]
      }
    ],
    practice: [
      { type: 'mc', lvl: 1, q: 'Under accrual-basis accounting, when is revenue recorded?', choices: ['When cash is received', 'When the customer is billed', 'When it is earned by delivering goods or services', 'At the end of the year'], answer: 2, explain: '<p>Accrual accounting follows the revenue recognition principle: record revenue when the performance is complete, whether or not cash or even a bill has changed hands.</p>' },
      { type: 'je', lvl: 1, q: 'On September 1 a company paid $3,600 for a 12-month insurance policy and debited Prepaid Insurance. Record the adjusting entry needed on December 31.', opts: ['Insurance Expense', 'Prepaid Insurance', 'Cash', 'Insurance Payable', 'Accounts Payable'], answer: [['Insurance Expense', 1200, 0], ['Prepaid Insurance', 0, 1200]], hint: 'How many months of coverage have been used by December 31?', explain: '<p>Monthly cost: $3,600 ÷ 12 = $300. September through December is four months: $1,200 used. Move it from the asset to expense.</p>' },
      { type: 'num', lvl: 1, q: 'The Supplies account began the year at $400. The company bought $1,100 of supplies during the year. A year-end count shows $350 on hand. How much is Supplies Expense for the year?', answer: 1150, unit: '$', explain: '<p>Available: $400 + $1,100 = $1,500. Used: $1,500 − $350 = $1,150. The adjusting entry debits Supplies Expense and credits Supplies for $1,150.</p>' },
      { type: 'je', lvl: 1, q: 'Monthly depreciation on a company’s equipment is $250. Record the month-end adjusting entry.', opts: ['Depreciation Expense', 'Accumulated Depreciation', 'Equipment', 'Cash', 'Accounts Payable'], answer: [['Depreciation Expense', 250, 0], ['Accumulated Depreciation', 0, 250]], explain: '<p>The credit goes to the contra-asset Accumulated Depreciation, not to Equipment, so the asset’s original cost stays visible.</p>' },
      { type: 'je', lvl: 2, q: 'On November 1 a company received $6,000 for six months of services beginning that day and credited Unearned Revenue. Record the adjusting entry on December 31.', opts: ['Unearned Revenue', 'Service Revenue', 'Cash', 'Accounts Receivable', 'Prepaid Insurance'], answer: [['Unearned Revenue', 2000, 0], ['Service Revenue', 0, 2000]], explain: '<p>$6,000 ÷ 6 = $1,000 per month. November and December are earned: $2,000. The liability falls and revenue rises.</p>' },
      { type: 'je', lvl: 2, q: 'Employees earn $1,500 per day and are paid each Friday for the five-day week. December 31 falls on a Tuesday. Record the adjusting entry for December 31.', opts: ['Salaries Expense', 'Salaries Payable', 'Cash', 'Prepaid Salaries', 'Accounts Payable'], answer: [['Salaries Expense', 3000, 0], ['Salaries Payable', 0, 3000]], explain: '<p>Monday and Tuesday have been worked but not paid: 2 days × $1,500 = $3,000 of accrued salaries.</p>' },
      { type: 'je', lvl: 2, q: 'On October 1 a company borrowed $10,000 on a one-year note at 9% annual interest, with all interest due at maturity. Record the interest accrual on December 31.', opts: ['Interest Expense', 'Interest Payable', 'Notes Payable', 'Cash', 'Interest Revenue'], answer: [['Interest Expense', 225, 0], ['Interest Payable', 0, 225]], hint: 'Principal × rate × fraction of a year.', explain: '<p>$10,000 × 9% × 3/12 = $225 for October through December. It hasn’t been paid, so it’s a liability, not a reduction in Notes Payable.</p>' },
      { type: 'classify', lvl: 2, q: 'Is each adjustment a deferral or an accrual?', cats: ['Deferral', 'Accrual'], items: [['Recording rent used from Prepaid Rent', 0], ['Recording revenue earned from Unearned Revenue', 0], ['Recording salaries earned but not paid', 1], ['Recording interest earned but not received', 1], ['Recording depreciation', 0], ['Recording services performed but not yet billed', 1]], explain: '<p>Deferrals start from cash already received or paid (prepaids, unearned revenue, the cost of equipment). Accruals record something that happened before any cash moved.</p>' },
      { type: 'mc', lvl: 2, q: 'Which account would <i>never</i> appear in an adjusting entry?', choices: ['Accounts Receivable', 'Unearned Revenue', 'Cash', 'Accumulated Depreciation'], answer: 2, explain: '<p>Adjusting entries catch up on events that didn’t involve cash at the time of the adjustment. If cash moved, it would already have been recorded as a regular transaction.</p>' },
      { type: 'num', lvl: 3, q: 'Before adjustments, a company’s net income is $12,000. Adjustments needed: depreciation $800; services performed but not billed $1,500; supplies used $400; unearned revenue now earned $1,000; salaries owed $900. What is net income after adjustments?', answer: 12400, unit: '$', hint: 'Which adjustments add revenue, and which add expense?', explain: '<p>$12,000 − $800 + $1,500 − $400 + $1,000 − $900 = $12,400. Accrued revenue and earned unearned revenue raise income; depreciation, supplies used and accrued salaries lower it.</p>' }
    ],
    more: ['adjusting entries explained', 'accruals vs deferrals', 'prepaid expenses and unearned revenue adjusting entries']
  });
})();
