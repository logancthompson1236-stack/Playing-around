// Tuning, content and layout data. Everything the designer would tweak lives here.
export const VERSION = typeof __VERSION__ !== 'undefined' ? __VERSION__ : 'dev';

export const DAY_SECONDS = 150;        // real seconds for 9:00–21:00 at 1x speed
export const VISITOR_SCALE = 0.756;    // 0.72 kept shoppers per minute like the old 4-minute days; v0.10 adds 5%
export const VISITOR_TAPER = [4, 12, 0.2];   // from level 4 to 12, crowds grow 20% slower than the mall does
export const WINDOW_SHOP = [8, 18, 0.25];    // from level 8 to 18, shoppers grow up to 25% pickier about buying
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

// The old mall: 30×17 tiles inside, plus two rows of sidewalk and parking outside the front doors.
// Layout v2: a four-row concourse, storefronts grouped side by side, and an open alcove by the restrooms.
export const LAYOUT = 2;
export const MAP_W = 30;              // the original building; expansions add wings to the east
export const MAP_W_MAX = 58;          // room for the East Wing, the Garden Court, and more later
export const MAP_H = 17;
export const OUTSIDE_H = 2;
export const CONCOURSE = { y: 7, h: 4 };
export const ENTRANCE = { x: 14, y: 16, w: 2 };   // door tiles on the bottom row
export const FOUNTAIN = { x: 14, y: 8, w: 2, h: 2, cost: 500, ambience: 10 };

// Clean floor at the start. Everything else inside the walls is dusty storage until restored.
export const START_CLEAN = [
  { x: 0, y: 7, w: 30, h: 4 },      // main concourse
  { x: 13, y: 11, w: 4, h: 6 },     // entrance hall
  { x: 14, y: 4, w: 2, h: 3 },      // the little alcove beside the restrooms
];

export const ZONES = [
  { id: 'nw', name: 'West storage', x: 0, y: 0, w: 14, h: 7, cost: 600, level: 2 },
  { id: 'ne', name: 'East storage', x: 14, y: 0, w: 16, h: 7, cost: 800, level: 3 },
  { id: 'sw', name: 'Southwest storage', x: 0, y: 11, w: 13, h: 6, cost: 900, level: 4 },
  { id: 'se', name: 'Southeast storage', x: 17, y: 11, w: 13, h: 6, cost: 1100, level: 5 },
];

// Store shells left over from the old mall, side by side. North side opens down onto the concourse, south side opens up.
export const START_UNITS = [
  { x: 1, y: 4, w: 3, h: 3, face: 'down' },
  { x: 4, y: 5, w: 2, h: 2, face: 'down' },
  { x: 6, y: 4, w: 2, h: 3, face: 'down' },
  { x: 11, y: 4, w: 3, h: 3, face: 'down', store: 'dollar' },
  { x: 16, y: 4, w: 4, h: 3, face: 'down', restroom: true },
  { x: 20, y: 5, w: 2, h: 2, face: 'down' },
  { x: 22, y: 4, w: 2, h: 3, face: 'down' },
  { x: 24, y: 4, w: 3, h: 3, face: 'down' },
  { x: 1, y: 11, w: 3, h: 3, face: 'up' },
  { x: 4, y: 11, w: 2, h: 2, face: 'up' },
  { x: 6, y: 11, w: 2, h: 3, face: 'up' },
  { x: 17, y: 11, w: 3, h: 3, face: 'up' },
  { x: 20, y: 11, w: 2, h: 2, face: 'up' },
  { x: 22, y: 11, w: 2, h: 3, face: 'up' },
  { x: 24, y: 11, w: 3, h: 3, face: 'up' },
];
export const START_KIOSKS = [{ x: 19, y: 8, store: 'pretzel' }];

// Restrooms: shoppers stop in now and then, and they get dirty with use. Janitors (or you) mop them out.
export const RESTROOM = { name: 'Restrooms', w: 4, h: 3, color: '#5cc8bf', trim: '#e8f7f5', floor: 'mint', icon: 'wc' };
export const RESTROOM_WAIT = 12;     // seconds a shopper waits for a free stall before giving up
export const RESTROOM_USE = 0.14;    // chance a shopper stops in on their way out
export const RESTROOM_DIRT = 6;      // grime added per visit (out of 100)
export const RESTROOM_MOP = 2.6;     // seconds to mop out (owner); janitors scale with stars

