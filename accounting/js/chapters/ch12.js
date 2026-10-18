(function () {
  const { qc, stmt, table } = Book;

  const OP = [['Net income', 48000, '$'], ['Adjustments:', null, 'h'], ['Depreciation expense', 12000, 'iL'], ['Gain on sale of equipment', -3000, 'iL'],
    ['Increase in accounts receivable', -5000, 'iL'], ['Decrease in inventory', 2000, 'iL'], ['Increase in prepaid expenses', -1000, 'iL'], ['Increase in accounts payable', 4000, 'iL'],
    ['Decrease in wages payable', -1500, 'iLu'], ['Total adjustments', 7500, 'u'], ['Net cash provided by operating activities', 55500, 'bd$']];
  const CF = [['Operating activities', null, 'h'], ['Net income', 48000, 'i$'], ['Adjustments to reconcile net income:', null, 'hi'], ['Depreciation expense', 12000, 'iiL'],
    ['Gain on sale of equipment', -3000, 'iiL'], ['Increase in accounts receivable', -5000, 'iiL'], ['Decrease in inventory', 2000, 'iiL'], ['Increase in prepaid expenses', -1000, 'iiL'],
    ['Increase in accounts payable', 4000, 'iiL'], ['Decrease in wages payable', -1500, 'iiLu'], ['Total adjustments', 7500, 'iu'], ['Net cash provided by operating activities', 55500, 'b'],
    ['Investing activities', null, 'h'], ['Sale of equipment', 10000, 'iL'], ['Purchase of equipment', -40000, 'iLu'], ['Net cash used by investing activities', -30000, 'b'],
    ['Financing activities', null, 'h'], ['Issuance of common stock', 20000, 'iL'], ['Repayment of long-term loan', -15000, 'iL'], ['Payment of dividends', -8000, 'iLu'],
    ['Net cash used by financing activities', -3000, 'bu'], ['Net increase in cash', 22500, 'b'], ['Cash, beginning of year', 14000, 'u'], ['Cash, end of year', 36500, 'bd$']];
  const CFS = [['Operating activities', null, 'h'], ['Net cash provided by operating activities', 55500, 'i$'], ['Investing activities', null, 'h'], ['Sale of equipment', 10000, 'iL'],
    ['Purchase of equipment', -40000, 'iLu'], ['Net cash used by investing activities', -30000, 'i'], ['Financing activities', null, 'h'], ['Issuance of common stock', 20000, 'iL'],
    ['Repayment of long-term loan', -15000, 'iL'], ['Payment of dividends', -8000, 'iLu'], ['Net cash used by financing activities', -3000, 'iu'], ['Net increase in cash', 22500, 'b'],
    ['Cash, beginning of year', 14000, 'u'], ['Cash, end of year', 36500, 'bd$']];
  const RULES = [['Increase in a current asset (receivables, inventory, prepaids)', 'Subtract'], ['Decrease in a current asset', 'Add'], ['Increase in a current liability (payables, accrued liabilities)', 'Add'], ['Decrease in a current liability', 'Subtract'], ['Depreciation, amortization, losses', 'Add back'], ['Gains on sales of assets', 'Subtract']];

  Book.chapter({
    id: 'ch12', num: 12, part: 4, short: 'Cash flows',
    title: 'The Statement of Cash Flows',
    blurb: 'Where the cash came from and where it went: operating, investing and financing activities, and the indirect method step by step.',
    minutes: 35,
    objectives: [
      'Explain what the statement of cash flows shows that the other statements don’t',
      'Classify cash flows as operating, investing or financing',
      'Prepare the operating section using the indirect method',
      'Prepare the investing and financing sections from balance sheet changes',
      'Compute free cash flow'
    ],
    lesson: `
<p>Brightside’s first month showed it: profit and cash are different things. A company can report rising profits while its bank account drains, or report a loss while cash piles up. The <dfn>statement of cash flows</dfn> explains, line by line, why cash changed during the period.</p>

<h2>Three kinds of cash flow</h2>
<p>Every cash receipt or payment fits in one of three categories:</p>
${table(['Activity', 'What it covers', 'Typical inflows', 'Typical outflows'], [
  ['<b>Operating</b>', 'Running the business day to day; items that affect net income', 'Cash from customers; interest and dividends received', 'Payments to suppliers and employees; interest; taxes'],
  ['<b>Investing</b>', 'Buying and selling long-term assets and investments', 'Selling equipment, land or investments; collecting loans made', 'Buying equipment, land, buildings or investments; making loans'],
  ['<b>Financing</b>', 'Dealing with owners and lenders', 'Issuing stock; borrowing', 'Repaying loan principal; paying dividends; buying treasury stock']
], { cls: 'compact' })}
<p>Under U.S. GAAP, interest paid, interest received and dividends received are operating cash flows, because they relate to items on the income statement. Dividends <i>paid</i> are financing, because they’re a payment to owners. (IFRS lets companies choose for some of these.)</p>
<p>Some important events involve no cash at all, such as buying land by issuing stock, or converting bonds into shares. These <b>noncash investing and financing activities</b> are reported in a separate schedule or note.</p>

${qc({ type: 'classify', q: 'Operating, investing or financing?', cats: ['Operating', 'Investing', 'Financing'], items: [['Paying employees’ wages', 0], ['Buying a delivery truck', 1], ['Borrowing from a bank', 2], ['Paying a dividend', 2], ['Collecting from customers', 0]], explain: '<p>Day-to-day operations are operating. Long-term assets are investing. Owners and lenders are financing.</p>' })}

<h2>The indirect method</h2>
<p>There are two ways to present the operating section. The <b>direct method</b> lists actual cash receipts and payments by type. The <dfn>indirect method</dfn> starts with net income and adjusts it to cash. Almost all companies use the indirect method, so this chapter focuses on it.</p>
<p>Net income differs from operating cash for two reasons, and each adjustment fixes one of them.</p>
<p><b>1. Noncash items in net income.</b> Depreciation and amortization reduced net income but used no cash this period, so they are <b>added back</b>. Gains and losses on selling long-term assets are also removed: the full sale price belongs in investing, so a gain is <b>subtracted</b> and a loss is <b>added back</b>.</p>
<p><b>2. Timing differences in current accounts.</b> Accrual accounting records revenue and expenses before or after cash moves, and those gaps show up as changes in current assets and current liabilities:</p>
${table(['Change during the year', 'Adjustment to net income'], RULES, { cls: 'compact' })}
<p>Why? If accounts receivable went <i>up</i>, the company recorded more revenue than it collected, so cash is lower than net income: subtract the increase. If accounts payable went <i>up</i>, the company recorded expenses it hasn’t paid, so cash is higher than net income: add the increase. A useful shortcut: changes in current assets move opposite to their effect on cash; changes in current liabilities move the same way.</p>

<div class="callout example"><span class="lbl">Example: Corner Coffee Co.</span>
<p>Net income this year was $48,000. Depreciation was $12,000. The company sold equipment with a book value of $7,000 for $10,000, a $3,000 gain. Over the year, accounts receivable rose $5,000, inventory fell $2,000, prepaid expenses rose $1,000, accounts payable rose $4,000 and wages payable fell $1,500.</p></div>
${stmt('Corner Coffee Co.', 'Operating activities (indirect method)', OP)}
<p>Corner Coffee generated $55,500 of cash from operations, more than its net income, mainly because depreciation is a large noncash expense.</p>

<h2>Investing and financing activities</h2>
<p>For these sections, look at changes in long-term assets, long-term liabilities and equity, and find the cash behind each one. Corner Coffee:</p>
<ul>
<li>Sold equipment for $10,000 cash (the full proceeds, not the $3,000 gain).</li>
<li>Bought new espresso machines for $40,000.</li>
<li>Issued common stock for $20,000.</li>
<li>Repaid $15,000 of a long-term bank loan.</li>
<li>Paid $8,000 of dividends.</li>
</ul>
<p>Putting all three sections together, with beginning cash of $14,000:</p>
${stmt('Corner Coffee Co.', 'Statement of Cash Flows · For the Year Ended December 31', CF)}
<p>The final figure, $36,500, must equal cash on the year-end balance sheet. That’s the built-in check.</p>

${qc({ type: 'mc', q: 'Corner Coffee sold equipment at a $3,000 gain. Why is the gain subtracted in the operating section?', choices: ['Because gains are taxed', 'Because the full $10,000 of proceeds is reported in investing, so leaving the gain in operating would count it twice', 'Because gains reduce cash', 'Because the equipment was fully depreciated'], answer: 1, explain: '<p>The gain is part of net income, but the cash from the sale belongs in investing activities. Subtracting the gain from operating avoids double counting.</p>' })}

<h2>The direct method, briefly</h2>
<p>The direct method shows the same total operating cash with more intuitive lines: cash collected from customers, cash paid to suppliers, cash paid to employees, and so on. Each line converts an income statement item to cash. For example, cash collected from customers = sales revenue − the increase in accounts receivable (or + a decrease). Companies that use the direct method must also provide the indirect reconciliation.</p>

<h2>Free cash flow</h2>
<p>Analysts often look at <dfn>free cash flow</dfn>: cash from operations minus capital expenditures (cash spent on property, plant and equipment). It’s the cash left for paying dividends, repaying debt, buying back shares or expanding. Corner Coffee’s free cash flow is $55,500 − $40,000 = $15,500. Some analysts also subtract dividends.</p>
<div class="callout"><span class="lbl">Reading the pattern</span>
<p>A healthy, established business usually shows positive operating cash flow that funds negative investing (it keeps reinvesting) and negative financing (it repays debt and pays dividends). A young company often shows the reverse: operating cash still negative, funded by borrowing or issuing stock. Neither pattern is good or bad by itself, but each tells a story.</p></div>
`,
    terms: [
      ['Statement of cash flows', 'A statement reporting cash receipts and payments during a period, classified as operating, investing and financing.'],
      ['Operating activities', 'Cash effects of transactions that enter into net income.'],
      ['Investing activities', 'Cash flows from buying and selling long-term assets and investments, and making and collecting loans.'],
      ['Financing activities', 'Cash flows from issuing and repaying debt, and from issuing stock, buying it back and paying dividends.'],
      ['Indirect method', 'Prepares operating cash flow by adjusting net income for noncash items and changes in current assets and liabilities.'],
      ['Direct method', 'Prepares operating cash flow by listing major classes of cash receipts and payments.'],
      ['Noncash investing and financing activities', 'Significant transactions that involve no cash, such as acquiring land by issuing stock; disclosed separately.'],
      ['Free cash flow', 'Cash provided by operating activities minus capital expenditures (and sometimes dividends).'],
      ['Capital expenditures', 'Cash spent to acquire property, plant and equipment.']
    ],
    videos: [
      {
        id: 'v1', title: 'The indirect method, line by line',
        summary: 'Corner Coffee earned $48,000 but generated $55,500 of operating cash. Walk through each adjustment and the reason for it.',
        steps: [
          { say: 'Corner Coffee earned forty-eight thousand dollars this year. The indirect method starts there and asks: what made cash different from that?', f: { k: 'stmt', h: 'Operating activities', sub: 'Corner Coffee Co. · indirect method', rows: OP, n: 1, hi: 0 } },
          { say: 'Depreciation reduced net income by twelve thousand dollars, but no cash left the company for it. So add it back.', n: 3, hi: 2 },
          { say: 'The company sold equipment at a three-thousand-dollar gain. The sale’s cash belongs in investing activities, so take the gain out of operating: subtract it.', n: 4, hi: 3 },
          { say: 'Accounts receivable rose five thousand. Customers were billed more than they paid, so cash is lower than revenue suggests. Subtract.', n: 5, hi: 4 },
          { say: 'Inventory fell two thousand. Some of the goods sold came off the shelf, not from new cash purchases. Add.', n: 6, hi: 5 },
          { say: 'Prepaid expenses rose a thousand. Cash was paid in advance for costs not yet expensed. Subtract.', n: 7, hi: 6 },
          { say: 'Accounts payable rose four thousand. The company recorded expenses it hasn’t paid yet, so it kept the cash. Add.', n: 8, hi: 7 },
          { say: 'Wages payable fell fifteen hundred. The company paid off wages expensed last year, using extra cash. Subtract.', n: 9, hi: 8 },
          { say: 'The adjustments net to plus seventy-five hundred. Operating cash flow: fifty-five thousand five hundred dollars.', n: 11, hi: [9, 10] },
          { say: 'The pattern to remember: current assets up, cash down. Current liabilities up, cash up. Noncash expenses and losses, add back. Gains, subtract.', f: { k: 'table', h: 'Indirect method rules', head: ['Change', 'Adjustment'], rows: RULES } }
        ]
      },
      {
        id: 'v2', title: 'Sorting cash into three buckets',
        summary: 'Every Corner Coffee cash flow goes into operating, investing or financing, and the finished statement ties back to the balance sheet.',
        steps: [
          { say: 'Here are Corner Coffee’s other cash events for the year. Each one goes into exactly one bucket.', f: { k: 'table', h: 'Which bucket?', head: ['Cash event', 'Activity'], rows: [['Sold equipment for $10,000', ''], ['Bought espresso machines, $40,000', ''], ['Issued stock for $20,000', ''], ['Repaid $15,000 of a bank loan', ''], ['Paid $8,000 of dividends', '']] } },
          { say: 'Buying and selling long-term assets is investing.', f: { k: 'table', h: 'Which bucket?', head: ['Cash event', 'Activity'], rows: [['Sold equipment for $10,000', 'Investing'], ['Bought espresso machines, $40,000', 'Investing'], ['Issued stock for $20,000', ''], ['Repaid $15,000 of a bank loan', ''], ['Paid $8,000 of dividends', '']], hi: [0, 1] } },
          { say: 'Dealing with owners and lenders is financing: new stock, loan repayments, and dividends paid.', f: { k: 'table', h: 'Which bucket?', head: ['Cash event', 'Activity'], rows: [['Sold equipment for $10,000', 'Investing'], ['Bought espresso machines, $40,000', 'Investing'], ['Issued stock for $20,000', 'Financing'], ['Repaid $15,000 of a bank loan', 'Financing'], ['Paid $8,000 of dividends', 'Financing']], hi: [2, 3, 4] } },
          { say: 'Here is the full statement. Operating activities, the fifty-five five we just built.', f: { k: 'stmt', h: 'Statement of Cash Flows', sub: 'Corner Coffee Co. · year ended December 31 (operating detail in Example 12.A)', rows: CFS, hi: 1 } },
          { say: 'Investing: ten thousand in from the old equipment, forty thousand out for new machines. Net thirty thousand used.', hi: [3, 4, 5] },
          { say: 'Financing: twenty thousand in from stock, fifteen thousand out to the bank, eight thousand out in dividends. Net three thousand used.', hi: [7, 8, 9, 10] },
          { say: 'Altogether, cash rose twenty-two thousand five hundred. Add the fourteen thousand Corner Coffee started with, and the year ends at thirty-six five. That must match the balance sheet.', hi: [11, 12, 13] },
          { say: 'One more number analysts love: free cash flow. Operating cash, minus what was spent on equipment: fifteen thousand five hundred dollars of cash the business generated beyond what it needed to reinvest.', f: { k: 'stmt', h: 'Free cash flow', rows: [['Net cash provided by operating activities', 55500, '$'], ['Less: Capital expenditures', 40000, 'u'], ['Free cash flow', 15500, 'bd$']], hi: 2 } }
        ]
      }
    ],
    practice: [
      { type: 'classify', lvl: 1, q: 'Classify each cash flow (U.S. GAAP).', cats: ['Operating', 'Investing', 'Financing'], items: [['Cash received from customers', 0], ['Purchase of equipment', 1], ['Issuance of bonds', 2], ['Payment of dividends', 2], ['Interest paid on a loan', 0], ['Purchase of another company’s stock as an investment', 1], ['Payment of wages', 0], ['Repayment of loan principal', 2]], explain: '<p>Interest paid is operating under U.S. GAAP because interest expense is part of net income. Repaying principal is financing; buying investments is investing.</p>' },
      { type: 'num', lvl: 2, q: 'Net income $30,000; depreciation $8,000; accounts receivable increased $4,000; inventory increased $2,500; accounts payable increased $3,000; loss on sale of equipment $1,000. What is net cash provided by operating activities?', answer: 35500, unit: '$', explain: '<p>$30,000 + $8,000 − $4,000 − $2,500 + $3,000 + $1,000 = $35,500. The loss is added back because it reduced net income without using cash.</p>' },
      { type: 'mc', lvl: 1, q: 'Under the indirect method, an increase in accounts receivable is:', choices: ['Added to net income', 'Subtracted from net income', 'Reported in investing activities', 'Ignored'], answer: 1, explain: '<p>Revenue was recorded but not all of it was collected, so cash is lower than net income.</p>' },
      { type: 'mc', lvl: 2, q: 'Under the indirect method, a decrease in accounts payable is:', choices: ['Added to net income', 'Subtracted from net income', 'Reported in financing activities', 'Ignored'], answer: 1, explain: '<p>The company paid suppliers more than it expensed this period, so cash is lower than net income.</p>' },
      { type: 'num', lvl: 2, q: 'A company sold land for $25,000, bought equipment for $60,000 and bought another company’s bonds as an investment for $10,000. What is net cash from investing activities? (Use a minus sign or parentheses for a net outflow.)', answer: -45000, unit: '$', explain: '<p>$25,000 − $60,000 − $10,000 = −$45,000, a net outflow, written ($45,000).</p>' },
      { type: 'num', lvl: 2, q: 'A company issued stock for $50,000, paid dividends of $12,000 and repaid $20,000 of notes payable. What is net cash from financing activities?', answer: 18000, unit: '$', explain: '<p>$50,000 − $12,000 − $20,000 = $18,000 provided.</p>' },
      { type: 'num', lvl: 2, q: 'Beginning cash was $9,000. Operating activities provided $35,500, investing used $45,000 and financing provided $18,000. What is ending cash?', answer: 17500, unit: '$', explain: '<p>Net change = $35,500 − $45,000 + $18,000 = $8,500. Ending cash = $9,000 + $8,500 = $17,500.</p>' },
      { type: 'num', lvl: 2, q: 'Sales revenue was $200,000 and accounts receivable increased by $6,000. How much cash was collected from customers?', answer: 194000, unit: '$', explain: '<p>$6,000 of the year’s sales hasn’t been collected yet: $200,000 − $6,000 = $194,000.</p>' },
      { type: 'num', lvl: 1, q: 'Cash provided by operating activities is $55,500 and capital expenditures are $40,000. What is free cash flow?', answer: 15500, unit: '$', explain: '<p>$55,500 − $40,000 = $15,500.</p>' },
      { type: 'mc', lvl: 2, q: 'A company acquires land by issuing $80,000 of common stock. How is this reported?', choices: ['As an investing outflow and a financing inflow', 'In a separate schedule of noncash investing and financing activities', 'As an operating activity', 'It isn’t reported'], answer: 1, explain: '<p>No cash changed hands, so it doesn’t appear in the three sections, but it’s significant, so it’s disclosed separately.</p>' },
      { type: 'num', lvl: 3, q: 'Equipment with a cost of $30,000 and accumulated depreciation of $22,000 was sold. The income statement shows a $4,000 gain on the sale. What amount appears in investing activities?', answer: 12000, unit: '$', hint: 'Cash received = book value + gain.', explain: '<p>Book value = $30,000 − $22,000 = $8,000. Cash received = $8,000 + $4,000 = $12,000, reported as an investing inflow.</p>' }
    ],
    more: ['statement of cash flows indirect method', 'operating investing financing activities examples', 'free cash flow explained']
  });
})();
