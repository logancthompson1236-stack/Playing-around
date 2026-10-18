(function () {
  const { qc, jeMany, table, stmt } = Book;

  const IS = [['Service revenue', 4500, '$'], ['Expenses', null, 'h'], ['Salaries expense', 1380, 'iL$'], ['Rent expense', 1000, 'iL'], ['Supplies expense', 350, 'iL'],
    ['Depreciation expense', 100, 'iLu'], ['Total expenses', 2830, 'u'], ['Net income', 1670, 'bd$']];
  const RE = [['Retained earnings, January 1', 0, '$'], ['Add: Net income', 1670, 'u'], ['', 1670, ''], ['Less: Dividends', 300, 'u'], ['Retained earnings, January 31', 1370, 'bd$']];
  const BS = [['Assets', null, 'h'], ['Current assets', null, 'hi'], ['Cash', 5800, 'iiL$'], ['Accounts receivable', 1000, 'iiL'], ['Supplies', 250, 'iiLu'],
    ['Total current assets', 7050, 'i$'], ['Property, plant and equipment', null, 'hi'], ['Equipment', 4800, 'iiL'], ['Less: Accumulated depreciation', 100, 'iiLu'],
    ['Net property, plant and equipment', 4700, 'iu'], ['Total assets', 11750, 'bd$'],
    ['Liabilities and Stockholders’ Equity', null, 'h'], ['Current liabilities', null, 'hi'], ['Accounts payable', 200, 'iiL$'], ['Salaries payable', 180, 'iiLu'],
    ['Total current liabilities', 380, 'i$'], ['Stockholders’ equity', null, 'hi'], ['Common stock', 10000, 'iiL'], ['Retained earnings', 1370, 'iiLu'],
    ['Total stockholders’ equity', 11370, 'iu'], ['Total liabilities and stockholders’ equity', 11750, 'bd$']];
  const CLOSE = [
    { date: 'Jan 31', lines: [['Service Revenue', 4500, 0], ['Income Summary', 0, 4500]], memo: '1. Close revenue' },
    { date: 'Jan 31', lines: [['Income Summary', 2830, 0], ['Salaries Expense', 0, 1380], ['Rent Expense', 0, 1000], ['Supplies Expense', 0, 350], ['Depreciation Expense', 0, 100]], memo: '2. Close expenses' },
    { date: 'Jan 31', lines: [['Income Summary', 1670, 0], ['Retained Earnings', 0, 1670]], memo: '3. Close net income to retained earnings' },
    { date: 'Jan 31', lines: [['Retained Earnings', 300, 0], ['Dividends', 0, 300]], memo: '4. Close dividends' }
  ];
  const PCTB = [['Cash', 5800, ''], ['Accounts Receivable', 1000, ''], ['Supplies', 250, ''], ['Equipment', 4800, ''], ['Accumulated Depreciation', '', 100],
    ['Accounts Payable', '', 200], ['Salaries Payable', '', 180], ['Common Stock', '', 10000], ['Retained Earnings', '', 1370]];
  const ATB = [['Cash', 5800, ''], ['Accounts Receivable', 1000, ''], ['Supplies', 250, ''], ['Equipment', 4800, ''], ['Accumulated Depreciation', '', 100],
    ['Accounts Payable', '', 200], ['Salaries Payable', '', 180], ['Common Stock', '', 10000], ['Dividends', 300, ''], ['Service Revenue', '', 4500],
    ['Salaries Expense', 1380, ''], ['Rent Expense', 1000, ''], ['Supplies Expense', 350, ''], ['Depreciation Expense', 100, '']];

  // T-accounts through the four closing entries.
  const closeT = (step) => {
    const c = (k) => step >= k;
    return [
      { n: 'Service Revenue', dr: c(1) ? [['C1', 4500]] : [], cr: [['Bal', 4500]] },
      { n: 'Salaries Expense', dr: [['Bal', 1380]], cr: c(2) ? [['C2', 1380]] : [] },
      { n: 'Rent Expense', dr: [['Bal', 1000]], cr: c(2) ? [['C2', 1000]] : [] },
      { n: 'Supplies Expense', dr: [['Bal', 350]], cr: c(2) ? [['C2', 350]] : [] },
      { n: 'Depreciation Expense', dr: [['Bal', 100]], cr: c(2) ? [['C2', 100]] : [] },
      { n: 'Income Summary', dr: [].concat(c(2) ? [['C2', 2830]] : [], c(3) ? [['C3', 1670]] : []), cr: c(1) ? [['C1', 4500]] : [] },
      { n: 'Dividends', dr: [['Bal', 300]], cr: c(4) ? [['C4', 300]] : [] },
      { n: 'Retained Earnings', dr: c(4) ? [['C4', 300]] : [], cr: c(3) ? [['C3', 1670]] : [] }
    ];
  };

  Book.chapter({
    id: 'ch06', num: 6, part: 2, short: 'Statements & closing',
    title: 'Financial Statements & Closing the Books',
    blurb: 'Turning the adjusted trial balance into finished statements, reading a classified balance sheet, and resetting the books for the next period.',
    minutes: 30,
    objectives: [
      'Prepare an income statement, statement of retained earnings and balance sheet from an adjusted trial balance',
      'Classify assets and liabilities as current or long-term',
      'Distinguish temporary accounts from permanent accounts',
      'Journalize and post closing entries, and prepare a post-closing trial balance'
    ],
    lesson: `
<p>With the accounts adjusted, the hard thinking for the period is done. What remains is presentation, putting the numbers in the forms readers expect, and housekeeping, getting the books ready to start the next period from a clean slate.</p>

<h2>From adjusted trial balance to statements</h2>
<p>The statements are prepared in a fixed order, because each one feeds the next:</p>
<ol>
<li>The <b>income statement</b> uses the revenue and expense accounts and produces net income.</li>
<li>The <b>statement of retained earnings</b> uses net income, the dividends account and beginning retained earnings, and produces ending retained earnings.</li>
<li>The <b>balance sheet</b> uses the asset and liability accounts, common stock, and ending retained earnings from step 2.</li>
</ol>
<p>Here is Brightside’s adjusted trial balance from Chapter 5 again, for reference:</p>
${table(['Account', 'Debit', 'Credit'], ATB, { cls: 'tb', foot: ['<b>Totals</b>', 14980, 14980] })}

<h2>The income statement</h2>
${stmt('Brightside Tutoring, Inc.', 'Income Statement · For the Month Ended January 31', IS)}
<p>This is a <b>single-step</b> income statement: all revenues together, all expenses together, one subtraction. Merchandising companies usually use a <b>multi-step</b> format that shows gross profit and operating income along the way. You’ll see it in Chapter 7.</p>
<p>Dividends don’t appear here. They aren’t an expense.</p>

<h2>The statement of retained earnings</h2>
${stmt('Brightside Tutoring, Inc.', 'Statement of Retained Earnings · For the Month Ended January 31', RE)}
<p>In February, this statement will start from $1,370. Public companies usually present a broader <b>statement of stockholders’ equity</b> that also shows changes in common stock and other equity accounts; Chapter 11 covers it.</p>

<h2>The classified balance sheet</h2>
<p>A <dfn>classified balance sheet</dfn> groups assets and liabilities into categories that help readers judge whether the company can pay its bills.</p>
<ul>
<li><dfn>Current assets</dfn> are cash and other assets expected to be turned into cash or used up within one year (or one operating cycle, if longer): cash, accounts receivable, inventory, supplies, prepaid expenses.</li>
<li><b>Long-term investments</b>: stocks and bonds of other companies held for more than a year, or land held for future use.</li>
<li><b>Property, plant and equipment</b>: long-lived physical assets used in operations, shown at cost less accumulated depreciation.</li>
<li><b>Intangible assets</b>: long-lived assets without physical substance, such as patents and trademarks.</li>
<li><dfn>Current liabilities</dfn> are obligations due within one year: accounts payable, salaries payable, unearned revenue, interest payable, and the part of long-term debt due this year.</li>
<li><b>Long-term liabilities</b>: obligations due after more than a year, such as long-term notes and bonds.</li>
</ul>
${stmt('Brightside Tutoring, Inc.', 'Balance Sheet · January 31', BS)}
<p>Grouping lets readers do quick analysis. <dfn>Working capital</dfn> is current assets minus current liabilities: $7,050 − $380 = $6,670 for Brightside. That’s the cushion available to cover short-term obligations. The <b>current ratio</b> divides instead of subtracting: $7,050 ÷ $380 ≈ 18.6. Most businesses run far closer to 1 or 2. Chapter 13 covers ratios in depth.</p>

${qc({ type: 'classify', q: 'Current or long-term?', cats: ['Current', 'Long-term'], items: [['Prepaid insurance covering the next 6 months', 0], ['A delivery truck', 1], ['Unearned revenue for work due next month', 0], ['A note payable due in four years', 1], ['Accounts receivable due in 30 days', 0]], explain: '<p>The dividing line is one year (or the operating cycle). Anything to be collected, used or paid within that window is current.</p>' })}

<h2>Closing the books</h2>
<p>Some accounts track activity for one period only. Revenue, expenses and dividends measure what happened <i>this</i> month or year; February’s revenue shouldn’t include January’s. These are <dfn>temporary accounts</dfn> (also called nominal accounts). At period end they are reset to zero and their balances transferred into Retained Earnings.</p>
<p>Every balance sheet account is a <dfn>permanent account</dfn> (real account). Its balance carries forward: the cash in the bank on January 31 is still there on February 1.</p>
<p><dfn>Closing entries</dfn> do the reset. Many companies use a temporary clearing account called <dfn>Income Summary</dfn> so the net income figure appears in the ledger. The process has four steps:</p>
<ol>
<li><b>Close revenues</b>: debit each revenue account for its balance; credit Income Summary.</li>
<li><b>Close expenses</b>: debit Income Summary for total expenses; credit each expense account.</li>
<li><b>Close Income Summary</b>: its balance is now net income. Debit Income Summary; credit Retained Earnings. (For a net loss, reverse it.)</li>
<li><b>Close dividends</b>: debit Retained Earnings; credit Dividends.</li>
</ol>
${jeMany(CLOSE)}
<p>After posting, every revenue, expense and dividends account has a zero balance, and Retained Earnings shows $1,370, matching the statement of retained earnings. Dividends skip Income Summary because they aren’t part of net income.</p>

<div class="callout warn"><span class="lbl">Common mistake</span>
<p>Closing Dividends to Income Summary. That would make dividends look like an expense and understate net income in the ledger. Dividends always close directly to Retained Earnings.</p></div>

<h2>The post-closing trial balance</h2>
<p>The last step of the cycle is a <dfn>post-closing trial balance</dfn>: a list of the permanent accounts after closing. It proves the ledger still balances going into the new period.</p>
${table(['Account', 'Debit', 'Credit'], PCTB, { cls: 'tb', foot: ['<b>Totals</b>', 11850, 11850] })}
<p>It contains only balance sheet accounts. And it’s the end of Brightside’s first accounting cycle. February starts here.</p>
`,
    terms: [
      ['Single-step income statement', 'An income statement that subtracts total expenses from total revenues in one step.'],
      ['Classified balance sheet', 'A balance sheet that groups assets and liabilities into standard categories such as current and long-term.'],
      ['Current assets', 'Assets expected to be converted to cash or used up within one year or the operating cycle, whichever is longer.'],
      ['Current liabilities', 'Obligations due within one year or the operating cycle, whichever is longer.'],
      ['Operating cycle', 'The time it takes to spend cash on goods or services, sell them and collect the cash.'],
      ['Property, plant and equipment', 'Long-lived tangible assets used in operations, reported at cost less accumulated depreciation.'],
      ['Intangible assets', 'Long-lived assets without physical substance, such as patents, copyrights and trademarks.'],
      ['Working capital', 'Current assets minus current liabilities.'],
      ['Temporary account', 'An account whose balance is closed at period end: revenues, expenses, dividends and Income Summary.'],
      ['Permanent account', 'A balance sheet account whose balance carries forward to the next period.'],
      ['Closing entries', 'Entries at period end that zero out temporary accounts and transfer their balances to Retained Earnings.'],
      ['Income Summary', 'A temporary clearing account used during closing; its balance equals net income or net loss.'],
      ['Post-closing trial balance', 'A trial balance of permanent accounts prepared after closing entries are posted.']
    ],
    videos: [
      {
        id: 'v1', title: 'From adjusted trial balance to three statements',
        summary: 'Watch Brightside’s adjusted trial balance split into an income statement, a statement of retained earnings and a classified balance sheet.',
        steps: [
          { say: 'Here is Brightside’s adjusted trial balance. Everything we need for the statements is in this one list. Let’s pull out the revenue and expense accounts first.', f: { k: 'table', h: 'Adjusted Trial Balance · January 31', head: ['Account', 'Debit', 'Credit'], rows: ATB, foot: ['Totals', 14980, 14980], hi: [9, 10, 11, 12, 13] } },
          { say: 'They become the income statement. Revenue of forty-five hundred...', f: { k: 'stmt', h: 'Income Statement', sub: 'For the Month Ended January 31', rows: IS, hi: 0 } },
          { say: '...less four expenses totaling twenty-eight hundred thirty...', hi: [2, 3, 4, 5, 6] },
          { say: '...gives net income of sixteen hundred seventy dollars.', hi: 7 },
          { say: 'Next, retained earnings. Beginning balance, zero. Add the net income we just found. Then subtract the dividends account, three hundred dollars.', f: { k: 'stmt', h: 'Statement of Retained Earnings', sub: 'For the Month Ended January 31', rows: RE, hi: [1, 3] } },
          { say: 'Ending retained earnings: thirteen hundred seventy.', hi: 4 },
          { say: 'Now the balance sheet. Current assets first: cash, receivables and supplies, all expected to be used or collected within a year.', f: { k: 'stmt', h: 'Balance Sheet', sub: 'January 31', rows: BS, hi: [2, 3, 4, 5] } },
          { say: 'Equipment is long-term. It’s shown at cost, less accumulated depreciation, for a book value of forty-seven hundred.', hi: [7, 8, 9] },
          { say: 'Current liabilities: the supplier and the assistant’s unpaid salary.', hi: [13, 14, 15] },
          { say: 'And equity: common stock plus the retained earnings figure from the previous statement.', hi: [17, 18, 19] },
          { say: 'Total assets, eleven thousand seven hundred fifty. Total liabilities and equity, eleven thousand seven hundred fifty. Balanced, and Brightside’s first set of statements is complete.', hi: [10, 20] }
        ]
      },
      {
        id: 'v2', title: 'Closing the books',
        summary: 'Four closing entries, posted step by step, that zero out Brightside’s temporary accounts and roll January’s results into retained earnings.',
        steps: [
          { say: 'Before February begins, Brightside’s temporary accounts need to go back to zero. Here they are, with their January balances, along with Income Summary and Retained Earnings.', f: { k: 't', accts: closeT(0), hi: [] } },
          { say: 'Step one: close revenue. Debit Service Revenue for its forty-five hundred dollar balance. Credit Income Summary.', f: { k: 'je', h: 'Closing entries', entries: CLOSE.map((e) => ({ d: e.date, lines: e.lines, memo: e.memo })), show: 1, hi: 0 } },
          { say: 'Posted. Service Revenue is now zero, and Income Summary holds the revenue.', f: { k: 't', accts: closeT(1), hi: ['Service Revenue', 'Income Summary'] } },
          { say: 'Step two: close the expenses. One debit to Income Summary for the total, twenty-eight thirty, and a credit to each expense for its balance.', f: { k: 'je', h: 'Closing entries', entries: CLOSE.map((e) => ({ d: e.date, lines: e.lines, memo: e.memo })), show: 2, hi: 1 } },
          { say: 'Posted. All four expenses are zero. Income Summary now has a credit balance of sixteen seventy. That’s net income.', f: { k: 't', accts: closeT(2), hi: ['Salaries Expense', 'Rent Expense', 'Supplies Expense', 'Depreciation Expense', 'Income Summary'] } },
          { say: 'Step three: close Income Summary. Debit it for sixteen seventy and credit Retained Earnings.', f: { k: 'je', h: 'Closing entries', entries: CLOSE.map((e) => ({ d: e.date, lines: e.lines, memo: e.memo })), show: 3, hi: 2 } },
          { say: 'Posted. Income Summary is zero, and the month’s profit now lives in Retained Earnings.', f: { k: 't', accts: closeT(3), hi: ['Income Summary', 'Retained Earnings'] } },
          { say: 'Step four: close dividends straight to Retained Earnings. Debit Retained Earnings three hundred, credit Dividends.', f: { k: 'je', h: 'Closing entries', entries: CLOSE.map((e) => ({ d: e.date, lines: e.lines, memo: e.memo })), show: 4, hi: 3 } },
          { say: 'Posted. Every temporary account is at zero. Retained Earnings shows thirteen seventy, exactly what the statement of retained earnings reported.', f: { k: 't', accts: closeT(4), hi: ['Dividends', 'Retained Earnings'] } },
          { say: 'The post-closing trial balance lists only permanent accounts. Eleven thousand eight hundred fifty on each side. Brightside is ready for February.', f: { k: 'table', h: 'Post-Closing Trial Balance · January 31', head: ['Account', 'Debit', 'Credit'], rows: PCTB, foot: ['Totals', 11850, 11850], hi: 'foot' } }
        ]
      }
    ],
    practice: [
      { type: 'classify', lvl: 1, q: 'Temporary or permanent?', cats: ['Temporary', 'Permanent'], items: [['Service Revenue', 0], ['Cash', 1], ['Dividends', 0], ['Retained Earnings', 1], ['Rent Expense', 0], ['Accumulated Depreciation', 1], ['Unearned Revenue', 1], ['Income Summary', 0]], explain: '<p>Income statement accounts, Dividends and Income Summary are temporary. Everything on the balance sheet, including contra accounts like Accumulated Depreciation, is permanent.</p>' },
      { type: 'num', lvl: 1, q: 'An adjusted trial balance shows Service Revenue $18,400; Salaries Expense $7,200; Rent Expense $2,400; Utilities Expense $650; Depreciation Expense $900; Dividends $3,000. What is net income?', answer: 7250, unit: '$', hint: 'Dividends aren’t an expense.', explain: '<p>Expenses: $7,200 + $2,400 + $650 + $900 = $11,150. Net income = $18,400 − $11,150 = $7,250. Dividends go on the statement of retained earnings, not the income statement.</p>' },
      { type: 'num', lvl: 1, q: 'Using the previous problem’s figures, beginning retained earnings were $12,000. What are ending retained earnings?', answer: 16250, unit: '$', explain: '<p>$12,000 + $7,250 − $3,000 = $16,250.</p>' },
      { type: 'num', lvl: 2, q: 'A company reports: Cash $3,100; Accounts Receivable $2,400; Supplies $500; Prepaid Insurance $1,200; Equipment $15,000; Accumulated Depreciation $3,000. What are total current assets?', answer: 7200, unit: '$', explain: '<p>Current assets: $3,100 + $2,400 + $500 + $1,200 = $7,200. Equipment and its accumulated depreciation belong in property, plant and equipment.</p>' },
      { type: 'je', lvl: 1, q: 'Close a Service Revenue balance of $18,400 using an Income Summary account.', opts: ['Service Revenue', 'Income Summary', 'Retained Earnings', 'Cash', 'Dividends'], answer: [['Service Revenue', 18400, 0], ['Income Summary', 0, 18400]], explain: '<p>Revenue has a credit balance, so debit it to bring it to zero, and credit Income Summary.</p>' },
      { type: 'je', lvl: 2, q: 'Close these expense accounts: Salaries Expense $7,200 and Rent Expense $2,400.', opts: ['Income Summary', 'Salaries Expense', 'Rent Expense', 'Retained Earnings', 'Cash'], answer: [['Income Summary', 9600, 0], ['Salaries Expense', 0, 7200], ['Rent Expense', 0, 2400]], explain: '<p>Expenses have debit balances, so credit each to zero. Income Summary takes one debit for the total.</p>' },
      { type: 'je', lvl: 1, q: 'Close a Dividends balance of $3,000.', opts: ['Retained Earnings', 'Dividends', 'Income Summary', 'Cash', 'Common Stock'], answer: [['Retained Earnings', 3000, 0], ['Dividends', 0, 3000]], explain: '<p>Dividends close directly to Retained Earnings, bypassing Income Summary, because they aren’t part of net income.</p>' },
      { type: 'mc', lvl: 2, q: 'After a company has a net loss, Income Summary has a $4,000 debit balance before step 3. What is the third closing entry?', choices: ['Debit Income Summary $4,000; credit Retained Earnings $4,000', 'Debit Retained Earnings $4,000; credit Income Summary $4,000', 'Debit Dividends $4,000; credit Income Summary $4,000', 'No entry: losses aren’t closed'], answer: 1, explain: '<p>A debit balance means expenses exceeded revenues. Credit Income Summary to zero it out, and debit Retained Earnings, because a loss reduces retained earnings.</p>' },
      { type: 'mc', lvl: 1, q: 'Which account would appear on a post-closing trial balance?', choices: ['Depreciation Expense', 'Dividends', 'Accumulated Depreciation', 'Income Summary'], answer: 2, explain: '<p>Only permanent accounts survive closing. Accumulated Depreciation is a balance sheet account (a contra asset), so it carries forward.</p>' },
      { type: 'num', lvl: 2, q: 'Current assets total $7,200. Current liabilities are Accounts Payable $1,900, Salaries Payable $600 and Unearned Revenue $800. What is working capital?', answer: 3900, unit: '$', explain: '<p>Current liabilities: $1,900 + $600 + $800 = $3,300. Working capital: $7,200 − $3,300 = $3,900.</p>' },
      { type: 'num', lvl: 3, q: 'Before closing, Retained Earnings shows $25,000. Revenues total $64,000, expenses $51,500 and dividends $5,000. What balance will Retained Earnings show on the post-closing trial balance?', answer: 32500, unit: '$', explain: '<p>Net income = $64,000 − $51,500 = $12,500. After closing: $25,000 + $12,500 − $5,000 = $32,500.</p>' }
    ],
    more: ['classified balance sheet explained', 'closing entries income summary', 'post closing trial balance']
  });
})();