// Big expansions: whole new wings east of the old building, with spaced-out storefronts and room to decorate.
export const EXPANSIONS = [
  { id: 'east', name: 'East Wing', cost: 20000, level: 8, x: 30, w: 16, xp: 300,
    sub: 'Reopen the sealed east wing: 16 more columns of floor, two big plots for attractions, 4 storefronts and more restrooms',
    lots: [{ x: 31, y: 3, w: 5, h: 4, face: 'down' }, { x: 37, y: 4, w: 3, h: 3, face: 'down' }, { x: 40, y: 4, w: 2, h: 3, face: 'down' },
           { x: 31, y: 11, w: 5, h: 4, face: 'up' }, { x: 37, y: 11, w: 3, h: 3, face: 'up' }, { x: 40, y: 11, w: 2, h: 2, face: 'up' }],
    restroom: { x: 42, y: 4, face: 'down' },
    decor: [{ type: 'planter', x: 36, y: 13, rot: 1 }, { type: 'plant', x: 44, y: 12 }, { type: 'bench', x: 43, y: 14 }, { type: 'plant', x: 36, y: 5 }] },
  { id: 'garden', name: 'Garden Court', cost: 45000, level: 13, x: 46, w: 12, xp: 500,
    sub: 'A sunny garden court past the east wing: grass, shade trees, one more big plot, 3 storefronts and plenty of room',
    lots: [{ x: 47, y: 4, w: 3, h: 3, face: 'down' }, { x: 51, y: 3, w: 5, h: 4, face: 'down' },
           { x: 47, y: 11, w: 3, h: 3, face: 'up' }, { x: 51, y: 11, w: 2, h: 3, face: 'up' }],
    garden: { x: 46, y: 7, w: 12, h: 4 },
    decor: [{ type: 'tree', x: 47, y: 7 }, { type: 'tree', x: 50, y: 10 }, { type: 'tree', x: 54, y: 7 }, { type: 'tree', x: 56, y: 10 }, { type: 'sofa', x: 54, y: 14, rot: 0 }, { type: 'lamp', x: 46, y: 13 }] },
];
export const EXPANSION_UTILITIES = 120;   // a bigger building costs more to light and heat, per wing

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
  // Attractions: big 5×4 plots. Tickets come from a machine at the door (no register), seats are limited and a
  // line forms outside when it's full. They cost a lot to build and have a daily upkeep.
  theater:  { name: 'Starlight Cinema', w: 5, h: 4, attraction: 'theater', cat: 'Fun', level: 12, cost: 12000, price: [24, 36], seats: 8, show: [12, 16], upkeep: 160, stock: 0, icon: 'film', litter: 0.25, color: '#3d2b56', trim: '#ffd23f', floor: 'cinema' },
  jumppark: { name: 'Bounce Zone',      w: 5, h: 4, attraction: 'jump',    cat: 'Fun', level: 15, cost: 15000, price: [20, 32], seats: 6, show: [10, 14], upkeep: 130, stock: 0, icon: 'bounce', litter: 0.12, color: '#ff6b35', trim: '#ffd23f', floor: 'bounce' },
  // v0.11: five more storefronts. dine: shoppers sit at a table inside to eat what they bought.
  toys:     { name: 'Toy Chest',      w: 3, h: 3, cat: 'Fun',     level: 6,  cost: 1200, price: [22, 48], stock: 45, icon: 'toy',        litter: 0.06, color: '#ffb703', trim: '#ef476f', floor: 'play' },
  perfume:  { name: 'Scent-sational', w: 2, h: 2, cat: 'Fashion', level: 7,  cost: 1300, price: [48, 90], stock: 30, icon: 'perfume',    litter: 0.03, color: '#c77dff', trim: '#fff0f6', floor: 'blush' },
  gaming:   { name: 'Level Up Games', w: 2, h: 3, cat: 'Tech',    level: 8,  cost: 1700, price: [35, 70], stock: 35, icon: 'controller', litter: 0.05, color: '#3a0ca3', trim: '#4cc9f0', floor: 'neon' },
  shoes:    { name: 'Sole Mates',     w: 2, h: 3, cat: 'Fashion', level: 9,  cost: 1600, price: [40, 85], stock: 35, icon: 'shoe',       litter: 0.04, color: '#e76f51', trim: '#ffe8d6', floor: 'wood' },
  burger:   { name: 'Big Bite Burgers', w: 3, h: 3, cat: 'Food',  level: 10, cost: 2200, price: [14, 24], stock: 70, icon: 'burger',     litter: 0.35, color: '#d62828', trim: '#fcbf49', floor: 'diner', dine: true },
};
// Prices went up 5% in v0.10 (the ranges above are the old ones).
export const PRICE_SCALE = 1.05;
for (const d of Object.values(STORES)) d.price = d.price.map(v => Math.round(v * PRICE_SCALE));

