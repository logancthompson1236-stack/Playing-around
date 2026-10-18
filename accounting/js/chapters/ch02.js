(function () {
  const { qc, widget } = Book;

  const CS = 'Common stock';
  const eq = (A, L, E, hi, note) => ({ k: 'eq', A, L, E, hi, note });

  Book.chapter({
    id: 'ch02', num: 2, part: 1, short: 'Accounting equation',
    title: 'The Accounting Equation',
    blurb: 'Assets = Liabilities + Equity. The one idea that holds every set of books together, and how to analyze any transaction with it.',
    minutes: 25,
    objectives: [
      'Define assets, liabilities and stockholders’ equity, with examples of each',
      'Explain how revenues, expenses and dividends change equity',
      'Analyze a transaction’s effect on the accounting equation',
      'Tell a business transaction apart from an event that isn’t one'
    ],
    lesson: `
<p>Everything a business owns was paid for by someone. Either the business borrowed the money, or the owners put it in (or left profits in). That simple fact, written as an equation, is the foundation of all accounting:</p>
<div class="formula">Assets <span class="op">=</span> Liabilities <span class="op">+</span> Stockholders’ Equity<small>What the business has = who has a claim on it</small></div>
<p>The left side lists the resources. The right side lists the claims against those resources: creditors’ claims first, then the owners’ claim on whatever is left. Because the two sides describe the same resources from two angles, they must always be equal.</p>

<h2>Assets</h2>
<p><dfn>Assets</dfn> are resources a business controls that are expected to provide future benefits. Common examples:</p>
<ul>
<li><b>Cash</b>: money in the bank and on hand.</li>
<li><b>Accounts receivable</b>: amounts customers owe for goods or services already delivered. The business has a right to collect.</li>
<li><b>Supplies</b>: paper, ink, cleaning products and other items not yet used.</li>
<li><b>Prepaid expenses</b>, such as insurance paid in advance.</li>
<li><b>Equipment, buildings and land</b>: long-lived resources used to run the business.</li>
</ul>
<p>The test is future benefit. A customer’s promise to pay you next month is an asset. A brilliant marketing idea is not, because it can’t be measured reliably in money.</p>

<h2>Liabilities</h2>
<p><dfn>Liabilities</dfn> are obligations to pay money or provide goods or services in the future. They are creditors’ claims on the assets.</p>
<ul>
<li><b>Accounts payable</b>: amounts owed to suppliers for purchases on credit (“on account”).</li>
<li><b>Notes payable</b>: formal written promises to repay a loan, usually with interest.</li>
<li><b>Salaries payable</b>: wages employees have earned but haven’t been paid yet.</li>
<li><b>Unearned revenue</b>: cash received from customers before the work is done. The business owes them the service.</li>
</ul>
<p>Account names that end in <i>payable</i> are almost always liabilities. Names that end in <i>receivable</i> are assets.</p>

<h2>Stockholders’ equity</h2>
<p><dfn>Stockholders’ equity</dfn> is the owners’ claim: what would be left for them if every asset were turned into cash at book value and every liability paid off. In a corporation it has two parts.</p>
<p><b>Contributed capital</b> is what owners have put in. When owners invest cash in exchange for shares, the company records <dfn>common stock</dfn>.</p>
<p><b>Retained earnings</b> is profit the company has earned and kept. Three things change it:</p>
<ul>
<li><dfn>Revenues</dfn> increase it. Revenue is the gross inflow from the company’s main business: fees earned, sales of goods, rent received.</li>
<li><dfn>Expenses</dfn> decrease it. Expenses are the costs of assets used up or services consumed to earn revenue: rent, salaries, utilities, advertising.</li>
<li><b>Dividends</b> decrease it. They are profits distributed to owners. Dividends are <i>not</i> an expense, because they aren’t a cost of earning revenue. They are a decision about what to do with profit afterward.</li>
</ul>
<p>Putting it together gives the <dfn>expanded accounting equation</dfn>:</p>
<div class="formula">Assets <span class="op">=</span> Liabilities <span class="op">+</span> Common Stock <span class="op">+</span> Revenues <span class="op">−</span> Expenses <span class="op">−</span> Dividends</div>
<p>When revenues exceed expenses for a period, the difference is <dfn>net income</dfn>. When expenses are larger, the difference is a <b>net loss</b>.</p>

${qc({ type: 'classify', q: 'Quick sort: asset, liability or equity?', cats: ['Asset', 'Liability', 'Equity'], items: [['Accounts receivable', 0], ['Salaries payable', 1], ['Common stock', 2], ['Prepaid insurance', 0], ['Unearned revenue', 1]], explain: '<p>Receivables and prepaids are future benefits (assets). Payables and unearned revenue are obligations (liabilities). Common stock is the owners’ investment (equity).</p>' })}

<h2>Analyzing transactions</h2>
<p>A <dfn>transaction</dfn> is an economic event that changes the accounting equation and can be measured in money. To analyze one, ask three questions:</p>
<ol>
<li>Which accounts are affected?</li>
<li>Is each one an asset, a liability or part of equity?</li>
<li>Does each go up or down, and by how much?</li>
</ol>
<p>Every transaction affects at least two places. That is the heart of <b>double-entry</b> accounting, which you’ll formalize in the next chapter. If one side of the equation changes, either the other side changes by the same amount, or something on the same side changes by an equal and opposite amount.</p>

<div class="callout example"><span class="lbl">Example</span>
<p><b>Brightside buys $4,800 of equipment for cash.</b> Equipment (an asset) goes up $4,800. Cash (an asset) goes down $4,800. Total assets don’t change, and nothing on the right side moves. The equation still balances.</p>
<p><b>Brightside buys $600 of supplies on account.</b> Supplies (an asset) go up $600. Accounts payable (a liability) goes up $600. Both sides rise by the same amount.</p>
<p><b>Brightside tutors students for $2,500 cash.</b> Cash goes up $2,500. Revenue, which increases equity, goes up $2,500. The company is better off, and the owners’ claim grows.</p></div>

<p>Here are all ten of Brightside’s January transactions. Before you press <b>Record next</b>, predict which two columns will change.</p>
${widget('equation')}

<p>Some patterns from that table are worth remembering:</p>
<ul>
<li>Swapping one asset for another (buying equipment, collecting a receivable) changes no totals.</li>
<li>Paying a bill reduces an asset and a liability together. It is <i>not</i> an expense; the expense, if any, was recorded when the goods or services were received.</li>
<li>Every revenue, expense and dividend runs through retained earnings.</li>
</ul>

${qc({ type: 'mc', q: 'Brightside collects $1,000 that the school owed it. What happens to total assets?', choices: ['They increase by $1,000', 'They decrease by $1,000', 'They don’t change', 'They increase by $2,000'], answer: 2, explain: '<p>Cash goes up $1,000 and accounts receivable goes down $1,000. One asset was exchanged for another, so total assets are unchanged. The revenue was already recorded back when the tutoring was done.</p>' })}

<h2>Events that aren’t transactions</h2>
<p>Not everything that happens in a business gets recorded. Hiring a new employee who starts next month, signing a contract for future work, or getting a quote from a supplier doesn’t change any asset, liability or equity yet. Nothing has been exchanged. These events become transactions later, when work is performed, goods are delivered or cash changes hands.</p>
<div class="callout warn"><span class="lbl">Common mistake</span>
<p>Placing an order is not the same as receiving the goods. If Brightside orders $300 of books to be delivered next week, nothing is recorded today. When the books arrive with an invoice, Brightside records the asset and the payable.</p></div>

<h2>Using the equation to find a missing number</h2>
<p>Because the equation always holds, you can solve for any piece. If a company has $85,000 of assets and owes $30,000, equity must be $55,000. If you know equity at the start and end of a year, and how much stock was issued and dividends paid, you can work out net income. The practice set includes several problems like this; they’re a favorite on exams because they test whether you really understand how the pieces connect.</p>
`,
    terms: [
      ['Accounting equation', 'Assets = Liabilities + Stockholders’ Equity. It holds after every transaction.'],
      ['Expanded accounting equation', 'Assets = Liabilities + Common Stock + Revenues − Expenses − Dividends.'],
      ['Asset', 'A resource a business controls that is expected to provide future benefit.'],
      ['Liability', 'An obligation to pay money or provide goods or services in the future.'],
      ['Stockholders’ equity', 'The owners’ claim on assets after liabilities: contributed capital plus retained earnings.'],
      ['Common stock', 'The equity account that records owners’ investments in a corporation in exchange for shares.'],
      ['Contributed capital', 'The total amount owners have invested in a corporation.'],
      ['Revenue', 'Gross increase in equity from the business’s main activities, such as fees earned or goods sold.'],
      ['Expense', 'The cost of assets consumed or services used to earn revenue; decreases equity.'],
      ['Net income', 'The amount by which revenues exceed expenses for a period. If expenses are larger, it is a net loss.'],
      ['Accounts receivable', 'Amounts customers owe the business for goods or services already delivered.'],
      ['Accounts payable', 'Amounts the business owes suppliers for purchases made on credit.'],
      ['Notes payable', 'A written promise to repay borrowed money, usually with interest.'],
      ['Unearned revenue', 'Cash received before goods or services are delivered; a liability until earned.'],
      ['Transaction', 'An economic event, measurable in money, that changes the accounting equation.'],
      ['On account', 'On credit: payment will be made or received later.']
    ],
    videos: [
      {
        id: 'v1', title: 'Brightside’s first five transactions',
        summary: 'Watch the equation stay in balance as Brightside opens for business: investment, purchases, and its first revenue.',
        steps: [
          { say: 'Here is the accounting equation for Brightside Tutoring before anything has happened. Every column is zero, and zero equals zero.', f: eq({}, {}, {}, [], 'Before day one') },
          { say: 'January 1: the owner invests ten thousand dollars in exchange for common stock. Cash, an asset, rises. Common stock, part of equity, rises by the same amount.', f: eq({ Cash: 10000 }, {}, { [CS]: 10000 }, ['Cash', CS], 'Cash <b>+10,000</b> · Common stock <b>+10,000</b>') },
          { say: 'January 2: Brightside buys four thousand eight hundred dollars of equipment with cash. One asset goes up, another goes down. The totals don’t move at all.', f: eq({ Cash: 5200, Equipment: 4800 }, {}, { [CS]: 10000 }, ['Cash', 'Equipment'], 'Cash <b>−4,800</b> · Equipment <b>+4,800</b>') },
          { say: 'January 3: it buys six hundred dollars of supplies on account. Supplies, an asset, rise. So does accounts payable, a liability. Both sides grow by six hundred.', f: eq({ Cash: 5200, Supplies: 600, Equipment: 4800 }, { 'Accounts payable': 600 }, { [CS]: 10000 }, ['Supplies', 'Accounts payable'], 'Supplies <b>+600</b> · Accounts payable <b>+600</b>') },
          { say: 'January 10: Brightside tutors students and is paid two thousand five hundred dollars in cash. Cash rises, and so does revenue, which increases equity.', f: eq({ Cash: 7700, Supplies: 600, Equipment: 4800 }, { 'Accounts payable': 600 }, { [CS]: 10000, Revenue: 2500 }, ['Cash', 'Revenue'], 'Cash <b>+2,500</b> · Revenue <b>+2,500</b>') },
          { say: 'January 15: it tutors for a school and sends a bill for eighteen hundred dollars. No cash yet, but Brightside has earned the revenue and has a receivable to collect.', f: eq({ Cash: 7700, 'Accounts receivable': 1800, Supplies: 600, Equipment: 4800 }, { 'Accounts payable': 600 }, { [CS]: 10000, Revenue: 4300 }, ['Accounts receivable', 'Revenue'], 'Accounts receivable <b>+1,800</b> · Revenue <b>+1,800</b>') },
          { say: 'Five transactions, and the equation balanced after every one: fourteen thousand nine hundred dollars on each side. That isn’t luck. Each transaction changed two places by matching amounts.', hi: ['A', 'L', 'E'] }
        ]
      },
      {
        id: 'v2', title: 'Expenses, dividends and the expanded equation',
        summary: 'The rest of Brightside’s January: paying bills, collecting cash, and how expenses and dividends shrink equity.',
        steps: [
          { say: 'We left Brightside with fourteen thousand nine hundred dollars on each side. Now for the second half of January.', f: eq({ Cash: 7700, 'Accounts receivable': 1800, Supplies: 600, Equipment: 4800 }, { 'Accounts payable': 600 }, { [CS]: 10000, Revenue: 4300 }, [], 'Balances after January 15') },
          { say: 'January 20: Brightside pays one thousand dollars of rent. Cash falls. Rent is an expense, and expenses reduce equity.', f: eq({ Cash: 6700, 'Accounts receivable': 1800, Supplies: 600, Equipment: 4800 }, { 'Accounts payable': 600 }, { [CS]: 10000, Revenue: 4300, Expenses: -1000 }, ['Cash', 'Expenses'], 'Cash <b>−1,000</b> · Expenses <b>−1,000</b> in equity') },
          { say: 'January 25: it pays four hundred dollars toward the supplies bill. Cash falls and accounts payable falls. This is not an expense. It settles a debt.', f: eq({ Cash: 6300, 'Accounts receivable': 1800, Supplies: 600, Equipment: 4800 }, { 'Accounts payable': 200 }, { [CS]: 10000, Revenue: 4300, Expenses: -1000 }, ['Cash', 'Accounts payable'], 'Cash <b>−400</b> · Accounts payable <b>−400</b>') },
          { say: 'January 28: the school pays one thousand dollars of its bill. Cash rises, accounts receivable falls. Total assets stay the same.', f: eq({ Cash: 7300, 'Accounts receivable': 800, Supplies: 600, Equipment: 4800 }, { 'Accounts payable': 200 }, { [CS]: 10000, Revenue: 4300, Expenses: -1000 }, ['Cash', 'Accounts receivable'], 'Cash <b>+1,000</b> · Accounts receivable <b>−1,000</b>') },
          { say: 'January 30: Brightside pays its assistant twelve hundred dollars. Another expense, another reduction in equity.', f: eq({ Cash: 6100, 'Accounts receivable': 800, Supplies: 600, Equipment: 4800 }, { 'Accounts payable': 200 }, { [CS]: 10000, Revenue: 4300, Expenses: -2200 }, ['Cash', 'Expenses'], 'Cash <b>−1,200</b> · Expenses <b>−1,200</b>') },
          { say: 'January 31: Brightside pays the owner a three hundred dollar dividend. Dividends reduce equity too, but they are not an expense. They are profit handed back to the owner.', f: eq({ Cash: 5800, 'Accounts receivable': 800, Supplies: 600, Equipment: 4800 }, { 'Accounts payable': 200 }, { [CS]: 10000, Revenue: 4300, Expenses: -2200, Dividends: -300 }, ['Cash', 'Dividends'], 'Cash <b>−300</b> · Dividends <b>−300</b>') },
          { say: 'The month ends with twelve thousand dollars of assets, two hundred of liabilities, and eleven thousand eight hundred of equity. Balanced.', hi: ['A', 'L', 'E'] },
          { say: 'Look inside equity. Revenue of four thousand three hundred, minus expenses of twenty-two hundred, is net income of twenty-one hundred. Subtract the dividend and Brightside kept eighteen hundred dollars of profit.', hi: ['Revenue', 'Expenses', 'Dividends'] },
          { say: 'That is the expanded accounting equation. Assets equal liabilities, plus common stock, plus revenues, minus expenses, minus dividends.', f: { k: 'points', h: 'The expanded equation', plain: true, items: ['<b>Assets</b> = Liabilities + Common stock + Revenues − Expenses − Dividends', '$12,000 = $200 + $10,000 + $4,300 − $2,200 − $300', 'Revenues raise equity; expenses and dividends lower it'] } }
        ]
      }
    ],
    practice: [
      { type: 'classify', lvl: 1, q: 'Classify each account.', cats: ['Asset', 'Liability', 'Equity'], items: [['Cash', 0], ['Accounts payable', 1], ['Equipment', 0], ['Common stock', 2], ['Notes payable', 1], ['Supplies', 0], ['Retained earnings', 2], ['Land', 0]], explain: '<p>Things the company controls with future benefit are assets. Amounts it owes are liabilities. Owners’ investment and kept profits are equity.</p>' },
      { type: 'num', lvl: 1, q: 'A company has total assets of $85,000 and total liabilities of $30,000. What is stockholders’ equity?', answer: 55000, unit: '$', explain: '<p>Equity = Assets − Liabilities = $85,000 − $30,000 = $55,000.</p>' },
      { type: 'num', lvl: 1, q: 'A company has liabilities of $20,000 and stockholders’ equity of $45,000. What are its total assets?', answer: 65000, unit: '$', explain: '<p>Assets = Liabilities + Equity = $20,000 + $45,000 = $65,000.</p>' },
      { type: 'mc', lvl: 1, q: 'A company buys $900 of supplies on account. What is the effect on the accounting equation?', choices: ['Assets +$900, equity +$900', 'Assets +$900, liabilities +$900', 'Assets −$900, liabilities +$900', 'No effect until the supplies are paid for'], answer: 1, explain: '<p>Supplies (an asset) increase, and accounts payable (a liability) increases because the company owes the supplier. Buying on account is still a transaction: the company now has the supplies and the obligation.</p>' },
      { type: 'mc', lvl: 1, q: 'A company pays $400 owed to a supplier. What is the effect?', choices: ['Assets −$400, liabilities −$400', 'Assets −$400, equity −$400', 'Liabilities −$400, equity +$400', 'Assets −$400, expenses +$400'], answer: 0, explain: '<p>Cash goes down and accounts payable goes down. Paying a bill settles a liability; it is not a new expense.</p>' },
      { type: 'classify', lvl: 2, q: 'How does each transaction affect total stockholders’ equity?', cats: ['Increases', 'Decreases', 'No effect'], items: [['Provide services on account', 0], ['Pay this month’s rent', 1], ['Pay a dividend to stockholders', 1], ['Borrow $10,000 from a bank', 2], ['Issue common stock for cash', 0], ['Buy equipment for cash', 2], ['Collect cash from a customer’s account', 2]], explain: '<p>Revenue and new stock raise equity; expenses and dividends lower it. Borrowing, buying assets and collecting receivables only shuffle assets and liabilities, so equity is unchanged.</p>' },
      { type: 'mc', lvl: 2, q: 'Which of these is <i>not</i> a transaction for the company?', choices: ['Paying an employee for last week’s work', 'Hiring an employee who will start next month', 'Buying office furniture on account', 'Receiving cash for services performed today'], answer: 1, explain: '<p>Hiring someone creates no asset or liability yet; nothing has been exchanged. The company records salary expense once the employee actually works.</p>' },
      { type: 'num', lvl: 2, q: 'At the start of the year a company had assets of $100,000 and liabilities of $40,000. During the year assets increased by $25,000 and liabilities decreased by $5,000. What is stockholders’ equity at year-end?', answer: 90000, unit: '$', hint: 'Find ending assets and ending liabilities first.', explain: '<p>Ending assets = $100,000 + $25,000 = $125,000. Ending liabilities = $40,000 − $5,000 = $35,000. Ending equity = $125,000 − $35,000 = $90,000.</p>' },
      { type: 'num', lvl: 3, q: 'Stockholders’ equity was $60,000 at the start of the year and $75,000 at the end. The company issued no new stock and paid $4,000 of dividends. What was net income?', answer: 19000, unit: '$', hint: 'Equity changed by $15,000. What raised it, and what lowered it?', explain: '<p>With no new stock, equity changes only through net income and dividends: Ending = Beginning + Net income − Dividends. So $75,000 = $60,000 + NI − $4,000, and NI = $19,000.</p>' },
      { type: 'num', lvl: 3, q: 'During March, a company’s assets increased by $12,000 and its liabilities increased by $3,000. Stockholders invested $5,000 for new shares, and the company paid $1,500 of dividends. What was March net income?', answer: 5500, unit: '$', hint: 'First find the change in equity. Then remove the effects that aren’t net income.', explain: '<p>Change in equity = $12,000 − $3,000 = $9,000. That change = new stock + net income − dividends, so $9,000 = $5,000 + NI − $1,500, and NI = $5,500.</p>' }
    ],
    more: ['accounting equation explained', 'transaction analysis accounting equation', 'assets liabilities equity examples']
  });
})();
