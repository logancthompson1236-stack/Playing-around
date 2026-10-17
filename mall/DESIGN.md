# Mall Revival: Game Concept (working title)

> Concept draft v0.1. Sections marked **Open question** are decisions still to make; everything else is a proposed default that can change.

## 1. Pitch

You inherit a dead shopping mall. The lights flicker, the floor tiles are dusty, most storefronts are boarded up and full of cobwebs, and only two stubborn shops are still open. At first you run the registers and sweep the floors yourself. Each day's profit pays to renovate one more storefront, hire one more helper, and open one more wing, until the mall spreads outward into the busiest place in town.

It's a cozy top-down mall sim with Tiny Tower's charm, FarmVille's chunky, bright art, and a day/night rhythm: run the mall by day, rebuild it by night.

## 2. Design pillars

1. **You can see the mall come back to life.** It visibly changes from grimy to gleaming, and every coin you spend changes something on the map.
2. **Hands-on early, hands-off later.** You start out doing every job yourself, and hiring is how you buy back your time. The game moves from active, to managing, to mostly watching.
3. **Your mall, your layout.** You decide which stores to open and where they go.
4. **Short, satisfying days.** One day takes about 5 minutes and ends with a report card. It should be easy to say "one more day."
5. **Cozy, never punishing.** No failure state wipes your progress. A bad day just earns less.

## 3. Setting and tone

- **Hook:** Your grandmother opened the mall in 1989 and it was the heart of town for twenty years. Online shopping emptied it out, and now she's left it to you. The player names the mall (default: *Sunnyside Mall*).
- **Gus:** the old night janitor who never left. He guides the tutorial and becomes your first free hire.
- **Vibe:** gentle 80s/90s mall nostalgia (a coin fountain, an arcade, a pretzel stand, soft muzak) in bright, rounded, toy-like art.
- **What "abandoned" looks like:** cobwebs in corners, papered-over windows with **FOR LEASE** signs, a layer of dust on the floor, flickering lights, dead potted plants, cracked tiles, a dry fountain, cute graffiti doodles, and pigeons that wandered inside. Restoring an area clears all of it with a sparkle-and-poof transition. This is the main visual payoff, so it should feel great.

## 4. Camera and art direction

- **Camera:** a 3/4 isometric-style view like FarmVille's rather than straight down, so you can read storefront signs and see characters' faces. Pinch to zoom, drag to pan, and optionally rotate in 90° steps.
- **Cutaway interior:** there's no roof, and walls facing the camera are drawn short, so you can see into every store.
- **Characters:** chibi proportions (big head, small body), simple faces, and outfits that hint at the customer type. Emote bubbles float above heads: hearts, coins, a storm cloud, *zzz*, and thought bubbles with store icons.
- **Day/night look:** warm daylight through skylights, then an orange sunset, then closed. At night the mall goes dim blue, store grates come down and neon signs glow. Build mode uses this night look.
- **Proposed rendering:** low-poly 3D with an orthographic camera, flat/toon shading, a pastel palette and soft shadows. Everything is modeled in code like Shardfall, so there are no art files to source. The alternative is 2D sprites, which need an artist or consistent generated art. **Open question.**

## 5. Core loop

```
 ┌──────────────► DAY  (~5 min, timed)
 │                Doors open → customers arrive → you serve registers,
 │                clean up, handle surprises → doors close
 │                         │
 │                         ▼
 │                REPORT CARD
 │                Revenue, expenses, profit, XP, ratings, day grade,
 │                what customers wished for
 │                         │
 │                         ▼
 └─────────────── NIGHT  (untimed build mode)
                  Renovate, place/move stores, decorate, hire,
                  restock, upgrade → "Open Doors"
```

**Meta loop:** profit pays for building, which raises ratings, which brings more (and richer) customers, which earns more profit. XP raises your level, which unlocks new stores, staff and expansions.

## 6. The mall: building outward

### The grid

- The mall is a tile grid. Tiles are walkway, store footprint, wall, entrance, derelict, or locked lot.
- Store sizes: **Kiosk** 1×1 (sits on the walkway, like a pretzel cart), **Small** 2×2, **Medium** 3×3, **Anchor** 4×6.
- A store's front door must touch a walkway. Customers only walk on walkway tiles.
- In night build mode you can place, move (free), rotate, or sell (50% refund).

### Four ways to grow

