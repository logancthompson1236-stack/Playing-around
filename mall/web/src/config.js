// Tuning, content and layout data. Everything the designer would tweak lives here.
export const VERSION = typeof __VERSION__ !== 'undefined' ? __VERSION__ : 'dev';

export const DAY_SECONDS = 240;        // real seconds for 9:00–21:00 at 1x speed
export const OPEN_HOUR = 9;
export const CLOSE_HOUR = 21;
export const LAST_ENTRY = 0.95;        // fraction of the day after which nobody new arrives
export const START_CASH = 500;
export const OWNER_SPEED = 3.2;        // tiles per second
export const OWNER_SERVE = 1.1;        // seconds per checkout
export const CLERK_SERVE = 1.5;
export const OWNER_CLEAN = 0.45;
export const JANITOR_CLEAN = 0.8;
export const STAFF_SPEED = 2.4;
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
  pretzel:  { name: 'Pretzel Pals',  w: 2, h: 1, kiosk: true, cat: 'Food',    level: 1, cost: 250,  price: [6, 9],   stock: 50, icon: 'pretzel', litter: 0.25, color: '#e63946', trim: '#ffd23f' },
  dollar:   { name: 'Dollar Dreams', w: 3, h: 3, cat: 'Home',    level: 1, cost: 450,  price: [5, 14],  stock: 60, icon: 'dollar',  litter: 0.05, color: '#ffd23f', trim: '#2f7a4e', floor: 'mint' },
  candy:    { name: 'Sweet Tooth',   w: 2, h: 2, cat: 'Food',    level: 1, cost: 250,  price: [6, 11],  stock: 50, icon: 'candy',   litter: 0.3,  color: '#ff8fab', trim: '#e8577e', floor: 'candy' },
  arcade:   { name: 'Pixel Palace',  w: 3, h: 3, cat: 'Fun',     level: 3, cost: 700,  price: [9, 15],  stock: 80, icon: 'joystick', litter: 0.2, color: '#7b2cbf', trim: '#ff5fa2', floor: 'carpet' },
  boutique: { name: 'Threads',       w: 2, h: 3, cat: 'Fashion', level: 4, cost: 900, price: [24, 42], stock: 35, icon: 'shirt',   litter: 0.04, color: '#5a8dee', trim: '#ffd6e0', floor: 'wood' },
  pets:     { name: 'Paws & Claws',  w: 3, h: 3, cat: 'Pets',    level: 5, cost: 1100, price: [26, 55], stock: 35, icon: 'paw',     litter: 0.08, color: '#06a77d', trim: '#ffe8a3', floor: 'grass' },
  coffee:   { name: 'Bean There',    w: 2, h: 2, cat: 'Food',    level: 2, cost: 450,  price: [6, 10],  stock: 60, icon: 'cup',     litter: 0.3,  color: '#8a5a44', trim: '#ffe8c2', floor: 'cafe' },
  books:    { name: 'Page Turners',  w: 2, h: 3, cat: 'Home',    level: 6, cost: 1000, price: [14, 28], stock: 40, icon: 'book',    litter: 0.03, color: '#3d5a80', trim: '#f2e6c8', floor: 'wood2' },
};

export const DECOR = {
  plant: { name: 'Potted palm', w: 1, h: 1, cost: 40, ambience: 2, level: 1 },
  bench: { name: 'Bench',       w: 2, h: 1, cost: 70, ambience: 2, level: 1, seat: true },
  bin:   { name: 'Trash can',   w: 1, h: 1, cost: 50, ambience: 0, level: 1, bin: true },
};
export const BIN_RADIUS = 3.2;

// Who shops here. `wants` weights which stores they wish for; hours are when they mostly show up.
export const CUSTOMERS = {
  walker:  { label: 'Mall walker',    wants: { coffee: 3, books: 3, dollar: 3, pretzel: 1, candy: 1 },                     buy: 0.75, spend: 0.9, patience: 1.25, litter: 0.04, speed: 1.2, hours: [9, 12],  weight: 1.0 },
  teen:    { label: 'Teen',           wants: { arcade: 4, pretzel: 3, candy: 3, boutique: 1, coffee: 1 },                   buy: 0.7,  spend: 0.75, patience: 0.8, litter: 0.32, speed: 1.6, hours: [14, 21], weight: 1.0 },
  family:  { label: 'Family',         wants: { pets: 4, candy: 2, arcade: 2, pretzel: 2, dollar: 2, books: 1 },             buy: 0.8,  spend: 1.1, patience: 1.0,  litter: 0.22, speed: 1.1, hours: [10, 20], weight: 0.9 },
  fashion: { label: 'Fashionista',    wants: { boutique: 5, coffee: 2, candy: 1, books: 1, pets: 1 },                       buy: 0.8,  spend: 1.35, patience: 0.9, litter: 0.05, speed: 1.4, hours: [10, 21], weight: 0.6 },
  browser: { label: 'Window shopper', wants: { pretzel: 1, dollar: 1, candy: 1, arcade: 1, boutique: 1, pets: 1, coffee: 1, books: 1 }, buy: 0.4, spend: 0.8, patience: 1.0, litter: 0.1, speed: 1.3, hours: [9, 21], weight: 0.8 },
};

// Relative arrivals per hour, 9:00 through 20:00.
export const HOURLY = [0.9, 0.8, 1.0, 1.6, 1.4, 0.9, 1.3, 1.3, 1.2, 1.4, 1.1, 0.6];

export const LEVEL_XP = [0, 0, 100, 300, 650, 1150, 1800, 2700, 3800];   // XP needed to reach level n
export const MAX_LEVEL = 8;
export const STAFF_MAX = [0, 0, 0, 1, 2, 3, 4, 5, 6];
export const WAGES = { janitor: 35, clerk: 45 };
export const LEVEL_PERKS = {
  2: ['Bean There Coffee', 'West storage can be cleared'],
  3: ['Pixel Palace Arcade', 'Your first janitor', 'East storage can be cleared'],
  4: ['Threads Boutique', 'Clerks to run your registers', 'Southwest storage can be cleared'],
  5: ['Paws & Claws Pet Shop', 'Southeast storage can be cleared', 'Room for more staff'],
  6: ['Page Turners Books', 'Room for more staff'],
  7: ['Room for more staff'],
  8: ["That's everything in this test version"],
};

export const LOOKS = {
  skin: ['#f5d0b0', '#f2c7a5', '#e0ac85', '#c68b62', '#a8714f', '#6e4a35'],
  hair: ['#2b2230', '#6b3e26', '#d9733f', '#e8c46a', '#9a9a9a', '#c0392b'],
  shirt: ['#f4b942', '#5a8dee', '#e63946', '#06a77d', '#7b2cbf', '#ff8fab'],
};

export const FIRST_NAMES = ['Ana', 'Ben', 'Cleo', 'Dev', 'Eli', 'Fern', 'Gabe', 'Hana', 'Ivy', 'Jules', 'Kai', 'Lena', 'Milo', 'Nia', 'Omar', 'Pia', 'Quinn', 'Rex', 'Sana', 'Theo', 'Uma', 'Vic', 'Wren', 'Yara', 'Zed'];
