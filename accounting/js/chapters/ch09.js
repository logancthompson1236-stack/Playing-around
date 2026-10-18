(function () {
  const { qc, je, stmt, table, widget } = Book;

  const SL = [[1, 40000, 7200, 7200, 32800], [2, 32800, 7200, 14400, 25600], [3, 25600, 7200, 21600, 18400], [4, 18400, 7200, 28800, 11200], [5, 11200, 7200, 36000, 4000]];
  const UA = [[1, '24,000', 8640, 8640, 31360], [2, '30,000', 10800, 19440, 20560], [3, '20,000', 7200, 26640, 13360], [4, '16,000', 5760, 32400, 7600], [5, '10,000', 3600, 36000, 4000]];
  const DDB = [[1, 40000, 16000, 16000, 24000], [2, 24000, 9600, 25600, 14400], [3, 14400, 5760, 31360, 8640], [4, 8640, 3456, 34816, 5184], [5, 5184, 1184, 36000, 4000]];
  const sched = (h, rows, hi, n, note) => ({ k: 'table', h, head: ['Year', 'Beginning book value', 'Depreciation', 'Accumulated', 'Ending book value'], rows: rows.map((r) => ['Year ' + r[0]].concat(r.slice(1))), hi, n, note, hc: 2 });

  Book.chapter({
    id: 'ch09', num: 9, part: 3, short: 'Long-term assets',
    title: 'Long-Term Assets & Depreciation',
    blurb: 'What goes into the cost of a building or machine, three ways to depreciate it, what happens when you sell it, and intangible assets.',
    minutes: 35,
    objectives: [
      'Determine the cost of property, plant and equipment',
      'Tell capital expenditures from ordinary repairs',
      'Compute depreciation by the straight-line, units-of-activity and double-declining-balance methods',
      'Record the sale of a plant asset and any gain or loss',
      'Account for intangible assets and amortization'
    ],
    lesson: `
<p>A delivery van, a pizza oven, an office building: these assets will serve the business for years. Accounting for them raises three questions. What did the asset cost? How should that cost be spread over the years it’s used? And what happens when the business gets rid of it?</p>

<h2>What goes into cost</h2>
<p><dfn>Property, plant and equipment</dfn> (PP&amp;E, or plant assets) are tangible, long-lived resources used in operations rather than held for sale. Under the historical cost principle, a plant asset’s cost includes <b>every expenditure necessary to acquire it and get it ready for use</b>.</p>
<ul>
<li><b>Equipment</b>: purchase price, sales tax, freight to get it there, insurance while in transit, installation and testing.</li>
<li><b>Land</b>: purchase price, closing costs, title fees, real estate commissions, and costs to prepare it, such as demolishing an old building. Land is <i>not</i> depreciated; it doesn’t wear out.</li>
<li><b>Land improvements</b>: parking lots, fences, lighting. They wear out, so they are depreciated.</li>
<li><b>Buildings</b>: purchase price and closing costs, or construction costs including architect fees and building permits.</li>
</ul>
<div class="callout example"><span class="lbl">Example</span>
<p>A bakery buys an oven for $30,000. It pays $1,800 sales tax, $500 freight and $700 for installation. After installation it buys a one-year insurance policy for $1,200. The oven’s cost is $30,000 + $1,800 + $500 + $700 = <b>$33,000</b>. The insurance is a cost of <i>operating</i> the oven, not acquiring it, so it is recorded as prepaid insurance and expensed over the year.</p></div>

<h3>Repairs or improvements?</h3>
<p>After purchase, spending on an asset falls into two groups. <b>Ordinary repairs</b> keep the asset running as expected (an oil change, new tires, fixing a broken door) and are expensed immediately. <b>Capital expenditures</b> make the asset better: they extend its life, increase its capacity or improve its efficiency (a new engine, an addition to a building). These are added to the asset’s cost and depreciated.</p>

<h2>Depreciation methods</h2>
<p>As Chapter 5 explained, <dfn>depreciation</dfn> allocates an asset’s cost to expense over its useful life. It is not an attempt to track market value. Three inputs drive it:</p>
<ul>
<li><b>Cost</b>: everything capitalized above.</li>
<li><dfn>Salvage value</dfn> (residual value): what the company expects to get for the asset at the end of its useful life.</li>
<li><dfn>Useful life</dfn>: expected service, in years or in units of activity (miles, hours, units produced).</li>
</ul>
<p>Cost minus salvage value is the <dfn>depreciable cost</dfn>, the total that will be expensed over the asset’s life. Our running example: a delivery van that cost $40,000, with a $4,000 salvage value, expected to last 5 years or 100,000 miles. Depreciable cost is $36,000.</p>

<h3>Straight-line</h3>
<p><dfn>Straight-line depreciation</dfn> expenses the same amount every year. It’s the most widely used method.</p>
<div class="formula">(Cost <span class="op">−</span> Salvage value) <span class="op">÷</span> Useful life<small>($40,000 − $4,000) ÷ 5 = $7,200 per year</small></div>

<h3>Units of activity</h3>
<p><dfn>Units-of-activity depreciation</dfn> ties expense to use. It suits assets that wear out from use rather than time, such as vehicles and machinery.</p>
<div class="formula">(Cost <span class="op">−</span> Salvage value) <span class="op">÷</span> Total units <span class="op">×</span> Units this year<small>$36,000 ÷ 100,000 miles = $0.36 per mile</small></div>
<p>If the van is driven 24,000 miles in year 1, depreciation is 24,000 × $0.36 = $8,640.</p>

<h3>Double-declining-balance</h3>
<p><dfn>Double-declining-balance</dfn> (DDB) is an <i>accelerated</i> method: more depreciation early, less later, which suits assets that are most productive when new. The rate is twice the straight-line rate, applied to each year’s <b>beginning book value</b>. Salvage value is ignored in the calculation, except that the asset may not be depreciated below it.</p>
<div class="formula">Beginning book value <span class="op">×</span> (2 <span class="op">÷</span> Useful life)<small>Year 1: $40,000 × 40% = $16,000 · Year 2: $24,000 × 40% = $9,600</small></div>
${table(['Year', 'Straight-line', 'Units of activity', 'Double-declining'], [['1', 7200, 8640, 16000], ['2', 7200, 10800, 9600], ['3', 7200, 7200, 5760], ['4', 7200, 5760, 3456], ['5', 7200, 3600, 1184]], { foot: ['<b>Total</b>', 36000, 36000, 36000], cls: 'compact' })}
<p>In DDB’s final year, depreciation is whatever brings book value down to exactly the $4,000 salvage value: $5,184 − $4,000 = $1,184. Every method expenses the same $36,000 in total; they differ only in timing.</p>
${widget('depreciation')}

<h3>Partial years and changed estimates</h3>
<p>Assets are rarely bought on January 1. If the van is bought on April 1, year-1 straight-line depreciation covers nine months: $7,200 × 9/12 = $5,400.</p>
<p>Estimates of life and salvage value are just that, estimates. When they change, the company doesn’t go back and fix prior years. It spreads the <b>remaining</b> book value, less the new salvage value, over the <b>remaining</b> life. After two years of straight-line depreciation the van’s book value is $25,600. If the company now expects four more years of use and a $2,000 salvage value, new annual depreciation is ($25,600 − $2,000) ÷ 4 = $5,900.</p>

${qc({ type: 'num', q: 'Equipment costs $52,000, has a salvage value of $4,000 and a useful life of 8 years. What is annual straight-line depreciation?', answer: 6000, unit: '$', explain: '<p>($52,000 − $4,000) ÷ 8 = $6,000.</p>' })}

<h2>Disposing of plant assets</h2>
<p>When a plant asset is sold, retired or scrapped, the steps are always the same:</p>
<ol>
<li>Record depreciation up to the date of disposal.</li>
<li>Remove the asset’s cost (credit the asset) and its accumulated depreciation (debit Accumulated Depreciation).</li>
<li>Record any cash received.</li>
<li>Record the difference as a <b>gain</b> (cash received exceeds book value) or a <b>loss</b> (book value exceeds cash received).</li>
</ol>
<p>Our van is sold for $20,000 at the end of year 3. Under straight-line, accumulated depreciation is 3 × $7,200 = $21,600, so book value is $40,000 − $21,600 = $18,400. The company got $1,600 more than book value:</p>
${je([['Cash', 20000, 0], ['Accumulated Depreciation', 21600, 0], ['Equipment', 0, 40000], ['Gain on Disposal of Equipment', 0, 1600]], { date: 'Dec 31', memo: 'Sold delivery van' })}
<p>If it had sold for $15,000 instead, there would be a $3,400 <b>loss</b>, recorded as a debit. Gains and losses on disposal appear in the “other” section of a multi-step income statement because selling vans isn’t the company’s main business.</p>

<h2>Natural resources and intangible assets</h2>
<p><b>Natural resources</b> such as timber, oil reserves and mineral deposits are used up physically. Their cost is allocated through <b>depletion</b>, usually on a units-of-activity basis (cost per ton or per barrel extracted).</p>
<p><dfn>Intangible assets</dfn> provide rights or advantages but have no physical form:</p>
<ul>
<li><b>Patents</b> give the exclusive right to an invention for 20 years.</li>
<li><b>Copyrights</b> protect creative works for the author’s life plus 70 years.</li>
<li><b>Trademarks</b> protect names and symbols and can be renewed indefinitely.</li>
<li><b>Franchises and licenses</b> grant the right to sell a product or use a brand in a territory.</li>
<li><dfn>Goodwill</dfn> is the excess of the price paid for an entire business over the fair value of its identifiable net assets: customer loyalty, reputation, a great location. It is recorded <i>only</i> when one company buys another.</li>
</ul>
<p>Intangibles with a limited life are <dfn>amortized</dfn>, usually straight-line over the shorter of their legal and useful lives. A patent bought for $60,000 with a 10-year useful life is amortized $6,000 a year. The credit usually goes straight to the asset account:</p>
${je([['Amortization Expense', 6000, 0], ['Patents', 0, 6000]], { date: 'Dec 31', memo: 'Annual patent amortization' })}
<p>Goodwill and indefinite-life trademarks aren’t amortized. Instead they are tested at least annually for <b>impairment</b>, a permanent drop in value, and written down if needed. Research and development costs are generally expensed as incurred, because their future benefit is too uncertain to record as an asset.</p>
`,
    terms: [
      ['Property, plant and equipment', 'Tangible long-lived assets used in operations, such as land, buildings and equipment.'],
      ['Capital expenditure', 'A cost that improves an asset or extends its life; added to the asset’s cost.'],
      ['Ordinary repair', 'A cost that maintains an asset in normal working order; expensed immediately.'],
      ['Salvage value', 'The estimated amount an asset will be worth at the end of its useful life; also called residual value.'],
      ['Useful life', 'The expected period of service of an asset, in years or units of activity.'],
      ['Depreciable cost', 'Cost minus salvage value: the total depreciation over an asset’s life.'],
      ['Straight-line depreciation', '(Cost − salvage) ÷ useful life: equal expense each year.'],
      ['Units-of-activity depreciation', 'Depreciation per unit of use times the units used in the period.'],
      ['Double-declining-balance', 'Accelerated depreciation: beginning book value × twice the straight-line rate, never below salvage.'],
      ['Gain or loss on disposal', 'The difference between cash received for an asset and its book value.'],
      ['Depletion', 'Allocation of the cost of a natural resource as it is extracted.'],
      ['Intangible asset', 'A long-lived asset without physical substance, such as a patent or trademark.'],
      ['Amortization', 'Allocation of the cost of a limited-life intangible asset over its useful life.'],
      ['Goodwill', 'The excess of the price paid for a business over the fair value of its identifiable net assets.'],
      ['Impairment', 'A permanent decline in an asset’s value below its carrying amount, requiring a write-down.']
    ],
    videos: [
      {
        id: 'v1', title: 'Three ways to depreciate the same van',
        summary: 'A $40,000 van, three depreciation schedules side by side, and why they all add up to the same $36,000.',
        steps: [
          { say: 'Our van cost forty thousand dollars. We expect to sell it for four thousand after five years, or a hundred thousand miles. So there are thirty-six thousand dollars to depreciate.', f: { k: 'points', h: 'The delivery van', items: ['Cost: <b>$40,000</b>', 'Salvage value: <b>$4,000</b>', 'Useful life: <b>5 years</b> or <b>100,000 miles</b>', 'Depreciable cost: $40,000 − $4,000 = <b>$36,000</b>'] } },
          { say: 'Straight-line divides thirty-six thousand evenly over five years: seventy-two hundred a year.', f: sched('Straight-line: $36,000 ÷ 5 years', SL, 0, 1) },
          { say: 'Every year is the same, and book value drops by the same amount each time until it reaches the four thousand dollar salvage value.', n: 5, hi: [0, 1, 2, 3, 4] },
          { say: 'Units of activity: thirty-six thousand over a hundred thousand miles is thirty-six cents a mile. Year one, twenty-four thousand miles, is eighty-six forty.', f: { k: 'table', h: 'Units of activity: $0.36 per mile', head: ['Year', 'Miles', 'Depreciation', 'Accumulated', 'Ending book value'], rows: UA.map((r) => ['Year ' + r[0]].concat(r.slice(1))), hi: 0, n: 1, hc: 2 } },
          { say: 'Each year’s depreciation follows how hard the van worked. A busy year two means more expense.', n: 5, hi: 1 },
          { say: 'Double-declining-balance: twice the straight-line rate. Straight-line is twenty percent a year, so DDB uses forty percent of the beginning book value. Year one: forty percent of forty thousand, sixteen thousand.', f: sched('Double-declining-balance: 40% of beginning book value', DDB, 0, 1) },
          { say: 'Year two: forty percent of twenty-four thousand, ninety-six hundred. The expense shrinks every year.', n: 2, hi: 1 },
          { say: 'Years three and four continue the pattern...', n: 4, hi: [2, 3] },
          { say: '...but year five can’t take forty percent, or the van would drop below salvage value. It takes just enough to land on four thousand: eleven eighty-four.', n: 5, hi: 4 },
          { say: 'Side by side, the patterns are very different. But every column totals thirty-six thousand. The methods change when the expense hits the income statement, not how much.', f: { k: 'table', h: 'Annual depreciation compared', head: ['Year', 'Straight-line', 'Units', 'DDB'], rows: [['1', 7200, 8640, 16000], ['2', 7200, 10800, 9600], ['3', 7200, 7200, 5760], ['4', 7200, 5760, 3456], ['5', 7200, 3600, 1184]], foot: ['Total', 36000, 36000, 36000], hi: 'foot' } }
        ]
      },
      {
        id: 'v2', title: 'Selling an asset: gain or loss?',
        summary: 'The van is sold after three years. Compare the price to book value, then write the entry that removes the asset from the books.',
        steps: [
          { say: 'At the end of year three, the company sells the van. Under straight-line depreciation, what’s it worth on the books?', f: { k: 'stmt', h: 'Book value at end of year 3', rows: [['Cost', 40000, 'L$'], ['Less: Accumulated depreciation (3 × $7,200)', 21600, 'Lu'], ['Book value', 18400, 'b$']], hi: [0, 1] } },
          { say: 'Cost forty thousand, less twenty-one six of accumulated depreciation: a book value of eighteen thousand four hundred.', hi: 2 },
          { say: 'A buyer pays twenty thousand. That’s sixteen hundred more than book value: a gain.', f: { k: 'stmt', h: 'Sold for $20,000', rows: [['Cash received', 20000, '$'], ['Book value', 18400, 'u'], ['Gain on disposal', 1600, 'bd$']], hi: 2 } },
          { say: 'The entry does four things. Record the cash received.', f: { k: 'je', h: 'Sale of the van', entries: [{ d: 'Dec 31', lines: [['Cash', 20000, 0], ['Accumulated Depreciation', 21600, 0], ['Equipment', 0, 40000], ['Gain on Disposal of Equipment', 0, 1600]], memo: 'Sold van for $20,000' }], hi: 0 } },
          { say: 'Wipe out the accumulated depreciation with a debit. Remove the van’s cost with a credit to Equipment. And credit the sixteen hundred dollar gain to balance it.', hi: [] },
          { say: 'Suppose instead the buyer paid only fifteen thousand. Now the company received thirty-four hundred less than book value: a loss.', f: { k: 'stmt', h: 'Sold for $15,000 instead', rows: [['Book value', 18400, '$'], ['Cash received', 15000, 'u'], ['Loss on disposal', 3400, 'bd$']], hi: 2 } },
          { say: 'Same entry shape, except the balancing figure is a debit to Loss on Disposal.', f: { k: 'je', h: 'Sale at a loss', entries: [{ d: 'Dec 31', lines: [['Cash', 15000, 0], ['Accumulated Depreciation', 21600, 0], ['Loss on Disposal of Equipment', 3400, 0], ['Equipment', 0, 40000]], memo: 'Sold van for $15,000' }] } },
          { say: 'The pattern never changes: update depreciation, remove cost and accumulated depreciation, record the cash, and let the gain or loss balance the entry.', f: { k: 'points', h: 'Disposal checklist', items: ['Update depreciation to the date of sale', 'Debit <b>Accumulated Depreciation</b>; credit the <b>asset</b> at cost', 'Debit <b>Cash</b> for whatever was received', 'Plug the difference: credit a <b>gain</b> or debit a <b>loss</b>'] } }
        ]
      }
    ],
    practice: [
      { type: 'num', lvl: 1, q: 'A company buys a machine for $30,000. It also pays $1,800 sales tax, $500 shipping, $700 installation, and $1,200 for the first year of insurance after installation. What is the machine’s cost?', answer: 33000, unit: '$', explain: '<p>Price, tax, shipping and installation are needed to get the machine ready: $33,000. Insurance after installation is an operating cost, recorded as prepaid insurance.</p>' },
      { type: 'mc', lvl: 1, q: 'Which cost should be capitalized (added to the asset account)?', choices: ['A routine oil change on a delivery truck', 'New tires to replace worn ones', 'A new engine that extends the truck’s life by three years', 'Washing the truck'], answer: 2, explain: '<p>The new engine extends the asset’s useful life, so it’s a capital expenditure. The others are ordinary maintenance and are expensed.</p>' },
      { type: 'num', lvl: 1, q: 'Equipment cost $52,000, has a $4,000 salvage value and an 8-year life. What is the book value after 3 years of straight-line depreciation?', answer: 34000, unit: '$', explain: '<p>Annual depreciation = $48,000 ÷ 8 = $6,000. After 3 years, accumulated depreciation is $18,000. Book value = $52,000 − $18,000 = $34,000.</p>' },
      { type: 'num', lvl: 2, q: 'A machine cost $50,000, with a $5,000 salvage value and a 5-year life. Using double-declining-balance, what is depreciation in year 2?', answer: 12000, unit: '$', hint: 'The rate is 2 ÷ 5 = 40%, applied to beginning book value.', explain: '<p>Year 1: $50,000 × 40% = $20,000, leaving $30,000. Year 2: $30,000 × 40% = $12,000. Salvage value isn’t subtracted first under DDB.</p>' },
      { type: 'num', lvl: 2, q: 'A press cost $90,000, has a $10,000 salvage value and is expected to produce 400,000 units. It produced 60,000 units this year. What is units-of-activity depreciation?', answer: 12000, unit: '$', explain: '<p>Rate = ($90,000 − $10,000) ÷ 400,000 = $0.20 per unit. 60,000 × $0.20 = $12,000.</p>' },
      { type: 'num', lvl: 2, q: 'Equipment costing $36,000 with no salvage value and a 6-year life is bought on October 1. Using straight-line, what is depreciation for the year ending December 31?', answer: 1500, unit: '$', explain: '<p>Annual depreciation = $6,000. October through December is 3 months: $6,000 × 3/12 = $1,500.</p>' },
      { type: 'je', lvl: 2, q: 'Equipment that cost $40,000, with accumulated depreciation of $21,600, is sold for $20,000 cash. Record the sale.', opts: ['Cash', 'Accumulated Depreciation', 'Equipment', 'Gain on Disposal of Equipment', 'Loss on Disposal of Equipment', 'Depreciation Expense'], answer: [['Cash', 20000, 0], ['Accumulated Depreciation', 21600, 0], ['Equipment', 0, 40000], ['Gain on Disposal of Equipment', 0, 1600]], explain: '<p>Book value is $18,400; cash of $20,000 exceeds it by $1,600, a gain. Remove the cost and accumulated depreciation, record the cash, and credit the gain.</p>' },
      { type: 'num', lvl: 2, q: 'A computer system cost $25,000 and has accumulated depreciation of $17,000. It’s sold for $6,500. What is the loss on disposal? (Enter the amount of the loss.)', answer: 1500, unit: '$', explain: '<p>Book value = $25,000 − $17,000 = $8,000. Cash received is $1,500 less, so there’s a $1,500 loss.</p>' },
      { type: 'je', lvl: 1, q: 'A company bought a patent for $60,000 and expects it to be useful for 10 years. Record one year’s amortization.', opts: ['Amortization Expense', 'Patents', 'Accumulated Depreciation', 'Depreciation Expense', 'Cash'], answer: [['Amortization Expense', 6000, 0], ['Patents', 0, 6000]], explain: '<p>$60,000 ÷ 10 = $6,000. Intangibles are usually amortized with a credit directly to the asset.</p>' },
      { type: 'num', lvl: 3, q: 'A van cost $40,000, with a $4,000 salvage value and a 5-year life, and has been depreciated straight-line for 2 years. The company now expects to use it 4 more years and sell it for $2,000. What is the new annual depreciation?', answer: 5900, unit: '$', hint: 'Start from current book value, not original cost.', explain: '<p>Accumulated depreciation after 2 years = $14,400, so book value = $25,600. New depreciation = ($25,600 − $2,000) ÷ 4 = $5,900. Past years aren’t restated.</p>' },
      { type: 'mc', lvl: 2, q: 'Which statement about goodwill is correct?', choices: ['A company records goodwill when its reputation improves', 'Goodwill is amortized over 40 years', 'Goodwill is recorded only when a company buys another business, and it is tested for impairment rather than amortized', 'Goodwill is a current asset'], answer: 2, explain: '<p>Internally created goodwill is never recorded. Purchased goodwill sits on the balance sheet indefinitely, subject to impairment testing.</p>' }
    ],
    more: ['depreciation methods straight line double declining units of production', 'disposal of fixed assets gain or loss', 'intangible assets amortization goodwill']
  });
})();