1. **Renovate (early game).** The starting building is the old mall: a central concourse lined with derelict storefronts. Renovating a vacant unit costs coins for cleanup. Then you pick any unlocked store that fits the unit's size. The old layout gives the early game some structure while you still choose what goes where.
2. **Restore wings (mid game).** Whole wings are closed off behind chain-link and boarded walls. Restoring one opens more floor and more vacant units, and sometimes a centerpiece such as the dry fountain, a broken escalator, or the old food court.
3. **Expand outward (late game).** Buy the land plots next to the mall (FarmVille-style expansion) and build new floor freely: new wings, an outdoor plaza, a garden atrium, more parking (which raises the daily visitor cap).
4. **Add floors (higher tiers).** Escalators unlock a second floor, and later a third. Each floor is a layer you switch between. Customers ride the escalators, and an elevator could be a nod to Tiny Tower.

**Open question:** should players be able to knock down walls and merge units at night, for complete layout freedom? Or should units stay fixed and only new construction be free-form?

## 7. Stores

### How a store works

- Every store has a **category**: Food, Fashion, Fun, Home, Pets, Tech, or Services.
- Every store sells **3 products** (a nod to Tiny Tower): cheap, mid-range and premium. Upgrading the store (★1 to ★3) unlocks the higher tiers and improves its look.
- **Stock:** a meter that drains as items sell. You restock at night for about 40% of retail value. Empty shelves send customers away unhappy. Later, a Stocker hire handles this during the day.
- **Register:** purchases happen at the counter. If nobody is staffing it (you or a clerk), customers queue and lose patience.

### Store catalog (draft; all names are placeholder puns, no real brands)

| Lv | Store | Size | Category | Draws | Notes |
|---|---|---|---|---|---|
| 1 | Pretzel Pals | Kiosk | Food | Everyone | Starting holdout. Wrappers on the floor |
| 1 | Dollar Dreams | Small | Home | Seniors, families | Starting holdout |
| 2 | Sweet Tooth Candy | Small | Food | Kids, teens | Lots of litter |
| 3 | Pixel Palace Arcade | Medium | Fun | Teens | Teens hang around. Litter |
| 4 | Threads Boutique | Small | Fashion | Fashionistas | High prices |
| 5 | Paws & Claws Pet Shop | Medium | Pets | Families | |
| 6 | Bean There Coffee | Small | Food | Everyone | Boosts morning traffic |
| 7 | Page Turners Books | Small | Home | Seniors | Quiet. Boosts ambience nearby |
| 8 | Toy Chest | Medium | Fun | Families | |
| 9 | Kicks Shoes | Small | Fashion | Teens, fashionistas | |
| 10 | **Food Court** | Area | Food | Everyone | Burger, pizza, noodle and smoothie stalls around shared seating. Huge draw, huge mess |
| 12 | Spin City Records | Small | Fun | Teens | |
| 14 | Gadget Hub | Medium | Tech | Adults | Expensive stock |
| 16 | Glam Salon | Small | Services | Fashionistas | Customers sit for a while (a service, not a sale) |
| 18 | Carousel / Photo Booth | Kiosk | Fun | Families | Coin-op attractions |
| 20 | Cineplex | Anchor | Fun | Everyone | Evening rush |
| 25 | Department Store | Anchor | Fashion/Home | Everyone | Raises traffic for the whole mall |
| 30 | Ice Rink / Bowling | Anchor | Fun | Everyone | Signature attraction |

### Neighbor bonuses (optional depth)

Some stores do better side by side: Coffee next to Books, Pets next to Toys. Arcade next to Food brings more traffic and more trash. Green and red arrows show these while you place a store, so the bonuses are easy to see without studying a guide.

## 8. Money: who gets paid

Stores can run in one of two ways. This turns "all or a portion of the proceeds" into a choice the player makes.

| | **Owner-operated** | **Leased to a tenant** |
|---|---|---|
| Who runs it | You, and staff you hire | An NPC business |
| Your income | 100% of sales, minus stock costs | Daily rent plus a small % of sales |
| Work | Staff the register, restock | None |
| Risk | Wages and stock still cost money on slow days | The tenant leaves if mall rating or foot traffic drops |
| Available | From day 1 | Once the mall reaches 2★. Nobody wants to lease in a dead mall |

