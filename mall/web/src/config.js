// Tuning, content and layout data. Everything the designer would tweak lives here.
export const VERSION = typeof __VERSION__ !== 'undefined' ? __VERSION__ : 'dev';

export const DAY_SECONDS = 150;        // real seconds for 9:00–21:00 at 1x speed
export const VISITOR_SCALE = 0.756;    // 0.72 kept shoppers per minute like the old 4-minute days; v0.10 adds 5%
export const VISITOR_TAPER = [4, 12, 0.2];   // from level 4 to 12, crowds grow 20% slower than the mall does
export const WINDOW_SHOP = [8, 18, 0.25];    // from level 8 to 18, shoppers grow up to 25% pickier about buying
export const LATE_CROWD = [12, 18, 0.15];    // v0.12: from level 12 to 18, 15% fewer shoppers (and it stays that way)
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
// Layout v3 (v0.12): the expansions are a second floor, up the escalator. Both floors live on one tile grid:
// the ground floor is columns 0–29, the second floor starts at column F2X, and the empty columns between keep
// the two floors from ever touching (nothing reaches across a 10-tile gap).
export const LAYOUT = 3;
export const MAP_W = 30;              // the ground floor
export const F2X = 40;                // where the second floor starts on the grid
export const MAP_W_MAX = 68;          // F2X + the whole second floor (Second Floor 16 + Sky Garden 12)
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

