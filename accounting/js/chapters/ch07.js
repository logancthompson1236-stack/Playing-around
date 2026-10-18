(function () {
  const { qc, je, stmt, table, widget } = Book;

  const MULTI = [['Sales revenue', 250000, 'L$'], ['Less: Sales returns and allowances', 4000, 'iL'], ['Less: Sales discounts', 1000, 'iLu'], ['Net sales', 245000, '$'],
    ['Cost of goods sold', 147000, 'u'], ['Gross profit', 98000, 'b'], ['Operating expenses', null, 'h'], ['Salaries and wages expense', 40000, 'iL'], ['Rent expense', 18000, 'iL'],
    ['Advertising expense', 5000, 'iL'], ['Utilities expense', 6000, 'iL'], ['Depreciation expense', 4000, 'iLu'], ['Total operating expenses', 73000, 'u'],
    ['Income from operations', 25000, 'b'], ['Other expenses', null, 'h'], ['Interest expense', 2000, 'iu'], ['Net income', 23000, 'bd$']];
  const LAYERS = [['Beginning inventory', 10, 200, 2000], ['Purchase, Mar 10', 20, 220, 4400], ['Purchase, Mar 20', 10, 250, 2500]];
  const lay = (hi) => ({ k: 'table', h: 'Juniper Bikes · goods available in March', head: ['Layer', 'Units', 'Unit cost', 'Total'], rows: LAYERS, foot: ['Available for sale', 40, '', 8900], hi });

  Book.chapter({
    id: 'ch07', num: 7, part: 3, short: 'Inventory',
    title: 'Merchandising & Inventory',
    blurb: 'Companies that buy and resell goods: recording purchases and sales, the multi-step income statement, and FIFO, LIFO and average cost.',
    minutes: 40,
    objectives: [
      'Record purchases, freight, returns and discounts under a perpetual inventory system',
      'Record a sale with both its revenue entry and its cost entry',
      'Prepare a multi-step income statement and compute gross profit',
      'Assign costs to goods sold and ending inventory using FIFO, LIFO and weighted average',
      'Apply the lower-of-cost-or-net-realizable-value rule'
    ],
    lesson: `
<p>Brightside sells a service. Many businesses instead buy finished goods and resell them: bookstores, grocery chains, bike shops, online retailers. These are <dfn>merchandisers</dfn>. They have one big extra question to answer every period: how much did the goods we sold actually cost us?</p>

<h2>Cost of goods sold and gross profit</h2>
<p>A merchandiser’s main expense is <dfn>cost of goods sold</dfn> (COGS): the cost of the inventory that was sold during the period. Subtracting it from net sales gives <dfn>gross profit</dfn>, the amount left to cover all other expenses.</p>
<div class="formula">Net sales <span class="op">−</span> Cost of goods sold <span class="op">=</span> Gross profit<small>Gross profit − Operating expenses = Income from operations</small></div>
<p>Goods that haven’t been sold yet are <dfn>inventory</dfn>, a current asset. When they are sold, their cost moves from the asset to COGS.</p>

<h2>Perpetual and periodic systems</h2>
<p>Under a <dfn>perpetual inventory system</dfn>, the company updates inventory and cost of goods sold with every purchase and every sale. Barcode scanners and point-of-sale software make this routine, so most businesses use it. Under a <dfn>periodic inventory system</dfn>, purchases are recorded in a separate account and cost of goods sold is calculated only at period end, after a physical count:</p>
<div class="formula">Beginning inventory <span class="op">+</span> Purchases <span class="op">−</span> Ending inventory <span class="op">=</span> COGS</div>
<p>This chapter records transactions with the perpetual system, and uses the periodic formula to compare costing methods.</p>

<h2>Recording purchases</h2>
<p>Juniper Bikes buys 20 bikes at $220 each on account. The supplier’s terms are <b>2/10, n/30</b>: a 2% discount if paid within 10 days; otherwise the full amount is due in 30 days.</p>
${je([['Inventory', 4400, 0], ['Accounts Payable', 0, 4400]], { date: 'Mar 10', memo: '20 bikes at $220, terms 2/10, n/30' })}
<p><b>Freight.</b> Shipping terms say who pays for transport, and when ownership passes. <dfn>FOB shipping point</dfn> means the buyer owns the goods once they leave the seller’s dock and pays the freight; that <i>freight-in</i> is part of the cost of inventory. <dfn>FOB destination</dfn> means the seller owns them until they arrive and pays the freight, recording it as Delivery Expense (freight-out).</p>
<p><b>Returns.</b> If Juniper sends back a defective bike, it reduces what it owes and what it holds: debit Accounts Payable, credit Inventory, $220.</p>
<p><b>Discounts.</b> Juniper pays on March 18, within the discount period. The 2% discount, $88, reduces the cost of the bikes:</p>
${je([['Accounts Payable', 4400, 0], ['Inventory', 0, 88], ['Cash', 0, 4312]], { date: 'Mar 18', memo: 'Paid supplier within discount period' })}
<div class="callout"><span class="lbl">Why take the discount?</span>
<p>Paying 20 days early saves 2%. Over a year that’s roughly 365 ÷ 20 × 2% ≈ 36% annual return. It’s almost always worth borrowing to take a purchase discount.</p></div>

<h2>Recording sales</h2>
<p>Under the perpetual system, each sale needs <b>two entries</b>. One records the revenue at selling price. The other moves the cost of the goods out of inventory and into cost of goods sold. Juniper sells a bike that cost $220 to a school club for $400 on account:</p>
${je([['Accounts Receivable', 400, 0], ['Sales Revenue', 0, 400]], { date: 'Mar 22', memo: 'Sold one bike on account' })}
${je([['Cost of Goods Sold', 220, 0], ['Inventory', 0, 220]], { date: 'Mar 22', memo: 'Cost of the bike sold' })}
<p>Gross profit on this sale is $400 − $220 = $180.</p>
<p><b>Sales returns and allowances</b> are recorded in a contra-revenue account so managers can see how much is coming back. If the club returns the bike in sellable condition, Juniper reverses both halves: debit Sales Returns and Allowances and credit Accounts Receivable for $400; debit Inventory and credit Cost of Goods Sold for $220. <b>Sales discounts</b> offered to customers go in another contra-revenue account, Sales Discounts.</p>

${qc({ type: 'je', q: 'Juniper sells a helmet that cost $30 for $55 cash. Record the cost side of the sale.', opts: ['Cost of Goods Sold', 'Inventory', 'Sales Revenue', 'Cash', 'Accounts Payable'], answer: [['Cost of Goods Sold', 30, 0], ['Inventory', 0, 30]], explain: '<p>The revenue entry (Cash $55 / Sales Revenue $55) records the selling price. The cost entry moves the helmet’s $30 cost from Inventory to Cost of Goods Sold.</p>' })}

<h2>The multi-step income statement</h2>
<p>Merchandisers usually present a <dfn>multi-step income statement</dfn>, which reports useful subtotals along the way: net sales, gross profit, income from operations, and finally net income. Items outside the main business, such as interest, are kept separate as <i>other</i> revenues and expenses.</p>
${stmt('Juniper Bikes, Inc.', 'Income Statement · For the Year Ended December 31', MULTI)}
<p>The <dfn>gross profit rate</dfn> is gross profit ÷ net sales: $98,000 ÷ $245,000 = 40%. Each dollar of sales leaves 40 cents to pay for everything else.</p>

<h2>Which cost goes to cost of goods sold?</h2>
<p>When identical items are bought at different prices, which cost goes with the units sold? The physical flow of goods doesn’t have to match; GAAP lets companies choose a <dfn>cost flow assumption</dfn>.</p>
<p>In March, Juniper had 10 bikes from February at $200, bought 20 more at $220 and later 10 more at $250. That’s 40 bikes costing $8,900 in total. It sold 25 at $400 each.</p>
${table(['Layer', 'Units', 'Unit cost', 'Total cost'], LAYERS, { foot: ['Goods available for sale', 40, '', 8900], cls: 'compact' })}
<ul>
<li><dfn>FIFO</dfn> (first-in, first-out): the oldest costs go to COGS first. COGS = 10 × $200 + 15 × $220 = <b>$5,300</b>. Ending inventory = 5 × $220 + 10 × $250 = $3,600.</li>
<li><dfn>LIFO</dfn> (last-in, first-out): the newest costs go to COGS first. COGS = 10 × $250 + 15 × $220 = <b>$5,800</b>. Ending inventory = 5 × $220 + 10 × $200 = $3,100.</li>
<li><dfn>Weighted average</dfn>: every unit carries the average cost, $8,900 ÷ 40 = $222.50. COGS = 25 × $222.50 = <b>$5,562.50</b>. Ending inventory = 15 × $222.50 = $3,337.50.</li>
<li><b>Specific identification</b> tracks the actual cost of each item. It’s used for unique, high-value goods such as cars, jewelry and houses.</li>
</ul>
<p>In every case COGS + ending inventory = $8,900. The method only decides how that fixed total is split. Try different numbers in the calculator:</p>
${widget('inventory')}

<h3>Choosing a method</h3>
<p>When prices are rising, as in Juniper’s March:</p>
<ul>
<li><b>FIFO</b> reports lower COGS, higher net income and an ending inventory close to current prices.</li>
<li><b>LIFO</b> matches the most recent costs against revenue, reports lower net income and so lowers income taxes. U.S. tax law has a <i>LIFO conformity rule</i>: a company that uses LIFO for taxes must also use it in its financial statements. <b>IFRS does not allow LIFO.</b></li>
<li><b>Weighted average</b> falls in between.</li>
</ul>
<p>When prices fall, the effects reverse. Whatever a company chooses, it must apply it consistently and disclose it.</p>

<h2>Lower of cost or net realizable value</h2>
<p>If inventory loses value (it goes out of style, gets damaged, or replacement prices drop), it is written down. Under the <dfn>lower-of-cost-or-net-realizable-value</dfn> rule (LCNRV), inventory is reported at the lower of its cost and its net realizable value: the expected selling price minus the costs to complete and sell it. Last year’s bike models that cost $8,000 but can now be sold for only $7,400 net are reported at $7,400, and the $600 loss is usually added to cost of goods sold.</p>

<div class="callout warn"><span class="lbl">Inventory errors ripple</span>
<p>If ending inventory is overstated, COGS is understated and net income is overstated. Because this year’s ending inventory is next year’s beginning inventory, next year’s COGS is then overstated and its income understated by the same amount. Over two years the error cancels out, but both years’ statements are wrong.</p></div>
`,
    terms: [
      ['Merchandiser', 'A company that buys finished goods and resells them to customers.'],
      ['Cost of goods sold', 'The cost of inventory sold during the period; the main expense of a merchandiser.'],
      ['Gross profit', 'Net sales minus cost of goods sold.'],
      ['Gross profit rate', 'Gross profit divided by net sales.'],
      ['Inventory', 'Goods held for sale to customers; a current asset.'],
      ['Perpetual inventory system', 'Inventory and cost of goods sold are updated with every purchase and sale.'],
      ['Periodic inventory system', 'Cost of goods sold is calculated at period end: beginning inventory + purchases − ending inventory.'],
      ['FOB shipping point', 'The buyer owns goods once they ship and pays the freight, which becomes part of inventory cost.'],
      ['FOB destination', 'The seller owns goods until they arrive and pays the freight as a delivery expense.'],
      ['Purchase discount', 'A reduction in price for paying within a set period, such as 2/10, n/30.'],
      ['Sales returns and allowances', 'A contra-revenue account for goods returned by customers or price reductions granted.'],
      ['Sales discounts', 'A contra-revenue account for discounts customers take for paying early.'],
      ['Net sales', 'Sales revenue minus sales returns and allowances and sales discounts.'],
      ['Multi-step income statement', 'An income statement showing subtotals for gross profit and income from operations before net income.'],
      ['Cost flow assumption', 'The method used to assign costs to goods sold and ending inventory: FIFO, LIFO, weighted average or specific identification.'],
      ['FIFO', 'First-in, first-out: the oldest costs are assigned to goods sold first.'],
      ['LIFO', 'Last-in, first-out: the most recent costs are assigned to goods sold first. Not permitted under IFRS.'],
      ['Weighted-average method', 'Assigns every unit the average cost of goods available for sale.'],
      ['Specific identification', 'Tracks the actual cost of each individual item sold.'],
      ['Net realizable value', 'Expected selling price minus the costs to complete and sell an item.'],
      ['Lower of cost or net realizable value', 'Inventory is reported at whichever is lower: its cost or its net realizable value.']
    ],
    videos: [
      {
        id: 'v1', title: 'Buying and selling bikes, perpetual style',
        summary: 'Juniper Bikes buys on credit, takes a purchase discount, then makes a sale with both its revenue and cost entries.',
        steps: [
          { say: 'Juniper Bikes starts March with ten bikes in inventory, at two hundred dollars each. Let’s follow a purchase and a sale through the books.', f: { k: 't', accts: [{ n: 'Inventory', dr: [['Bal', 2000]] }, { n: 'Accounts Payable' }, { n: 'Cash', dr: [['Bal', 9000]] }, { n: 'Accounts Receivable' }, { n: 'Sales Revenue' }, { n: 'Cost of Goods Sold' }], hi: 'Inventory' } },
          { say: 'March tenth: Juniper buys twenty bikes at two hundred twenty dollars each, on account, terms two ten, net thirty. Inventory goes up. Accounts payable goes up.', f: { k: 'je', entries: [{ d: 'Mar 10', lines: [['Inventory', 4400, 0], ['Accounts Payable', 0, 4400]], memo: '20 bikes at $220, terms 2/10, n/30' }] } },
          { say: 'Posted.', f: { k: 't', accts: [{ n: 'Inventory', dr: [['Bal', 2000], ['3/10', 4400]] }, { n: 'Accounts Payable', cr: [['3/10', 4400]] }, { n: 'Cash', dr: [['Bal', 9000]] }, { n: 'Accounts Receivable' }, { n: 'Sales Revenue' }, { n: 'Cost of Goods Sold' }], hi: ['Inventory', 'Accounts Payable'] } },
          { say: 'March eighteenth: Juniper pays within ten days, so it takes the two percent discount, eighty-eight dollars. It clears the full forty-four hundred owed but pays only forty-three twelve. The discount lowers the cost of the inventory.', f: { k: 'je', entries: [{ d: 'Mar 18', lines: [['Accounts Payable', 4400, 0], ['Inventory', 0, 88], ['Cash', 0, 4312]], memo: 'Paid within discount period' }] } },
          { say: 'Posted. Accounts payable is cleared, and inventory now carries the bikes at their discounted cost.', f: { k: 't', accts: [{ n: 'Inventory', dr: [['Bal', 2000], ['3/10', 4400]], cr: [['3/18', 88]] }, { n: 'Accounts Payable', dr: [['3/18', 4400]], cr: [['3/10', 4400]] }, { n: 'Cash', dr: [['Bal', 9000]], cr: [['3/18', 4312]] }, { n: 'Accounts Receivable' }, { n: 'Sales Revenue' }, { n: 'Cost of Goods Sold' }], hi: ['Inventory', 'Accounts Payable', 'Cash'] } },
          { say: 'March twenty-second: a school club buys two of the older bikes for four hundred dollars each, on account. A sale needs two entries. The first records revenue at selling price, eight hundred dollars.', f: { k: 'je', entries: [{ d: 'Mar 22', lines: [['Accounts Receivable', 800, 0], ['Sales Revenue', 0, 800]], memo: 'Sold 2 bikes on account' }, { d: 'Mar 22', lines: [['Cost of Goods Sold', 400, 0], ['Inventory', 0, 400]], memo: 'Cost of the 2 bikes sold' }], show: 1, hi: 0 } },
          { say: 'The second moves the bikes’ cost, two hundred each, out of inventory and into cost of goods sold.', n: 2, hi: 1 },
          { say: 'Posted. Sales revenue of eight hundred, cost of goods sold of four hundred.', f: { k: 't', accts: [{ n: 'Inventory', dr: [['Bal', 2000], ['3/10', 4400]], cr: [['3/18', 88], ['3/22', 400]] }, { n: 'Accounts Payable', dr: [['3/18', 4400]], cr: [['3/10', 4400]] }, { n: 'Cash', dr: [['Bal', 9000]], cr: [['3/18', 4312]] }, { n: 'Accounts Receivable', dr: [['3/22', 800]] }, { n: 'Sales Revenue', cr: [['3/22', 800]] }, { n: 'Cost of Goods Sold', dr: [['3/22', 400]] }], hi: ['Accounts Receivable', 'Sales Revenue', 'Cost of Goods Sold', 'Inventory'] } },
          { say: 'So the gross profit on this sale is four hundred dollars, a fifty percent gross profit rate. Every sale under a perpetual system works the same way.', f: { k: 'stmt', h: 'Gross profit on the March 22 sale', rows: [['Sales revenue', 800, '$'], ['Cost of goods sold', 400, 'u'], ['Gross profit', 400, 'bd$']], hi: 2 } }
        ]
      },
      {
        id: 'v2', title: 'FIFO vs. LIFO vs. average, side by side',
        summary: 'The same 40 bikes and the same 25 sales, costed three ways, and why the choice changes reported profit.',
        steps: [
          { say: 'In March, Juniper had forty bikes available at three different costs: eighty-nine hundred dollars in total. It sold twenty-five. Which costs go with the bikes sold?', f: lay([]) },
          { say: 'First-in, first-out says the oldest bikes are sold first. Take all ten at two hundred...', f: lay(0) },
          { say: '...then fifteen of the twenty at two hundred twenty. FIFO cost of goods sold: fifty-three hundred dollars.', f: { k: 'stmt', h: 'FIFO', sub: '25 units sold, oldest costs first', rows: [['10 units × $200', 2000, 'L$'], ['15 units × $220', 3300, 'Lu'], ['Cost of goods sold', 5300, 'bd$'], ['Ending inventory (5 × $220 + 10 × $250)', 3600, '$']], hi: 2 } },
          { say: 'Last-in, first-out takes the newest costs first: all ten at two fifty...', f: lay(2) },
          { say: '...then fifteen at two twenty. LIFO cost of goods sold: fifty-eight hundred dollars.', f: { k: 'stmt', h: 'LIFO', sub: '25 units sold, newest costs first', rows: [['10 units × $250', 2500, 'L$'], ['15 units × $220', 3300, 'Lu'], ['Cost of goods sold', 5800, 'bd$'], ['Ending inventory (5 × $220 + 10 × $200)', 3100, '$']], hi: 2 } },
          { say: 'Weighted average divides total cost by total units: eighty-nine hundred over forty, two hundred twenty-two fifty a bike. Twenty-five bikes: fifty-five sixty-two fifty.', f: { k: 'stmt', h: 'Weighted average', sub: '$8,900 ÷ 40 units = $222.50 per unit', rows: [['25 units × $222.50', 5562.5, 'bd$'], ['Ending inventory (15 × $222.50)', 3337.5, '$']], hi: 0 } },
          { say: 'Side by side. Sales are ten thousand dollars no matter what. But cost of goods sold ranges from fifty-three hundred to fifty-eight hundred.', f: { k: 'table', h: 'Same bikes, three answers', head: ['Method', 'COGS', 'Ending inventory', 'Gross profit'], rows: [['FIFO', 5300, 3600, 4700], ['Weighted average', 5562.5, 3337.5, 4437.5], ['LIFO', 5800, 3100, 4200]], hc: 1 } },
          { say: 'Ending inventory moves the opposite way. COGS plus ending inventory always equals the same eighty-nine hundred.', hc: 2 },
          { say: 'Prices were rising, so FIFO shows the most profit and LIFO the least. That lower LIFO profit means lower taxes, which is why many U.S. companies chose it. IFRS doesn’t allow LIFO at all.', hc: 3, hi: [0, 2] }
        ]
      }
    ],
    practice: [
      { type: 'je', lvl: 1, q: 'Using a perpetual system, a store buys $4,400 of merchandise on account. Record the purchase.', opts: ['Inventory', 'Accounts Payable', 'Cost of Goods Sold', 'Purchases', 'Cash'], answer: [['Inventory', 4400, 0], ['Accounts Payable', 0, 4400]], explain: '<p>Under a perpetual system, purchases go straight into Inventory. (A periodic system would use a Purchases account instead.)</p>' },
      { type: 'je', lvl: 2, q: 'The store pays the $4,400 invoice within the discount period. Terms were 2/10, n/30. Record the payment.', opts: ['Accounts Payable', 'Inventory', 'Cash', 'Sales Discounts', 'Cost of Goods Sold'], answer: [['Accounts Payable', 4400, 0], ['Inventory', 0, 88], ['Cash', 0, 4312]], hint: '2% of $4,400.', explain: '<p>The full payable is cleared. The $88 discount reduces the cost of the inventory, and cash paid is $4,312.</p>' },
      { type: 'je', lvl: 1, q: 'The store sells merchandise for $1,200 on account. Record the revenue side of the sale.', opts: ['Accounts Receivable', 'Sales Revenue', 'Inventory', 'Cost of Goods Sold', 'Cash'], answer: [['Accounts Receivable', 1200, 0], ['Sales Revenue', 0, 1200]], explain: '<p>Revenue is recorded at the selling price.</p>' },
      { type: 'je', lvl: 1, q: 'The merchandise sold for $1,200 had cost the store $660. Record the cost side of the sale.', opts: ['Cost of Goods Sold', 'Inventory', 'Sales Revenue', 'Accounts Receivable', 'Accounts Payable'], answer: [['Cost of Goods Sold', 660, 0], ['Inventory', 0, 660]], explain: '<p>The goods leave inventory at cost and become an expense.</p>' },
      { type: 'num', lvl: 1, q: 'A company has sales revenue of $180,000, sales returns of $3,000, sales discounts of $2,000 and cost of goods sold of $105,000. What is gross profit?', answer: 70000, unit: '$', explain: '<p>Net sales = $180,000 − $3,000 − $2,000 = $175,000. Gross profit = $175,000 − $105,000 = $70,000.</p>' },
      { type: 'num', lvl: 2, q: 'Periodic system: beginning inventory $12,000; purchases $64,000; freight-in $1,500; purchase returns $2,500; ending inventory $15,000. What is cost of goods sold?', answer: 60000, unit: '$', explain: '<p>Cost of goods available = $12,000 + $64,000 + $1,500 − $2,500 = $75,000. COGS = $75,000 − $15,000 = $60,000.</p>' },
      { type: 'fill', lvl: 2, q: 'A store had 100 units at $10, then bought 200 units at $12 and later 100 units at $15. It sold 250 units. Using a periodic system, find cost of goods sold under each method.', blanks: [{ l: 'FIFO', a: 2800, unit: '$' }, { l: 'LIFO', a: 3300, unit: '$' }, { l: 'Weighted average', a: 3062.5, unit: '$' }], hint: 'Goods available: 400 units costing $4,900.', explain: '<p><b>FIFO:</b> 100 × $10 + 150 × $12 = $2,800.<br><b>LIFO:</b> 100 × $15 + 150 × $12 = $3,300.<br><b>Average:</b> $4,900 ÷ 400 = $12.25; 250 × $12.25 = $3,062.50.</p>' },
      { type: 'num', lvl: 2, q: 'In the previous problem, what is ending inventory under FIFO?', answer: 2100, unit: '$', explain: '<p>Goods available $4,900 − FIFO COGS $2,800 = $2,100. Check: the 150 units left are 50 at $12 and 100 at $15 = $600 + $1,500.</p>' },
      { type: 'mc', lvl: 2, q: 'Prices have been rising all year. Which method reports the highest net income?', choices: ['LIFO', 'FIFO', 'Weighted average', 'All three report the same income'], answer: 1, explain: '<p>FIFO sends the oldest, cheapest costs to cost of goods sold, so COGS is lowest and income highest.</p>' },
      { type: 'mc', lvl: 1, q: 'Goods are shipped FOB shipping point and are still on the truck at year-end. Who includes them in inventory?', choices: ['The seller', 'The buyer', 'The trucking company', 'Neither, until they arrive'], answer: 1, explain: '<p>Under FOB shipping point, ownership passes to the buyer when goods leave the seller’s dock.</p>' },
      { type: 'num', lvl: 2, q: 'A line of jackets cost $8,000. They can now be sold for $8,300, but selling them will cost $900 in alterations and commissions. At what amount should the inventory be reported?', answer: 7400, unit: '$', explain: '<p>Net realizable value = $8,300 − $900 = $7,400, which is lower than the $8,000 cost. Report $7,400 and recognize a $600 loss.</p>' },
      { type: 'mc', lvl: 3, q: 'A company overstated its year-end inventory by $5,000. What is the effect on this year’s statements?', choices: ['COGS overstated, net income understated', 'COGS understated, net income overstated', 'COGS and net income both overstated', 'No effect until next year'], answer: 1, explain: '<p>COGS = goods available − ending inventory. A too-high ending inventory makes COGS too low and net income too high. Next year the error reverses.</p>' }
    ],
    more: ['merchandising journal entries perpetual inventory', 'FIFO LIFO weighted average explained', 'multi step income statement']
  });
})();
