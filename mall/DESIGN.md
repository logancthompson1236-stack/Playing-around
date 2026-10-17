# Mall Revival: Game Concept (working title)

> Concept draft v0.3. Sections marked **Open question** are decisions still to make. Sections marked **Decided** reflect the owner's choices. Everything else is a proposed default that can change.

## 1. Pitch

You inherit a dead shopping mall. The lights flicker, the floor tiles are dusty, most storefronts are boarded up and full of cobwebs, and only two stubborn shops are still open. At first you run the registers and sweep the floors yourself. Each day's profit pays to renovate one more storefront, hire one more helper, and open one more wing, until the mall spreads outward into the busiest place in town.

It's a cozy top-down mall sim with Tiny Tower's charm, a FarmVille-style cute look, and a day/night rhythm: run the mall by day, rebuild it by night.

## 2. Design pillars

1. **You can see the mall come back to life.** It visibly changes from grimy to gleaming, and every coin you spend changes something on the map.
2. **Hands-on early, hands-off later.** You start out doing every job yourself, and hiring is how you buy back your time. The game moves from active, to managing, to mostly watching.
3. **Your mall, your layout.** You decide which stores to open and where they go.
4. **Short, satisfying days.** One day takes about 5 minutes and ends with a report card. It should be easy to say "one more day."
5. **Cozy, never punishing.** No failure state wipes your progress. A bad day just earns less.

## 3. Story

### Setting and tone

A light 80s/90s mall theme: a coin fountain, potted palms, terrazzo floors, an arcade, a pretzel cart, a record store, soft muzak. Early on the mall has only small shops. Big anchor stores come much later. The player names the mall (default: *Sunnyside Mall*), and the sign out front updates to match.

### What "abandoned" looks like

- Cobwebs in corners and papered-over windows with **FOR LEASE** signs.
- A layer of dust on the floor, cracked tiles, and flickering lights.
- Dead potted plants, a dry fountain, and cute graffiti doodles.
- Ghost outlines of old store signs, like a faded "VIDEO HUT."
- Pigeons that wandered inside.

Restoring an area clears all of it with a sparkle-and-poof transition. This is the main visual payoff, so it should feel great.

### The intro (about 60 seconds, skippable)

The intro is told Stardew Valley-style: a handful of illustrated panels with short captions, then straight into play.

1. **A gray city office.** Rain on the window and a mountain of paperwork. Your phone buzzes.
2. **A letter from Grandma Rose,** written before she passed: *"Sweet pea, the mall is yours now. She's tired, and so was I at the end. But she has good bones. Gus will show you around. Give her a little love and she'll love you back."*
3. **A bus ride** out of the city to the small town where you spent your summers as a kid.
4. **Night at the mall.** The sign buzzes with half its letters dead: `SUN Y IDE  ALL`. A flashlight beam swings around, and an old man in a faded uniform says: *"You must be Rosie's grandkid. Name's Gus. I kept the lights on. Most of 'em."*
5. **Character creation:** your name, your look, and the mall's name.
6. **Day 1:** the tutorial, with Gus.

### Gus

**Who he is.** Gus has been the mall's janitor since opening day in 1989, when Rose hired him and nobody else would. He's around seventy, wears a faded teal uniform and cap, and carries a ring of about a hundred keys and a mop he calls Betsy. He practically lives in the janitor's closet, with a cot, a hot plate, a transistor radio playing oldies, and a wall of Polaroids from the mall's glory days. He's gruff, sweet, proud, and a big softie. He knows every inch of the building and every bit of town gossip, and he hates gum.

**Why he stayed.** After the paychecks stopped, Gus kept cleaning, fixing things and chasing out pigeons, because he'd promised Rose he would keep the lights on until someone came.

**What he does in the game:**

