(function () {
  const { qc, je, jeMany, stmt, table } = Book;

  const EQ1 = [['Common stock, $1 par, 10,000 shares issued', 10000, 'L$'], ['Paid-in capital in excess of par', 140000, 'Lu'], ['Total paid-in capital', 150000, ''], ['Retained earnings', 60000, 'u'], ['Total stockholders’ equity', 210000, 'bd$']];
  const EQ2 = [['Common stock, $1 par, 10,000 shares issued', 10000, 'L$'], ['Paid-in capital in excess of par', 140000, 'Lu'], ['Total paid-in capital', 150000, ''], ['Retained earnings', 60000, 'u'], ['', 210000, ''],
    ['Less: Treasury stock (500 shares at cost)', 10000, 'u'], ['Total stockholders’ equity', 200000, 'bd$']];
  const EQ3 = [['Common stock, $1 par, 10,000 shares issued', 10000, 'L$'], ['Paid-in capital in excess of par', 140000, 'L'], ['Paid-in capital from treasury stock', 1000, 'Lu'], ['Total paid-in capital', 151000, ''],
    ['Retained earnings', 60000, 'u'], ['', 211000, ''], ['Less: Treasury stock (300 shares at cost)', 6000, 'u'], ['Total stockholders’ equity', 205000, 'bd$']];

  Book.chapter({
    id: 'ch11', num: 11, part: 3, short: 'Stockholders’ equity',
    title: 'Stockholders’ Equity',
    blurb: 'How corporations raise money from owners, buy back their own shares, pay dividends, and report earnings per share.',
    minutes: 35,
    objectives: [
      'Describe the main features of the corporate form',
      'Record the issue of common stock at par and above par',
      'Record purchases and reissues of treasury stock',
      'Allocate dividends between preferred and common stock, and record cash dividends',
      'Explain stock dividends and stock splits, and compute earnings per share'
    ],
    lesson: `
<p>Brightside started as a small corporation with one owner. As businesses grow, they sell shares to many owners, buy some back, and pay dividends to some classes of shareholders before others. This chapter covers the equity side of the balance sheet in full.</p>

<h2>The corporate form</h2>
<p>A corporation is a legal entity separate from its owners. That brings advantages:</p>
<ul>
<li><b>Limited liability.</b> Stockholders can lose what they invested, but creditors can’t come after their personal assets.</li>
<li><b>Transferable ownership.</b> Shares can be sold without affecting the company’s operations.</li>
<li><b>Easier to raise capital</b>, because many investors can each buy a small stake.</li>
<li><b>Continuous life.</b> The company carries on when owners change.</li>
</ul>
<p>And some drawbacks: more <b>government regulation</b>, and <b>double taxation</b>, since the corporation pays income tax on its profits and stockholders pay tax again on the dividends they receive.</p>

<h2>Shares and par value</h2>
<p>A corporation’s charter sets the number of <dfn>authorized shares</dfn> it may sell. <dfn>Issued shares</dfn> are those it has sold. <dfn>Outstanding shares</dfn> are issued shares still held by investors, which excludes any the company has bought back.</p>
<p><dfn>Par value</dfn> is a nominal amount per share written in the charter, often $1 or less. It has nothing to do with market value. It’s a legal figure that determines how the proceeds of a stock sale are split between accounts. Some stock is <b>no-par</b>, with all proceeds credited to Common Stock.</p>
<p>Common stockholders typically have the right to vote for the board of directors, to share in dividends the board declares, to keep their percentage of ownership when new shares are issued (the preemptive right, where granted), and to share in any assets left if the company is liquidated.</p>

<h2>Issuing common stock</h2>
<p>When stock sells above par, par value goes to Common Stock and the excess goes to <dfn>Paid-in Capital in Excess of Par</dfn> (also called additional paid-in capital). A company issues 1,000 shares of $1 par stock at $15 a share:</p>
${je([['Cash', 15000, 0], ['Common Stock', 0, 1000], ['Paid-in Capital in Excess of Par—Common', 0, 14000]], { date: 'Mar 1', memo: 'Issued 1,000 shares of $1 par stock at $15' })}
<p>Together, Common Stock and Paid-in Capital in Excess of Par are the company’s <b>paid-in capital</b>: everything owners have invested. Stock issued for land, equipment or services is recorded at the fair value of whatever was received or given, whichever is more clearly determinable.</p>

${qc({ type: 'je', q: 'A company issues 5,000 shares of $2 par common stock for $18 a share. Record the entry.', opts: ['Cash', 'Common Stock', 'Paid-in Capital in Excess of Par—Common', 'Retained Earnings', 'Treasury Stock'], answer: [['Cash', 90000, 0], ['Common Stock', 0, 10000], ['Paid-in Capital in Excess of Par—Common', 0, 80000]], explain: '<p>Cash: 5,000 × $18 = $90,000. Par: 5,000 × $2 = $10,000 to Common Stock. The other $80,000 is paid-in capital in excess of par.</p>' })}

<h2>Preferred stock</h2>
<p><dfn>Preferred stock</dfn> gives its holders priority over common stockholders, usually in exchange for giving up voting rights. Preferred stockholders must receive their stated dividend before common stockholders get anything, and they are paid ahead of common in a liquidation.</p>
<p>The dividend is stated as a percentage of par or a dollar amount: a 6%, $100 par preferred share pays $6 a year. If the preferred stock is <dfn>cumulative</dfn>, any dividends the board skips become <dfn>dividends in arrears</dfn>, which must be paid in full before common stockholders receive a dividend. Dividends in arrears aren’t a liability (no dividend has been declared) but they must be disclosed.</p>
<div class="callout example"><span class="lbl">Example</span>
<p>A company has 2,000 shares of 6%, $100 par cumulative preferred stock, so the annual preferred dividend is $12,000. It paid no dividends last year. This year it declares $30,000 of dividends. Preferred gets $12,000 in arrears plus $12,000 for this year: $24,000. Common gets the remaining $6,000.</p></div>

<h2>Treasury stock</h2>
<p><dfn>Treasury stock</dfn> is a corporation’s own shares that it has issued and then bought back. Companies buy back shares to reissue to employees, to boost earnings per share, or to signal confidence in the stock. Under the common <b>cost method</b>, treasury stock is recorded at what the company paid. It’s a contra-equity account: it reduces total stockholders’ equity, and it isn’t an asset.</p>
${je([['Treasury Stock', 4000, 0], ['Cash', 0, 4000]], { date: 'Jun 1', memo: 'Bought back 200 shares at $20' })}
<p>If 100 of those shares are later reissued at $25, the excess over cost goes to a paid-in capital account, not to revenue or a gain. A company can’t earn income by trading in its own shares.</p>
${je([['Cash', 2500, 0], ['Treasury Stock', 0, 2000], ['Paid-in Capital from Treasury Stock', 0, 500]], { date: 'Sep 1', memo: 'Reissued 100 treasury shares at $25 (cost $20)' })}
<p>Treasury shares have no voting rights and receive no dividends, which is why outstanding shares = issued shares − treasury shares.</p>

<h2>Cash dividends</h2>
<p>A cash dividend involves three dates:</p>
<ol>
<li><b>Declaration date.</b> The board declares the dividend, creating a legal obligation. Record it: debit Dividends (or Retained Earnings), credit Dividends Payable.</li>
<li><b>Record date.</b> Whoever owns shares on this date receives the dividend. No entry.</li>
<li><b>Payment date.</b> Debit Dividends Payable, credit Cash.</li>
</ol>
${jeMany([
  { date: 'Nov 10', lines: [['Dividends', 30000, 0], ['Dividends Payable', 0, 30000]], memo: 'Declared $30,000 cash dividend' },
  { date: 'Dec 15', lines: [['Dividends Payable', 30000, 0], ['Cash', 0, 30000]], memo: 'Paid the dividend' }
])}
<p>To pay a cash dividend, a company needs both retained earnings and actual cash. Profitable companies sometimes skip dividends because the cash is needed to grow.</p>

<h2>Stock dividends and stock splits</h2>
<p>A <dfn>stock dividend</dfn> distributes additional shares instead of cash. A <b>small</b> stock dividend (under about 20–25% of shares) is recorded at the shares’ market value, moving that amount from retained earnings to paid-in capital. A 10% stock dividend on 10,000 shares of $1 par stock with a $15 market price distributes 1,000 shares:</p>
${je([['Stock Dividends', 15000, 0], ['Common Stock Dividends Distributable', 0, 1000], ['Paid-in Capital in Excess of Par—Common', 0, 14000]], { date: 'Oct 1', memo: 'Declared 10% stock dividend' })}
<p>When the shares are issued, Common Stock Dividends Distributable is debited and Common Stock credited for the $1,000 par value. Stock Dividends closes to Retained Earnings at year-end, like Dividends.</p>
<p>A <dfn>stock split</dfn> increases the number of shares and cuts par value in proportion. In a 2-for-1 split, each share becomes two and $1 par becomes $0.50. Splits lower the market price per share so it’s easier to trade. No journal entry is needed, only a memo.</p>
${table(['Effect on…', 'Cash dividend', 'Stock dividend', 'Stock split'], [['Total stockholders’ equity', 'Decreases', 'No change', 'No change'], ['Retained earnings', 'Decreases', 'Decreases', 'No change'], ['Paid-in capital', 'No change', 'Increases', 'No change'], ['Shares outstanding', 'No change', 'Increases', 'Increases'], ['Par value per share', 'No change', 'No change', 'Decreases']], { cls: 'compact' })}

<h2>Reporting equity and earnings per share</h2>
<p>The stockholders’ equity section lists paid-in capital, then retained earnings, then subtracts treasury stock. Public companies also present a <dfn>statement of stockholders’ equity</dfn> showing how each equity account changed during the year.</p>
<p><dfn>Earnings per share</dfn> (EPS) is net income available to common stockholders, divided by the average number of common shares outstanding during the year:</p>
<div class="formula">EPS <span class="op">=</span> (Net income <span class="op">−</span> Preferred dividends) <span class="op">÷</span> Weighted-average common shares<small>($250,000 − $12,000) ÷ 50,000 shares = $4.76</small></div>
<p>EPS is the most widely quoted measure of a company’s profitability, and the only ratio GAAP requires on the face of the income statement.</p>
`,
    terms: [
      ['Authorized shares', 'The maximum number of shares a corporation’s charter allows it to issue.'],
      ['Issued shares', 'Shares a corporation has sold to investors.'],
      ['Outstanding shares', 'Issued shares currently held by investors: issued minus treasury shares.'],
      ['Par value', 'A nominal legal value per share set in the charter, unrelated to market value.'],
      ['Paid-in capital in excess of par', 'The amount received for stock above its par value; also called additional paid-in capital.'],
      ['Paid-in capital', 'Total amount invested by stockholders: common and preferred stock plus additional paid-in capital.'],
      ['Preferred stock', 'Stock with priority over common stock for dividends and in liquidation, usually without voting rights.'],
      ['Cumulative preferred stock', 'Preferred stock whose skipped dividends accumulate and must be paid before common receives any.'],
      ['Dividends in arrears', 'Undeclared dividends owed to cumulative preferred stockholders for past years; disclosed, not recorded.'],
      ['Treasury stock', 'A corporation’s own shares that it has reacquired and holds; a contra-equity account.'],
      ['Declaration date', 'The date the board declares a dividend, creating a liability.'],
      ['Record date', 'The date that determines which stockholders will receive a declared dividend.'],
      ['Payment date', 'The date a declared dividend is paid.'],
      ['Stock dividend', 'A distribution of additional shares of the company’s own stock to stockholders.'],
      ['Stock split', 'Issuing more shares to stockholders while reducing par value proportionally; no change to any account balance.'],
      ['Earnings per share', '(Net income − preferred dividends) ÷ weighted-average common shares outstanding.'],
      ['Statement of stockholders’ equity', 'A statement showing changes in each component of stockholders’ equity during the period.']
    ],
    videos: [
      {
        id: 'v1', title: 'Issuing and buying back stock',
        summary: 'A company sells 10,000 shares, buys 500 back, and reissues 200 at a higher price. Watch the equity section after each step.',
        steps: [
          { say: 'Summit Gear Corporation issues ten thousand shares of one-dollar par common stock at fifteen dollars a share. That brings in a hundred fifty thousand dollars.', f: { k: 'je', h: 'Issuing common stock', entries: [{ d: 'Jan 5', lines: [['Cash', 150000, 0], ['Common Stock', 0, 10000], ['Paid-in Capital in Excess of Par—Common', 0, 140000]], memo: '10,000 shares, $1 par, at $15' }] } },
          { say: 'Par value, one dollar times ten thousand shares, goes to Common Stock. The other fourteen dollars a share, a hundred forty thousand, goes to Paid-in Capital in Excess of Par.', hi: 0 },
          { say: 'Some years later, the company has also built up sixty thousand of retained earnings. Here’s its equity section: two hundred ten thousand dollars.', f: { k: 'stmt', h: 'Stockholders’ equity', sub: 'Before any buyback', rows: EQ1, hi: [0, 1, 2, 3, 4] } },
          { say: 'Now Summit buys back five hundred of its own shares at twenty dollars each. Debit Treasury Stock ten thousand, credit Cash.', f: { k: 'je', h: 'Buying back shares', entries: [{ d: 'Jun 1', lines: [['Treasury Stock', 10000, 0], ['Cash', 0, 10000]], memo: '500 shares at $20' }] } },
          { say: 'Treasury stock isn’t an asset. It’s subtracted at the bottom of equity. Total equity falls to two hundred thousand, because cash left the company and went back to owners.', f: { k: 'stmt', h: 'Stockholders’ equity', sub: 'After the buyback', rows: EQ2, hi: [5, 6] } },
          { say: 'Later, Summit reissues two hundred of those shares at twenty-five dollars. It receives five thousand dollars for shares that cost four thousand.', f: { k: 'je', h: 'Reissuing treasury shares', entries: [{ d: 'Sep 1', lines: [['Cash', 5000, 0], ['Treasury Stock', 0, 4000], ['Paid-in Capital from Treasury Stock', 0, 1000]], memo: '200 shares at $25; cost $20 each' }] } },
          { say: 'The thousand-dollar excess is not a gain. Companies can’t earn income trading their own stock. It goes to paid-in capital.', hi: 0 },
          { say: 'Final equity section: paid-in capital now includes that thousand dollars, and treasury stock is down to three hundred shares at cost. Total equity: two hundred five thousand.', f: { k: 'stmt', h: 'Stockholders’ equity', sub: 'After the reissue', rows: EQ3, hi: [2, 6, 7] } },
          { say: 'And the share count: ten thousand issued, three hundred in the treasury, nine thousand seven hundred outstanding. Only outstanding shares vote and receive dividends.', f: { k: 'table', h: 'Share count', head: ['', 'Shares'], rows: [['Issued', 10000], ['Less: Held in treasury', 300]], foot: ['Outstanding', 9700], hi: 'foot' } }
        ]
      },
      {
        id: 'v2', title: 'Who gets the dividend? Preferred vs. common',
        summary: 'The three dividend dates, the journal entries, and how a skipped year changes the split between cumulative preferred and common stock.',
        steps: [
          { say: 'A cash dividend has three important dates. Only two of them need journal entries.', f: { k: 'tl', h: 'Three dividend dates', pts: [{ at: 'Nov 10', l: '<b>Declaration</b>: board votes; liability created' }, { at: 'Nov 25', l: '<b>Record</b>: who owns shares today gets paid' }, { at: 'Dec 15', l: '<b>Payment</b>: cash goes out' }], hi: 0 } },
          { say: 'On the declaration date, the board makes it official. The company now owes the dividend: debit Dividends, credit Dividends Payable.', f: { k: 'je', entries: [{ d: 'Nov 10', lines: [['Dividends', 30000, 0], ['Dividends Payable', 0, 30000]], memo: 'Declared $30,000 cash dividend' }, { d: 'Dec 15', lines: [['Dividends Payable', 30000, 0], ['Cash', 0, 30000]], memo: 'Paid the dividend' }], show: 1, hi: 0 } },
          { say: 'The record date just identifies who gets paid. No entry. On the payment date, the liability is settled with cash.', n: 2, hi: 1 },
          { say: 'Now, who gets the thirty thousand? This company has two thousand shares of six percent, hundred-dollar par cumulative preferred stock. That’s a twelve-thousand-dollar dividend each year.', f: { k: 'stmt', h: 'Annual preferred dividend', rows: [['Shares of preferred', '2,000', 'L'], ['× Par value', 100, 'L$'], ['× Dividend rate', '6%', 'Lu'], ['Annual preferred dividend', 12000, 'bd$']], hi: 3 } },
          { say: 'Last year, business was tough and the board declared nothing. Because the preferred stock is cumulative, last year’s twelve thousand is now in arrears.', f: { k: 'table', h: 'Dividends declared', head: ['Year', 'Declared', 'To preferred', 'To common'], rows: [['Last year', 0, 0, 0], ['This year', 30000, '?', '?']], hi: 0 } },
          { say: 'This year, preferred must be caught up first: twelve thousand in arrears, plus twelve thousand for the current year.', f: { k: 'stmt', h: 'Splitting this year’s $30,000', rows: [['Total declared', 30000, '$'], ['Preferred: arrears from last year', 12000, 'iL'], ['Preferred: current year', 12000, 'iLu'], ['Total to preferred', 24000, 'u'], ['Remainder to common', 6000, 'bd$']], hi: [1, 2, 3] } },
          { say: 'Common stockholders get only what’s left: six thousand dollars.', hi: 4 },
          { say: 'If the preferred stock had been noncumulative, last year’s dividend would simply be lost. Preferred would get twelve thousand, and common eighteen thousand.', f: { k: 'table', h: 'Same $30,000, two kinds of preferred', head: ['', 'Cumulative', 'Noncumulative'], rows: [['To preferred', 24000, 12000], ['To common', 6000, 18000]], foot: ['Total', 30000, 30000] } }
        ]
      }
    ],
    practice: [
      { type: 'je', lvl: 1, q: 'A company issues 5,000 shares of $2 par common stock at $18 per share. Record the entry.', opts: ['Cash', 'Common Stock', 'Paid-in Capital in Excess of Par—Common', 'Retained Earnings', 'Service Revenue'], answer: [['Cash', 90000, 0], ['Common Stock', 0, 10000], ['Paid-in Capital in Excess of Par—Common', 0, 80000]], explain: '<p>Par value (5,000 × $2) goes to Common Stock; the rest of the $90,000 goes to paid-in capital in excess of par.</p>' },
      { type: 'num', lvl: 1, q: 'A corporation has 200,000 shares authorized, 80,000 issued, and 6,000 held as treasury stock. How many shares are outstanding?', answer: 74000, unit: 'shares', explain: '<p>Outstanding = issued − treasury = 80,000 − 6,000 = 74,000. Authorized shares don’t enter the calculation.</p>' },
      { type: 'fill', lvl: 2, q: 'A company has 5,000 shares of 5%, $100 par cumulative preferred stock. No dividend was declared last year. This year it declares $70,000. How much goes to each class?', blanks: [{ l: 'Preferred stockholders', a: 50000, unit: '$' }, { l: 'Common stockholders', a: 20000, unit: '$' }], hint: 'Annual preferred dividend = shares × par × rate.', explain: '<p>Annual preferred dividend = 5,000 × $100 × 5% = $25,000. Preferred gets one year in arrears plus this year: $50,000. Common gets $70,000 − $50,000 = $20,000.</p>' },
      { type: 'je', lvl: 1, q: 'The board declares a $40,000 cash dividend, payable next month. Record the declaration.', opts: ['Dividends', 'Dividends Payable', 'Cash', 'Common Stock', 'Interest Expense'], answer: [['Dividends', 40000, 0], ['Dividends Payable', 0, 40000]], explain: '<p>Declaration creates a liability. (Some companies debit Retained Earnings directly instead of a Dividends account; the effect is the same.)</p>' },
      { type: 'classify', lvl: 1, q: 'Which events require a journal entry?', cats: ['Journal entry', 'No entry'], items: [['Declaration date of a cash dividend', 0], ['Record date of a cash dividend', 1], ['Payment date of a cash dividend', 0], ['A 2-for-1 stock split', 1], ['Buying back the company’s own shares', 0]], explain: '<p>The record date only identifies who will be paid, and a split changes share count and par value without changing any account balance.</p>' },
      { type: 'je', lvl: 1, q: 'A company buys back 1,000 of its own shares at $30 each. Record the purchase using the cost method.', opts: ['Treasury Stock', 'Cash', 'Common Stock', 'Paid-in Capital from Treasury Stock', 'Investments'], answer: [['Treasury Stock', 30000, 0], ['Cash', 0, 30000]], explain: '<p>Treasury stock is recorded at cost. It is a contra-equity account, not an investment.</p>' },
      { type: 'je', lvl: 2, q: 'The company reissues 400 of those treasury shares (cost $30 each) at $34 per share. Record the reissue.', opts: ['Cash', 'Treasury Stock', 'Paid-in Capital from Treasury Stock', 'Gain on Sale of Stock', 'Common Stock'], answer: [['Cash', 13600, 0], ['Treasury Stock', 0, 12000], ['Paid-in Capital from Treasury Stock', 0, 1600]], explain: '<p>Cash: 400 × $34 = $13,600. Treasury Stock is reduced at cost, 400 × $30 = $12,000. The $1,600 excess is paid-in capital, never a gain.</p>' },
      { type: 'mc', lvl: 1, q: 'What is the effect of a 2-for-1 stock split?', choices: ['Retained earnings decrease', 'Total equity increases', 'Shares outstanding double and par value per share halves; account balances don’t change', 'Cash decreases'], answer: 2, explain: '<p>A split just divides the same ownership into more pieces. No account balance changes.</p>' },
      { type: 'num', lvl: 2, q: 'Net income is $250,000. Preferred dividends are $12,000. The weighted-average number of common shares outstanding is 50,000. What is earnings per share?', answer: 4.76, unit: '$', tol: 0.006, explain: '<p>($250,000 − $12,000) ÷ 50,000 = $4.76.</p>' },
      { type: 'mc', lvl: 2, q: 'What is the effect of buying treasury stock on total stockholders’ equity?', choices: ['Increases it', 'Decreases it', 'No effect', 'Increases paid-in capital'], answer: 1, explain: '<p>Cash goes back to owners and the contra-equity account grows, so total equity falls.</p>' },
      { type: 'num', lvl: 2, q: 'A company with 20,000 shares of $1 par stock outstanding declares a 10% stock dividend when the market price is $12. How much is transferred out of retained earnings?', answer: 24000, unit: '$', explain: '<p>New shares: 20,000 × 10% = 2,000. A small stock dividend is recorded at market value: 2,000 × $12 = $24,000.</p>' },
      { type: 'mc', lvl: 1, q: 'Which is an advantage of the corporate form?', choices: ['Double taxation', 'Limited liability for owners', 'Less government regulation', 'Owners manage the business directly'], answer: 1, explain: '<p>Stockholders can lose only their investment. Double taxation and heavier regulation are disadvantages, and ownership is usually separate from management.</p>' }
    ],
    more: ['issuing common stock journal entry par value', 'treasury stock cost method', 'cumulative preferred stock dividends in arrears']
  });
})();
