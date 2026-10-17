// Tuning, content and layout data. Everything the designer would tweak lives here.
export const VERSION = typeof __VERSION__ !== 'undefined' ? __VERSION__ : 'dev';

export const DAY_SECONDS = 150;        // real seconds for 9:00–21:00 at 1x speed
export const VISITOR_SCALE = 0.72;     // keeps shoppers per minute about the same as the old 4-minute days
export const LITTER_SCALE = 0.25;      // overall litter rate (each store and shopper type has its own weight)
export const BIN_USE = 0.9;            // chance a shopper near a trash can uses it instead of the floor
export const OPEN_HOUR = 9;
export const CLOSE_HOUR = 21;
export const LAST_ENTRY = 0.95;        // fraction of the day after which nobody new arrives
export const START_CASH = 500;
export const OWNER_SPEED = 3.2;        // tiles per second
export const OWNER_SERVE = 1.1;        // seconds per checkout
export const OWNER_CLEAN = 0.45;
export const STAFF_SPEED = 2.4;        // clerks walking to their register
export const BASE_PATIENCE = 24;       // seconds a customer waits in line before leaving
export const MAX_JOBS = 3;
export const MAX_TRASH = 70;
export const RESTOCK_RATE = 0.3;       // restocking costs this fraction of retail value
export const UTILITIES_BASE = 10;
export const UTILITIES_PER_STORE = 5;

// The old mall: 26×15 tiles inside, plus two rows of sidewalk and parking outside the front doors.
export const MAP_W = 26;
export const MAP_H = 15;
export const OUTSIDE_H = 2;
export const ENTRANCE = { x: 12, y: 14, w: 2 };   // door tiles on the bottom row
export const FOUNTAIN = { x: 12, y: 7, w: 2, h: 2, cost: 500, ambience: 10 };

// Clean floor at the start. Everything else inside the walls is dusty storage until restored.
export const START_CLEAN = [
  { x: 0, y: 6, w: 26, h: 3 },      // main concourse
  { x: 11, y: 9, w: 4, h: 6 },      // entrance hall
];

export const ZONES = [
  { id: 'nw', name: 'West storage', x: 0, y: 0, w: 14, h: 6, cost: 600, level: 2 },
  { id: 'ne', name: 'East storage', x: 14, y: 0, w: 12, h: 6, cost: 750, level: 3 },
  { id: 'sw', name: 'Southwest storage', x: 0, y: 9, w: 11, h: 6, cost: 900, level: 4 },
  { id: 'se', name: 'Southeast storage', x: 15, y: 9, w: 11, h: 6, cost: 1100, level: 5 },
];

// Store shells left over from the old mall. North side opens down onto the concourse, south side opens up.
export const START_UNITS = [
  { x: 1, y: 3, w: 3, h: 3, face: 'down' },
  { x: 4, y: 4, w: 2, h: 2, face: 'down' },
  { x: 6, y: 3, w: 2, h: 3, face: 'down' },
  { x: 11, y: 3, w: 3, h: 3, face: 'down', store: 'dollar' },
  { x: 15, y: 3, w: 3, h: 3, face: 'down' },
  { x: 18, y: 4, w: 2, h: 2, face: 'down' },
  { x: 21, y: 3, w: 2, h: 3, face: 'down' },
  { x: 1, y: 9, w: 3, h: 3, face: 'up' },
  { x: 5, y: 9, w: 2, h: 2, face: 'up' },
  { x: 7, y: 9, w: 2, h: 3, face: 'up' },
  { x: 16, y: 9, w: 3, h: 3, face: 'up' },
  { x: 20, y: 9, w: 2, h: 2, face: 'up' },
  { x: 22, y: 9, w: 3, h: 3, face: 'up' },
];
export const START_KIOSKS = [{ x: 16, y: 7, store: 'pretzel' }];

export const RENOVATE_PER_TILE = 15;   // cost to clean out a boarded-up unit
export const BUILD_PER_TILE = 45;      // cost to put up a brand-new shell on open floor