1. **Tutorial guide.** One-line tips in a speech bubble, never a wall of text.
2. **Your first hire.** On night 1 he refuses pay: *"Pay me when the place can afford it."* At level 3 you can finally put him on payroll. In a small moment he puts on a fresh uniform. He becomes your first janitor, with a unique perk called **Old Reliable**: he cleans faster and never slacks.
3. **Town gossip.** On a lease offer, tap Gus to reveal one of the tenant's hidden traits, once per night: *"That Discount Dan fella? Left boxes stacked to the ceiling at his last place."* This ties the story directly into the leasing system (see section 8).
4. **Keeper of the scrapbook.** Restoring parts of the mall turns up old Polaroids and 90s relics, like a mixtape, a virtual pet keychain, or a movie poster. They go in Gus's scrapbook, and many of them unlock retro decor.

### Story pacing: Gus's memories

**The rule:** story never interrupts the day.

- Story beats happen only at night, after the report card.
- There's at most one beat per night. Each one is 3–6 lines and can always be skipped.
- When a beat is ready, a **"!"** appears over Gus's closet in night mode. You can tap it now or later, because it waits for you.
- Beats are triggered by restoration milestones, so story progress is literally tied to bringing places back.

| Trigger | Memory | Reward |
|---|---|---|
| Night 1 | Why Gus stayed. He refuses to be paid. | — |
| Reach level 3 | Gus goes on payroll. *"Rose would've liked this."* | Gus joins as janitor |
| Restore the fountain | Rose tossed a penny in every morning "for one more good day." | **Daily Wish:** toss a coin each morning for a small random boost |
| Open an arcade | Gus has held the high score on *Galaxy Pals* since 1994. A few days later a teen beats it. Gus sulks for a day, then you catch him coaching the kid. | Retro arcade cabinet decor |
| Upgrade Pretzel Pals to ★3 | The recipe belonged to Marlene, Gus's late wife. He met her in line at that cart in 1990. | **Marlene's Cinnamon Twist:** a premium Pretzel Pals product |
| Each wing restored | A memory about what used to be there. For example, the 1993 snow day when half the town slept in the mall, or the record store where your parent had their first job. | A Polaroid and a decor piece |
| Reach 4★ | Gus finds Rose's old ledger, full of her notes on running the mall. | A small permanent bonus |
| Reach Mega Mall (finale) | Gus leads you to the fountain. Underneath is a time capsule he and Rose buried on opening day, "to open when the mall is full again." Inside is a letter from young Rose to whoever kept her mall alive. Gus finally takes a vacation, and sends postcards. | The original neon sign is relit. Postcards bring occasional small gifts |

After the finale, Gus comes back as *Head of Maintenance (semi-retired)*. Players will want him around.

### A light rival (optional)

Victor Sterling of Sterling Developments wants to bulldoze the mall for condos and a parking garage.

- **Buyout letters:** at milestones he mails smug offers to buy the mall. Each one is a bit more desperate than the last, and you can frame it or tear it up. This is a comedy beat in the mailbox, never a real threat.
- **Possible twist:** one of the shady tenants turns out to be working for him.
- **The ending:** in the finale he gives up and asks to lease a unit for his condo sales office.

## 4. Camera and art direction

**Camera (leaning):** a **3/4 top-down view**, the Stardew Valley angle. You see the floor from above and the fronts of walls, people and props.

- On a phone this is easier to read than FarmVille's diagonal view.
- The square grid fills a portrait screen with no wasted corners.
- Controls: pinch to zoom, drag to pan.
- **Cutaway interior:** there's no roof, and walls facing the camera are drawn as low knee walls, so you can see into every store.

**Art style (leaning 2D, pending the mockup):** an interactive comparison is at `mall/mockups/art-styles.html`. It shows the same mall corner as flat 2D art drawn in code, and as low-poly 3D with toon shading and real shadows.

- **What "2D drawn" means here:** clean vector cartoon art. That means bold outlines, flat colors and one shade tone, drawn in code and baked into sprites when the game loads.
- **Upsides:** it's sharp at any screen size, a tiny download, and consistent.
- **Limitation:** it isn't painterly, textured hand-drawn art. That level needs a human artist or AI-generated sprite sheets.
- **Art stays swappable:** every sprite is keyed by name, so an artist's work can replace any piece later without touching gameplay.
- **3D's upsides:** lighting and shadows add polish automatically, and the camera can turn. The downsides are a diorama feel rather than a drawn one, wasted corners on a portrait screen, and heavier work for low-end phones.

