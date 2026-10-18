(function () {
  const { qc, stmt, table, widget } = Book;

  const CMIS = [['Sales (2,600 × $25)', 65000, '$'], ['Variable costs (2,600 × $10)', 26000, 'u'], ['Contribution margin', 39000, 'b'], ['Fixed costs', 30000, 'u'], ['Operating income', 9000, 'bd$']];
  const BEROWS = [['1,000', 25000, 40000, -15000], ['2,000', 50000, 50000, 0], ['2,600', 65000, 56000, 9000], ['3,000', 75000, 60000, 15000]];
  const SPECIAL = [['Incremental revenue (500 × $16)', 8000, '$'], ['Incremental costs:', null, 'h'], ['Variable costs (500 × $10)', 5000, 'iL'], ['Custom labels', 300, 'iLu'],
    ['Total incremental costs', 5300, 'u'], ['Increase in operating income', 2700, 'bd$']];

  Book.chapter({
    id: 'ch14', num: 14, part: 4, short: 'Costs & decisions',
    title: 'Costs & Decisions',
    blurb: 'A first step into managerial accounting: how costs behave, contribution margin, break-even analysis, and choosing between alternatives.',
    minutes: 30,
    objectives: [
      'Contrast managerial accounting with financial accounting',
      'Classify costs as variable, fixed or mixed, and split a mixed cost with the high-low method',
      'Prepare a contribution margin income statement',
      'Compute break-even point, target-profit volume and margin of safety',
      'Identify relevant costs for a decision such as a special order'
    ],
    lesson: `
<p>Everything so far has been financial accounting: reports for outsiders, following GAAP. <dfn>Managerial accounting</dfn> turns the same data inward to help managers plan, control and decide. There are no required formats. The only test is whether a report helps someone make a better decision.</p>
${table(['', 'Financial accounting', 'Managerial accounting'], [
  ['Users', 'Investors, lenders, regulators', 'Managers and employees'],
  ['Rules', 'GAAP or IFRS', 'Whatever is useful'],
  ['Focus', 'The whole company, past results', 'Products, departments, decisions; often the future'],
  ['Timing', 'Monthly, quarterly, annually', 'Whenever needed, even daily']
], { cls: 'compact' })}

<h2>How costs behave</h2>
<p>The single most useful idea in managerial accounting is <dfn>cost behavior</dfn>: how a cost changes when activity (units made, hours worked, customers served) changes.</p>
<ul>
<li>A <dfn>variable cost</dfn> changes in total in direct proportion to activity: wax and wicks for each candle, sales commissions per unit. Per unit, it stays the same.</li>
<li>A <dfn>fixed cost</dfn> stays the same in total regardless of activity: rent, insurance, a manager’s salary. Per unit, it <i>falls</i> as volume rises, because the same total is spread over more units.</li>
<li>A <dfn>mixed cost</dfn> has both parts: a phone plan with a monthly fee plus per-minute charges, or utilities with a base charge plus usage.</li>
</ul>
<p>These patterns hold only within the <dfn>relevant range</dfn>, the band of activity a company normally operates in. Double production and you may need a second factory, so “fixed” costs jump.</p>
<p>Manufacturers also sort costs by role. <b>Product costs</b> (direct materials, direct labor and manufacturing overhead) attach to inventory and become cost of goods sold when units are sold. <b>Period costs</b>, such as selling and administrative expenses, are expensed when incurred.</p>

<h3>Splitting a mixed cost: the high-low method</h3>
<p>Ridgeline Candle Co.’s utility bill was $7,800 in its busiest month (5,000 machine hours) and $4,200 in its slowest (2,000 hours). The change in cost divided by the change in activity gives the variable rate:</p>
<div class="formula">($7,800 <span class="op">−</span> $4,200) <span class="op">÷</span> (5,000 <span class="op">−</span> 2,000) <span class="op">=</span> $1.20 per hour</div>
<p>Then the fixed part is what’s left at either point: $7,800 − 5,000 × $1.20 = $1,800 a month. So utilities ≈ $1,800 + $1.20 per machine hour. The method is quick but uses only two data points; regression analysis uses them all.</p>

${qc({ type: 'mc', q: 'Ridgeline’s factory rent is $6,000 a month. If production rises from 2,000 to 3,000 candles, what happens to rent per candle?', choices: ['It rises from $3.00 to $4.50', 'It stays at $3.00', 'It falls from $3.00 to $2.00', 'It falls to zero'], answer: 2, explain: '<p>Total rent is fixed at $6,000. Spread over 2,000 candles that’s $3.00 each; over 3,000 it’s $2.00 each.</p>' })}

<h2>Contribution margin</h2>
<p>Ridgeline sells candles for $25. Each one costs $10 in variable costs (wax, wicks, jars, packaging, commission). Fixed costs are $30,000 a month.</p>
<p>The <dfn>contribution margin</dfn> is sales minus variable costs: what each sale contributes toward covering fixed costs and then producing profit. Per candle, it’s $25 − $10 = <b>$15</b>. As a percentage of price, the <dfn>contribution margin ratio</dfn> is $15 ÷ $25 = <b>60%</b>.</p>
<p>A <b>contribution margin income statement</b> organizes costs by behavior rather than by function, which makes “what if” questions easy. At 2,600 candles a month:</p>
${stmt('Ridgeline Candle Co.', 'Contribution Margin Income Statement · One Month', CMIS)}

<h2>Cost-volume-profit analysis</h2>
<p><dfn>Cost-volume-profit analysis</dfn> (CVP) asks how profit responds to changes in volume, prices and costs. Its most famous question: how many units must we sell to break even?</p>
<p>The <dfn>break-even point</dfn> is where total contribution margin exactly covers fixed costs, so operating income is zero.</p>
<div class="formula">Break-even units <span class="op">=</span> Fixed costs <span class="op">÷</span> Contribution margin per unit<small>$30,000 ÷ $15 = 2,000 candles · in sales dollars: $30,000 ÷ 60% = $50,000</small></div>
<p>To earn a <b>target profit</b>, add it to fixed costs: to make $15,000 a month, Ridgeline needs ($30,000 + $15,000) ÷ $15 = <b>3,000 candles</b>.</p>
<p>The <dfn>margin of safety</dfn> is how far sales can fall before the company starts losing money. Expecting 2,600 candles, Ridgeline’s margin of safety is 600 candles, or $15,000 of sales, about 23% of expected sales.</p>
${widget('breakeven')}
<p>Try raising fixed costs (say, a bigger shop) and watch the break-even point move right. Raise the price and it moves left, because each sale contributes more.</p>

${qc({ type: 'num', q: 'A product sells for $40 and has variable costs of $28 per unit. Fixed costs are $54,000. How many units must be sold to break even?', answer: 4500, unit: 'units', explain: '<p>Contribution margin per unit = $12. Break-even = $54,000 ÷ $12 = 4,500 units.</p>' })}

<h2>Relevant costs and decisions</h2>
<p>Many decisions compare alternatives: accept or reject an order, make a part or buy it, keep a product line or drop it. Only <dfn>relevant costs</dfn> matter: future costs and revenues that <i>differ</i> between the alternatives.</p>
<ul>
<li>A <dfn>sunk cost</dfn> has already been spent and can’t be recovered. It’s never relevant. The $20,000 Ridgeline paid for its candle molds last year is the same whatever it decides today.</li>
<li>An <dfn>opportunity cost</dfn> is the benefit given up by choosing one option over another. It’s relevant even though it never appears in the ledger.</li>
<li>Fixed costs that won’t change as a result of the decision aren’t relevant either.</li>
</ul>
<div class="callout example"><span class="lbl">Special order</span>
<p>A hotel chain offers to buy 500 candles at $16, well below the $25 price. Ridgeline has spare capacity, and the order wouldn’t affect regular sales. Full cost per candle at 2,600 units is $10 + $30,000 ÷ 2,600 ≈ $21.54, so the offer looks like a loss. But fixed costs won’t change. The relevant figures are the $16 price, the $10 variable cost, and $300 for custom labels:</p>
${stmt('', 'Incremental analysis: hotel order', SPECIAL)}
<p>Accept: operating income rises by $2,700. The trap would have been counting fixed costs that are spent either way.</p></div>
<div class="callout warn"><span class="lbl">But check the qualitative side</span>
<p>Will regular customers hear about the $16 price and ask for it too? Is the capacity really idle, or would this order crowd out full-price sales (an opportunity cost)? Numbers frame the decision; they don’t make it alone.</p></div>
<p>That’s the end of the book. You can now follow a transaction from the moment it happens to the financial statements, read those statements critically, and use cost information to make decisions. The Mixed Review is a good place to test it all together.</p>
`,
    terms: [
      ['Managerial accounting', 'Accounting information prepared for internal decision-making, without required formats.'],
      ['Cost behavior', 'How a cost changes in response to changes in activity level.'],
      ['Variable cost', 'A cost that changes in total in proportion to activity; constant per unit.'],
      ['Fixed cost', 'A cost that stays the same in total within the relevant range; falls per unit as activity rises.'],
      ['Mixed cost', 'A cost with both fixed and variable components.'],
      ['Relevant range', 'The range of activity over which cost behavior assumptions hold.'],
      ['High-low method', 'Estimates the variable and fixed parts of a mixed cost from the highest and lowest activity levels.'],
      ['Product costs', 'Direct materials, direct labor and manufacturing overhead; attached to inventory until sold.'],
      ['Period costs', 'Selling and administrative costs expensed in the period incurred.'],
      ['Contribution margin', 'Sales minus variable costs, in total or per unit.'],
      ['Contribution margin ratio', 'Contribution margin ÷ sales.'],
      ['Cost-volume-profit analysis', 'The study of how changes in costs, volume and price affect profit.'],
      ['Break-even point', 'The sales level at which total revenue equals total costs and operating income is zero.'],
      ['Margin of safety', 'The amount by which expected sales exceed break-even sales.'],
      ['Relevant cost', 'A future cost that differs between the alternatives being considered.'],
      ['Sunk cost', 'A cost already incurred that cannot be changed by any decision; never relevant.'],
      ['Opportunity cost', 'The benefit given up by choosing one alternative over another.']
    ],
    videos: [
      {
        id: 'v1', title: 'Finding the break-even point',
        summary: 'Ridgeline Candle Co.’s contribution margin, break-even point, target profit and margin of safety, worked out step by step.',
        steps: [
          { say: 'Ridgeline Candle sells candles for twenty-five dollars. Each one costs ten dollars in materials and commissions. And the shop costs thirty thousand a month no matter what.', f: { k: 'points', h: 'Ridgeline Candle Co.', items: ['Price: <b>$25</b> per candle', 'Variable cost: <b>$10</b> per candle', 'Fixed costs: <b>$30,000</b> per month', 'Expected sales: <b>2,600</b> candles a month'] } },
          { say: 'Each candle sold contributes twenty-five minus ten, fifteen dollars, toward covering the fixed costs. That’s the contribution margin. As a ratio, sixty percent of every sales dollar.', f: { k: 'stmt', h: 'Contribution margin per candle', rows: [['Price', 25, '$'], ['Variable cost', 10, 'u'], ['Contribution margin', 15, 'bd$'], ['Contribution margin ratio ($15 ÷ $25)', '60%', '']], hi: [2, 3] } },
          { say: 'How many candles to cover thirty thousand dollars of fixed costs, at fifteen dollars each? Two thousand. That’s the break-even point.', f: { k: 'stmt', h: 'Break-even point', rows: [['Fixed costs', 30000, 'L$'], ['÷ Contribution margin per unit', 15, 'Lu'], ['Break-even units', '2,000', 'b'], ['Break-even sales (2,000 × $25)', 50000, 'bd$']], hi: [2, 3] } },
          { say: 'Check it at different volumes. At a thousand candles, Ridgeline loses fifteen thousand. At two thousand, exactly zero.', f: { k: 'table', h: 'Profit at different volumes', head: ['Candles', 'Revenue', 'Total cost', 'Operating income'], rows: BEROWS, hi: [0, 1] } },
          { say: 'At the expected twenty-six hundred, it earns nine thousand. Every candle past break-even adds fifteen dollars of profit.', hi: 2 },
          { say: 'Want fifteen thousand of profit? Add it to the fixed costs and divide by fifteen: three thousand candles.', f: { k: 'stmt', h: 'Target profit of $15,000', rows: [['Fixed costs', 30000, 'L$'], ['+ Target profit', 15000, 'Lu'], ['Contribution margin needed', 45000, 'L'], ['÷ Contribution margin per unit', 15, 'Lu'], ['Candles needed', '3,000', 'b']], hi: 4 } },
          { say: 'And the margin of safety: expected sales of twenty-six hundred, minus break-even of two thousand. Sales could drop six hundred candles, about twenty-three percent, before Ridgeline loses money.', f: { k: 'stmt', h: 'Margin of safety', rows: [['Expected sales (units)', '2,600', ''], ['Break-even sales (units)', '2,000', 'u'], ['Margin of safety (units)', '600', 'b'], ['As a % of expected sales', '23.1%', '']], hi: [2, 3] } }
        ]
      },
      {
        id: 'v2', title: 'Should we take the special order?',
        summary: 'A hotel wants 500 candles at $16. Full cost says no; incremental analysis says yes. Here’s why.',
        steps: [
          { say: 'A hotel chain wants five hundred candles at sixteen dollars each, nine dollars below the normal price. Ridgeline has spare capacity. Should it say yes?', f: { k: 'title', eyebrow: 'Example 14.B', h: '500 candles at $16?', sub: 'Normal price $25 · spare capacity available' } },
          { say: 'A quick look at full cost says no. Ten dollars of variable cost plus fixed costs spread over twenty-six hundred candles: about twenty-one fifty-four each. Sixteen dollars wouldn’t cover it.', f: { k: 'stmt', h: 'The misleading view: full cost per candle', rows: [['Variable cost', 10, 'L$'], ['Fixed cost ($30,000 ÷ 2,600)', 11.54, 'Lu'], ['Full cost per candle', 21.54, 'b$'], ['Hotel’s offer', 16, '$']], hi: [2, 3] } },
          { say: 'But ask which costs actually change if Ridgeline accepts. Rent, insurance and the molds bought last year stay exactly the same. They’re not relevant.', f: { k: 'table', h: 'What changes if we say yes?', head: ['Item', 'Changes?'], rows: [['Revenue from the hotel', 'Yes: +$8,000'], ['Wax, wicks, jars, packaging', 'Yes: $10 per candle'], ['Custom hotel labels', 'Yes: $300'], ['Factory rent and insurance', 'No'], ['Molds bought last year (sunk)', 'No']], hi: [0, 1, 2] } },
          { say: 'Only the rows that change belong in the analysis.', hi: [3, 4] },
          { say: 'Incremental revenue: eight thousand dollars. Incremental costs: five thousand of variable cost plus three hundred for labels.', f: { k: 'stmt', h: 'Incremental analysis', rows: SPECIAL, hi: [0, 2, 3, 4] } },
          { say: 'Operating income goes up by twenty-seven hundred dollars. On the numbers, accept the order.', hi: 5 },
          { say: 'Then check what the numbers can’t see. Will regular customers want the same price? Is the capacity truly idle? If this order would bump full-price sales, the lost profit is an opportunity cost, and it’s relevant.', f: { k: 'points', h: 'Before saying yes', items: ['Is there really <b>spare capacity</b>?', 'Could it <b>undercut regular prices</b>?', 'Any <b>opportunity cost</b>: sales we’d give up?', 'Ignore <b>sunk costs</b> and fixed costs that don’t change'] } }
        ]
      }
    ],
    practice: [
      { type: 'classify', lvl: 1, q: 'Classify each cost for a candle maker by its behavior.', cats: ['Variable', 'Fixed', 'Mixed'], items: [['Factory rent', 1], ['Wax used in each candle', 0], ['Sales commission per candle sold', 0], ['Electricity: base fee plus usage charges', 2], ['Annual insurance premium', 1], ['Packaging for each candle', 0]], explain: '<p>Costs tied to each unit are variable; costs that don’t change with volume are fixed; costs with a base amount plus a usage charge are mixed.</p>' },
      { type: 'num', lvl: 1, q: 'A product sells for $40 and has variable costs of $28 per unit. What is the contribution margin ratio?', answer: 30, unit: '%', explain: '<p>Contribution margin = $12. Ratio = $12 ÷ $40 = 30%.</p>' },
      { type: 'num', lvl: 1, q: 'Fixed costs are $54,000, price is $40 and variable cost is $28 per unit. What is the break-even point in units?', answer: 4500, unit: 'units', explain: '<p>$54,000 ÷ $12 = 4,500 units.</p>' },
      { type: 'num', lvl: 2, q: 'Using the same figures, what is the break-even point in sales dollars?', answer: 180000, unit: '$', explain: '<p>$54,000 ÷ 30% = $180,000. (Check: 4,500 × $40 = $180,000.)</p>' },
      { type: 'num', lvl: 2, q: 'How many units must be sold to earn a target operating income of $18,000?', answer: 6000, unit: 'units', explain: '<p>($54,000 + $18,000) ÷ $12 = 6,000 units.</p>' },
      { type: 'num', lvl: 2, q: 'Expected sales are 5,200 units and break-even is 4,500 units. What is the margin of safety in units?', answer: 700, unit: 'units', explain: '<p>5,200 − 4,500 = 700 units. Sales could fall by 700 units before the company starts losing money.</p>' },
      { type: 'fill', lvl: 2, q: 'Utility costs were $7,800 at 5,000 machine hours (the highest month) and $4,200 at 2,000 hours (the lowest). Use the high-low method.', blanks: [{ l: 'Variable cost per machine hour', a: 1.2, unit: '$' }, { l: 'Fixed cost per month', a: 1800, unit: '$' }], explain: '<p>Variable rate = ($7,800 − $4,200) ÷ (5,000 − 2,000) = $1.20 per hour. Fixed = $7,800 − 5,000 × $1.20 = $1,800.</p>' },
      { type: 'mc', lvl: 1, q: 'A company paid $20,000 for equipment last year. It is now deciding whether to replace it. How should the $20,000 be treated in the decision?', choices: ['Add it to the cost of keeping the old equipment', 'Subtract it from the cost of the new equipment', 'Ignore it: it is a sunk cost', 'Spread it over the new equipment’s life'], answer: 2, explain: '<p>The money is already spent and won’t change whatever the company decides, so it’s irrelevant. (The old equipment’s resale value today, however, would be relevant.)</p>' },
      { type: 'num', lvl: 3, q: 'A customer offers to buy 1,000 units at $15. Variable cost is $11 per unit, the company has spare capacity, and the order requires a one-time $1,500 setup. Fixed costs won’t otherwise change. By how much would operating income change if the company accepts?', answer: 2500, unit: '$', explain: '<p>Incremental revenue $15,000 − variable costs $11,000 − setup $1,500 = $2,500 increase.</p>' },
      { type: 'mc', lvl: 1, q: 'Within the relevant range, as production volume increases, fixed cost per unit:', choices: ['Increases', 'Decreases', 'Stays the same', 'Becomes variable'], answer: 1, explain: '<p>The same total fixed cost is spread over more units.</p>' },
      { type: 'num', lvl: 2, q: 'Ridgeline sells 2,600 candles at $25 each with variable costs of $10 each and fixed costs of $30,000. What is operating income?', answer: 9000, unit: '$', explain: '<p>Contribution margin = 2,600 × $15 = $39,000. Operating income = $39,000 − $30,000 = $9,000.</p>' }
    ],
    more: ['cost volume profit analysis break even', 'fixed vs variable costs explained', 'relevant costs special order decision']
  });
})();
