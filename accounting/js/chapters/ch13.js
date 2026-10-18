(function () {
  const { qc, table } = Book;

  const IS2 = [['Net sales', 800000, 640000, '160,000', '25.0%'], ['Cost of goods sold', 480000, 390000, '90,000', '23.1%'], ['Gross profit', 320000, 250000, '70,000', '28.0%'],
    ['Operating expenses', 200000, 160000, '40,000', '25.0%'], ['Income from operations', 120000, 90000, '30,000', '33.3%'], ['Interest expense', 20000, 10000, '10,000', '100.0%'],
    ['Income before income taxes', 100000, 80000, '20,000', '25.0%'], ['Income tax expense', 25000, 20000, '5,000', '25.0%'], ['Net income', 75000, 60000, '15,000', '25.0%']];
  const CS = [['Net sales', 800000, '100.0%'], ['Cost of goods sold', 480000, '60.0%'], ['Gross profit', 320000, '40.0%'], ['Operating expenses', 200000, '25.0%'],
    ['Income from operations', 120000, '15.0%'], ['Interest expense', 20000, '2.5%'], ['Income before income taxes', 100000, '12.5%'], ['Income tax expense', 25000, '3.1%'], ['Net income', 75000, '9.4%']];
  const BS = [['Cash', 40000, 35000], ['Accounts receivable', 60000, 40000], ['Inventory', 100000, 140000], ['Prepaid expenses', 10000, 5000], ['<b>Total current assets</b>', 210000, 220000],
    ['Property, plant and equipment, net', 390000, 280000], ['<b>Total assets</b>', 600000, 500000], ['Current liabilities', 105000, 100000], ['Long-term debt', 195000, 140000],
    ['<b>Total liabilities</b>', 300000, 240000], ['Stockholders’ equity', 300000, 260000], ['<b>Total liabilities and equity</b>', 600000, 500000]];
  const RATIOS = [
    ['<b>Liquidity</b>', '', ''],
    ['Current ratio', 'Current assets ÷ current liabilities', '2.00×'],
    ['Quick (acid-test) ratio', '(Cash + short-term investments + receivables) ÷ current liabilities', '0.95×'],
    ['Receivables turnover', 'Net credit sales ÷ average accounts receivable', '16.0×'],
    ['Average collection period', '365 ÷ receivables turnover', '22.8 days'],
    ['Inventory turnover', 'Cost of goods sold ÷ average inventory', '4.0×'],
    ['Days in inventory', '365 ÷ inventory turnover', '91.3 days'],
    ['<b>Solvency</b>', '', ''],
    ['Debt to assets', 'Total liabilities ÷ total assets', '50.0%'],
    ['Debt to equity', 'Total liabilities ÷ total stockholders’ equity', '1.00×'],
    ['Times interest earned', '(Net income + interest + income taxes) ÷ interest expense', '6.0×'],
    ['<b>Profitability</b>', '', ''],
    ['Gross profit rate', 'Gross profit ÷ net sales', '40.0%'],
    ['Profit margin', 'Net income ÷ net sales', '9.4%'],
    ['Asset turnover', 'Net sales ÷ average total assets', '1.45×'],
    ['Return on assets', 'Net income ÷ average total assets', '13.6%'],
    ['Return on equity', 'Net income ÷ average stockholders’ equity', '26.8%'],
    ['Earnings per share', '(Net income − preferred dividends) ÷ weighted-average shares', '$1.50'],
    ['Price-earnings ratio', 'Market price per share ÷ EPS', '20.0×']
  ];

  Book.chapter({
    id: 'ch13', num: 13, part: 4, short: 'Statement analysis',
    title: 'Analyzing Financial Statements',
    blurb: 'Reading the numbers like an analyst: trends, common-size statements, and the ratios that measure liquidity, solvency and profitability.',
    minutes: 35,
    objectives: [
      'Perform horizontal and vertical (common-size) analysis',
      'Compute and interpret liquidity ratios',
      'Compute and interpret solvency ratios',
      'Compute and interpret profitability ratios',
      'Recognize the limits of ratio analysis'
    ],
    lesson: `
<p>A single number from a financial statement doesn’t say much. Is $75,000 of net income good? It depends: compared with last year, with sales, with the money invested to earn it, with competitors. Financial statement analysis is the habit of putting every number next to something else.</p>
<p>Three comparisons matter most: the same company over time (<b>intracompany</b>), the company against a competitor (<b>intercompany</b>), and the company against its <b>industry</b> average. This chapter uses Summit Outfitters, an outdoor gear retailer, for two years.</p>
${table(['Summit Outfitters: balance sheet', 'This year', 'Last year'], BS, { cls: 'compact' })}

<h2>Horizontal analysis</h2>
<p><dfn>Horizontal analysis</dfn> (trend analysis) measures the change in each line from one period to the next, in dollars and as a percentage:</p>
<div class="formula">Percentage change <span class="op">=</span> (This year <span class="op">−</span> Base year) <span class="op">÷</span> Base year</div>
${table(['Income statement', 'This year', 'Last year', 'Change', '% change'], IS2, { cls: 'compact' })}
<p>Sales and net income both grew 25%. Gross profit grew faster than sales (28%) because cost of goods sold grew more slowly. But interest expense doubled: Summit took on more long-term debt to buy new stores, which shows up in the balance sheet too. That’s the kind of story horizontal analysis surfaces.</p>

<h2>Vertical analysis</h2>
<p><dfn>Vertical analysis</dfn> expresses each item as a percentage of a base amount in the same statement: net sales on the income statement, total assets on the balance sheet. The result is a <dfn>common-size statement</dfn>, which makes companies of very different sizes comparable.</p>
${table(['Income statement', 'Amount', '% of net sales'], CS, { cls: 'compact' })}
<p>Of every sales dollar, 60 cents goes to the cost of the gear, 25 cents to running the stores, and 9.4 cents ends up as profit. A competitor twice Summit’s size can be compared line by line.</p>

${qc({ type: 'num', q: 'Last year Summit’s operating expenses were $160,000; this year they are $200,000. What is the percentage change?', answer: 25, unit: '%', explain: '<p>($200,000 − $160,000) ÷ $160,000 = 25%.</p>' })}

<h2>Liquidity: can it pay its bills?</h2>
<p><dfn>Liquidity ratios</dfn> measure the ability to meet short-term obligations. Lenders and suppliers watch them closely.</p>
<ul>
<li><dfn>Current ratio</dfn> = current assets ÷ current liabilities = $210,000 ÷ $105,000 = <b>2.0</b>. Summit has $2 of current assets for each $1 of current debts.</li>
<li><dfn>Quick ratio</dfn> (acid-test) leaves out inventory and prepaids, which can’t quickly become cash: ($40,000 + $60,000) ÷ $105,000 = <b>0.95</b>.</li>
<li><b>Receivables turnover</b> = net credit sales ÷ average receivables = $800,000 ÷ [($60,000 + $40,000) ÷ 2] = <b>16.0 times</b>. The <b>average collection period</b> is 365 ÷ 16 = <b>22.8 days</b>.</li>
<li><b>Inventory turnover</b> = cost of goods sold ÷ average inventory = $480,000 ÷ [($100,000 + $140,000) ÷ 2] = <b>4.0 times</b>, so goods sit about 365 ÷ 4 = <b>91 days</b> before they sell.</li>
</ul>
<p>Turnover ratios use <i>averages</i> of balance sheet figures, because the income statement number they’re paired with built up over the whole year.</p>

<h2>Solvency: can it survive the long run?</h2>
<p><dfn>Solvency ratios</dfn> measure the ability to meet long-term obligations and survive a downturn.</p>
<ul>
<li><b>Debt to assets</b> = total liabilities ÷ total assets = $300,000 ÷ $600,000 = <b>50%</b>. Half of Summit’s assets are financed by creditors.</li>
<li><b>Debt to equity</b> = total liabilities ÷ equity = <b>1.0</b>.</li>
<li><dfn>Times interest earned</dfn> = earnings before interest and taxes ÷ interest expense = ($75,000 + $20,000 + $25,000) ÷ $20,000 = <b>6.0 times</b>. Operating earnings cover interest six times over.</li>
</ul>

<h2>Profitability: how well does it earn?</h2>
<ul>
<li><b>Gross profit rate</b> = $320,000 ÷ $800,000 = <b>40%</b>.</li>
<li><dfn>Profit margin</dfn> = net income ÷ net sales = <b>9.4%</b>.</li>
<li><b>Asset turnover</b> = net sales ÷ average total assets = $800,000 ÷ $550,000 = <b>1.45</b>: each dollar of assets generated $1.45 of sales.</li>
<li><dfn>Return on assets</dfn> (ROA) = net income ÷ average total assets = $75,000 ÷ $550,000 = <b>13.6%</b>. (Notice ROA = profit margin × asset turnover.)</li>
<li><dfn>Return on equity</dfn> (ROE) = net income ÷ average stockholders’ equity = $75,000 ÷ $280,000 = <b>26.8%</b>.</li>
<li><b>Earnings per share</b> = $75,000 ÷ 50,000 shares = <b>$1.50</b>, and with the stock at $30 the <dfn>price-earnings ratio</dfn> is 30 ÷ 1.50 = <b>20</b>: investors pay $20 for each dollar of current earnings.</li>
</ul>
<p>ROE is higher than ROA because Summit uses borrowed money. As long as debt costs less than the assets earn, borrowing boosts returns to owners. That’s called <b>leverage</b>, and it cuts both ways.</p>

${table(['Ratio', 'Formula', 'Summit'], RATIOS, { cls: 'compact' })}

${qc({ type: 'mc', q: 'A supplier deciding whether to sell to Summit on 30-day credit would care most about:', choices: ['Price-earnings ratio', 'Current and quick ratios', 'Return on equity', 'Earnings per share'], answer: 1, explain: '<p>A short-term creditor wants to know whether Summit can pay within weeks. Liquidity ratios answer that; P/E, ROE and EPS matter more to stock investors.</p>' })}

<h2>Limits of ratio analysis</h2>
<ul>
<li><b>Estimates and choices.</b> FIFO versus LIFO, depreciation methods and bad-debt estimates all change the ratios. Compare companies that account the same way, or adjust.</li>
<li><b>Snapshots.</b> Balance sheet ratios reflect one day. A retailer’s inventory on December 31 may look nothing like its inventory in October. Companies can also time transactions to flatter year-end ratios (“window dressing”).</li>
<li><b>One-time items.</b> A big gain on selling a building inflates one year’s profit. Analysts look at results from continuing operations separately.</li>
<li><b>No single right answer.</b> A current ratio of 2 might be comfortable for a manufacturer and wasteful for a grocery chain that turns inventory every two weeks. Compare against the industry.</li>
</ul>
<p>Ratios are questions, not answers. A falling receivables turnover tells you to look at credit policy; it doesn’t tell you what went wrong.</p>
`,
    terms: [
      ['Horizontal analysis', 'Comparing line items across periods, in dollars and percentage change; also called trend analysis.'],
      ['Vertical analysis', 'Expressing each item as a percentage of a base amount in the same statement.'],
      ['Common-size statement', 'A statement in which every item is shown as a percentage of a base such as net sales or total assets.'],
      ['Liquidity ratios', 'Measures of a company’s ability to pay short-term obligations.'],
      ['Current ratio', 'Current assets ÷ current liabilities.'],
      ['Quick ratio', '(Cash + short-term investments + receivables) ÷ current liabilities; also called acid-test ratio.'],
      ['Receivables turnover', 'Net credit sales ÷ average accounts receivable.'],
      ['Inventory turnover', 'Cost of goods sold ÷ average inventory.'],
      ['Solvency ratios', 'Measures of a company’s ability to meet long-term obligations.'],
      ['Debt to assets ratio', 'Total liabilities ÷ total assets.'],
      ['Times interest earned', 'Earnings before interest and taxes ÷ interest expense.'],
      ['Profit margin', 'Net income ÷ net sales.'],
      ['Asset turnover', 'Net sales ÷ average total assets.'],
      ['Return on assets', 'Net income ÷ average total assets.'],
      ['Return on equity', 'Net income ÷ average stockholders’ equity.'],
      ['Price-earnings ratio', 'Market price per share ÷ earnings per share.'],
      ['Leverage', 'Using borrowed money to increase the return on owners’ equity.']
    ],
    videos: [
      {
        id: 'v1', title: 'Common-sizing an income statement',
        summary: 'Turn Summit Outfitters’ dollar figures into percentages of sales, and compare this year with last.',
        steps: [
          { say: 'Here is Summit Outfitters’ income statement for this year. Eight hundred thousand in sales, seventy-five thousand of profit. To compare it with anyone, convert every line to a percent of sales.', f: { k: 'table', h: 'Summit Outfitters · common-size income statement', head: ['', 'Amount', '% of sales'], rows: CS, n: 1, hi: 0 } },
          { say: 'Sales is the base: one hundred percent.', hc: 2 },
          { say: 'Cost of goods sold: four eighty over eight hundred, sixty percent. So gross profit is forty percent.', n: 3, hi: [1, 2] },
          { say: 'Operating expenses take twenty-five cents of each sales dollar, leaving fifteen percent as income from operations.', n: 5, hi: [3, 4] },
          { say: 'After interest and taxes, net income is nine point four percent of sales. That’s the profit margin.', n: 9, hi: [5, 6, 7, 8] },
          { say: 'Now compare with last year using horizontal analysis. Sales grew a hundred sixty thousand, twenty-five percent.', f: { k: 'table', h: 'Horizontal analysis', head: ['', 'This year', 'Last year', 'Change', '%'], rows: IS2, hi: 0, hc: 4 } },
          { say: 'Gross profit grew even faster, twenty-eight percent, because cost of goods sold grew more slowly than sales. Good news about pricing or purchasing.', hi: [1, 2] },
          { say: 'But look at interest expense: up one hundred percent. Summit borrowed to open new stores. It still grew net income twenty-five percent, but it’s carrying more risk.', hi: 5 },
          { say: 'Two tools, two questions. Vertical analysis: how is each dollar of sales spent? Horizontal analysis: what changed, and how fast?', f: { k: 'points', h: 'Two lenses', items: ['<b>Vertical</b>: each line ÷ a base in the same year (net sales, total assets)', '<b>Horizontal</b>: each line’s change ÷ the base year', 'Both turn raw dollars into comparisons you can reason about'] } }
        ]
      },
      {
        id: 'v2', title: 'A ratio checkup for Summit Outfitters',
        summary: 'Liquidity, solvency and profitability ratios computed from Summit’s statements, with what each one is telling you.',
        steps: [
          { say: 'Let\u2019s give Summit a full checkup, in three parts: liquidity, solvency and profitability.', f: { k: 'points', h: 'Three questions', items: ['<b>Liquidity</b>: can Summit pay what it owes in the next year?', '<b>Solvency</b>: can it carry its debt over the long run?', '<b>Profitability</b>: how well does it turn sales and investment into profit?'] } },
          { say: 'Liquidity first. The current ratio is two: two dollars of current assets for each dollar due soon. The quick ratio, which drops inventory, is just under one.', f: { k: 'table', h: 'Liquidity', head: ['Ratio', 'Formula', 'Result'], rows: RATIOS.slice(1, 7), hi: [0, 1] } },
          { say: 'Customers pay in about twenty-three days, which is fine for typical thirty-day terms. Inventory turns four times a year, sitting about ninety-one days. For gear that\u2019s seasonal, worth watching.', hi: [2, 3, 4, 5] },
          { say: 'Solvency. Half of Summit\u2019s assets are financed with debt. Operating earnings cover interest six times. Comfortable, but debt has been rising.', f: { k: 'table', h: 'Solvency', head: ['Ratio', 'Formula', 'Result'], rows: RATIOS.slice(8, 11), hi: [0, 1, 2] } },
          { say: 'Profitability. A forty percent gross profit rate, and nine point four cents of profit on each sales dollar.', f: { k: 'table', h: 'Profitability', head: ['Ratio', 'Formula', 'Result'], rows: RATIOS.slice(12), hi: [0, 1] } },
          { say: 'Each dollar of assets generated a dollar forty-five of sales. Margin times turnover gives return on assets: thirteen point six percent.', hi: [2, 3] },
          { say: 'Return on equity is almost double that, twenty-six point eight percent, because Summit uses borrowed money. That\u2019s leverage working in the owners\u2019 favor.', hi: 4 },
          { say: 'Finally, earnings per share of a dollar fifty, and a price-earnings ratio of twenty. Investors are paying twenty dollars for each dollar of current earnings, expecting growth to continue.', hi: [5, 6] },
          { say: 'The verdict: a profitable, growing business with adequate liquidity and rising, but manageable, debt. Ratios don\u2019t give answers. They tell you which questions to ask next.', f: { k: 'points', h: 'Summit\u2019s checkup', items: ['Liquidity: <b>adequate</b>, with inventory worth watching', 'Solvency: <b>manageable</b>, but debt is rising', 'Profitability: <b>strong</b>, boosted by leverage'] } }
        ]
      }
    ],
    practice: [
      { type: 'num', lvl: 1, q: 'Current assets are $180,000 and current liabilities are $120,000. What is the current ratio?', answer: 1.5, unit: 'x', explain: '<p>$180,000 ÷ $120,000 = 1.5.</p>' },
      { type: 'num', lvl: 2, q: 'Cash $20,000; short-term investments $10,000; accounts receivable $30,000; inventory $80,000; prepaid expenses $5,000; current liabilities $75,000. What is the quick ratio?', answer: 0.8, unit: 'x', explain: '<p>Quick assets = $20,000 + $10,000 + $30,000 = $60,000. Quick ratio = $60,000 ÷ $75,000 = 0.8. Inventory and prepaids are left out.</p>' },
      { type: 'num', lvl: 2, q: 'Cost of goods sold is $360,000. Inventory was $50,000 at the start of the year and $70,000 at the end. What is inventory turnover?', answer: 6, unit: 'x', explain: '<p>Average inventory = ($50,000 + $70,000) ÷ 2 = $60,000. Turnover = $360,000 ÷ $60,000 = 6.0 times.</p>' },
      { type: 'num', lvl: 2, q: 'Using the previous answer, how many days on average does inventory sit before being sold? (Use 365 days; round to one decimal.)', answer: 60.8, unit: 'days', tol: 0.06, explain: '<p>365 ÷ 6.0 = 60.8 days.</p>' },
      { type: 'num', lvl: 2, q: 'Net income is $45,000. Stockholders’ equity was $280,000 at the start of the year and $320,000 at the end. What is return on equity?', answer: 15, unit: '%', explain: '<p>Average equity = $300,000. ROE = $45,000 ÷ $300,000 = 15%.</p>' },
      { type: 'num', lvl: 1, q: 'Sales were $640,000 last year and $800,000 this year. What is the percentage increase?', answer: 25, unit: '%', explain: '<p>($800,000 − $640,000) ÷ $640,000 = 25%.</p>' },
      { type: 'num', lvl: 1, q: 'Net sales are $800,000 and cost of goods sold is $480,000. In a common-size income statement, what percentage is cost of goods sold?', answer: 60, unit: '%', explain: '<p>$480,000 ÷ $800,000 = 60%.</p>' },
      { type: 'mc', lvl: 1, q: 'A bank considering a 90-day loan would care most about which ratio?', choices: ['Return on equity', 'Price-earnings ratio', 'Current ratio', 'Asset turnover'], answer: 2, explain: '<p>A short-term lender wants to know if current assets can cover current obligations: a liquidity ratio.</p>' },
      { type: 'num', lvl: 1, q: 'Total liabilities are $300,000 and total assets are $600,000. What is the debt-to-assets ratio?', answer: 50, unit: '%', explain: '<p>$300,000 ÷ $600,000 = 50%.</p>' },
      { type: 'num', lvl: 2, q: 'Net income $75,000; interest expense $20,000; income tax expense $25,000. What is times interest earned?', answer: 6, unit: 'x', explain: '<p>Earnings before interest and taxes = $75,000 + $20,000 + $25,000 = $120,000. $120,000 ÷ $20,000 = 6.0 times.</p>' },
      { type: 'num', lvl: 2, q: 'A company with no preferred stock earned $75,000 with 50,000 weighted-average common shares. Its stock trades at $30. What is the price-earnings ratio?', answer: 20, unit: 'x', explain: '<p>EPS = $75,000 ÷ 50,000 = $1.50. P/E = $30 ÷ $1.50 = 20.</p>' },
      { type: 'mc', lvl: 3, q: 'A company’s receivables turnover fell from 16 to 10 while sales stayed flat. What is the most likely explanation?', choices: ['Customers are paying faster', 'Customers are taking longer to pay, or credit terms have loosened', 'Inventory is selling more slowly', 'The company paid its suppliers faster'], answer: 1, explain: '<p>Lower turnover with flat sales means average receivables grew: collections slowed from about 23 days to about 37 days. That calls for a look at credit policy and collection efforts.</p>' }
    ],
    more: ['financial ratio analysis explained', 'horizontal and vertical analysis financial statements', 'liquidity solvency profitability ratios']
  });
})();