export const STORES = {
  pretzel:  { name: 'Pretzel Pals',  w: 2, h: 1, kiosk: true, cat: 'Food',    level: 1, cost: 250,  price: [10, 15], stock: 50, icon: 'pretzel', litter: 0.25, color: '#e63946', trim: '#ffd23f' },
  dollar:   { name: 'Dollar Dreams', w: 3, h: 3, cat: 'Home',    level: 1, cost: 450,  price: [9, 25],  stock: 60, icon: 'dollar',  litter: 0.05, color: '#ffd23f', trim: '#2f7a4e', floor: 'mint' },
  candy:    { name: 'Sweet Tooth',   w: 2, h: 2, cat: 'Food',    level: 1, cost: 250,  price: [10, 19], stock: 50, icon: 'candy',   litter: 0.3,  color: '#ff8fab', trim: '#e8577e', floor: 'candy' },
  arcade:   { name: 'Pixel Palace',  w: 3, h: 3, cat: 'Fun',     level: 3, cost: 700,  price: [15, 26], stock: 80, icon: 'joystick', litter: 0.2, color: '#7b2cbf', trim: '#ff5fa2', floor: 'carpet' },
  boutique: { name: 'Threads',       w: 2, h: 3, cat: 'Fashion', level: 4, cost: 900, price: [41, 73], stock: 35, icon: 'shirt',   litter: 0.04, color: '#5a8dee', trim: '#ffd6e0', floor: 'wood' },
  pets:     { name: 'Paws & Claws',  w: 3, h: 3, cat: 'Pets',    level: 5, cost: 1100, price: [45, 94], stock: 35, icon: 'paw',     litter: 0.08, color: '#06a77d', trim: '#ffe8a3', floor: 'grass' },
  coffee:   { name: 'Bean There',    w: 2, h: 2, cat: 'Food',    level: 2, cost: 450,  price: [10, 16], stock: 60, icon: 'cup',     litter: 0.3,  color: '#8a5a44', trim: '#ffe8c2', floor: 'cafe' },
  books:    { name: 'Page Turners',  w: 2, h: 3, cat: 'Home',    level: 6, cost: 1000, price: [25, 49], stock: 40, icon: 'book',    litter: 0.03, color: '#3d5a80', trim: '#f2e6c8', floor: 'wood2' },
  scoops:   { name: 'Scoops',        w: 2, h: 1, kiosk: true, cat: 'Food', level: 9, cost: 700, price: [12, 20], stock: 70, icon: 'cone', litter: 0.3, color: '#ff8fc8', trim: '#7ed6c8' },
  music:    { name: 'Mixtape Music', w: 2, h: 3, cat: 'Fun',     level: 11, cost: 1500, price: [32, 60], stock: 40, icon: 'record', litter: 0.05, color: '#2b2d42', trim: '#ffd23f', floor: 'carpet' },
  gadgets:  { name: 'Gadget Galaxy', w: 3, h: 3, cat: 'Tech',    level: 14, cost: 2400, price: [70, 140], stock: 30, icon: 'tv',   litter: 0.03, color: '#118ab2', trim: '#c0f0ff', floor: 'mint' },
};