// Expansions: the second floor, up an escalator at the east end of the concourse. It opens in two parts.
// Ids stay 'east' and 'garden' so older saves (where these were wings beside the ground floor) carry over.
export const EXPANSIONS = [
  { id: 'east', name: 'Second Floor', cost: 20000, level: 8, x: 40, w: 16, xp: 300,
    sub: 'Open up the sealed second floor, with an escalator from the concourse: two big plots for attractions, 4 storefronts and more restrooms',
    lots: [{ x: 41, y: 3, w: 5, h: 4, face: 'down' }, { x: 47, y: 4, w: 3, h: 3, face: 'down' }, { x: 50, y: 4, w: 2, h: 3, face: 'down' },
           { x: 41, y: 11, w: 5, h: 4, face: 'up' }, { x: 47, y: 11, w: 3, h: 3, face: 'up' }, { x: 50, y: 11, w: 2, h: 2, face: 'up' }],
    restroom: { x: 52, y: 4, face: 'down' },
    decor: [{ type: 'planter', x: 46, y: 13, rot: 1 }, { type: 'plant', x: 54, y: 12 }, { type: 'bench', x: 53, y: 14 }, { type: 'plant', x: 46, y: 5 }] },
  { id: 'garden', name: 'Sky Garden', cost: 45000, level: 13, x: 56, w: 12, xp: 500,
    sub: 'A sunny garden under a glass roof at the end of the second floor: grass, shade trees, one more big plot, 3 storefronts and plenty of room',
    lots: [{ x: 57, y: 4, w: 3, h: 3, face: 'down' }, { x: 61, y: 3, w: 5, h: 4, face: 'down' },
           { x: 57, y: 11, w: 3, h: 3, face: 'up' }, { x: 61, y: 11, w: 2, h: 3, face: 'up' }],
    garden: { x: 56, y: 7, w: 12, h: 4 },
    decor: [{ type: 'tree', x: 57, y: 7 }, { type: 'tree', x: 60, y: 10 }, { type: 'tree', x: 64, y: 7 }, { type: 'tree', x: 66, y: 10 }, { type: 'sofa', x: 64, y: 14, rot: 0 }, { type: 'lamp', x: 56, y: 13 }] },
];
// The escalators, one at each end of the ride: at the east end of the ground floor's concourse and the west end of
// the second floor's. land: the tile you step on and off from. The belts run away from the landing (dir: which way).
export const ESCALATORS = [
  { floor: 0, x: 27, y: 7, w: 3, h: 2, land: { x: 26, y: 8 }, dir: 1 },
  { floor: 1, x: 40, y: 7, w: 3, h: 2, land: { x: 43, y: 8 }, dir: -1 },
];
export const ESCALATOR_RIDE = 1.5;    // seconds on each belt (up one, then off the other)
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
  // v0.12: a hot dog stand on the concourse and a sit-down pizzeria.
  hotdog:   { name: 'Top Dog',        w: 2, h: 1, kiosk: true, cat: 'Food', level: 19, cost: 3200, price: [13, 21], stock: 70, icon: 'hotdog', litter: 0.32, color: '#ffbe0b', trim: '#d62828' },
  pizza:    { name: 'Slice Society',  w: 3, h: 3, cat: 'Food',    level: 22, cost: 6500, price: [20, 34], stock: 70, icon: 'pizza',      litter: 0.3,  color: '#2a9d8f', trim: '#e63946', floor: 'pizzeria', dine: true },
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
  candy:   { name: 'Candy Stripe',    level: 19, cost: 6500, ambience: 5, sub: 'Pink and cream stripes with little sweets dotted along' },
  starry:  { name: 'Starry Night',    level: 21, cost: 8000, ambience: 6, sub: 'Midnight blue with twinkling gold stars and a crescent moon' },
  tropic:  { name: 'Tropical Leaves', level: 24, cost: 10000, ambience: 6, sub: 'Big banana leaves on a sunny cream wall' },
  gala:    { name: 'Golden Gala',     level: 27, cost: 12500, ambience: 7, sub: 'Plum velvet panels framed in gold' },
  sakura:  { name: 'Cherry Blossom',  level: 30, cost: 15000, ambience: 7, sub: 'Pink blossom branches on soft cream' },
  waves:   { name: 'Ocean Waves',     level: 33, cost: 17500, ambience: 8, sub: 'Rolling blue waves and little sailboats' },
  crystal: { name: 'Crystal Palace',  level: 35, cost: 20000, ambience: 8, sub: 'Pale lilac with sparkling crystal facets' },
};
export const FLOORS = {
  classic:    { name: 'Classic Terrazzo', cost: 0,    ambience: 0, sub: 'Speckled cream tile with pink and teal diamonds' },
  diner:      { name: 'Diner Checker',    level: 10, cost: 1500, ambience: 3, sub: 'Big cream and mint checkerboard' },
  terracotta: { name: 'Terracotta Tile',  level: 12, cost: 2400, ambience: 3, sub: 'Sun-baked clay tiles with little inlays' },
  flagstone:  { name: 'Garden Flagstone', level: 14, cost: 3200, ambience: 4, sub: 'Sandy stone pavers, like a garden path' },
  herring:    { name: 'Herringbone Oak',  level: 16, cost: 4200, ambience: 4, sub: 'Honey oak planks in a herringbone' },
  marble:     { name: 'Marble Hall',      level: 18, cost: 6000, ambience: 5, sub: 'Big marble slabs with gold seams' },
  mosaic:     { name: 'Rainbow Mosaic',   level: 20, cost: 7000, ambience: 5, sub: 'Tiny glossy tiles in every color' },
  starlight:  { name: 'Starlight Carpet', level: 23, cost: 9000, ambience: 6, sub: 'Soft navy carpet sprinkled with stars' },
  bamboo:     { name: 'Bamboo Deck',      level: 26, cost: 11000, ambience: 6, sub: 'Pale bamboo planks, calm and bright' },
  gold:       { name: 'Gold Terrazzo',    level: 28, cost: 14000, ambience: 7, sub: 'White terrazzo flecked with real gold' },
  ocean:      { name: 'Seaside Tile',     level: 31, cost: 16000, ambience: 7, sub: 'Sea-glass blue tiles with sandy grout' },
  velvet:     { name: 'Royal Carpet',     level: 34, cost: 18500, ambience: 8, sub: 'Deep red carpet with a gold border pattern' },
  crystal:    { name: 'Crystal Marble',   level: 35, cost: 22000, ambience: 8, sub: 'Pearly marble with a soft rainbow shimmer' },
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
  // play: families stop so the kid can play a while (free), the grown-up waiting at its front.
  playarea:  { name: 'Kids play area',  w: 3, h: 2, cost: 1800, ambience: 4, level: 15, play: { kids: 3, secs: [6, 9] }, sub: 'A slide and a ball pit. Families stop so the kids can play' },
  topiary:   { name: 'Topiary bunny',   w: 1, h: 1, cost: 450, ambience: 4, level: 19, sub: 'A hedge clipped into a bunny · +ambience' },
  photobooth:{ name: 'Photo booth',     w: 1, h: 1, cost: 900, ambience: 2, level: 20, rot: true, coin: { price: [6, 9], who: ['teen', 'fashion', 'family'], chance: 0.2, secs: 2.6 }, sub: 'Strike a pose: teens and fashionistas love it' },
  aquarium:  { name: 'Aquarium',        w: 2, h: 1, cost: 1500, ambience: 6, level: 21, sub: 'Tropical fish in a big glowing tank · +ambience' },
  massage:   { name: 'Massage chair',   w: 1, h: 1, cost: 1100, ambience: 2, level: 23, rot: true, coin: { price: [5, 8], who: ['walker', 'fashion', 'browser'], chance: 0.2, secs: 4.0 }, sub: 'Tired feet pay for a few minutes of bliss' },
  piano:     { name: 'Grand piano',     w: 2, h: 2, cost: 2600, ambience: 8, level: 25, sub: 'It plays itself, softly, all day · +ambience' },
  arch:      { name: 'Flower arch',     w: 2, h: 1, cost: 1400, ambience: 6, level: 27, sub: 'A climbing-rose arch, perfect for photos · +ambience' },
  balloons:  { name: 'Balloon cart',    w: 1, h: 1, cost: 1600, ambience: 3, level: 29, coin: { price: [4, 6], who: ['family'], chance: 0.4, secs: 1.2 }, sub: 'Kids get a balloon to carry around' },
  statue:    { name: 'Wishing fountain', w: 1, h: 1, cost: 2200, ambience: 6, level: 30, sub: 'A little stone fountain that sparkles · +ambience' },
  arcadecab: { name: 'Arcade cabinet',  w: 1, h: 1, cost: 1900, ambience: 2, level: 32, rot: true, coin: { price: [3, 5], who: ['teen', 'browser', 'family'], chance: 0.25, secs: 3.4 }, sub: 'A classic stand-up game: teens line up for it' },
  bubbles:   { name: 'Bubble machine',  w: 1, h: 1, cost: 2000, ambience: 6, level: 33, sub: 'Floats bubbles over the crowd · +ambience' },
  koi:       { name: 'Koi pond',        w: 2, h: 2, cost: 3800, ambience: 9, level: 34, sub: 'Orange and white koi under lily pads · +ambience' },
};
export const BIN_RADIUS = 4;