- Tenant applications arrive at night, for example: *"Kicks Shoes would like to lease your 2×2 unit in the East Wing: $120/day + 5% of sales."* Accept or decline. At high ratings, prestigious anchor tenants start to apply.
- The strategy is to run the money-makers yourself and lease out the stores you don't want to manage.
- **Expenses:** staff wages, stock, and utilities that grow with mall size.
- **Other income:** coins tossed in the wishing fountain, vending machines, coin-op rides, and (later) hosted events.

## 9. Customers

### A customer's visit

1. Arrives at an entrance (from the parking lot or a bus stop).
2. Picks 1–3 **wishes** based on their customer type.
3. Walks to stores that match, browses inside for a few seconds, then decides whether to buy. The chance depends on store level, price tier, stock and their current mood.
4. Queues at the register and pays.
5. Might sit on a bench, toss a coin in the fountain, or eat at the food court.
6. Might drop trash along the way.
7. Leaves. Their mood on the way out counts toward the day's ratings.

### Feedback above their heads

- A **thought bubble with a store icon** shows what a customer wants. If the mall doesn't have it, the bubble turns grey and goes into the report card tally: *"14 shoppers wished for a Pet Shop."* This is the main way the game tells you what to build next.
- A **patience ring** fills while they wait at a register. Hearts pop when they're served quickly, and a storm cloud appears when they walk out.

### Customer types

| Type | Look | Likes | Quirks |
|---|---|---|---|
| Mall Walkers | Tracksuits, visors | Coffee, books, benches | Arrive at opening and walk laps. Very bothered by dirt |
| Teens | Hoodies, phones | Arcade, food, records, shoes | Show up after school (3pm). Litter a lot and linger |
| Families | Parent plus 1–2 kids | Toys, pets, food court | Move slowly as a group. Kids spill drinks |
| Fashionistas | Sunglasses, shopping bags | Boutique, shoes, salon | Care about ambience. Big spenders |
| Window Shoppers | Casual | Anything | Browse a lot and buy little. Still count as foot traffic, which tenants love |
| Foodies | Aprons, chef hats on merch | Food court, coffee | Come at lunch and in the evening |
| Mall Critic (rare VIP) | Trench coat, notepad | Everything | Random visit. Their review swings the mall rating up or down a lot |
| Sneaky Shoplifter (mid game) | Striped shirt, beanie | | Needs a Security Guard. Getting caught plays a cute little scene |

**Daily rhythm:** mall walkers in the morning, a lunch rush, teens after school, families and date nights in the evening.

## 10. Playing as the owner

- The owner is a character on the map. **Tap a job and the owner walks over and does it.** Jobs queue up and show as numbered pins. This works one-handed and still works when there are lots of jobs.
- **Jobs:**
  - **Ring up:** a customer is waiting at a register. Tap to start a quick checkout. An optional timing tap could earn a tip.
  - **Clean:** wrappers, spilled soda, gum.
  - **Fix:** a flickering light, a jammed escalator, a clogged fountain.
  - **Greet a VIP:** earns a rating bonus.
  - **Emergency restock:** refill a store's shelves mid-day.
- **Owner upgrades:** Sneakers (walk faster), Big Broom (clean a wider area), Charm (bigger tips), Clipboard (queue more jobs).
- Early days work like Diner Dash: one person juggling two registers and a growing pile of trash. As you hire, your role shrinks to handling emergencies and VIPs and making the big decisions. You can always step in to rush a register.

**Open question:** tap-to-task (proposed) or direct control with a joystick?

## 11. Staff

| Role | Unlock | What they do | Upgrades |
|---|---|---|---|
| Janitor | Lv3 (Gus, free) | Cleans an assigned zone or patrols the mall | Speed, zone size, mop for spills |
| Clerk | Lv4 | Staffs one owner-operated store's register | Checkout speed, upselling |
| Stocker | Lv12 | Restocks stores during the day | Carry capacity |
| Security Guard | Lv15 | Catches shoplifters and settles rowdy teens | Patrol radius |
| Handyman | Lv18 | Fixes breakdowns | Speed |
| Mall Manager | Lv25 | Handles nightly restocking and tenant renewals automatically | |

- You hire at night from a small pool of applicants that refreshes every day.
- Every applicant is a named character with their own look and a **dream job** (another nod to Tiny Tower). Putting someone in their dream job makes them faster and happier.
- Staff earn a daily wage. Your level sets how many staff you can have.

## 12. Day/night and the report card