// rot: can be turned to face four ways. seat: shoppers sit on it. coin: a coin-op machine shoppers pay to use.
export const DECOR = {
  bin:       { name: 'Trash can',       w: 1, h: 1, cost: 50,  ambience: 0, level: 1, bin: true, sub: 'Shoppers nearby toss trash in it' },
  plant:     { name: 'Potted palm',     w: 1, h: 1, cost: 40,  ambience: 2, level: 1, sub: '+ambience' },
  bench:     { name: 'Bench',           w: 2, h: 1, cost: 70,  ambience: 2, level: 1, seat: true, rot: true, sub: 'Somewhere to sit · +ambience' },
  planter:   { name: 'Flower planter',  w: 2, h: 1, cost: 90,  ambience: 3, level: 9, rot: true, sub: '+ambience' },
  lamp:      { name: 'Lamp post',       w: 1, h: 1, cost: 60,  ambience: 2, level: 9, sub: 'Glows in the evening · +ambience' },
  vending:   { name: 'Soda machine',    w: 1, h: 1, cost: 250, ambience: 0, level: 10, rot: true, coin: { price: [3, 5], who: null, chance: 0.12, secs: 1.4 }, sub: 'Thirsty shoppers buy a soda' },
  sofa:      { name: 'Comfy sofa',      w: 2, h: 1, cost: 160, ambience: 3, level: 11, seat: true, comfy: true, rot: true, sub: 'A long, happy sit · +ambience' },
  ride:      { name: 'Kiddie ride',     w: 1, h: 1, cost: 400, ambience: 1, level: 12, rot: true, coin: { price: [4, 7], who: ['family'], chance: 0.35, secs: 3.2 }, sub: 'Families pay for a ride' },
  gumball:   { name: 'Gumball machine', w: 1, h: 1, cost: 120, ambience: 1, level: 13, coin: { price: [1, 2], who: ['family', 'teen'], chance: 0.2, secs: 1.0 }, sub: 'Kids and teens love it' },
  directory: { name: 'Mall directory',  w: 1, h: 1, cost: 150, ambience: 1, level: 13, rot: true, directory: true, sub: 'Shoppers find more stores to visit' },
};
export const BIN_RADIUS = 4;

// Who shops here. `wants` weights which stores they wish for; hours are when they mostly show up.
export const CUSTOMERS = {
  walker:  { label: 'Mall walker',    wants: { coffee: 3, books: 3, dollar: 3, pretzel: 1, candy: 1, scoops: 1, gadgets: 1 },                     buy: 0.75, spend: 0.9, patience: 1.25, litter: 0.04, speed: 1.2, hours: [9, 12],  weight: 1.0 },
  teen:    { label: 'Teen',           wants: { arcade: 4, pretzel: 3, candy: 3, boutique: 1, coffee: 1, music: 4, scoops: 2, gadgets: 2 },                   buy: 0.7,  spend: 0.75, patience: 0.8, litter: 0.32, speed: 1.6, hours: [14, 21], weight: 1.0 },
  family:  { label: 'Family',         wants: { pets: 4, candy: 2, arcade: 2, pretzel: 2, dollar: 2, books: 1, scoops: 4, gadgets: 1 },             buy: 0.8,  spend: 1.1, patience: 1.0,  litter: 0.22, speed: 1.1, hours: [10, 20], weight: 0.9 },
  fashion: { label: 'Fashionista',    wants: { boutique: 5, coffee: 2, candy: 1, books: 1, pets: 1, music: 1, scoops: 1 },                       buy: 0.8,  spend: 1.35, patience: 0.9, litter: 0.05, speed: 1.4, hours: [10, 21], weight: 0.6 },
  browser: { label: 'Window shopper', wants: { pretzel: 1, dollar: 1, candy: 1, arcade: 1, boutique: 1, pets: 1, coffee: 1, books: 1, scoops: 1, music: 1, gadgets: 1 }, buy: 0.4, spend: 0.8, patience: 1.0, litter: 0.1, speed: 1.3, hours: [9, 21], weight: 0.8 },
};

// Relative arrivals per hour, 9:00 through 20:00.
export const HOURLY = [0.9, 0.8, 1.0, 1.6, 1.4, 0.9, 1.3, 1.3, 1.2, 1.4, 1.1, 0.6];

