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

// Notebook tips: shown once, when the situation first comes up.
export const DEE_SCENE = {
  staff: 'Tap Staff, down in the corner. That’s where you hire help.',
  hire: 'There’s Dee, right at the top. Tap Hire.',
  hired: ['That’s her. She’ll be here when you open tomorrow.', 'Wages come out each night. When things get busier, come back here and hire more help.'],
  skipped: ['No rush. Dee’s name will be on that list whenever you’re ready.'],
};

export const TIPS = {
  night: { title: 'Nights are for building', text: 'Nothing’s on the clock till you hit Open Doors. Tap things in the mall to see what you can do.' },
  renovate: { title: 'Fix up a unit', text: 'That old unit could be a shop again. Tap a boarded-up store to fix it up.' },
  vacant: { title: 'Open a store', text: 'Fixed up! Tap the empty unit to open a store inside it.' },
  walkout: { title: 'Folks don’t wait forever', text: 'Watch the ring around their bubble. When it runs out, they leave grumpy.' },
  wish: { title: 'Grey bubbles', text: 'Grey means we don’t have what they want. The report card keeps a list of what folks wished for.' },
  litter: { title: 'Trash cans', text: 'Put a trash can out and most folks nearby will toss their trash in it instead of on the floor. Build, then Decor.' },
  staff: { title: 'Hiring help', text: 'You can hire staff now. Open Staff at night. Janitors sweep, clerks run a register for you.' },
  clerks: { title: 'Clerks', text: 'Clerks can run a register for you now. Hire one under Staff and pick their store.' },
  speed: { title: 'Speed things up', text: 'Got help now? Tap the fast-forward button to speed up the day.' },
  zone: { title: 'Storage rooms', text: 'Those dusty storage rooms are wasted space. Clear one out and you can build anywhere on the new floor.' },
  fountain: { title: 'The old fountain', text: 'That fountain was the heart of this place. Fix it up and folks will stop to sit a while.' },
  stockout: { title: 'Empty shelves', text: 'A store ran out today. Shelves restock overnight, so keep a little cash on hand.' },
  register: { title: 'Back to the register', text: 'You can tap any store to go stand at its register. You’ll serve whoever lines up until you leave.' },
  move: { title: 'Rearranging', text: 'Moving things at night is free. Tap a store or decoration, then Move.' },
};