// Mall styles (level 10): a wallpaper for the mall's walls and a floor for the concourse.
// Each is bought once, then you can switch between the ones you own for free. ambience: points toward the rating, like decor.
export const STYLE_LEVEL = 10;
export const WALLPAPERS = {
  classic: { name: 'Classic Lilac',   cost: 0,    ambience: 0, sub: 'The lilac stripes Gus picked out back in the day' },
  retro:   { name: 'Retro Wave',      level: 10, cost: 1200, ambience: 3, sub: 'Mint walls with pink zigzags, straight out of the 80s' },
  sunset:  { name: 'Sunset Plaza',    level: 11, cost: 1800, ambience: 3, sub: 'Warm peach stucco and terracotta arches' },
  garden:  { name: 'Greenhouse',      level: 13, cost: 2600, ambience: 4, sub: 'Sage leaves over oak paneling' },
  deco:    { name: 'Art Deco',        level: 15, cost: 3600, ambience: 4, sub: 'Deep teal with golden fans' },
  luxe:    { name: 'Modern Luxe',     level: 17, cost: 5000, ambience: 5, sub: 'White marble with a thin gold line' },
};
export const FLOORS = {
  classic:    { name: 'Classic Terrazzo', cost: 0,    ambience: 0, sub: 'Speckled cream tile with pink and teal diamonds' },
  diner:      { name: 'Diner Checker',    level: 10, cost: 1500, ambience: 3, sub: 'Big cream and mint checkerboard' },
  terracotta: { name: 'Terracotta Tile',  level: 12, cost: 2400, ambience: 3, sub: 'Sun-baked clay tiles with little inlays' },
  flagstone:  { name: 'Garden Flagstone', level: 14, cost: 3200, ambience: 4, sub: 'Sandy stone pavers, like a garden path' },
  herring:    { name: 'Herringbone Oak',  level: 16, cost: 4200, ambience: 4, sub: 'Honey oak planks in a herringbone' },
  marble:     { name: 'Marble Hall',      level: 18, cost: 6000, ambience: 5, sub: 'Big marble slabs with gold seams' },
};
export const STYLE_XP = 30;

// Troublemakers (from level 10): rowdy teens who blast music, kick over trash cans and spook shoppers.
// Tap one to shoo them out, or hire a security guard. Count per day ramps from min to max over these levels.
export const TROUBLE = { level: 10, perDay: [1, 4], ramp: [10, 18], radius: 3.2, moodHit: 0.18, scareChance: 0.2, stay: [25, 45], guardRadius: [0, 4, 5, 6] };

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
  claw:      { name: 'Claw machine',    w: 1, h: 1, cost: 350, ambience: 1, level: 6, rot: true, coin: { price: [2, 3], who: ['family', 'teen', 'browser'], chance: 0.22, secs: 3.4 }, sub: 'Shoppers try to grab a plush prize' },
  directory: { name: 'Mall directory',  w: 1, h: 1, cost: 150, ambience: 1, level: 13, rot: true, directory: true, sub: 'Shoppers find more stores to visit' },
  tree:      { name: 'Shade tree',      w: 1, h: 1, cost: 300, ambience: 4, level: 13, sub: 'A real tree, right indoors · +ambience' },
};
export const BIN_RADIUS = 4;

