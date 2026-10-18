(function () {
  const { qc, je, tgrid, table } = Book;

  // Brightside's T-accounts after each of the first five transactions (refs are January dates).
  const T = (n) => {
    const a = {
      Cash: { dr: [['1', 10000], ['10', 2500]], cr: [['2', 4800]] },
      'Accounts Receivable': { dr: [['15', 1800]], cr: [] },
      Supplies: { dr: [['3', 600]], cr: [] },
      Equipment: { dr: [['2', 4800]], cr: [] },
      'Accounts Payable': { dr: [], cr: [['3', 600]] },
      'Common Stock': { dr: [], cr: [['1', 10000]] },
      'Service Revenue': { dr: [], cr: [['10', 2500], ['15', 1800]] }
    };
    const upto = { 1: ['1'], 2: ['1', '2'], 3: ['1', '2', '3'], 4: ['1', '2', '3', '10'], 5: ['1', '2', '3', '10', '15'] }[n];
    return Object.keys(a).map((name) => ({ n: name, dr: a[name].dr.filter((x) => upto.includes(x[0])), cr: a[name].cr.filter((x) => upto.includes(x[0])) }));
  };
  const tf = (n, hi) => ({ k: 't', accts: T(n), hi, check: true });
  const jf = (d, lines, memo) => ({ k: 'je', entries: [{ d, lines, memo }] });

  Book.chapter({
    id: 'ch03', num: 3, part: 1, short: 'Debits & credits',
    title: 'Debits, Credits & T-Accounts',
    blurb: 'The left-right rules that let every transaction be recorded the same way, and the T-account, the accountant’s sketchpad.',
    minutes: 25,
    objectives: [
      'Explain what debit and credit mean (and what they don’t)',
      'Apply the debit and credit rules to every type of account',
      'Record transactions in T-accounts and find an account’s balance',
      'Describe a chart of accounts and a contra account'
    ],
    lesson: `
<p>The accounting equation tells you that every transaction keeps the books in balance. Debits and credits are the system that makes recording those transactions mechanical. Once the rules click, you can record anything from a coffee purchase to a corporate merger the same way.</p>

<h2>The account and the T-account</h2>
<p>An <dfn>account</dfn> is a record of the increases and decreases in one specific item: Cash, Accounts Payable, Rent Expense. Each account has two sides. The left side is called the <dfn>debit</dfn> side and the right side is the <dfn>credit</dfn> side. On paper, accountants sketch an account as a large letter T:</p>
<div class="tgrid"><div class="tacct"><div class="tname">Cash</div><div class="tbody"><div class="tside tdr"><span class="tref">Debit side (left)</span></div><div class="tside tcr"><span class="tref">Credit side (right)</span></div><div class="tside tdr"></div><div class="tside tcr"></div></div></div></div>
<p>Entering an amount on the left side is <i>debiting</i> the account. Entering it on the right is <i>crediting</i> it. You’ll often see them abbreviated <b>Dr.</b> and <b>Cr.</b></p>
<div class="callout warn"><span class="lbl">Forget what your bank taught you</span>
<p>Debit and credit just mean left and right. They don’t mean good or bad, and they don’t mean increase or decrease by themselves. Whether a debit increases an account depends on what kind of account it is. (Your bank calls a deposit a “credit” because, on the <i>bank’s</i> books, your account is a liability: money the bank owes you.)</p></div>

<h2>The rules</h2>
<p>The rules come straight from the accounting equation. Assets sit on the left side of the equation, so they increase on the left: with a debit. Liabilities and equity sit on the right side, so they increase on the right: with a credit.</p>
<div class="formula">Assets <span class="op">=</span> Liabilities <span class="op">+</span> Equity<small>Left side: increase with debits · Right side: increase with credits</small></div>
<p>Equity has parts that move in opposite directions. Revenues increase equity, so revenues increase with a credit, just like equity. Expenses and dividends <i>decrease</i> equity, so they work the other way: they increase with a debit.</p>
${table(['Account type', 'Increase with', 'Decrease with', 'Normal balance'], [
  ['Assets', '<span class="dr">Debit</span>', '<span class="cr">Credit</span>', '<span class="dr">Debit</span>'],
  ['Liabilities', '<span class="cr">Credit</span>', '<span class="dr">Debit</span>', '<span class="cr">Credit</span>'],
  ['Common stock', '<span class="cr">Credit</span>', '<span class="dr">Debit</span>', '<span class="cr">Credit</span>'],
  ['Retained earnings', '<span class="cr">Credit</span>', '<span class="dr">Debit</span>', '<span class="cr">Credit</span>'],
  ['Revenues', '<span class="cr">Credit</span>', '<span class="dr">Debit</span>', '<span class="cr">Credit</span>'],
  ['Expenses', '<span class="dr">Debit</span>', '<span class="cr">Credit</span>', '<span class="dr">Debit</span>'],
  ['Dividends', '<span class="dr">Debit</span>', '<span class="cr">Credit</span>', '<span class="dr">Debit</span>']
], { cls: 'compact' })}
<p>The <dfn>normal balance</dfn> of an account is the side where increases go, which is where its balance usually sits. Cash normally has a debit balance. Accounts payable normally has a credit balance. A balance on the other side usually signals an error, such as a cash account that shows a credit balance (an overdraft).</p>

<div class="callout plain"><span class="lbl">Memory trick: DEALER</span>
<p><b>D</b>ividends, <b>E</b>xpenses, <b>A</b>ssets increase with debits. <b>L</b>iabilities, <b>E</b>quity, <b>R</b>evenues increase with credits. Say “DEA” on the left, “LER” on the right.</p></div>

${qc({ type: 'classify', q: 'Which side increases each account?', cats: ['Debit', 'Credit'], items: [['Supplies', 0], ['Service Revenue', 1], ['Salaries Expense', 0], ['Notes Payable', 1], ['Dividends', 0]], explain: '<p>DEALER: dividends, expenses and assets increase with debits; liabilities, equity and revenues increase with credits.</p>' })}

<h2>Double-entry: debits always equal credits</h2>
<p>Every transaction is recorded with at least one debit and at least one credit, and the total debits must equal the total credits. This is <dfn>double-entry accounting</dfn>, and it’s what keeps the equation balanced. If the dollar amounts entered on the left don’t match those on the right, something has gone wrong.</p>
<p>Here is how Brightside’s first transactions translate into debits and credits:</p>
<ul>
<li><b>Owner invests $10,000 cash.</b> Cash (asset) increases: debit Cash $10,000. Common Stock (equity) increases: credit Common Stock $10,000.</li>
<li><b>Buys $4,800 of equipment for cash.</b> Equipment (asset) increases: debit Equipment. Cash (asset) decreases: credit Cash.</li>
<li><b>Buys $600 of supplies on account.</b> Supplies increase: debit Supplies. Accounts Payable (liability) increases: credit Accounts Payable.</li>
<li><b>Earns $2,500 tutoring for cash.</b> Debit Cash. Service Revenue increases: credit Service Revenue.</li>
<li><b>Pays $1,000 rent.</b> Rent Expense increases: debit Rent Expense. Cash decreases: credit Cash.</li>
</ul>
<p>Written as a formal entry, the first one looks like this. Chapter 4 covers this format in detail.</p>
${je([['Cash', 10000, 0], ['Common Stock', 0, 10000]], { date: 'Jan 1', memo: 'Owner invested cash in exchange for common stock' })}

<h2>Finding an account’s balance</h2>
<p>To find a balance, total each side and subtract the smaller total from the larger. The balance goes on the larger side. Here are all of Brightside’s January cash transactions, labeled by date:</p>
${tgrid([{ n: 'Cash', dr: [['1', 10000], ['10', 2500], ['28', 1000]], cr: [['2', 4800], ['20', 1000], ['25', 400], ['30', 1200], ['31', 300]] }, { n: 'Accounts Payable', dr: [['25', 400]], cr: [['3', 600]] }])}
<p>Cash: debits total $13,500 and credits total $7,700, so the balance is a $5,800 debit. Accounts Payable: credits of $600 minus debits of $400 leaves a $200 credit balance. Both are on their normal side.</p>

${qc({ type: 'num', q: 'Brightside’s Service Revenue account has credits of $2,500 and $1,800 and no debits. What is its balance?', answer: 4300, unit: '$', explain: '<p>$2,500 + $1,800 = $4,300, a credit balance, which is normal for revenue.</p>' })}

<h2>The chart of accounts</h2>
<p>A <dfn>chart of accounts</dfn> is the list of every account a company uses, usually numbered by type. A common scheme:</p>
${table(['Numbers', 'Account type', 'Brightside examples'], [
  ['100–199', 'Assets', '101 Cash · 110 Accounts Receivable · 120 Supplies · 150 Equipment'],
  ['200–299', 'Liabilities', '201 Accounts Payable · 210 Salaries Payable'],
  ['300–399', 'Stockholders’ equity', '301 Common Stock · 320 Retained Earnings · 330 Dividends'],
  ['400–499', 'Revenues', '400 Service Revenue'],
  ['500–599', 'Expenses', '501 Salaries Expense · 505 Rent Expense']
], { cls: 'compact' })}
<p>The numbers make accounts easy to sort and find, and they follow the order the accounts appear in the financial statements.</p>

<h2>A first look at contra accounts</h2>
<p>A <dfn>contra account</dfn> sits beside another account and carries the opposite balance, reducing it. The most common is <b>Accumulated Depreciation</b>, which carries a credit balance and is subtracted from Equipment on the balance sheet. Using a separate account lets the books keep the original cost visible while still showing how much has been used up. You’ll meet it properly in Chapter 5.</p>
`,
    terms: [
      ['Account', 'A record of increases and decreases in one specific asset, liability, equity, revenue or expense item.'],
      ['T-account', 'A simple sketch of an account shaped like a T, with debits on the left and credits on the right.'],
      ['Debit', 'The left side of an account, or an entry made on that side. Abbreviated Dr.'],
      ['Credit', 'The right side of an account, or an entry made on that side. Abbreviated Cr.'],
      ['Normal balance', 'The side of an account where increases are recorded and where its balance usually sits.'],
      ['Double-entry accounting', 'Recording every transaction with equal debits and credits so the equation stays balanced.'],
      ['DEALER', 'Mnemonic: Dividends, Expenses, Assets increase with debits; Liabilities, Equity, Revenues with credits.'],
      ['Chart of accounts', 'A numbered list of all the accounts a business uses.'],
      ['Contra account', 'An account that offsets a related account and carries the opposite normal balance, such as Accumulated Depreciation.']
    ],
    videos: [
      {
        id: 'v1', title: 'Why debits go on the left',
        summary: 'Derive every debit and credit rule from the accounting equation, so you never have to memorize them blind.',
        steps: [
          { say: 'Debits and credits trip up almost everyone at first. They don’t have to. Every rule comes from the accounting equation.', f: { k: 'title', eyebrow: 'Example 3.A', h: 'Why debits go on the left', sub: 'Deriving the rules from A = L + E' } },
          { say: 'Assets sit on the left side of the equation.', f: { k: 'points', h: 'Start with the equation', items: ['Assets sit on the <b>left</b> side of A = L + E', 'Liabilities and equity sit on the <b>right</b> side', 'So assets increase on the left, with a <b>debit</b>. Liabilities and equity increase on the right, with a <b>credit</b>.'], n: 1, hi: 0 } },
          { say: 'Liabilities and equity sit on the right.', n: 2, hi: 1 },
          { say: 'So each account increases on the same side it sits on in the equation. Assets increase with a debit. Liabilities and equity increase with a credit.', n: 3, hi: 2 },
          { say: 'Try it. The owner invests ten thousand dollars. Cash, an asset, increases: debit. Common stock, equity, increases: credit. Ten thousand on each side.', f: { k: 't', accts: [{ n: 'Cash', dr: [['1', 10000]], cr: [] }, { n: 'Common Stock', dr: [], cr: [['1', 10000]] }], hi: ['Cash', 'Common Stock'] } },
          { say: 'Now the parts of equity. Revenue makes equity bigger, so it behaves like equity: it increases with a credit.', f: { k: 'points', h: 'Inside equity', items: ['Revenues <b>increase</b> equity → increase with a <b>credit</b>', 'Expenses <b>decrease</b> equity → increase with a <b>debit</b>', 'Dividends <b>decrease</b> equity → increase with a <b>debit</b>'], n: 1, hi: 0 } },
          { say: 'Expenses make equity smaller, so they work backwards. An expense increases with a debit.', n: 2, hi: 1 },
          { say: 'Dividends also shrink equity, so they increase with a debit too.', n: 3, hi: 2 },
          { say: 'Here is the whole rulebook in one table. Notice the normal balance is always the increase side.', f: { k: 'table', h: 'The rules', head: ['Account type', 'Increase', 'Decrease', 'Normal balance'], rows: [['Assets', 'Debit', 'Credit', 'Debit'], ['Liabilities', 'Credit', 'Debit', 'Credit'], ['Common stock', 'Credit', 'Debit', 'Credit'], ['Revenues', 'Credit', 'Debit', 'Credit'], ['Expenses', 'Debit', 'Credit', 'Debit'], ['Dividends', 'Debit', 'Credit', 'Debit']], hc: [1, 3] } },
          { say: 'And a way to remember it: DEALER. Dividends, expenses and assets increase on the left. Liabilities, equity and revenues increase on the right.', f: { k: 'title', eyebrow: 'Remember', h: 'DEA | LER', sub: 'Dividends · Expenses · Assets ← debit   |   credit → Liabilities · Equity · Revenues' } }
        ]
      },
      {
        id: 'v2', title: 'Posting Brightside’s first week to T-accounts',
        summary: 'Five transactions, each analyzed into a debit and a credit and then posted, ending with a check that debits equal credits.',
        steps: [
          { say: 'These are the seven accounts Brightside needs for its first five transactions, all empty. We’ll analyze each transaction, then post it.', f: { k: 't', accts: T(1).map((a) => ({ n: a.n })), hi: [] } },
          { say: 'January 1: the owner invests ten thousand dollars. Cash increases, so debit Cash. Common stock increases, so credit Common Stock.', f: jf('Jan 1', [['Cash', 10000, 0], ['Common Stock', 0, 10000]], 'Owner investment') },
          { say: 'Post it: ten thousand on the left of Cash, ten thousand on the right of Common Stock.', f: tf(1, ['Cash', 'Common Stock']) },
          { say: 'January 2: equipment for four thousand eight hundred in cash. Equipment increases: debit. Cash decreases: credit.', f: jf('Jan 2', [['Equipment', 4800, 0], ['Cash', 0, 4800]], 'Bought equipment for cash') },
          { say: 'Post the debit to Equipment and the credit to Cash.', f: tf(2, ['Cash', 'Equipment']) },
          { say: 'January 3: six hundred dollars of supplies on account. Supplies increase: debit. Accounts payable, a liability, increases: credit.', f: jf('Jan 3', [['Supplies', 600, 0], ['Accounts Payable', 0, 600]], 'Bought supplies on account') },
          { say: 'Posted.', f: tf(3, ['Supplies', 'Accounts Payable']) },
          { say: 'January 10: tutoring for two thousand five hundred in cash. Debit Cash. Revenue increases, so credit Service Revenue.', f: jf('Jan 10', [['Cash', 2500, 0], ['Service Revenue', 0, 2500]], 'Tutoring for cash') },
          { say: 'Posted.', f: tf(4, ['Cash', 'Service Revenue']) },
          { say: 'January 15: tutoring billed to a school, eighteen hundred dollars. Accounts receivable increases: debit. Service revenue increases: credit.', f: jf('Jan 15', [['Accounts Receivable', 1800, 0], ['Service Revenue', 0, 1800]], 'Tutoring on account') },
          { say: 'Posted. Now each account shows its balance underneath.', f: tf(5, ['Accounts Receivable', 'Service Revenue']) },
          { say: 'Add up the debit balances: seventy-seven hundred, eighteen hundred, six hundred and forty-eight hundred. Fourteen thousand nine hundred.', hi: ['Cash', 'Accounts Receivable', 'Supplies', 'Equipment'] },
          { say: 'Now the credit balances: six hundred, ten thousand, and forty-three hundred. Also fourteen thousand nine hundred. Debits equal credits, and the books are in balance.', hi: ['Accounts Payable', 'Common Stock', 'Service Revenue'] }
        ]
      }
    ],
    practice: [
      { type: 'classify', lvl: 1, q: 'What is the normal balance of each account?', cats: ['Debit', 'Credit'], items: [['Cash', 0], ['Accounts Payable', 1], ['Service Revenue', 1], ['Rent Expense', 0], ['Dividends', 0], ['Common Stock', 1], ['Equipment', 0], ['Unearned Revenue', 1]], explain: '<p>DEALER again. Unearned revenue is a liability (the company owes the customer a service), so its normal balance is a credit, even though it has “revenue” in its name.</p>' },
      { type: 'mc', lvl: 1, q: 'A credit to the Cash account means:', choices: ['Cash increased', 'Cash decreased', 'The company earned revenue', 'The bank made an error'], answer: 1, explain: '<p>Cash is an asset, and assets decrease with credits. A credit to Cash means cash went out.</p>' },
      { type: 'mc', lvl: 1, q: 'Which account is increased by a debit?', choices: ['Notes Payable', 'Service Revenue', 'Salaries Expense', 'Common Stock'], answer: 2, explain: '<p>Expenses increase with debits. The other three are a liability, a revenue and an equity account, which all increase with credits.</p>' },
      { type: 'je', lvl: 1, q: 'A new company issues common stock to its owners for $15,000 cash. Record the entry.', opts: ['Cash', 'Common Stock', 'Service Revenue', 'Retained Earnings', 'Notes Payable'], answer: [['Cash', 15000, 0], ['Common Stock', 0, 15000]], explain: '<p>Cash (asset) increases with a debit. Common Stock (equity) increases with a credit. Issuing stock is not revenue: the company didn’t earn anything, the owners invested.</p>' },
      { type: 'je', lvl: 1, q: 'A company buys $3,200 of equipment on account. Record the entry.', opts: ['Equipment', 'Accounts Payable', 'Cash', 'Accounts Receivable', 'Supplies'], answer: [['Equipment', 3200, 0], ['Accounts Payable', 0, 3200]], explain: '<p>Equipment increases (debit). The company owes the supplier, so Accounts Payable increases (credit). No cash moved yet.</p>' },
      { type: 'je', lvl: 1, q: 'A company performs $2,750 of services for a client and sends a bill. Record the entry.', opts: ['Accounts Receivable', 'Service Revenue', 'Cash', 'Unearned Revenue', 'Accounts Payable'], answer: [['Accounts Receivable', 2750, 0], ['Service Revenue', 0, 2750]], explain: '<p>The service is done, so revenue is earned now (credit Service Revenue). The client owes the money, an asset (debit Accounts Receivable).</p>' },
      { type: 'je', lvl: 1, q: 'A company pays its $340 utility bill for the month in cash. Record the entry.', opts: ['Utilities Expense', 'Cash', 'Accounts Payable', 'Prepaid Insurance', 'Service Revenue'], answer: [['Utilities Expense', 340, 0], ['Cash', 0, 340]], explain: '<p>Expenses increase with debits; cash decreases with a credit.</p>' },
      { type: 'num', lvl: 2, q: 'A Cash account begins the month with a $3,000 debit balance. During the month it receives debits of $5,200 and $1,800 and credits of $2,400, $900 and $1,100. What is the ending balance?', answer: 5600, unit: '$', explain: '<p>Debits: $3,000 + $5,200 + $1,800 = $10,000. Credits: $2,400 + $900 + $1,100 = $4,400. Balance: $10,000 − $4,400 = $5,600 debit.</p>' },
      { type: 'num', lvl: 2, q: 'Accounts Payable has credits of $4,000 and $1,500 and a debit of $2,200. What is its balance, and on which side? (Enter the amount.)', answer: 3300, unit: '$', explain: '<p>Credits total $5,500, debits $2,200. The balance is a $3,300 <b>credit</b>, the normal side for a liability.</p>' },
      { type: 'mc', lvl: 3, q: 'A student says, “Expenses are bad, so they must be credits.” What’s the best response?', choices: ['Correct: credits record decreases, and expenses decrease profit', 'Incorrect: expenses reduce equity, and since equity increases with credits, expenses increase with debits', 'Correct: expenses are always paid with cash, which is credited', 'Incorrect: expenses are recorded on whichever side keeps cash positive'], answer: 1, explain: '<p>Debit and credit are positions, not judgments. Expenses reduce equity, which works opposite to equity’s credit increases, so expenses increase with debits. The cash credit in a typical expense entry is the <i>other</i> half of the entry.</p>' }
    ],
    more: ['debits and credits explained simply', 'T accounts explained', 'normal balance of accounts DEALER']
  });
})();
