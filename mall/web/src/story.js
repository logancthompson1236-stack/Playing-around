// Words: the intro, Gus's Day 1 walkthrough, his memories, and the notebook tips.

export const INTRO = [
  { scene: 'office', text: 'The city. Another gray Tuesday, another stack of paperwork. Then your phone buzzes.' },
  { scene: 'letter', text: '' },
  { scene: 'bus', text: 'One long bus ride later, you are back in the little town where you spent your summers as a kid.' },
  { scene: 'mall', text: 'Grandma’s mall. Dark, dusty, half the sign burned out. And someone inside has a flashlight.' },
];
export const LETTER = [
  'Sweet pea,',
  'The mall is yours now. She’s tired, and so was I at the end. But she has good bones.',
  'Give her a little love and she’ll love you back.',
  'P.S. If you run into Gus, tell him I said hi.',
  '— Grandma Rose',
];
export const MEET_GUS = [
  'Easy, I’m not a burglar. Name’s Gus.',
  'Swept these floors for your grandma for twenty-seven years. Still come by to walk my laps.',
  'She’d be glad it’s you. Come back in the morning and I’ll show you the ropes.',
];

export const DAY1 = {
  open: ['Morning, boss. Doors are open, and folks’ll start trickling in.', 'Most days you’ll be running around like I used to. Here comes somebody now.'],
  serve: 'They want a pretzel. Tap them, and you’ll go ring ’em up.',
  served: 'There you go. Cha-ching.',
  trash: 'Somebody dropped a wrapper. Tap it to sweep it up.',
  done: ['That’s the whole job: keep folks served and keep the floors clean.', 'I’ll get out of your hair. See you around. Don’t let the pigeons win.'],
};

// Gus's memories, told after closing on days he visits. `when` is checked by the game.
export const MEMORIES = {
  night1: {
    title: 'Why Gus still comes by',
    lines: [
      'You did all right today. Rose would’ve been tickled.',
      'You’re probably wondering why an old man walks laps in a closed mall.',
      'Habit, mostly. Twenty-seven years, my day started right here. Marlene and I ate lunch on that fountain every single day.',
      'When the last big store left in 2016, your grandma had to let us all go. I was the last one. She told me to keep my keys.',
      'Anyway. Here. My old notebook. Every trick I learned keeping this place running is in there.',
    ],
    reward: 'Gus gave you his notebook. Tips will show up in it as you need them.',
  },
  dee: {
    title: 'A good word',
    lines: [
      'Evening! Saw the lights on, figured I’d stop in.',
      'Place is getting busy. You need a real janitor, and my knees aren’t what they were.',
      'There’s a gal named Dee. I trained her back in ’04. Best mop hand I ever saw.',
      'Let me show you where to find her.',
    ],
    reward: '',
  },
  fountain: {
    title: 'One more good day',
    lines: [
      'Would you look at that. Water in the old girl again.',
      'Rose tossed a penny in every morning. Said it bought her one more good day.',
      'Marlene and I would sit right on the edge with our pretzels. Twenty years.',
      'You should keep that up. The penny, I mean.',
    ],
    reward: 'Each morning, tap the coin over the fountain to make a wish for the day.',
  },
  arcade: {
    title: 'High score',
    lines: [
      'An arcade! I held the high score on Galaxy Pals from 1994 until the day they hauled it out.',
      'G-U-S. Three letters of pure glory.',
      'Don’t tell the teenagers. They’ll want to beat it.',
    ],
    reward: '',
  },
};

// Gus stops by the first night you can afford each expansion.
export const EXPAND_SCENES = {
  east: [
    'Evening, boss. Had to come see it for myself. Full stores, music playing, kids running around.',
    'You know there’s a whole second floor up there? Busiest part of the mall when I started. Rose shut the escalator off in ’09 to save on the heating bill.',
    'With the kind of money you’re pulling in, you could open her back up. Twenty grand, give or take. Get that old escalator running and there’s room for big shops up top.',
    'Take a look under Build, then Fix up. Rose would’ve cried happy tears.',
  ],
  garden: [
    'That second floor’s humming. Better than I ever saw it.',
    'Rose had one dream she never got to. A garden up there, under a glass roof. Real trees, sunlight, somewhere to sit that doesn’t smell like pretzels.',
    'The far end of the second floor is still boarded up. Forty-five grand and it’s yours. Just saying.',
  ],
  // The first night you could afford the casino: Gus takes stock of how far it's all come.
  casino: [
    'Evening, boss. I took the long way in tonight. Every floor, every store. Had to sit down by the fountain for a minute.',
    'When Rose and I locked those doors, I figured that was it. Pigeons and dust, forever. Now look. Two floors, every storefront lit, a line at the door every morning.',
    'She’d be proud of you. I mean that.',
    'Now, here’s a wild one. There’s a third floor up top. Used to be the Starlight Ballroom: big band on Fridays, the whole town in their good shoes.',
    'Some folks I know want to bring it back as a casino. Bright lights, card tables, slot machines going ding-ding-ding. Fifty grand, and you’ve got it sitting right there.',
    'You’d need dealers to run the tables. Real pros, vests and bow ties. Look under Build, then Fix up. Rose always did love a little razzle-dazzle.',
  ],
  vip: [
    'Boss, that casino of yours is the talk of the town. I saw a fellow in a gold tie tip a dealer fifty bucks.',
    'Folks with that kind of money want somewhere quieter to play. A high roller suite at the end of the casino floor: gold carpet, golden slots, champagne.',
    'A hundred and twenty grand. Big number. Bigger crowd. Your call.',
  ],
};