// Who shops here. `wants` weights which stores they wish for; hours are when they mostly show up.
export const CUSTOMERS = {
  walker:  { label: 'Mall walker',    wants: { coffee: 3, books: 3, dollar: 3, pretzel: 1, candy: 1, scoops: 1, gadgets: 1, theater: 1, burger: 2, shoes: 2 },                     buy: 0.75, spend: 0.9, patience: 1.25, litter: 0.04, speed: 1.2, hours: [9, 12],  weight: 1.0 },
  teen:    { label: 'Teen',           wants: { arcade: 4, pretzel: 3, candy: 3, boutique: 1, coffee: 1, music: 4, scoops: 2, gadgets: 2, theater: 3, jumppark: 3, gaming: 5, burger: 3, shoes: 2, perfume: 1 },                   buy: 0.7,  spend: 0.75, patience: 0.8, litter: 0.32, speed: 1.6, hours: [14, 21], weight: 1.0 },
  family:  { label: 'Family',         wants: { pets: 4, candy: 2, arcade: 2, pretzel: 2, dollar: 2, books: 1, scoops: 4, gadgets: 1, theater: 3, jumppark: 5, toys: 5, burger: 3, shoes: 1 },             buy: 0.8,  spend: 1.1, patience: 1.0,  litter: 0.22, speed: 1.1, hours: [10, 20], weight: 0.9 },
  fashion: { label: 'Fashionista',    wants: { boutique: 5, coffee: 2, candy: 1, books: 1, pets: 1, music: 1, scoops: 1, theater: 2, perfume: 5, shoes: 4 },                       buy: 0.8,  spend: 1.35, patience: 0.9, litter: 0.05, speed: 1.4, hours: [10, 21], weight: 0.6 },
  browser: { label: 'Window shopper', wants: { pretzel: 1, dollar: 1, candy: 1, arcade: 1, boutique: 1, pets: 1, coffee: 1, books: 1, scoops: 1, music: 1, gadgets: 1, theater: 1, jumppark: 1, toys: 1, perfume: 1, gaming: 1, shoes: 1, burger: 1 }, buy: 0.4, spend: 0.8, patience: 1.0, litter: 0.1, speed: 1.3, hours: [9, 21], weight: 0.8 },
};

// Relative arrivals per hour, 9:00 through 20:00.
export const HOURLY = [0.9, 0.8, 1.0, 1.6, 1.4, 0.9, 1.3, 1.3, 1.2, 1.4, 1.1, 0.6];