- The mall is open **9:00 to 21:00**, which takes about **5 real minutes** (about 25 seconds per in-game hour). A 1×/2× speed toggle unlocks once you have staff.
- A clock and a small foot-traffic curve sit at the top of the screen.
- At closing time the doors lock, the last customers finish up, the lights dim, and the report card slides in:

```
┌──────────────── DAY 12 · Sunnyside Mall ────────────────┐
│  Visitors 143 (+18)                  Happy customers 86%  │
│                                                          │
│  Revenue                                       $2,410    │
│  Expenses   wages 600 · stock 430 · utilities 90  -$1,120 │
│  PROFIT                                        +$1,290    │
│                                                          │
│  Cleanliness  ★★★★☆        Service   ★★★☆☆               │
│  Variety      ★★★☆☆        Ambience  ★★☆☆☆               │
│                                                          │
│  DAY GRADE:  B+                    Streak: 3 days at B+   │
│  XP +340   ▓▓▓▓▓▓▓▓░░   Lv 7 → 8                         │
│                                                          │
│  Wishes: 14× Pet Shop · 9× more benches · 5× Coffee      │
│  Top store: Pixel Palace Arcade ($620)                    │
└──────────────────────────────────────────────────────────┘
```

**Ratings:**

- **Cleanliness:** average dirt on the walkways during open hours, plus any trash left at close.
- **Service:** the share of customers served before their patience ran out, and the average wait.
- **Variety:** how many store categories are open, compared with what customers wished for.
- **Ambience:** decor points (plants, benches, fountains, lighting, music) per floor tile. Derelict tiles count against it.

**Day Grade** (S/A/B/C/D) combines the four ratings with overall customer happiness.

**Mall Rating** (1–5★) is a rolling average of the last ~5 days. It sets how many visitors come, which customer types show up, and how interested tenants are. Because it's an average, one bad day never sinks you.

## 13. Progression

- **XP sources:** sales, happy customers, renovations, good day grades, and streaks.
- **Levels** unlock stores, decor, staff roles and expansions.
- **Mall tiers** are milestones. Each one changes the mall's sign and exterior:

| Tier | Levels | Name | What changes |
|---|---|---|---|
| 1 | 1–5 | Dead Mall | You do everything. Renovate the first units |
| 2 | 6–12 | Neighborhood Mall | First hires, tenants start applying, restore the first wing |
| 3 | 13–20 | Shopping Center | Food court, buying land, parking |
| 4 | 21–30 | Regional Mall | Second floor, anchor stores |
| 5 | 31+ | Mega Mall | Third floor, attractions, hosted events |

- **Goals:** 3 rotating goals at a time, like Tiny Tower missions: *"Serve 30 customers in one day," "Open a pet shop," "Reach 4★ cleanliness."* These keep the player pointed somewhere.
- **Mall Directory:** a sticker book that collects every store type, customer type and VIP you've met.

## 14. Decor and ambience

Benches, potted plants, trash cans (less littering nearby), fountains (earn coins), skylights, neon signs, coin-op kiddie rides, vending machines, floor tile styles, holiday decorations, and a music selector (muzak, jazz or pop, each nudging customer mood slightly). Decor feeds the Ambience rating. Since most of it is cosmetic, it's also the natural place for any future monetization.

## 15. Events

- **Weekly rhythm:** busy Saturdays, shorter Sundays.
- **Random days:** rain (more visitors and wet-floor spills), a school field trip (a busload of kids), a power flicker, a Mall Critic visit, a pigeon invasion, a celebrity book signing.
- **Seasonal:** trick-or-treating at stores for Halloween, a Santa photo booth in winter, back-to-school, summer sales.
- **Player-hosted (later):** pay to throw a Sale Day or an atrium concert.

## 16. Active vs. idle

Proposed: **days only advance while you play**, with no real-time timers or energy systems. A small, capped "overnight rent" from leased tenants could reward coming back without pressuring the player to check in.

**Open question:** should the mall keep earning while the app is closed, Tiny Tower-style?

## 17. Multiplayer (later, but planned for now)

- **Visit a friend's mall:** load a snapshot of their layout, decor and ratings, and watch it run locally with simulated customers. Leave a like or send a gift (a shopper, a piece of decor).
- **Leaderboards:** mall rating, daily visitors, best day grade streak.
- **What this means for the code now:** keep the whole mall as plain serializable data (the grid plus entities), and keep the simulation separate from rendering. Saves go to local storage first. A backend added later only needs to store and fetch snapshots.

## 18. Scope plan