// Who shops here. `wants` weights which stores they wish for; hours are when they mostly show up.
export const CUSTOMERS = {
  walker:  { label: 'Mall walker',    wants: { coffee: 3, books: 3, dollar: 3, pretzel: 1, candy: 1, scoops: 1, gadgets: 1, theater: 1, burger: 2, shoes: 2, hotdog: 1, pizza: 2 },                     buy: 0.75, spend: 0.9, patience: 1.25, litter: 0.04, speed: 1.2, hours: [9, 12],  weight: 1.0 },
  teen:    { label: 'Teen',           wants: { arcade: 4, pretzel: 3, candy: 3, boutique: 1, coffee: 1, music: 4, scoops: 2, gadgets: 2, theater: 3, jumppark: 3, gaming: 5, burger: 3, shoes: 2, perfume: 1, hotdog: 3, pizza: 4 },                   buy: 0.7,  spend: 0.75, patience: 0.8, litter: 0.32, speed: 1.6, hours: [14, 21], weight: 1.0 },
  family:  { label: 'Family',         wants: { pets: 4, candy: 2, arcade: 2, pretzel: 2, dollar: 2, books: 1, scoops: 4, gadgets: 1, theater: 3, jumppark: 5, toys: 5, burger: 3, shoes: 1, hotdog: 3, pizza: 4 },             buy: 0.8,  spend: 1.1, patience: 1.0,  litter: 0.22, speed: 1.1, hours: [10, 20], weight: 0.9 },
  fashion: { label: 'Fashionista',    wants: { boutique: 5, coffee: 2, candy: 1, books: 1, pets: 1, music: 1, scoops: 1, theater: 2, perfume: 5, shoes: 4, pizza: 1 },                       buy: 0.8,  spend: 1.35, patience: 0.9, litter: 0.05, speed: 1.4, hours: [10, 21], weight: 0.6 },
  browser: { label: 'Window shopper', wants: { pretzel: 1, dollar: 1, candy: 1, arcade: 1, boutique: 1, pets: 1, coffee: 1, books: 1, scoops: 1, music: 1, gadgets: 1, theater: 1, jumppark: 1, toys: 1, perfume: 1, gaming: 1, shoes: 1, burger: 1, hotdog: 1, pizza: 1 }, buy: 0.4, spend: 0.8, patience: 1.0, litter: 0.1, speed: 1.3, hours: [9, 21], weight: 0.8 },
};