export const LEVEL_XP = [0, 0, 85, 255, 550, 980, 1530, 2300, 3230, 4760, 6460, 11000, 14100, 17600, 21500, 25900, 30800, 36300, 42400];   // XP needed to reach level n
export const MAX_LEVEL = 18;
// Staff roles. Wages are per day, indexed by star rating (1–3).
export const ROLES = {
  janitor: { name: 'Janitor', plural: 'Janitors', level: 3,  wage: [0, 28, 36, 46], desc: 'Sweeps up trash near them.' },
  clerk:   { name: 'Clerk',   plural: 'Clerks',   level: 1,  wage: [0, 28, 38, 50], desc: 'Runs a register for you.' },
  stocker: { name: 'Stocker', plural: 'Stockers', level: 10, wage: [0, 34, 44, 56], desc: 'Restocks stores during the day so shelves never run dry.' },
  greeter: { name: 'Greeter', plural: 'Greeters', level: 12, wage: [0, 30, 38, 48], desc: 'Welcomes shoppers at the door. Happier, more patient customers.' },
  mascot:  { name: 'Mascot',  plural: 'Mascots',  level: 15, wage: [0, 40, 52, 66], desc: 'Sunny the mascot draws a bigger crowd and cheers folks up.' },
  supervisor: { name: 'Supervisor', plural: 'Supervisors', level: 5, wage: [0, 48, 62, 80], desc: 'Makes the rounds, gets anyone on their phone back to work, and staff near them work faster.' },
  guard:   { name: 'Security guard', plural: 'Security guards', level: 10, wage: [0, 44, 56, 70], desc: 'Patrols the mall and walks troublemakers out before they upset anyone.' },
};
export const WAGES = Object.fromEntries(Object.entries(ROLES).map(([k, r]) => [k, r.wage]));
// How many of each role you can employ at each level (index = level).
export const STAFF_LIMITS = {
  janitor: [0, 0, 0, 1, 1, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 6],
  clerk:   [0, 2, 2, 2, 3, 3, 4, 5, 6, 7, 7, 8, 8, 9, 10, 10, 11, 12, 13],
  stocker: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3],
  greeter: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
  mascot:  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2],
  supervisor: [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2],
  guard:   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 2],
};
export const SUPERVISOR_RADIUS = [0, 3, 4, 5];      // tiles they keep an eye on
export const SUPERVISOR_BOOST = [0, 1.05, 1.09, 1.13];   // staff in range work this much faster (by the supervisor's stars)…
export const SUPERVISOR_BREAKS = 0.75;              // …and their break clock runs this much slower
// Staff are rated 1–3 stars (index = stars). Better staff work faster and cost more.
export const JANITOR_SPEED = [0, 1.25, 1.75, 2.0];  // tiles per second (one-stars dawdle)
export const JANITOR_CLEAN = [0, 1.9, 1.2, 0.95];   // seconds per sweep
export const JANITOR_SIGHT = 7;                     // tiles; trash farther away waits for someone closer
export const CLERK_SERVE = [0, 2.5, 1.5, 1.2];      // seconds per checkout
export const DREAM_SERVE = 0.8;                     // a clerk in their dream job checks out faster…
export const DREAM_SPEND = 1.15;                    // …and talks customers into spending more
// Breaks: one-star staff wander off to their phones every so often, two-stars now and then, three-stars never.
// Tap them and you'll go have a word; otherwise they drift back when the break runs out.
export const BREAK_EVERY = [0, [35, 60], [120, 180], null];   // seconds of work between breaks [min, max]
export const BREAK_LENGTH = [0, 24, 14, 0];
export const STOCKER_SPEED = [0, 1.3, 1.9, 2.2];
export const STOCKER_TIME = [0, 3.8, 2.4, 1.8];     // seconds to restock a store
export const RESTOCK_AT = 0.35;                      // stockers top up a store below this fraction
// What each level unlocks. The report card and the level-up screen are built from this.
export const LEVEL_UNLOCKS = {
  2: [{ store: 'coffee' }, { zone: 'nw' }],
  3: [{ store: 'arcade' }, { hire: 'janitor' }, { zone: 'ne' }],
  4: [{ store: 'boutique' }, { zone: 'sw' }, { staffSlots: true }],
  5: [{ store: 'pets' }, { hire: 'supervisor' }, { zone: 'se' }, { staffSlots: true }],
  6: [{ store: 'books' }, { store: 'toys' }, { decor: 'claw' }, { staffSlots: true }],
  7: [{ store: 'perfume' }, { staffSlots: true }],
  8: [{ store: 'gaming' }, { staffSlots: true }],
  9: [{ store: 'scoops' }, { store: 'shoes' }, { decor: 'planter' }, { decor: 'lamp' }, { staffSlots: true }],
  10: [{ store: 'burger' }, { hire: 'stocker' }, { hire: 'guard' }, { decor: 'vending' }, { style: 'wall:retro' }, { style: 'floor:diner' }],
  11: [{ store: 'music' }, { decor: 'sofa' }, { style: 'wall:sunset' }, { staffSlots: true }],
  12: [{ hire: 'greeter' }, { store: 'theater' }, { decor: 'ride' }, { style: 'floor:terracotta' }],
  13: [{ decor: 'gumball' }, { decor: 'directory' }, { style: 'wall:garden' }, { staffSlots: true }],
  14: [{ store: 'gadgets' }, { style: 'floor:flagstone' }, { staffSlots: true }],
  15: [{ hire: 'mascot' }, { store: 'jumppark' }, { style: 'wall:deco' }, { staffSlots: true }],
  16: [{ style: 'floor:herring' }, { staffSlots: true }],
  17: [{ style: 'wall:luxe' }, { staffSlots: true }],
  18: [{ style: 'floor:marble' }, { staffSlots: true }, { done: true }],
};

export const LOOKS = {
  skin: ['#f5d0b0', '#f2c7a5', '#e0ac85', '#c68b62', '#a8714f', '#6e4a35'],
  hair: ['#2b2230', '#6b3e26', '#d9733f', '#e8c46a', '#9a9a9a', '#c0392b'],
  shirt: ['#f4b942', '#5a8dee', '#e63946', '#06a77d', '#7b2cbf', '#ff8fab'],
};

export const FIRST_NAMES = ['Ana', 'Ben', 'Cleo', 'Dev', 'Eli', 'Fern', 'Gabe', 'Hana', 'Ivy', 'Jules', 'Kai', 'Lena', 'Milo', 'Nia', 'Omar', 'Pia', 'Quinn', 'Rex', 'Sana', 'Theo', 'Uma', 'Vic', 'Wren', 'Yara', 'Zed'];
