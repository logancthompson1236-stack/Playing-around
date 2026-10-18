(function () {
  const { stmt, qc } = Book;

  const IS = [['Service revenue', 4300, '$'], ['Expenses', null, 'h'], ['Salaries expense', 1200, 'iL'], ['Rent expense', 1000, 'iLu'],
    ['Total expenses', 2200, 'u'], ['Net income', 2100, 'bd$']];
  const RE = [['Retained earnings, January 1', 0, '$'], ['Add: Net income', 2100, 'u'], ['', 2100, ''], ['Less: Dividends', 300, 'u'], ['Retained earnings, January 31', 1800, 'bd$']];
  const BS = [['Assets', null, 'h'], ['Cash', 5800, 'iL$'], ['Accounts receivable', 800, 'iL'], ['Supplies', 600, 'iL'], ['Equipment', 4800, 'iLu'], ['Total assets', 12000, 'bd$'],
    ['Liabilities', null, 'h'], ['Accounts payable', 200, 'i$'], ['Stockholders’ equity', null, 'h'], ['Common stock', 10000, 'iL'], ['Retained earnings', 1800, 'iLu'],
    ['Total stockholders’ equity', 11800, 'u'], ['Total liabilities and stockholders’ equity', 12000, 'bd$']];
  const CF = [['Operating activities', null, 'h'], ['Cash received from customers', 3500, 'iL$'], ['Cash paid for rent', -1000, 'iL'], ['Cash paid to suppliers', -400, 'iL'],
    ['Cash paid for salaries', -1200, 'iLu'], ['Net cash provided by operating activities', 900, '$'],
    ['Investing activities', null, 'h'], ['Purchase of equipment', -4800, 'i'],
    ['Financing activities', null, 'h'], ['Issued common stock', 10000, 'iL'], ['Paid dividends', -300, 'iLu'], ['Net cash provided by financing activities', 9700, 'u'],
    ['Net increase in cash', 5800, ''], ['Cash, January 1', 0, 'u'], ['Cash, January 31', 5800, 'bd$']];

  Book.chapter({
    id: 'ch01', num: 1, part: 1, short: 'Language of business',
    title: 'The Language of Business',
    blurb: 'What accounting is, who relies on it, the rules it follows, and a first look at the four financial statements.',
    minutes: 20,
    objectives: [
      'Explain what accounting does and how it differs from bookkeeping',
      'Name the people who use accounting information and what they want to know',
      'Describe the assumptions and principles behind every number in a report',
      'Recognize the four financial statements and how they connect'
    ],
    lesson: `
<p>Every business, from a lemonade stand to a global airline, needs to answer the same few questions. Did we make money? What do we own? What do we owe? Where did our cash go? <dfn>Accounting</dfn> is the system that answers them. It is often called <em>the language of business</em> because managers, investors, lenders and governments all use it to talk about how an organization is doing.</p>

<h2>What accounting does</h2>
<p>Accounting has three jobs:</p>
<ol>
<li><b>Identify</b> the economic events that matter to an organization: a sale, a purchase, a loan, a paycheck.</li>
<li><b>Record</b> those events in a consistent, organized way so there is a history of what happened.</li>
<li><b>Communicate</b> the results in reports called <dfn>financial statements</dfn>, so people can make decisions.</li>
</ol>
<p><dfn>Bookkeeping</dfn> is the recording part, the careful day-to-day entry of transactions. Accounting is broader. It includes designing the system, analyzing and interpreting results, and explaining what the numbers mean.</p>

<div class="callout plain"><span class="lbl">In plain English</span>
<p>Bookkeeping is writing the diary. Accounting is writing the diary, then reading it back and telling everyone what it says about the business.</p></div>

<h2>Who uses accounting information</h2>
<p><b>Internal users</b> work inside the business: owners who run it, managers, supervisors, the finance team. They ask questions like <i>Which product line is most profitable? Can we afford to hire two more people? What should we charge?</i> The branch of accounting that serves them is <dfn>managerial accounting</dfn>. Its reports can take any shape that is useful, and they are usually private.</p>
<p><b>External users</b> are outside the business: investors deciding whether to buy shares, banks deciding whether to lend, suppliers deciding whether to offer credit, tax authorities, regulators, and labor unions. The branch that serves them is <dfn>financial accounting</dfn>. Because outsiders can't walk into the office and ask questions, financial accounting follows strict, shared rules so that reports are reliable and comparable from one company to the next.</p>
<p>Most of this book is financial accounting. The last chapter introduces the managerial side.</p>

${qc({ type: 'mc', q: 'A bank is reviewing a bakery’s financial statements before approving a $50,000 loan. The bank is:', choices: ['An internal user, served by managerial accounting', 'An external user, served by financial accounting', 'An internal user, because it will have a claim on the bakery’s assets', 'Not a user of accounting information'], answer: 1, explain: '<p>The bank sits outside the business and relies on the bakery’s published statements, so it is an external user. Financial accounting exists for exactly this kind of decision.</p>' })}

<h2>Three ways to own a business</h2>
<p>A <dfn>sole proprietorship</dfn> has one owner and is simple to start, but the owner is personally responsible for every debt. A <dfn>partnership</dfn> has two or more owners who share profits and, usually, personal responsibility. A <dfn>corporation</dfn> is a separate legal entity owned by stockholders. Stockholders can lose what they invested but are not personally liable for the corporation’s debts.</p>
<p>The bookkeeping is almost identical for all three. The difference shows up in the owners’ section of the balance sheet. This book uses small corporations in its examples because that is how most growing businesses are organized, and because corporate statements are the ones you will read as an investor.</p>

<h2>The rules of the game</h2>
<p>In the United States, financial accounting follows <dfn>generally accepted accounting principles</dfn>, or <b>GAAP</b>. The <b>Financial Accounting Standards Board (FASB)</b>, a private, independent organization, writes those standards. The <b>Securities and Exchange Commission (SEC)</b>, a government agency, requires publicly traded companies to follow them. Most other countries use <b>International Financial Reporting Standards (IFRS)</b>, written by the International Accounting Standards Board. GAAP and IFRS agree on most fundamentals, and this book points out where they differ.</p>

<h3>Four assumptions</h3>
<ul>
<li><dfn>Economic entity</dfn>: the business is separate from its owners and from every other business. The owner’s personal groceries are not a business expense.</li>
<li><dfn>Monetary unit</dfn>: only events that can be measured in money are recorded. Great employee morale is valuable, but it does not appear in the books.</li>
<li><dfn>Going concern</dfn>: assume the business will keep operating for the foreseeable future. That is why a building is reported at what it cost, not at what it would fetch in a fire sale tomorrow.</li>
<li><dfn>Time period</dfn> (periodicity): the life of a business can be cut into equal slices, such as months, quarters and years, so results can be reported regularly.</li>
</ul>

<h3>Four principles</h3>
<ul>
<li><dfn>Historical cost</dfn>: record assets at what was actually paid for them. Cost is objective and can be verified with a receipt. (Some investments are reported at current fair value instead.)</li>
<li><dfn>Revenue recognition</dfn>: record revenue when the company does the work or delivers the goods, not necessarily when cash arrives.</li>
<li><dfn>Expense recognition</dfn>, often called <b>matching</b>: record expenses in the same period as the revenue they helped produce.</li>
<li><dfn>Full disclosure</dfn>: report anything a reasonable reader would need to know, in the statements or in the notes that accompany them.</li>
</ul>
<p>Two practical limits sit on top of these. <dfn>Materiality</dfn> means an item only needs strict treatment if it is big enough to change someone’s decision. A $12 stapler can simply be expensed. <b>Cost constraint</b> means the benefit of a piece of information should exceed the cost of producing it.</p>

<div class="callout warn"><span class="lbl">Common mistake</span>
<p>Cash and revenue are not the same thing. A tutor who teaches in March and is paid in April earned the revenue in March. Chapter 5 is built around this idea.</p></div>

${qc({ type: 'mc', q: 'Rosa owns Rosa’s Repair Shop, a corporation. She pays for a family vacation with her personal credit card. How should the shop record it?', choices: ['As a travel expense of the shop', 'As a reduction in the shop’s cash', 'It shouldn’t: the shop and Rosa are separate entities', 'As a loan from the shop to Rosa'], answer: 2, explain: '<p>The economic entity assumption keeps personal transactions off the business’s books. Nothing left the shop, so there is nothing for the shop to record.</p>' })}

<h2>The four financial statements</h2>
<p>Here is Brightside Tutoring, a small company that opened in January. You will follow it through the next five chapters, so the names and numbers will become familiar. For now, focus on what each report is for and how the reports connect.</p>

<h3>Income statement: did we make a profit?</h3>
<p>The <dfn>income statement</dfn> reports revenues and expenses over a period of time. Revenues minus expenses equal <b>net income</b> (or <b>net loss</b> if expenses are larger).</p>
${stmt('Brightside Tutoring, Inc.', 'Income Statement · For the Month Ended January 31', IS)}

<h3>Statement of retained earnings: what did we keep?</h3>
<p><dfn>Retained earnings</dfn> are the profits a corporation has earned over its life and kept rather than paid out to owners. Payments of profit to owners are <b>dividends</b>. This statement shows how retained earnings changed during the period.</p>
${stmt('Brightside Tutoring, Inc.', 'Statement of Retained Earnings · For the Month Ended January 31', RE)}

<h3>Balance sheet: what do we own and owe right now?</h3>
<p>The <dfn>balance sheet</dfn> is a snapshot at one moment. It lists <b>assets</b> (resources the business controls), <b>liabilities</b> (what it owes) and <b>stockholders’ equity</b> (the owners’ claim). The two halves always match, which is where the name comes from.</p>
${stmt('Brightside Tutoring, Inc.', 'Balance Sheet · January 31', BS)}

<h3>Statement of cash flows: where did the cash go?</h3>
<p>The <dfn>statement of cash flows</dfn> explains the change in cash, sorted into <b>operating</b> activities (running the business), <b>investing</b> activities (buying and selling long-term assets) and <b>financing</b> activities (dealing with owners and lenders).</p>
${stmt('Brightside Tutoring, Inc.', 'Statement of Cash Flows · For the Month Ended January 31', CF)}

<div class="callout"><span class="lbl">Key idea</span>
<p>The statements are linked. Net income ($2,100) flows into the statement of retained earnings. Ending retained earnings ($1,800) flows into the balance sheet. The statement of cash flows ends at the same $5,800 cash shown on the balance sheet. When you understand those links, you understand how the whole system fits together.</p></div>

<p>Notice that Brightside earned a $2,100 profit but its operating activities produced only $900 of cash. Part of the revenue ($800) hasn’t been collected yet, and some cash went to pay off a supplier. Profit and cash are related, but they are not the same thing. Every chapter that follows builds on that distinction.</p>

${qc({ type: 'num', q: 'Brightside’s total assets are $12,000 and its liabilities are $200. What is total stockholders’ equity?', answer: 11800, unit: '$', explain: '<p>Equity is what remains for the owners after liabilities: $12,000 − $200 = $11,800. That is the accounting equation, the subject of the next chapter.</p>' })}
`,
    terms: [
      ['Accounting', 'The system that identifies, records and communicates the economic events of an organization to interested users.'],
      ['Bookkeeping', 'The recording part of accounting: entering transactions accurately and consistently.'],
      ['Financial accounting', 'Accounting for external users such as investors and lenders, following GAAP or IFRS.'],
      ['Managerial accounting', 'Accounting for internal users such as managers, in whatever form helps decisions.'],
      ['GAAP', 'Generally accepted accounting principles: the U.S. standards, set by the FASB, for preparing financial statements.'],
      ['FASB', 'Financial Accounting Standards Board, the private body that writes U.S. GAAP.'],
      ['IFRS', 'International Financial Reporting Standards, used in most countries outside the U.S.'],
      ['SEC', 'Securities and Exchange Commission, the U.S. agency that oversees public companies’ reporting.'],
      ['Economic entity assumption', 'A business’s activities are kept separate from its owners’ and from other businesses.'],
      ['Monetary unit assumption', 'Only transactions measurable in money are recorded.'],
      ['Going concern assumption', 'The business is assumed to continue operating for the foreseeable future.'],
      ['Time period assumption', 'A business’s life can be divided into equal reporting periods such as months and years.'],
      ['Historical cost principle', 'Assets are recorded at the amount paid to acquire them.'],
      ['Revenue recognition principle', 'Revenue is recorded when the goods or services are delivered, not when cash is received.'],
      ['Expense recognition principle', 'Expenses are recorded in the period they help generate revenue; also called matching.'],
      ['Full disclosure principle', 'Companies report all information that would affect a reasonable user’s decisions.'],
      ['Materiality', 'An item matters for reporting only if it is large enough to influence a decision.'],
      ['Sole proprietorship', 'A business owned by one person, who is personally liable for its debts.'],
      ['Partnership', 'A business owned by two or more people who share its profits and, usually, its liabilities.'],
      ['Corporation', 'A business that is a separate legal entity owned by stockholders, whose liability is limited to their investment.'],
      ['Income statement', 'Reports revenues, expenses and net income over a period.'],
      ['Statement of retained earnings', 'Shows how retained earnings changed during a period: beginning balance plus net income minus dividends.'],
      ['Balance sheet', 'Lists assets, liabilities and stockholders’ equity at a specific date.'],
      ['Statement of cash flows', 'Explains the change in cash, grouped into operating, investing and financing activities.'],
      ['Retained earnings', 'Total net income a corporation has earned over its life, minus all dividends it has paid.'],
      ['Dividends', 'Distributions of a corporation’s profits to its stockholders.']
    ],
    videos: [
      {
        id: 'v1', title: 'Four statements, one story',
        summary: 'Brightside Tutoring’s first month told four ways, and the threads that tie the four reports together.',
        steps: [
          { say: 'Brightside Tutoring opened in January. Let’s see what its four financial statements say about that first month.', f: { k: 'title', eyebrow: 'Example 1.A', h: 'Four statements, one story', sub: 'Brightside Tutoring, Inc. · January' } },
          { say: 'Here is the month in brief. The owner invested ten thousand dollars, the company bought equipment and supplies, tutored students, paid its bills, and paid the owner a small dividend.', f: { k: 'points', h: 'What happened in January', items: ['Owner invested <b>$10,000</b> for common stock', 'Bought <b>$4,800</b> of equipment and <b>$600</b> of supplies (on credit)', 'Earned <b>$4,300</b> tutoring: $2,500 in cash, $1,800 billed to a school', 'Paid <b>$1,000</b> rent and <b>$1,200</b> salary', 'Paid $400 toward the supplies bill and collected $1,000 from the school', 'Paid the owner a <b>$300</b> dividend'] } },
          { say: 'The income statement answers one question: did we make a profit? Revenue of four thousand three hundred dollars...', f: { k: 'stmt', h: 'Income Statement', sub: 'For the Month Ended January 31', rows: IS, hi: 0 } },
          { say: '...minus expenses of two thousand two hundred dollars...', hi: [2, 3, 4] },
          { say: '...leaves net income of <b>$2,100</b>. That number travels to the next statement.', hi: 5 },
          { say: 'The statement of retained earnings shows what happened to profit kept in the business. Start at zero, since Brightside is brand new. Add the $2,100 of net income.', f: { k: 'stmt', h: 'Statement of Retained Earnings', sub: 'For the Month Ended January 31', rows: RE, hi: [0, 1] } },
          { say: 'Subtract the $300 dividend paid to the owner. Brightside retained <b>$1,800</b> of its profit.', hi: [3, 4] },
          { say: 'The balance sheet is a snapshot on January 31. Here is what Brightside owns: twelve thousand dollars of assets.', f: { k: 'stmt', h: 'Balance Sheet', sub: 'January 31', rows: BS, hi: [1, 2, 3, 4, 5] } },
          { say: 'It owes a supplier two hundred dollars. And look at retained earnings: <b>$1,800</b>, carried straight over from the previous statement.', hi: [7, 10] },
          { say: 'Liabilities plus equity also total twelve thousand dollars. The two halves always match. That is why it is called a balance sheet.', hi: [5, 12] },
          { say: 'Last, the statement of cash flows. Running the business brought in a net nine hundred dollars of cash.', f: { k: 'stmt', h: 'Statement of Cash Flows', sub: 'For the Month Ended January 31', rows: CF, hi: [1, 2, 3, 4, 5] } },
          { say: 'Buying equipment used four thousand eight hundred. The owner’s investment, less the dividend, brought in nine thousand seven hundred.', hi: [7, 9, 10, 11] },
          { say: 'Cash went from zero to <b>$5,800</b>, the same figure on the balance sheet. Profit was $2,100, but operating cash was only $900. Profit and cash are not the same thing.', hi: [12, 13, 14] },
          { say: 'So the statements form a chain: net income feeds retained earnings, retained earnings feeds the balance sheet, and the cash flow statement explains the cash line.', f: { k: 'points', h: 'The links to remember', items: ['Income statement → <b>net income</b> → statement of retained earnings', 'Statement of retained earnings → <b>ending retained earnings</b> → balance sheet', 'Statement of cash flows → <b>ending cash</b> → balance sheet'] } }
        ]
      },
      {
        id: 'v2', title: 'The ground rules behind every number',
        summary: 'Deciding which events belong in Brightside’s books, and the assumptions and principles that shape how they’re recorded.',
        steps: [
          { say: 'Before recording anything, an accountant has to decide what counts. A handful of ground rules make that decision for us.', f: { k: 'title', eyebrow: 'Example 1.B', h: 'The ground rules', sub: 'Assumptions and principles behind the numbers' } },
          { say: 'Start with the economic entity assumption: the business is separate from its owner. Which of these belong in Brightside’s books?', f: { k: 'points', h: 'Is it Brightside’s transaction?', items: ['Dana, the owner, buys a car for personal use with personal savings', 'Brightside buys $4,800 of laptops and whiteboards', 'A friend lends Dana $2,000 for a vacation', 'Brightside pays January rent from its business account'] } },
          { say: 'Dana buying a personal car is <b>not</b> Brightside’s transaction. Personal money, personal asset.', hi: 0 },
          { say: 'Brightside buying equipment with business money <b>is</b>. It gets recorded.', hi: 1 },
          { say: 'A personal loan to Dana stays off the company’s books too.', hi: 2 },
          { say: 'Rent paid from the business account is a business transaction. Record it.', hi: 3 },
          { say: 'Here are the other ground rules. The monetary unit assumption: only record what can be measured in money.', f: { k: 'table', h: 'Rules of the game', head: ['Rule', 'In one line'], rows: [['Monetary unit', 'Record only what can be measured in dollars'], ['Going concern', 'Assume the business will keep operating'], ['Time period', 'Report in equal slices: months, quarters, years'], ['Historical cost', 'Record assets at what was paid'], ['Revenue recognition', 'Record revenue when the work is done'], ['Expense recognition', 'Record expenses with the revenue they helped earn']], n: 1, hi: 0 } },
          { say: 'Going concern: we assume Brightside will keep running, so its equipment is reported at cost, not at a fire-sale price.', n: 2, hi: 1 },
          { say: 'Time period: even though the business will last for years, we report on it every month, quarter and year.', n: 3, hi: 2 },
          { say: 'Historical cost: the equipment goes on the books at the $4,800 Brightside actually paid, backed by a receipt.', n: 4, hi: 3 },
          { say: 'Revenue recognition: Brightside tutored for a school and billed $1,800. That’s January revenue, even though only $1,000 was collected.', n: 5, hi: 4 },
          { say: 'And expense recognition, or matching: January’s rent and salary are January expenses because they helped earn January’s revenue.', n: 6, hi: 5 },
          { say: 'Keep these six rules in mind. Every journal entry in this book follows from them.', hi: [] }
        ]
      }
    ],
    practice: [
      { type: 'mc', lvl: 1, q: 'Which statement best describes accounting?', choices: ['Preparing tax returns for individuals', 'Identifying, recording and communicating an organization’s economic events', 'Counting the cash in a business at the end of each day', 'Deciding which investments a company should make'], answer: 1, explain: '<p>Accounting covers the whole process: identify the events, record them, and communicate the results. Tax work and cash counts are pieces of it, not the definition.</p>' },
      { type: 'classify', lvl: 1, q: 'Classify each user of accounting information as internal or external.', cats: ['Internal', 'External'], items: [['A bank evaluating a loan request', 1], ['The company’s marketing director', 0], ['Someone thinking about buying the company’s stock', 1], ['A production supervisor', 0], ['The tax authority', 1], ['A supplier deciding whether to offer credit', 1]], explain: '<p>Internal users work inside the company and manage it. Everyone else (lenders, investors, suppliers, government) is an external user who relies on published financial statements.</p>' },
      { type: 'mc', lvl: 1, q: 'Which organization writes U.S. generally accepted accounting principles?', choices: ['The Internal Revenue Service (IRS)', 'The Securities and Exchange Commission (SEC)', 'The Financial Accounting Standards Board (FASB)', 'The International Accounting Standards Board (IASB)'], answer: 2, explain: '<p>The FASB writes U.S. GAAP. The SEC has the legal authority to require public companies to follow it and generally relies on the FASB. The IASB writes IFRS.</p>' },
      { type: 'mc', lvl: 2, q: 'Green Leaf Landscaping bought land for $50,000 three years ago. An appraiser says it is now worth $70,000. At what amount does the land appear on the balance sheet?', choices: ['$70,000, its current value', '$50,000, its historical cost', '$60,000, the average', '$20,000, the gain'], answer: 1, hint: 'Which principle says assets are recorded at what was paid?', explain: '<p>Under the historical cost principle, the land stays at its $50,000 cost. Cost can be verified from the purchase documents; an appraisal is an estimate.</p>' },
      { type: 'mc', lvl: 2, q: 'A tutor teaches a student 10 sessions in March and is paid $500 in April. When is the revenue recognized?', choices: ['March, when the work was performed', 'April, when the cash was received', 'Half in March and half in April', 'When the tutor deposits the check'], answer: 0, explain: '<p>The revenue recognition principle ties revenue to performance. The service was delivered in March, so March gets the $500 of revenue, even though cash arrives in April.</p>' },
      { type: 'mc', lvl: 2, q: 'An accountant reports a company’s buildings at cost rather than at what they would sell for in a quick liquidation. Which assumption supports this?', choices: ['Monetary unit', 'Time period', 'Going concern', 'Economic entity'], answer: 2, explain: '<p>Because we assume the company will keep operating (going concern), it will use its buildings rather than sell them off, so liquidation values are not relevant.</p>' },
      { type: 'classify', lvl: 2, q: 'Which financial statement would you look at to find each item?', cats: ['Income statement', 'Retained earnings', 'Balance sheet', 'Cash flows'], items: [['Net income for the year', 0], ['Accounts payable owed at year-end', 2], ['Cash spent to buy new equipment', 3], ['Rent expense for the year', 0], ['How profits kept in the business changed', 1], ['Total assets at year-end', 2]], explain: '<p>Activity over a period (revenue, expenses) lives on the income statement. Balances at a moment (assets, liabilities) live on the balance sheet. Changes in kept profits go on the retained earnings statement, and cash movements on the statement of cash flows.</p>' },
      { type: 'num', lvl: 1, q: 'A consulting firm earned $9,000 of revenue in May and incurred $6,400 of expenses. What was its net income?', answer: 2600, unit: '$', explain: '<p>Net income = revenues − expenses = $9,000 − $6,400 = $2,600.</p>' },
      { type: 'num', lvl: 2, q: 'A company began the year with retained earnings of $5,000. It earned net income of $2,600 and paid dividends of $1,000. What are its ending retained earnings?', answer: 6600, unit: '$', hint: 'Beginning + net income − dividends.', explain: '<p>$5,000 + $2,600 − $1,000 = $6,600.</p>' },
      { type: 'num', lvl: 3, q: 'At year-end a company reports total liabilities of $38,000 and stockholders’ equity of $52,000. During the year it earned $15,000 of net income and paid no dividends. What are total assets at year-end?', answer: 90000, unit: '$', hint: 'The balance sheet must balance. Net income is already inside equity.', explain: '<p>Assets = liabilities + equity = $38,000 + $52,000 = $90,000. The $15,000 of net income is a distractor here: it is already included in the year-end equity figure through retained earnings.</p>' }
    ],
    more: ['introduction to accounting for beginners', 'four financial statements explained', 'GAAP assumptions and principles explained']
  });
})();