**Milestone 1: playable prototype.** The goal is to find out whether one hands-on day is fun for 5 minutes.
- One floor, renovating vacant units, 6 store types
- Owner tap-to-task, trash, register queues
- Janitor and clerk hiring
- Day/night cycle and the report card
- Levels 1–8, local save, placeholder art
- The test build pipeline: an HTML link plus an APK for every version

**Milestone 2: content and feel.**
- About 15 store types, decor, all customer types, wishes
- Tenants and leasing, wing restoration, goals
- Art pass, sound and music
- Tutorial with Gus

**Milestone 3: shippable 1.0.**
- 30 levels, land expansion, food court, second floor
- Events and a balance pass
- Settings, Capacitor builds for Android and iOS, TestFlight, and store page assets

**Later:** friend visits and leaderboards, seasonal events, a third floor, and a prestige mode (open a second mall in a new town).

## 19. Platforms and test builds

**Target:** a mobile game for **Android and iPhone**, shipped to Google Play and the App Store.

### Every playable version ships two test builds

| Build | For | How it's delivered |
|---|---|---|
| **HTML link** | iPhone and Android (any phone browser) | A hosted copy of the single-file web build at a stable URL (GitHub Pages, since the repo is public). On iPhone: Safari → Share → **Add to Home Screen** for a full-screen, app-like icon |
| **APK** | Android | Attached in the chat, plus a download link on the repo's GitHub Releases page |

- **Version number:** every build gets one (for example *v0.1.0*), shown on the title screen so it's always clear which build is being tested.
- **One signing key:** every APK is signed with the same dedicated test key. A new build then installs over the old one without uninstalling first, which would wipe your save. Shardfall currently uses a per-machine debug key, which causes exactly that problem.
- **iPhone can't install APKs.** Until there's an Apple Developer account ($99/yr, needed anyway for the App Store), the HTML link is how the game gets tested on iPhone. After that, iOS builds can go out through **TestFlight**.

### Wrapping for both app stores

Shardfall uses a hand-built Android-only WebView shell. This game should use **[Capacitor](https://capacitorjs.com)** instead. It wraps the same web build as a native Android app *and* a native iOS app, and its plugins cover haptics, saving and in-app purchases on both platforms. Android builds run on Linux (here or in GitHub Actions). iOS builds need macOS and Xcode, which a GitHub Actions macOS runner can provide.

### What this means for the game

- **Touch-first controls:** tap, drag to pan, pinch to zoom. No hover states. Respect the safe-area insets around notches and the home bar.
- **Make the web build a proper home-screen web app:** a manifest, icons, full-screen mode, no rubber-band scrolling or double-tap zoom.
- **iOS Safari quirks:** sound only starts after the first tap. The browser has no vibration support, so haptics come from the Capacitor plugin in the real app. Safari can clear saved data for a site that hasn't been opened in a while, so web test builds should offer a save export/import code.
- **Performance:** aim for 60 fps on a mid-range Android phone and an older iPhone. Draw crowds with instancing and cap the number of on-screen characters.

## 20. Tech approach (proposed)

- **Pipeline:** JavaScript, three.js and esbuild produce a single-file web build (the HTML test link). Capacitor wraps that build as the Android and iOS apps.
- **Rendering:** an orthographic camera, procedural low-poly toon models, and instanced meshes so crowds of customers stay cheap. Audio (muzak and sound effects) is synthesized with WebAudio, so there are no asset files.
- **Simulation:** runs on a fixed tick, separate from rendering. Customers find their way with grid pathfinding, using a cached flow field toward each store entrance.
- **Save:** JSON in local storage.

## 21. Open questions

1. **Art and camera:** 3/4 isometric or true top-down? Procedural low-poly 3D, or 2D sprites?
2. **Orientation:** portrait (one-handed, like Tiny Tower) or landscape (more mall on screen)? The platforms are decided: Android and iPhone.
3. **Layout freedom:** free-form grid building, or renovating fixed units plus free-form expansion?
4. **Owner control:** tap-to-task or a joystick?
5. **Leasing:** keep the owner-operated vs. leased split, or have the owner run every store?
6. **Idle:** does the mall earn while the app is closed?
7. **Monetization:** paid up front, free with ads or in-app purchases, or none (a hobby project)?
8. **Characters:** people, or cute animal shoppers (Animal Crossing style)?
9. **Name:** Mall Revival, Sunnyside Mall, Mallville, Tiny Plaza, Second Wind Mall, or something else?
