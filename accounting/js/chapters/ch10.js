(function () {
  const { qc, je, jeMany, stmt, table } = Book;

  const NOTE = [
    { date: 'Oct 1', lines: [['Cash', 12000, 0], ['Notes Payable', 0, 12000]], memo: 'Borrowed on a 6-month, 8% note' },
    { date: 'Dec 31', lines: [['Interest Expense', 240, 0], ['Interest Payable', 0, 240]], memo: 'Accrue 3 months of interest' },
    { date: 'Apr 1', lines: [['Notes Payable', 12000, 0], ['Interest Payable', 240, 0], ['Interest Expense', 240, 0], ['Cash', 0, 12480]], memo: 'Repaid note with interest' }
  ];
  const PAY = [['Gross salaries', 10000, '$'], ['Less withholdings:', null, 'h'], ['FICA (7.65%)', 765, 'iL'], ['Federal income tax', 1500, 'iL'], ['State income tax', 300, 'iLu'], ['Total withholdings', 2565, 'u'], ['Net pay', 7435, 'bd$']];
  const ER = [['Employer FICA match (7.65%)', 765, 'L$'], ['Federal unemployment, FUTA (0.6%)', 60, 'L'], ['State unemployment, SUTA (5.4%)', 540, 'Lu'], ['Employer payroll tax expense', 1365, 'bd$']];
  const PAYJE = [
    { date: 'Mar 31', lines: [['Salaries and Wages Expense', 10000, 0], ['FICA Taxes Payable', 0, 765], ['Federal Income Taxes Payable', 0, 1500], ['State Income Taxes Payable', 0, 300], ['Salaries and Wages Payable', 0, 7435]], memo: 'Record March payroll' },
    { date: 'Mar 31', lines: [['Payroll Tax Expense', 1365, 0], ['FICA Taxes Payable', 0, 765], ['FUTA Taxes Payable', 0, 60], ['SUTA Taxes Payable', 0, 540]], memo: 'Employer payroll taxes' }
  ];

  Book.chapter({
    id: 'ch10', num: 10, part: 3, short: 'Liabilities',
    title: 'Liabilities',
    blurb: 'What a business owes: notes and interest, sales tax, payroll, bonds, and obligations that might or might not happen.',
    minutes: 35,
    objectives: [
      'Classify liabilities as current or long-term',
      'Record notes payable and the interest on them',
      'Record sales taxes and a payroll, including employer payroll taxes',
      'Explain why bonds sell at a premium or discount, and record a bond issue',
      'Decide whether a contingent liability should be recorded, disclosed or ignored'
    ],
    lesson: `
<p>Liabilities are claims on a company’s assets by people outside it: lenders, suppliers, employees, governments, customers who have paid in advance. Getting them right matters to anyone judging whether a company can pay its bills.</p>

<h2>Current and long-term liabilities</h2>
<p>A <dfn>current liability</dfn> is due within one year (or the operating cycle, if longer) and will be paid from current assets. Accounts payable, salaries payable, interest payable, sales taxes payable and unearned revenue are typical. A <b>long-term liability</b> is due later: long-term notes, mortgages, bonds.</p>
<p>When part of a long-term debt is due in the coming year, that part is reclassified as the <dfn>current portion of long-term debt</dfn>. A 10-year loan repaid $5,000 a year shows $5,000 as current and the rest as long-term.</p>

<h2>Notes payable</h2>
<p>A <dfn>note payable</dfn> is a written promise to repay a borrowed amount, usually with interest. Interest is principal × annual rate × time, and it accrues over the life of the note, whether or not it’s been paid yet.</p>
<p>On October 1, a company borrows $12,000 on a six-month note at 8%, with principal and interest due April 1. By December 31, three months of interest has built up: $12,000 × 8% × 3/12 = $240. On April 1 the company repays the principal plus six months of interest, $480 in total.</p>
${jeMany(NOTE)}
<p>The April payment clears the $240 already accrued and records the remaining $240 as this year’s expense. Each year bears the interest for the months the money was borrowed.</p>

<h2>Sales taxes and unearned revenue</h2>
<p>When a store collects sales tax, the tax isn’t revenue. The store is collecting it on behalf of the government and owes it until it’s sent in. A $1,000 sale with 6% sales tax:</p>
${je([['Cash', 1060, 0], ['Sales Revenue', 0, 1000], ['Sales Taxes Payable', 0, 60]], { date: 'May 4', memo: 'Cash sale with 6% sales tax' })}
<p><b>Unearned revenue</b> (Chapter 5) is another common current liability: season tickets, gift cards, subscriptions, customer deposits. It’s paid off by delivering the goods or services rather than by paying cash.</p>

<h2>Payroll</h2>
<p>An employee’s <dfn>gross pay</dfn> is the total earned. The employer is required to withhold amounts from it and send them to the government on the employee’s behalf. What the employee actually receives is <dfn>net pay</dfn>.</p>
<ul>
<li><dfn>FICA taxes</dfn> fund Social Security (6.2% of wages up to an annual wage limit) and Medicare (1.45% of all wages), 7.65% in total for most employees.</li>
<li><b>Federal and state income taxes</b>, based on each employee’s earnings and withholding elections.</li>
<li>Voluntary deductions such as health insurance premiums, retirement contributions and union dues.</li>
</ul>
<p>Every withholding is a liability until the employer pays it over. A monthly payroll with $10,000 of gross salaries:</p>
${stmt('Payroll summary', 'Month of March', PAY)}
<p>The employer also owes its <b>own</b> payroll taxes on top of the gross pay: a matching 7.65% of FICA, plus federal and state unemployment taxes (FUTA and SUTA). These are an additional expense of having employees.</p>
${stmt('Employer payroll taxes', 'Month of March', ER)}
${jeMany(PAYJE)}
<p>So $10,000 of salaries really cost this employer $11,365. When the employer pays employees and later remits the taxes, each payable is debited and Cash is credited.</p>
<div class="callout warn"><span class="lbl">Rates change</span>
<p>The rates here illustrate how payroll works. The Social Security wage limit changes every year, FUTA applies only to the first $7,000 of each employee’s annual wages, and SUTA rates differ by state and employer. Always check current rules for a real payroll.</p></div>

${qc({ type: 'num', q: 'An employee earns $4,000 this month. FICA is 7.65%, federal income tax withheld is $520, state income tax is $140 and a health insurance premium of $85 is deducted. What is net pay?', answer: 2949, unit: '$', explain: '<p>FICA = $4,000 × 7.65% = $306. Net pay = $4,000 − $306 − $520 − $140 − $85 = $2,949.</p>' })}

<h2>Bonds</h2>
<p>Large companies borrow by issuing <dfn>bonds</dfn>: interest-bearing notes sold to many investors. Each bond has a <dfn>face value</dfn> (the amount repaid at maturity), a <dfn>stated rate</dfn> (also called the coupon or contract rate) that sets the cash interest paid each period, and a maturity date.</p>
<p>When the bonds are sold, investors compare the stated rate with the <dfn>market rate</dfn> they could earn elsewhere on similar bonds. That comparison sets the price, which is quoted as a percentage of face value:</p>
${table(['If the stated rate is…', 'Bonds sell at…', 'Example price'], [['Equal to the market rate', 'Face value (par)', '100'], ['Below the market rate', 'A <b>discount</b>, below face', '98'], ['Above the market rate', 'A <b>premium</b>, above face', '102']], { cls: 'compact' })}
<p>A bond paying 6% when the market expects 7% is less attractive, so buyers pay less for it. The discount makes up the difference.</p>
<p>Suppose a company issues $100,000 of 5-year, 6% bonds with annual interest. Sold at <b>par</b>, the entries are simple: debit Cash $100,000 and credit Bonds Payable $100,000; each year debit Interest Expense and credit Cash for $6,000.</p>
<p>Sold at <b>98</b>, the company receives $98,000 but must still repay $100,000:</p>
${je([['Cash', 98000, 0], ['Discount on Bonds Payable', 2000, 0], ['Bonds Payable', 0, 100000]], { date: 'Jan 1', memo: 'Issued 5-year, 6% bonds at 98' })}
<p><b>Discount on Bonds Payable</b> is a contra-liability. The bonds’ <dfn>carrying value</dfn> is face value minus the unamortized discount: $98,000 on day one. The $2,000 discount is really extra interest the company pays at maturity, so it’s spread over the bond’s life. Using the straight-line method, $400 a year:</p>
${je([['Interest Expense', 6400, 0], ['Discount on Bonds Payable', 0, 400], ['Cash', 0, 6000]], { date: 'Dec 31', memo: 'Annual interest and discount amortization' })}
<p>Carrying value rises to $98,400 after one year and reaches $100,000 at maturity, when the company repays face value. A <b>premium</b> works in reverse: it sits in a Premium on Bonds Payable account, adds to carrying value, and its amortization <i>reduces</i> interest expense below the cash paid.</p>
<div class="callout"><span class="lbl">Effective-interest method</span>
<p>GAAP prefers the <b>effective-interest method</b>, which computes each period’s interest expense as the market rate times the bonds’ carrying value. Straight-line amortization is allowed when the results aren’t materially different, and it’s the clearest way to learn the idea.</p></div>

${qc({ type: 'mc', q: 'A company issues 5% bonds when the market rate for similar bonds is 6%. The bonds will sell:', choices: ['At par', 'At a premium', 'At a discount', 'It depends on the maturity date only'], answer: 2, explain: '<p>The bonds pay less than investors can get elsewhere, so investors will pay less than face value for them.</p>' })}

<h2>Contingent liabilities</h2>
<p>A <dfn>contingent liability</dfn> is a possible obligation that depends on a future event: a pending lawsuit, a product warranty, a guarantee of someone else’s loan. GAAP sorts them by likelihood:</p>
${table(['If the loss is…', 'Then…'], [['<b>Probable</b> and can be reasonably estimated', 'Record a liability and an expense'], ['<b>Reasonably possible</b>', 'Disclose it in the notes to the statements'], ['<b>Remote</b>', 'Nothing is required']], { cls: 'compact' })}
<p>Product warranties are a classic “probable and estimable” case: a company that sells 10,000 blenders and knows from experience that 2% will need a $25 repair records $5,000 of warranty expense and a warranty liability in the year of the sales.</p>
`,
    terms: [
      ['Current liability', 'An obligation due within one year or the operating cycle, paid from current assets.'],
      ['Current portion of long-term debt', 'The part of a long-term debt due within the next year.'],
      ['Note payable', 'A written promise to repay a borrowed amount, usually with interest.'],
      ['Sales taxes payable', 'Sales tax collected from customers and owed to the government.'],
      ['Gross pay', 'Total wages or salary earned before any deductions.'],
      ['Net pay', 'Gross pay minus all withholdings: the amount the employee receives.'],
      ['FICA taxes', 'Social Security and Medicare taxes, withheld from employees and matched by employers.'],
      ['Payroll tax expense', 'Taxes the employer owes on its payroll: its FICA match, FUTA and SUTA.'],
      ['Bond', 'A long-term interest-bearing note sold to investors.'],
      ['Face value', 'The amount a bond issuer repays at maturity; also called par value.'],
      ['Stated rate', 'The interest rate printed on a bond, which sets the cash interest; also called coupon or contract rate.'],
      ['Market rate', 'The rate investors demand on similar bonds; also called effective rate.'],
      ['Bond discount', 'The amount by which a bond’s issue price is below face value, because the stated rate is below the market rate.'],
      ['Bond premium', 'The amount by which a bond’s issue price exceeds face value, because the stated rate is above the market rate.'],
      ['Carrying value (bonds)', 'Face value minus unamortized discount, or plus unamortized premium.'],
      ['Contingent liability', 'A possible obligation that depends on a future event, such as a lawsuit or a warranty.']
    ],
    videos: [
      {
        id: 'v1', title: 'A note payable from signing to payoff',
        summary: 'A six-month note that straddles year-end: borrowing, accruing interest on December 31, and paying it all off in April.',
        steps: [
          { say: 'On October first, a company borrows twelve thousand dollars on a six-month note at eight percent. Principal and all interest are due April first.', f: { k: 'tl', h: '$12,000 · 8% · 6 months', pts: [{ at: 'Oct 1', l: 'Borrow <b>$12,000</b>' }, { at: 'Dec 31', l: 'Year-end: 3 months of interest owed' }, { at: 'Apr 1', l: 'Repay principal + 6 months interest' }], hi: 0 } },
          { say: 'Borrowing is simple. Cash goes up, and so does a liability, Notes Payable. No interest yet; no time has passed.', f: { k: 'je', entries: [{ d: NOTE[0].date, lines: NOTE[0].lines, memo: NOTE[0].memo }] } },
          { say: 'December thirty-first. The company owes three months of interest, even though nothing’s been paid.', f: { k: 'tl', h: '$12,000 · 8% · 6 months', pts: [{ at: 'Oct 1', l: 'Borrow $12,000' }, { at: 'Dec 31', l: 'Year-end: <b>3 months</b> of interest owed' }, { at: 'Apr 1', l: 'Repay principal + 6 months interest' }], hi: 1 } },
          { say: 'Twelve thousand times eight percent times three-twelfths: two hundred forty dollars.', f: { k: 'stmt', h: 'Interest to December 31', rows: [['Principal', 12000, 'L$'], ['× Annual rate', '8%', 'L'], ['× Time (Oct–Dec)', '3/12', 'Lu'], ['Accrued interest', 240, 'bd$']], hi: 3 } },
          { say: 'An adjusting entry records it: debit Interest Expense, credit Interest Payable. This year’s income statement carries this year’s share of the cost.', f: { k: 'split', a: { k: 'je', entries: [{ d: NOTE[1].date, lines: NOTE[1].lines, memo: NOTE[1].memo }] }, b: { k: 't', accts: [{ n: 'Notes Payable', cr: [['10/1', 12000]] }, { n: 'Interest Payable', cr: [['12/31', 240]] }, { n: 'Interest Expense', dr: [['12/31', 240]] }], hi: ['Interest Payable', 'Interest Expense'] } } },
          { say: 'April first. The company pays back twelve thousand plus six months of interest, four hundred eighty dollars. Twelve thousand four eighty in all.', f: { k: 'tl', h: '$12,000 · 8% · 6 months', pts: [{ at: 'Oct 1', l: 'Borrow $12,000' }, { at: 'Dec 31', l: 'Accrued $240' }, { at: 'Apr 1', l: 'Pay <b>$12,480</b>' }], hi: 2 } },
          { say: 'The payment wipes out the note, wipes out the two forty already accrued, and records the other two forty, January to March, as this year’s interest expense.', f: { k: 'je', entries: [{ d: NOTE[2].date, lines: NOTE[2].lines, memo: NOTE[2].memo }] } },
          { say: 'Each year bore the interest for the months it used the money: two forty last year, two forty this year. That’s matching at work.', f: { k: 'points', h: 'What happened', items: ['Year 1: <b>$240</b> interest expense (Oct–Dec)', 'Year 2: <b>$240</b> interest expense (Jan–Mar)', 'Cash paid: $12,480 on April 1, clearing every liability'] } }
        ]
      },
      {
        id: 'v2', title: 'Anatomy of a paycheck',
        summary: 'From $10,000 of gross salaries to $7,435 of take-home pay, and why the employer’s real cost is $11,365.',
        steps: [
          { say: 'This month’s gross salaries total ten thousand dollars. That’s what the employees earned. It’s not what they take home.', f: { k: 'stmt', h: 'From gross to net', sub: 'March payroll', rows: PAY, n: 1, hi: 0 } },
          { say: 'The employer must withhold FICA: seven point six five percent for Social Security and Medicare. Seven sixty-five.', n: 3, hi: 2 },
          { say: 'Plus federal and state income taxes, based on each employee’s withholding elections.', n: 6, hi: [3, 4, 5] },
          { say: 'Net pay, the total of the paychecks: seventy-four thirty-five.', n: 7, hi: 6 },
          { say: 'The journal entry records the full ten thousand as expense. Every withholding becomes a liability, money the employer now holds for the government. Net pay is owed to employees.', f: { k: 'je', h: 'Recording the payroll', entries: PAYJE.map((e) => ({ d: e.date, lines: e.lines, memo: e.memo })), show: 1, hi: 0 } },
          { say: 'But the employer has its own taxes too: a matching seven sixty-five of FICA, plus federal and state unemployment taxes.', f: { k: 'stmt', h: 'The employer’s share', sub: 'Owed on top of gross pay', rows: ER, hi: [0, 1, 2] } },
          { say: 'Thirteen sixty-five of payroll tax expense.', hi: 3 },
          { say: 'A second entry records it. Debit Payroll Tax Expense; credit a payable for each tax.', f: { k: 'je', h: 'Recording the payroll', entries: PAYJE.map((e) => ({ d: e.date, lines: e.lines, memo: e.memo })), show: 2, hi: 1 } },
          { say: 'So ten thousand dollars of salaries really cost the company eleven thousand three sixty-five. Employees see seventy-four thirty-five. The rest goes to the government, from both sides.', f: { k: 'table', h: 'Where $11,365 goes', head: ['', 'Amount'], rows: [['Employees’ take-home pay', 7435], ['Employee withholdings remitted for them', 2565], ['Employer’s own payroll taxes', 1365]], foot: ['Total cost to employer', 11365], hi: 'foot' } }
        ]
      }
    ],
    practice: [
      { type: 'classify', lvl: 1, q: 'Current or long-term liability?', cats: ['Current', 'Long-term'], items: [['Accounts payable', 0], ['Salaries payable', 0], ['Bonds due in 10 years', 1], ['The portion of a mortgage due in the next 12 months', 0], ['Unearned revenue for services next month', 0], ['Mortgage principal due after next year', 1]], explain: '<p>Anything due within a year is current, including the slice of long-term debt due in the coming year.</p>' },
      { type: 'num', lvl: 1, q: 'On September 1 a company signed an $18,000, 6% note payable due in one year. How much interest should it accrue on December 31?', answer: 360, unit: '$', explain: '<p>$18,000 × 6% × 4/12 = $360 for September through December.</p>' },
      { type: 'je', lvl: 1, q: 'Record the December 31 accrual of $360 of interest on the note.', opts: ['Interest Expense', 'Interest Payable', 'Notes Payable', 'Cash', 'Interest Revenue'], answer: [['Interest Expense', 360, 0], ['Interest Payable', 0, 360]], explain: '<p>Interest incurred but not paid is an accrued expense: debit the expense, credit a payable. The note itself is unchanged.</p>' },
      { type: 'je', lvl: 1, q: 'A store makes a $2,500 cash sale. Sales tax is 7%. Record the sale (ignore cost of goods sold).', opts: ['Cash', 'Sales Revenue', 'Sales Taxes Payable', 'Sales Tax Expense', 'Accounts Receivable'], answer: [['Cash', 2675, 0], ['Sales Revenue', 0, 2500], ['Sales Taxes Payable', 0, 175]], explain: '<p>Tax = $2,500 × 7% = $175. The store collects $2,675 but only $2,500 is revenue; the $175 is owed to the state.</p>' },
      { type: 'num', lvl: 2, q: 'Gross pay is $4,000. FICA is 7.65%, federal income tax withheld is $520, state income tax is $140, and health insurance of $85 is deducted. What is net pay?', answer: 2949, unit: '$', explain: '<p>FICA: $306. Total deductions: $306 + $520 + $140 + $85 = $1,051. Net pay: $4,000 − $1,051 = $2,949.</p>' },
      { type: 'num', lvl: 2, q: 'For the same $4,000 of wages, the employer pays FICA of 7.65%, FUTA of 0.6% and SUTA of 5.4%. What is the employer’s payroll tax expense?', answer: 546, unit: '$', explain: '<p>$306 + $24 + $216 = $546. The employee’s withholdings aren’t the employer’s expense; these matching and unemployment taxes are.</p>' },
      { type: 'mc', lvl: 1, q: 'Bonds with a 6% stated rate are issued when the market rate is 7%. They will sell at:', choices: ['A premium', 'A discount', 'Par', 'Face value plus accrued interest'], answer: 1, explain: '<p>The bonds pay below-market interest, so investors pay less than face value.</p>' },
      { type: 'je', lvl: 2, q: 'A company issues $200,000 of 10-year bonds at 98. Record the issue.', opts: ['Cash', 'Discount on Bonds Payable', 'Bonds Payable', 'Premium on Bonds Payable', 'Interest Expense'], answer: [['Cash', 196000, 0], ['Discount on Bonds Payable', 4000, 0], ['Bonds Payable', 0, 200000]], explain: '<p>98% of $200,000 is $196,000 of cash. Bonds Payable is always recorded at face value; the $4,000 difference goes to the contra-liability.</p>' },
      { type: 'num', lvl: 2, q: 'Those bonds’ discount is amortized straight-line. What is their carrying value after one year?', answer: 196400, unit: '$', explain: '<p>$4,000 ÷ 10 years = $400 a year. Carrying value = $196,000 + $400 = $196,400.</p>' },
      { type: 'num', lvl: 3, q: 'The bonds have a 5% stated rate, paid annually. What is annual interest expense using straight-line amortization?', answer: 10400, unit: '$', explain: '<p>Cash interest = $200,000 × 5% = $10,000. Add the $400 of discount amortization: interest expense = $10,400.</p>' },
      { type: 'classify', lvl: 2, q: 'How should each contingency be handled?', cats: ['Record it', 'Disclose it', 'Neither'], items: [['A lawsuit the company will probably lose, with damages reliably estimated at $50,000', 0], ['A lawsuit with a reasonable chance of loss but no reliable estimate', 1], ['A lawsuit lawyers consider frivolous', 2], ['Warranty repairs expected on this year’s sales, estimated from experience', 0]], explain: '<p>Probable and estimable: record. Reasonably possible: disclose. Remote: nothing. Warranties are recorded because past experience makes them probable and estimable.</p>' },
      { type: 'je', lvl: 3, q: 'A $12,000 note is repaid with $480 of interest. $240 of the interest was accrued at last year-end. Record the repayment.', opts: ['Notes Payable', 'Interest Payable', 'Interest Expense', 'Cash', 'Interest Revenue'], answer: [['Notes Payable', 12000, 0], ['Interest Payable', 240, 0], ['Interest Expense', 240, 0], ['Cash', 0, 12480]], explain: '<p>Clear the note and the interest already accrued, record the rest of the interest as this year’s expense, and credit the total cash paid.</p>' }
    ],
    more: ['notes payable accrued interest journal entry', 'payroll accounting journal entries', 'bonds issued at discount premium explained']
  });
})();