// Relative arrivals per hour, 9:00 through 20:00.
export const HOURLY = [0.9, 0.8, 1.0, 1.6, 1.4, 0.9, 1.3, 1.3, 1.2, 1.4, 1.1, 0.6];

export const LEVEL_XP = [0, 0, 85, 255, 550, 980, 1530, 2300, 3230, 4760, 6460, 11000, 14100, 17600, 21500, 25900, 30800, 36300, 42400,
  48000, 54100, 60700, 67800, 75400, 83500, 92100, 101200, 110800, 120900,
  131500, 142600, 154200, 166300, 178900, 192000, 205600];   // XP needed to reach level n
export const MAX_LEVEL = 35;
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
  janitor: [0, 0, 0, 1, 1, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7, 7, 8, 8, 8, 8, 9, 9, 9, 10, 10, 10, 10],
  clerk:   [0, 2, 2, 2, 3, 3, 4, 5, 6, 7, 7, 8, 8, 9, 10, 10, 11, 12, 13, 14, 14, 15, 16, 16, 17, 18, 18, 19, 20, 21, 21, 22, 23, 23, 24, 25],
  stocker: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6, 7, 7, 7, 7],
  greeter: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  mascot:  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4],
  supervisor: [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5],
  guard:   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6],
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
  15: [{ hire: 'mascot' }, { store: 'jumppark' }, { decor: 'playarea' }, { style: 'wall:deco' }, { staffSlots: true }],
  16: [{ style: 'floor:herring' }, { staffSlots: true }],
  17: [{ style: 'wall:luxe' }, { staffSlots: true }],
  18: [{ style: 'floor:marble' }, { staffSlots: true }],
  19: [{ store: 'hotdog' }, { decor: 'topiary' }, { style: 'wall:candy' }, { staffSlots: true }],
  20: [{ decor: 'photobooth' }, { style: 'floor:mosaic' }, { staffSlots: true }],
  21: [{ decor: 'aquarium' }, { style: 'wall:starry' }, { staffSlots: true }],
  22: [{ store: 'pizza' }, { staffSlots: true }],
  23: [{ decor: 'massage' }, { style: 'floor:starlight' }, { staffSlots: true }],
  24: [{ style: 'wall:tropic' }, { staffSlots: true }],
  25: [{ decor: 'piano' }, { staffSlots: true }],
  26: [{ style: 'floor:bamboo' }, { staffSlots: true }],
  27: [{ decor: 'arch' }, { style: 'wall:gala' }, { staffSlots: true }],
  28: [{ style: 'floor:gold' }, { staffSlots: true }],
  29: [{ decor: 'balloons' }, { staffSlots: true }],
  30: [{ decor: 'statue' }, { style: 'wall:sakura' }, { staffSlots: true }],
  31: [{ style: 'floor:ocean' }, { staffSlots: true }],
  32: [{ decor: 'arcadecab' }, { staffSlots: true }],
  33: [{ decor: 'bubbles' }, { style: 'wall:waves' }, { staffSlots: true }],
  34: [{ decor: 'koi' }, { style: 'floor:velvet' }, { staffSlots: true }],
  35: [{ style: 'wall:crystal' }, { style: 'floor:crystal' }, { done: true }],
};

export const LOOKS = {
  skin: ['#f5d0b0', '#f2c7a5', '#e0ac85', '#c68b62', '#a8714f', '#6e4a35'],
  hair: ['#2b2230', '#6b3e26', '#d9733f', '#e8c46a', '#9a9a9a', '#c0392b'],
  shirt: ['#f4b942', '#5a8dee', '#e63946', '#06a77d', '#7b2cbf', '#ff8fab'],
};

export const FIRST_NAMES = ['Ana', 'Ben', 'Cleo', 'Dev', 'Eli', 'Fern', 'Gabe', 'Hana', 'Ivy', 'Jules', 'Kai', 'Lena', 'Milo', 'Nia', 'Omar', 'Pia', 'Quinn', 'Rex', 'Sana', 'Theo', 'Uma', 'Vic', 'Wren', 'Yara', 'Zed'];