// Night 1: Gus helps you hire your first two clerks.
export const CLERK_SCENE = {
  lines: [
    'One more thing before I head out.',
    'You can’t be at every register at once. Back in the day there was a clerk behind every counter.',
    'I asked around, and a couple of folks would be glad of the work. Let me show you where to hire them.',
  ],
  staff: 'Tap Staff, down in the corner. That’s where you hire help.',
  hire: 'Hire two clerks. Each one takes a register for you.',
  hired: ['There you go. They’ll be behind the registers when you open tomorrow.', 'That frees you up to keep the floors clean and plan what’s next. Wages come out each night.'],
  skipped: ['Suit yourself. Clerks are under Staff whenever you want them.'],
};
// Night 2: with help at the registers, Gus nudges you to open another store.
export const STORE_SCENE = [
  'Evening! Registers ran smooth today, didn’t they?',
  'Now that you’ve got help, let’s get another shop open. Those boarded-up storefronts won’t fix themselves.',
  'Tap Build and pick a store. I’d start with something small and sweet.',
];
// Level 10: the first troublemakers, and a security guard to deal with them.
export const TROUBLE_SCENE = [
  'Evening, boss. You see those kids today? Blasting music, kicking over trash cans, scaring off customers.',
  'Busy malls draw a rowdy crowd. Always have. Back in ’98 we had a whole gang that lived in the arcade.',
  'You can tap one to shoo them out yourself. But a place this size needs real security.',
  'Hire a security guard under Staff. They’ll walk the halls and show troublemakers the door.',
];

// Notebook tips: shown once, when the situation first comes up.
export const DEE_SCENE = {
  staff: 'Tap Staff, down in the corner. That’s where you hire help.',
  hire: 'There’s Dee, right at the top. Tap Hire.',
  hired: ['That’s her. She’ll be here when you open tomorrow.', 'Wages come out each night. When things get busier, come back here and hire more help.'],
  skipped: ['No rush. Dee’s name will be on that list whenever you’re ready.'],
};

export const TIPS = {
  night: { title: 'Nights are for building', text: 'Nothing’s on the clock till you hit Open Doors. Tap things in the mall to see what you can do.' },
  open: { title: 'Opening a store', text: 'Those boarded-up storefronts can be shops again. Tap Build, pick a store, then tap a glowing storefront to open it.' },
  newshell: { title: 'Out of storefronts', text: 'Every storefront’s taken. Pick a store under Build and tap Build new to put one up. Old storage gets cleared out as part of the job.' },
  walkout: { title: 'Folks don’t wait forever', text: 'If customers wait in line too long they get frustrated and leave (that’s the little storm cloud). Watch the ring around their bubble: tap it to rush to that register before it runs out, or hire clerks to keep the lines moving.' },
  wish: { title: 'Grey bubbles', text: 'Grey means we don’t have what they want. The report card keeps a list of what folks wished for.' },
  style: { title: 'A fresh look', text: 'The old lilac walls have had a good run. Under Build, then Style, you can pick new wallpaper and flooring for the whole mall. A fresh look brightens the ambience, too.' },
  litter: { title: 'Trash cans', text: 'Put a trash can out and most folks nearby will toss their trash in it instead of on the floor. Build, then Decor.' },
  staff: { title: 'Hiring help', text: 'You can hire staff now. Open Staff at night. Janitors sweep, clerks run a register for you.' },
  clerks: { title: 'Clerks', text: 'Clerks can run a register for you now. Hire one under Staff and pick their store. Put them in their dream job (♥) and folks spend more.' },
  speed: { title: 'Speed things up', text: 'Got help now? Tap the fast-forward button to speed up the day.' },
  fountain: { title: 'The old fountain', text: 'That fountain was the heart of this place. Fix it up and folks will stop to sit a while.' },
  stockout: { title: 'Empty shelves', text: 'A store ran out today. Shelves restock overnight, so keep a little cash on hand.' },
  register: { title: 'Back to the register', text: 'You can tap any store to go stand at its register. You’ll serve whoever lines up until you leave.' },
  move: { title: 'Rearranging', text: 'Moving things at night is free. Tap a store or decoration, then Move.' },
  slacker: { title: 'On their phone again', text: 'One-star hires take long phone breaks. Tap the phone bubble and you’ll go have a word. Two-stars slack off now and then; three-stars never do.' },
  restroom: { title: 'Restrooms', text: 'Folks need the restroom too, and it gets grubby. Tap it to mop it out yourself, or hire janitors: they’ll keep it clean.' },
};