**Characters and feedback:**

- **Characters:** chibi proportions (big head, small body), simple faces, and outfits that hint at the customer type. Only people for now (**Decided**). Animals, mascots in costumes, and other quirky visitors come later.
- **Emotes:** bubbles float above heads, including hearts, coins, a storm cloud, *zzz*, and thought bubbles with store icons.

**Day/night look:**

- **Day:** warm daylight through skylights, turning to an orange sunset.
- **Closed:** the mall goes dim blue, store grates come down, and neon signs glow. Build mode uses this night look.

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
                  read the mailbox (lease offers), restock,
                  maybe a Gus memory → "Open Doors"
```

**Meta loop:** profit pays for building, which raises ratings, which brings more (and richer) customers and better tenants, which earns more profit. XP raises your level, which unlocks new stores, staff and expansions.

## 6. The mall: building outward (Decided: free-form)

### Units and the grid

- The mall is a tile grid. Any clean floor is yours to arrange.
- Every store sits in a **unit**: a storefront shell with a set footprint. You can build a unit anywhere it fits, as long as its door opens onto a walkway. Leftover floor automatically becomes walkway.
- An empty unit shows a FOR LEASE sign. It can be filled with your own store or a tenant's (see section 8).
- The old mall's derelict units start out as existing shells. You can clean one out cheaply because its walls are already up, or demolish it to free the floor.
- At night, moving a store is free and keeps its upgrades. Selling refunds 50%.
- **Guardrail:** the game warns you if a placement would cut part of the mall off from the entrance.

### Store sizes match what they sell

Different store types need different footprints. A pretzel cart is tiny, a bookstore is long and narrow for its aisles, an arcade is square for its cabinets, and anchors are huge. Odd shapes make layout a satisfying little puzzle.

| Size | Examples |
|---|---|
| 1×1 / 2×1 kiosk | Pretzel cart, phone-case kiosk, photo booth |
| 2×2 | Candy shop, coffee, records |
| 2×3 (long) | Bookstore, shoe store, boutique |
| 3×3 | Arcade, pet shop, toy store |
| 5×6+ anchors | Cinema, department store, ice rink |
| Food court | A free-form area: 2×1 stalls around seating you lay out yourself |

### Size upgrades

Upgrading a store from ★1 to ★3 needs more floor. For example, *Sweet Tooth Candy* (2×2) grows into the *Candy Emporium* (3×2) and then the *Candy Palace* (3×3).

- **What each step adds:** more products, more shelves, a second register, and a fancier storefront.
- **Why it matters:** leaving room to grow becomes part of planning your layout. If there's no room, move the store at night.

### Four ways to grow

1. **Renovate (early game).** The starting building is the old mall: a central concourse lined with derelict storefronts.
2. **Restore wings (mid game).** Whole wings are closed off behind boarded walls. Restoring one opens more floor and more derelict units, and sometimes a centerpiece such as the fountain, a broken escalator, or the old food court.
3. **Expand outward (late game).** Buy the land plots next to the mall, FarmVille-style, and build new floor freely: new wings, an outdoor plaza, a garden atrium, more parking (which raises the daily visitor cap).
4. **Add floors (higher tiers).** Escalators unlock a second floor, and later a third. Each floor is a layer you switch between.

## 7. Stores

### How your own stores work

- **Category:** every store type has one: Food, Fashion, Fun, Home, Pets, Tech, or Services.
- **Products:** every store sells **3 products** (a nod to Tiny Tower): cheap, mid-range and premium. Upgrades unlock the higher tiers.
- **Stock:** a meter that drains as items sell. You restock at night for about 40% of retail value. Empty shelves send customers away unhappy. Later, a Stocker hire handles this during the day.
- **Register:** purchases happen at the counter. If nobody is staffing it (you or a clerk), customers queue up and lose patience.

### Store catalog (draft; all names are placeholder puns, no real brands)

| Lv | Store | Size (★1 → ★3) | Category | Draws | Notes |
|---|---|---|---|---|---|
| 1 | Pretzel Pals | 2×1 → 2×2 → 3×2 | Food | Everyone | Starting holdout (Marlene's recipe). Wrappers on the floor |
| 1 | Dollar Dreams | 3×3 → 3×4 → 4×4 | Home | Seniors, families | Starting holdout |
| 2 | Sweet Tooth Candy | 2×2 → 3×2 → 3×3 | Food | Kids, teens | Lots of litter |
| 3 | Pixel Palace Arcade | 3×3 → 4×3 → 4×4 | Fun | Teens | Teens hang around. Litter |
| 4 | Threads Boutique | 2×3 → 3×3 → 3×4 | Fashion | Fashionistas | High prices |
| 5 | Paws & Claws Pet Shop | 3×3 → 3×4 → 4×4 | Pets | Families | |
| 6 | Bean There Coffee | 2×2 → 2×3 → 3×3 | Food | Everyone | Boosts morning traffic |
| 7 | Page Turners Books | 2×3 → 2×4 → 3×4 | Home | Seniors | Quiet. Boosts ambience nearby |
| 8 | Toy Chest | 3×3 → 4×3 → 4×4 | Fun | Families | |
| 9 | Kicks Shoes | 2×3 → 3×3 | Fashion | Teens, fashionistas | |
| 10 | **Food Court** | Area | Food | Everyone | Burger, pizza, noodle and smoothie stalls. Huge draw, huge mess |
| 12 | Spin City Records | 2×2 → 2×3 | Fun | Teens | |
| 14 | Gadget Hub | 3×3 → 3×4 | Tech | Adults | Expensive stock |
| 16 | Glam Salon | 2×3 → 3×3 | Services | Fashionistas | Customers sit for a while (a service, not a sale) |
| 18 | Carousel / Photo Booth | 3×3 / 1×1 | Fun | Families | Coin-op attractions |
| 20 | Cineplex | 5×6 | Fun | Everyone | Evening rush |
| 25 | Department Store | 6×6 | Fashion/Home | Everyone | Raises traffic for the whole mall |
| 30 | Ice Rink / Bowling | 6×8 | Fun | Everyone | Signature attraction |

### Neighbor bonuses (optional depth)

Some stores do better side by side: Coffee next to Books, Pets next to Toys. Arcade next to Food brings more traffic and more trash. Green and red arrows show these while you place a store, so the bonuses are easy to see without studying a guide.

## 8. Your stores and leased stores (Decided: hybrid)

Every unit is filled one of two ways. Both run side by side, and they connect in a few simple places, each a single button or mailbox card. There's no separate management screen.

### Your own stores (owner-operated)

- Open one from the **Stores** screen: pick any store type you've unlocked and place it.
- You keep all sales, minus stock and wages. You (or a clerk) staff the register, and you restock.
- New store types unlock as you level up.

### Leased stores (tenants)

- **When offers arrive:** lease offers start coming in the **Mailbox** at night once your reputation reaches 2★. Nobody wants to lease in a dead mall.
- **What an offer asks for:** an empty unit of the right size. At higher ratings, offers can also ask you to build one: *"Would you build us a 3×3?"*
- **The tenant card** shows:
  - The shop's name and the shopkeeper's portrait
  - Store type and size
  - A star rating ("word around town")
  - Two traits: one visible, and one hidden (?) until they've been open a few days or Gus spills the beans
  - The lease terms
- **Terms take one tap:** **Flat Rent** (steady $/day) or **Revenue Share** (a cut of their sales, which pays more if they do well and less if they flop). Leases run 5, 10 or 20 days.
- **Tenants run themselves:** no staffing and no restocking. Their store still counts toward Variety, draws its own customers, and affects its neighbors.
- **Who applies depends on your mall:**
  - Low rating: mostly sketchy tenants willing to take a chance. This is the early-game risk and reward.
  - High rating: beloved local shops.
  - 4★ and up: anchor tenants.

### Where the two meet

- **Buy Out:** pay a one-time price for a thriving tenant's store, and it becomes yours to run. This even works for store types you haven't unlocked yet.
- **Hand Off:** sometimes a tenant offers to take over one of your stores: *"I'll run that candy shop for you, 15% of sales."* This is handy for stores you don't want to babysit.
- **Renew or Let Go:** when a lease ends, renew it (the terms shift with their performance) or take the unit back.

### Tenant traits

**Good traits:**

| Trait | Example tenant | Effect |
|---|---|---|
| Crowd Pleaser | Glitter Galaxy | Brings extra visitors to the whole mall |
| Spotless | Tidy Tina's Linens | Keeps the walkway in front of their store clean |
| Beloved | Grandma Dot's Cookies | The smell drifts, and nearby customers get happier |
| Trendsetter | Neon Threads | Draws fashionistas and raises Ambience |
| Handy | Mr. Fixit Repairs | Fixes small breakdowns next door |
| Reliable | Corner Cards & Gifts | Always pays on time and renews cheaper |

**Bad traits.** Each one comes with a visible, funny tell, so you can see the problem on the map:

| Trait | Example tenant | What you see | Effect |
|---|---|---|---|
| Loud | Boomin' Bob's Stereo Barn | Bass thumps, the window shakes, neighbors cover their ears | Nearby customers lose mood |
| Pushy | The Lotion Kiosk | A salesperson steps into the walkway waving samples | Passersby lose patience, and some detour around it |
| Smelly | Mystery Meat on a Stick | Green stink lines | Nearby food stores sell less |
| Messy | Discount Dan's Everything | Boxes spill into the walkway | Blocks paths and lowers cleanliness |
| Knockoffs | Totally Real Designer Bags | Suspiciously cheap "luxury" goods | Sells a lot, but a Mall Critic who spots them lowers your rating |
| Flaky | Flaky Fran's Froyo | Shutter down with a "BACK IN 5 MIN" sign, all day | Random days closed, and no money from revenue share |
| Pigeon Magnet | Pete's Birdseed Barn | A birdseed trail, and pigeons stealing pretzels | Pigeons and litter |
| Drama | Diva's Boutique | Shopkeepers argue across the walkway with angry bubbles | A feud: both stores sell less until it's resolved |
| Late Payer | Honest Abe's Electronics | IOU notes in the mailbox | Rent arrives late or short |

**Mixed traits** trade one thing for another. A loud arcade draws teens but annoys seniors. A spooky fortune teller scares kids, but adults love her.

**Dealing with a bad tenant:**

- **Warning Letter:** free. It usually improves their behavior for a few days, but not always.
- **Send Gus:** once a week. He resolves a feud or finds out what's going on.
- **Evict:** immediate, but you pay off the rest of the lease, take a small rating hit, and the unit needs cleaning before anyone can use it again.
- **Wait It Out:** decline to renew when the lease ends.

**Tenants and ratings over time:**

- The report card names a **Tenant of the Day**. Great tenants raise your Mall Rating, and bad ones drag it down.
- A tenant's own stars rise or fall depending on how your mall treats them: foot traffic, cleanliness, and their neighbors.

### Other money

- **Expenses:** staff wages, stock, and utilities that grow with mall size.
- **Other income:** coins tossed in the fountain, vending machines, coin-op rides, and (later) hosted events.

## 9. Customers

All customers are people for now (**Decided**).

### A customer's visit

1. Arrives at an entrance, from the parking lot or a bus stop.
2. Picks 1–3 **wishes** based on their customer type.
3. Walks to stores that match and browses inside for a few seconds. Then decides whether to buy, based on store level, price tier, stock and their current mood.
4. Queues at the register and pays.
5. Might sit on a bench, toss a coin in the fountain, or eat at the food court.
6. Might drop trash along the way.
7. Leaves. Their mood on the way out counts toward the day's ratings.

### Feedback above their heads

- **What they want:** a thought bubble with a store icon. If the mall doesn't have that store, the bubble turns grey and goes into the report card tally: *"14 shoppers wished for a Pet Shop."* This is the main way the game tells you what to build next.
- **How long they'll wait:** a patience ring fills around their bubble at a register. Hearts pop when they're served quickly. A storm cloud appears when they walk out.

### Customer types

| Type | Look | Likes | Quirks |
|---|---|---|---|
| Mall Walkers | Tracksuits, visors | Coffee, books, benches | Arrive at opening and walk laps. Very bothered by dirt |
| Teens | Hoodies, phones | Arcade, food, records, shoes | Show up after school (3pm). Litter a lot and linger |
| Families | Parent plus 1–2 kids | Toys, pets, food court | Move slowly as a group. Kids spill drinks and carry balloons |
| Fashionistas | Sunglasses, shopping bags | Boutique, shoes, salon | Care about ambience. Big spenders |
| Window Shoppers | Casual | Anything | Browse a lot and buy little. Still count as foot traffic, which tenants love |
| Foodies | Foodie T-shirts | Food court, coffee | Come at lunch and in the evening |
| Mall Critic (rare VIP) | Trench coat, notepad | Everything | Random visit. Their review swings the mall rating up or down a lot |
| Sneaky Shoplifter (mid game) | Striped shirt, beanie | | Needs a Security Guard. Getting caught plays a cute little scene |

**Daily rhythm:** mall walkers in the morning, a lunch rush, teens after school, families and date nights in the evening.

## 10. Playing as the owner (Decided: tap-to-task)

- The owner is a character on the map. **Tap a job and the owner walks over and does it.** Jobs queue up and show as numbered pins.
- **Jobs:**
  - **Ring up:** a customer is waiting at a register. An optional timing tap could earn a tip.
  - **Clean:** wrappers, spilled soda, gum.
  - **Fix:** a flickering light, a jammed escalator, a clogged fountain.
  - **Greet a VIP:** earns a rating bonus.
  - **Emergency restock:** refill a store's shelves mid-day.
- **Owner upgrades:** Sneakers (walk faster), Big Broom (clean a wider area), Charm (bigger tips), Clipboard (queue more jobs).
- **How the role changes:** early days work like Diner Dash, with one person juggling two registers and a growing pile of trash. As you hire staff, your role shrinks to handling emergencies and VIPs and making the big decisions. You can always step in to rush a register.

## 11. Staff

| Role | Unlock | What they do | Upgrades |
|---|---|---|---|
| Janitor | Lv3 (Gus first) | Cleans an assigned zone or patrols the mall | Speed, zone size, mop for spills |
| Clerk | Lv4 | Staffs one of your stores' registers | Checkout speed, upselling |
| Stocker | Lv12 | Restocks your stores during the day | Carry capacity |
| Security Guard | Lv15 | Catches shoplifters and settles rowdy teens | Patrol radius |
| Handyman | Lv18 | Fixes breakdowns | Speed |
| Mall Manager | Lv25 | Handles nightly restocking and lease renewals automatically | |

- You hire at night from a small pool of applicants that refreshes every day.
- Every applicant is a named character with their own look and a **dream job** (another nod to Tiny Tower). Putting someone in their dream job makes them faster and happier.
- Staff earn a daily wage. Your level sets how many staff you can have.
- Staff only work in your own stores. Tenants bring their own.

## 12. Day/night and the report card

- The mall is open **9:00 to 21:00**, which takes about **5 real minutes** (about 25 seconds per in-game hour). A 1×/2× speed toggle unlocks once you have staff.
- A clock and a small foot-traffic curve sit at the top of the screen.
- At closing time the doors lock, the last customers finish up, the lights dim, and the report card slides in:

```
┌──────────────── DAY 12 · Sunnyside Mall ────────────────┐
│  Visitors 143 (+18)                  Happy customers 86%  │
│                                                          │
│  Revenue (your stores)                         $1,890    │
│  Rent & share (tenants)                          $520    │
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
│  Tenant of the Day: Grandma Dot's Cookies ★★★★★          │
│  Trouble: Boomin' Bob's is too loud (neighbors -12%)      │
└──────────────────────────────────────────────────────────┘
```

**Ratings:**

- **Cleanliness:** average dirt on the walkways during open hours, plus any trash left at close.
- **Service:** the share of customers served before their patience ran out, and the average wait.
- **Variety:** how many store categories are open, compared with what customers wished for.
- **Ambience:** decor points (plants, benches, fountains, lighting, music) per floor tile. Derelict tiles count against it.

**Day Grade** (S/A/B/C/D) combines the four ratings with overall customer happiness and how your tenants performed.

**Mall Rating** (1–5★) is your reputation: a rolling average of the last ~5 days. It sets how many visitors come, which customer types show up, and which tenants apply. Because it's an average, one bad day never sinks you.

## 13. Progression

- **XP sources:** sales, happy customers, renovations, good day grades, and streaks.
- **Levels** unlock stores, decor, staff roles and expansions. **Reputation** (Mall Rating) unlocks better lease offers.
- **Mall tiers** are milestones. Each one changes the mall's sign and exterior:

| Tier | Levels | Name | What changes |
|---|---|---|---|
| 1 | 1–5 | Dead Mall | You do everything. Renovate the first units |
| 2 | 6–12 | Neighborhood Mall | First hires, first lease offers, restore the first wing |
| 3 | 13–20 | Shopping Center | Food court, buying land, parking |
| 4 | 21–30 | Regional Mall | Second floor, anchor stores, anchor tenants |
| 5 | 31+ | Mega Mall | Third floor, attractions, hosted events, story finale |

- **Goals:** 3 rotating goals at a time, like Tiny Tower missions: *"Serve 30 customers in one day," "Open a pet shop," "Reach 4★ cleanliness."* These keep the player pointed somewhere.
- **Gus's Scrapbook:** collects every Polaroid and relic you find, plus every store type, customer type and VIP you've met.

## 14. Decor and ambience

Benches, potted palms, trash cans (less littering nearby), fountains (earn coins), skylights, neon signs, coin-op kiddie rides, vending machines, floor tile styles, holiday decorations, scrapbook relics, and a music selector (muzak, jazz or pop, each nudging customer mood slightly). Decor feeds the Ambience rating.

## 15. Events

- **Weekly rhythm:** busy Saturdays, shorter Sundays.
- **Random days:** rain (more visitors and wet-floor spills), a school field trip (a busload of kids), a power flicker, a Mall Critic visit, a pigeon invasion, a celebrity book signing.
- **Seasonal:** trick-or-treating at stores for Halloween, a Santa photo booth in winter, back-to-school, summer sales.
- **Player-hosted (later):** pay to throw a Sale Day or an atrium concert.

## 16. Away earnings (Decided)

- Days only advance while you play. Your own stores are closed while you're away.
- **Tenants keep paying a trickle:** about one-tenth of a day's tenant rent per hour away. It's capped at one day's worth no matter how long you're gone, and the cap is reached after about 10 hours.
- **On return,** Gus leaves a note: *"Rent came in while you were gone: $340."*
- **Nothing bad happens while you're away:** no decay and no lost tenants.

## 17. Monetization (later, light)

Leaning toward a small amount of ads. Nothing is final.

- **Design rule now:** the economy has to feel complete with no ads at all. Ads only add optional bonuses.
- **Preferred format: opt-in rewarded ads** at natural pauses, like the report card or the mailbox. For example: *"Watch to double today's tenant rent," "Watch for a free restock," "Watch for one more lease offer."*
- **No ads during the day.** If interstitial ads are ever used, they'd come only between days, rarely, and a one-time **Remove Ads** purchase would turn them off.
- **Possible later purchases:** cosmetic decor packs. No pay-to-win and no energy timers.
- **Tech:** AdMob through a Capacitor plugin.

## 18. Multiplayer (later, but planned for now)

- **Visit a friend's mall:** load a snapshot of their layout, decor and ratings, and watch it run locally with simulated customers. Leave a like or send a gift (a shopper, a piece of decor).
- **Leaderboards:** mall rating, daily visitors, best day grade streak.
- **What this means for the code now:** keep the whole mall as plain serializable data (the grid plus entities), and keep the simulation separate from rendering. Saves go to local storage first. A backend added later only needs to store and fetch snapshots.

## 19. Scope plan

**Milestone 1: playable prototype.** The goal is to find out whether one hands-on day is fun for 5 minutes.
- One floor, free-form unit placement, renovating derelict units, 6 store types
- Owner tap-to-task, trash, register queues
- Janitor (Gus) and clerk hiring
- Day/night cycle and the report card
- Levels 1–8, local save, first-pass art in the chosen style
- The test build pipeline: an HTML link plus an APK for every version

**Milestone 2: content and feel.**
- About 15 store types with size upgrades, decor, all customer types, wishes
- Leasing: the mailbox, tenant cards, traits, buy-out and hand-off
- Wing restoration, goals, Gus's memories and scrapbook
- The intro, art pass, sound and music

**Milestone 3: shippable 1.0.**
- 30 levels, land expansion, food court, second floor
- Events, away earnings, rewarded ads, balance pass
- Settings, Android release, store page assets

**Later:**
- iOS release (via Capacitor)
- Friend visits and leaderboards, seasonal events
- A third floor and animal characters
- A prestige mode: open a second mall in a new town

## 20. Platforms and test builds (Decided: Android first, iOS later)

**Target:** a mobile game. Android ships first, and iOS follows from the same code.

### Every playable version ships two test builds

| Build | For | How it's delivered |
|---|---|---|
| **HTML link** | iPhone and Android (any phone browser) | A hosted copy of the single-file web build at a stable URL (GitHub Pages, since the repo is public). On iPhone: Safari → Share → **Add to Home Screen** for a full-screen, app-like icon |
| **APK** | Android | Attached in the chat, plus a download link on the repo's GitHub Releases page |

- **Version number:** every build gets one (for example *v0.1.0*), shown on the title screen so it's always clear which build is being tested.
- **One signing key:** every APK is signed with the same dedicated test key. A new build then installs over the old one without uninstalling first, which would wipe your save.
- **iPhone can't install APKs.** Until there's an Apple Developer account ($99/yr, needed anyway for the App Store), the HTML link is how the game gets tested on iPhone. After that, iOS builds can go out through **TestFlight**.

### Wrapping for both app stores

Use **[Capacitor](https://capacitorjs.com)**. It wraps the same web build as a native Android app now and a native iOS app later, and its plugins cover haptics, ads, saving and purchases on both platforms. Android builds run on Linux (here or in GitHub Actions). iOS builds need macOS and Xcode, which a GitHub Actions macOS runner can provide.

### What this means for the game

- **Touch-first controls:** tap, drag to pan, pinch to zoom. No hover states. Respect the safe-area insets around notches and the home bar.
- **Make the web build a proper home-screen web app:** a manifest, icons, full-screen mode, no rubber-band scrolling or double-tap zoom.
- **iOS Safari quirks:** sound only starts after the first tap. The browser has no vibration support, so haptics come from the Capacitor plugin in the real app. Safari can clear saved data for a site that hasn't been opened in a while, so web test builds should offer a save export/import code.
- **Performance:** aim for 60 fps on a mid-range Android phone and an older iPhone. Bake sprites once when the game loads, and cap the number of on-screen characters.

## 21. Tech approach (proposed)

- **Pipeline:** JavaScript and esbuild produce a single-file web build (the HTML test link). Capacitor wraps that build as the Android app, and later the iOS app.
- **Rendering (2D):**
  - Canvas 2D (or PixiJS if crowds get big) in the 3/4 projection.
  - Vector art is drawn by code into cached sprites at the device's pixel density.
  - Painter's-order sorting by each object's base row.
- **Rendering (3D, if chosen instead):** three.js with an orthographic camera and toon materials.
- **Audio:** muzak and sound effects synthesized with WebAudio, so there are no asset files.
- **Simulation:** runs on a fixed tick, separate from rendering. Customers find their way with grid pathfinding, using a cached flow field toward each store entrance.
- **Save:** JSON in local storage.

## 22. Open questions

1. **Art style:** 2D drawn or 3D low-poly, after looking at the mockup (`mall/mockups/art-styles.html`)?
2. **Orientation:** portrait (one-handed, like Tiny Tower) or landscape (more mall on screen)?
3. **Monetization details:** rewarded ads only, or also a paid Remove Ads option?
4. **Optional rival:** keep Victor Sterling, or keep the story all about Gus and Rose?
5. **Name:** Mall Revival, Sunnyside Mall, Mallville, Tiny Plaza, Second Wind Mall, or something else?