export const LEVEL_XP = [0, 0, 100, 300, 650, 1150, 1800, 2700, 3800, 5600, 8000, 11000, 14800, 19500, 25000, 31500, 39000, 47500, 57000];   // XP needed to reach level n
export const MAX_LEVEL = 18;
// Staff roles. Wages are per day, indexed by star rating (1–3).
export const ROLES = {
  janitor: { name: 'Janitor', plural: 'Janitors', level: 3,  wage: [0, 28, 36, 46], desc: 'Sweeps up trash near them.' },
  clerk:   { name: 'Clerk',   plural: 'Clerks',   level: 4,  wage: [0, 36, 46, 58], desc: 'Runs a register for you.' },
  stocker: { name: 'Stocker', plural: 'Stockers', level: 10, wage: [0, 34, 44, 56], desc: 'Restocks stores during the day so shelves never run dry.' },
  greeter: { name: 'Greeter', plural: 'Greeters', level: 12, wage: [0, 30, 38, 48], desc: 'Welcomes shoppers at the door. Happier, more patient customers.' },
  mascot:  { name: 'Mascot',  plural: 'Mascots',  level: 15, wage: [0, 40, 52, 66], desc: 'Sunny the mascot draws a bigger crowd and cheers folks up.' },
};
export const WAGES = Object.fromEntries(Object.entries(ROLES).map(([k, r]) => [k, r.wage]));
// How many of each role you can employ at each level (index = level).
export const STAFF_LIMITS = {
  janitor: [0, 0, 0, 1, 1, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 6],
  clerk:   [0, 0, 0, 0, 2, 3, 4, 5, 6, 7, 7, 8, 8, 9, 10, 10, 11, 12, 12],
  stocker: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3],
  greeter: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
  mascot:  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2],
};
// Staff are rated 1–3 stars (index = stars). Better staff work faster and cost more.
export const JANITOR_SPEED = [0, 1.5, 1.75, 2.0];   // tiles per second
export const JANITOR_CLEAN = [0, 1.5, 1.2, 0.95];   // seconds per sweep
export const JANITOR_SIGHT = 7;                     // tiles; trash farther away waits for someone closer
export const CLERK_SERVE = [0, 1.9, 1.5, 1.2];      // seconds per checkout
export const DREAM_SERVE = 0.8;                     // a clerk in their dream job checks out faster…
export const DREAM_SPEND = 1.15;                    // …and talks customers into spending more
export const STOCKER_SPEED = [0, 1.6, 1.9, 2.2];
export const STOCKER_TIME = [0, 3.0, 2.4, 1.8];     // seconds to restock a store
export const RESTOCK_AT = 0.35;                      // stockers top up a store below this fraction
// What each level unlocks. The report card and the level-up screen are built from this.
export const LEVEL_UNLOCKS = {
  2: [{ store: 'coffee' }, { zone: 'nw' }],
  3: [{ store: 'arcade' }, { hire: 'janitor' }, { zone: 'ne' }],
  4: [{ store: 'boutique' }, { hire: 'clerk' }, { zone: 'sw' }],
  5: [{ store: 'pets' }, { zone: 'se' }, { staffSlots: true }],
  6: [{ store: 'books' }, { staffSlots: true }],
  7: [{ staffSlots: true }],
  8: [{ staffSlots: true }],
  9: [{ store: 'scoops' }, { decor: 'planter' }, { decor: 'lamp' }, { staffSlots: true }],
  10: [{ hire: 'stocker' }, { decor: 'vending' }],
  11: [{ store: 'music' }, { decor: 'sofa' }, { staffSlots: true }],
  12: [{ hire: 'greeter' }, { decor: 'ride' }],
  13: [{ decor: 'gumball' }, { decor: 'directory' }, { staffSlots: true }],
  14: [{ store: 'gadgets' }, { staffSlots: true }],
  15: [{ hire: 'mascot' }, { staffSlots: true }],
  16: [{ staffSlots: true }],
  17: [{ staffSlots: true }],
  18: [{ staffSlots: true }, { done: true }],
};

export const LOOKS = {
  skin: ['#f5d0b0', '#f2c7a5', '#e0ac85', '#c68b62', '#a8714f', '#6e4a35'],
  hair: ['#2b2230', '#6b3e26', '#d9733f', '#e8c46a', '#9a9a9a', '#c0392b'],
  shirt: ['#f4b942', '#5a8dee', '#e63946', '#06a77d', '#7b2cbf', '#ff8fab'],
};

export const FIRST_NAMES = ['Ana', 'Ben', 'Cleo', 'Dev', 'Eli', 'Fern', 'Gabe', 'Hana', 'Ivy', 'Jules', 'Kai', 'Lena', 'Milo', 'Nia', 'Omar', 'Pia', 'Quinn', 'Rex', 'Sana', 'Theo', 'Uma', 'Vic', 'Wren', 'Yara', 'Zed'];
