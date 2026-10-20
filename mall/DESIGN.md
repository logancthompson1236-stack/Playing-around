# Mall Revival: Game Concept

> Concept draft v0.4. Sections marked **Open question** are decisions still to make. Sections marked **Decided** reflect the owner's choices. Everything else is a proposed default that can change.

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
2. **A letter from Grandma Rose,** written before she passed: *"Sweet pea, the mall is yours now. She's tired, and so was I at the end. But she has good bones. Give her a little love and she'll love you back. P.S. If you run into Gus, tell him I said hi."*
3. **A bus ride** out of the city to the small town where you spent your summers as a kid.
4. **Night at the mall.** The sign buzzes with half its letters dead: `SUN Y IDE  ALL`. You're fumbling with Grandma's keys at the front doors when a flashlight beam hits you from inside. An old man in a faded teal work jacket, holding a thermos, says: *"Easy, I'm not a burglar. Name's Gus. Swept these floors for your grandma for twenty-seven years. Still come by to walk my laps."* He looks at the dust and the dark storefronts. *"She'd be glad it's you."*
5. **Character creation:** your name, your look, and the mall's name.
6. **Day 1:** Gus sticks around for the first morning to show you the basics, then heads home: *"I'll drop by. Don't let the pigeons win."*

### Gus

**Who he is.** Gus was the mall's janitor from opening day in 1989 until 2016, when the last big store left and Rose had to let the staff go.

- He was the last person she let go, and she told him to keep his keys.
- He's around seventy-two now, retired, and lives a few blocks away.
- He still wears his old teal work jacket out of habit, and carries a flashlight, a thermos of coffee, and a pocketful of pretzel-cart napkins.
- He's gruff, sweet, proud, and a big softie. He knows every inch of the building and every bit of town gossip, and he hates gum.

**Why he still comes by.** Mostly habit. For twenty-seven years his day started with laps around the concourse, and he never stopped.

- He walks the empty halls and sits at the dry fountain where he and his late wife Marlene ate lunch every day.
- He remembers how loud and bright the place used to be.
- He tells himself he's just checking for leaks.

**A visitor, not an employee.**

- **How often he comes:** at first, about once every 3–4 days. As the mall comes back to life he visits more often, until he's there almost every day (*"Can't stay away from the old girl"*). How often he shows up is a quiet sign of how far the mall has come.
- **What he does there:** walks his laps, chats with customers, and sits by the fountain. Tap him for a one-line comment.
- **He never gets in the way:** Gus never pauses the game or asks for your attention.

**What he does.** Each ability is limited, so he helps without taking over:

| Ability | How it works | Limit |
|---|---|---|
| Old habits | On his laps, he picks up any trash he walks past | Only what's on his path, a few pieces per visit. He never replaces a janitor |
| Town gossip | Reveals one hidden trait on a lease offer: *"That Discount Dan fella? Left boxes stacked to the ceiling at his last place."* | Once per visit, and only on days he came by |
| Memories | After you find an old Polaroid or restore a place he remembers, he stays after closing to tell you about it | At most one per night. Skippable, and it waits until you're ready |
| Gus's Notebook | His old handwritten notebook of mall tips, which he gives you on night 1. It's where the tutorial tips live (see section 11) | One tip at a time, only when a mechanic first comes up |
| A good word | At level 3 he recommends your first janitor, Dee, who he trained back in 2004. Dee starts out a little faster than a normal hire | Once |

**Keeper of the scrapbook.** Restoring parts of the mall turns up old Polaroids and 90s relics, like a mixtape, a virtual pet keychain, or a movie poster. They go in Gus's scrapbook, and many of them unlock retro decor.

### Story pacing: Gus's memories

**The rule:** story never interrupts the day.

- Gus's memories happen only after closing, and only on days he visited.
- When he has a story, a small speech-bubble icon sits over him during the day. After the report card he's waiting by the fountain.
- Tap to hear it (3–6 lines) or skip it. A memory you skip waits for his next visit.
- Memories are triggered by restoration milestones, so story progress is literally tied to bringing places back.

| Trigger | Memory | Reward |
|---|---|---|
| Night 1 | Why he still comes by: his laps, Marlene, and the keys Rose let him keep | Gus's Notebook |
| Reach level 3 | *"You need a real janitor, and my knees aren't what they were."* He recommends Dee | Dee joins as your first janitor |
| Restore the fountain | Rose tossed a penny in every morning "for one more good day." He and Marlene ate lunch on its edge for twenty years | **Daily Wish:** toss a coin each morning for a small random boost |
| Open an arcade | Gus has held the high score on *Galaxy Pals* since 1994. Soon after, a teen beats it. Gus sulks through his next visit, then you catch him coaching the kid | Retro arcade cabinet decor |
| Upgrade Pretzel Pals to ★3 | The recipe was Marlene's. He met her in line at that cart in 1990 | **Marlene's Cinnamon Twist:** a premium Pretzel Pals product |
| Each wing restored | A memory about what used to be there. For example, the 1993 snow day when half the town slept in the mall, or the record store where your parent had their first job | A Polaroid and a decor piece |
| Reach 4★ | Rose's old ledger, full of her notes on running the mall. Gus has kept it in his garage since 2016 | A small permanent bonus |
| Reach Mega Mall (finale) | Gus leads you to the fountain. Underneath is a time capsule he and Rose buried on opening day, "to open when the mall is full again." Inside is a letter from young Rose to whoever kept her mall alive. Then Gus asks, a little embarrassed, whether you'd have him back on Saturdays | The original neon sign is relit. Gus works Saturdays as Head Janitor (semi-retired) |

The arc follows the game's theme: Gus left when the mall died, and the mall coming back gives him a reason to come back too.

### Saved for later: a rival

A developer who wants to bulldoze the mall for condos and mails smug buyout offers you can tear up. This is parked for a future update.

## 4. Camera and art direction

**Orientation: landscape (Decided).** You see more of the mall at once, and since the mall grows outward, the extra width matters.

- **Top bar:** the clock with a small foot-traffic curve, money, and Mall Rating.
- **Bottom right, under the thumb:** Build, Stores, Staff and Mailbox buttons.
- **Menus slide in as a side panel,** so the mall stays visible behind them.
- **Phone shapes:** design for widescreen phones (16:9 up to about 20:9) and keep clear of the notch and rounded corners.

**Camera:** a **3/4 top-down view**, the Stardew Valley angle. You see the floor from above and the fronts of walls, people and props.

- Controls: pinch to zoom, drag to pan.
- **Cutaway interior:** there's no roof, and walls facing the camera are drawn as low knee walls, so you can see into every store.

**Art style: 2D drawn (Decided).** Clean vector cartoon art: bold outlines, flat colors and one shade tone, drawn in code and baked into sprites when the game loads.

- **Upsides:** it's sharp at any screen size, a tiny download, and consistent.
- **Art stays swappable:** every sprite is keyed by name, so a human artist's work can replace any piece later without touching gameplay.
- **Reference:** `mall/mockups/art-styles.html` shows the look. The mockup is portrait, but the game is landscape.

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
                  maybe a Gus memory    → "Open Doors"
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
  - Two traits: one visible, and one hidden (?) until they've been open a few days or Gus's gossip reveals it
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
- **Ask Gus:** on a day he visits, and at most once a week, he has a word with them. It settles a feud or finds out what's going on.
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

## 11. Tutorials: Gus's Notebook (Decided: gradual)

Each mechanic is taught when it first matters, never all up front.

**Day 1 teaches only the core, by doing,** with Gus beside you:
1. A customer waits at Pretzel Pals. Tap them to ring them up.
2. Someone drops a wrapper. Tap it to clean it up.
3. The doors close and the report card appears, with one line explaining each row.

That's all. Building, hiring and leasing wait until they're relevant.

**After Day 1, tips appear just in time.** Each one is a small card in Gus's handwriting, 1–2 sentences long, with an optional **Show me** that highlights the button or spot.

- **When they appear:** a tip shows up only the first time its situation happens.
- **How many:** one at a time, and at most two per day.
- **Never during a rush:** if a lot is going on, the tip waits for a calm moment or for night.
- **Dismissing:** tap anywhere. Every tip is saved in the Notebook to reread later.
- **Turning them off:** a setting turns tips off, and back on.

| First time this happens | Gus's tip |
|---|---|
| First night | *"Nights are for building. Nothing's on the clock till you hit Open Doors."* |
| Enough money to open a store | *"Those boarded-up storefronts can be shops again. Tap Build, pick a store, then tap a glowing storefront."* |
| A customer walks out | *"Folks don't wait forever. Watch the ring around their bubble."* |
| A grey wish bubble | *"Grey means we don't have what they want. The report card keeps a list."* |
| Level 3 | Gus introduces Dee, and the Staff button lights up |
| First lease offer | *"Somebody wants to rent a spot. Flat rent is steady. A cut of sales pays more if they're any good."* |
| First bad-tenant trouble | *"Bob's music is chasing off the neighbors. Send a warning letter, or wait out the lease."* |
| A store outgrows its spot | *"Store needs more room to grow. Move it at night. Moving's free."* |
| First Mall Critic | *"Trench coat and notepad? That's a critic. Keep it clean and be quick."* |
| First rainy day | *"Rain brings folks in, and wet floors. Keep the mop handy."* |

The tips are written in Gus's voice, so they read like advice from a friend, not a manual.

## 12. Staff

| Role | Unlock | What they do | Upgrades |
|---|---|---|---|
| Janitor | Lv3 (Dee, recommended by Gus) | Cleans an assigned zone or patrols the mall | Speed, zone size, mop for spills |
| Clerk | Lv4 (two at first, more as you level) | Staffs one of your stores' registers; faster and better at selling in their dream store | Checkout speed, upselling |
| Stocker | Lv10 | Carries boxes out to any store running low and restocks it during the day | Speed |
| Greeter | Lv12 | Says hi at the door: shoppers start a little happier and wait longer in line | Warmth |
| Mascot | Lv15 | Sunny, a walking sun costume: draws more visitors and cheers up anyone nearby | Pep |
| Security Guard | Later | Catches shoplifters and settles rowdy teens | Patrol radius |
| Handyman | Later | Fixes breakdowns | Speed |
| Mall Manager | Later | Handles nightly restocking and lease renewals automatically | |

- You hire at night from a small pool of applicants that refreshes every day.
- Every applicant is a named character with their own look and a **dream job** (another nod to Tiny Tower). Putting someone in their dream job makes them faster and happier.
- Staff earn a daily wage. Your level sets how many staff you can have.
- Staff only work in your own stores. Tenants bring their own.

## 13. Day/night and the report card

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

## 14. Progression

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

## 15. Decor and ambience

Benches, potted palms, trash cans (less littering nearby), fountains (earn coins), skylights, neon signs, coin-op kiddie rides, vending machines, floor tile styles, holiday decorations, scrapbook relics, and a music selector (muzak, jazz or pop, each nudging customer mood slightly). Decor feeds the Ambience rating.

## 16. Events

- **Weekly rhythm:** busy Saturdays, shorter Sundays.
- **Random days:** rain (more visitors and wet-floor spills), a school field trip (a busload of kids), a power flicker, a Mall Critic visit, a pigeon invasion, a celebrity book signing.
- **Seasonal:** trick-or-treating at stores for Halloween, a Santa photo booth in winter, back-to-school, summer sales.
- **Player-hosted (later):** pay to throw a Sale Day or an atrium concert.

## 17. Away earnings (Decided)

- Days only advance while you play. Your own stores are closed while you're away.
- **Tenants keep paying a trickle:** about one-tenth of a day's tenant rent per hour away. It's capped at one day's worth no matter how long you're gone, and the cap is reached after about 10 hours.
- **On return,** a welcome-back card shows what came in: *"Rent while you were away: $340."*
- **Nothing bad happens while you're away:** no decay and no lost tenants.

## 18. Monetization (later, light)

Leaning toward a small amount of ads. Nothing is final.

- **Design rule now:** the economy has to feel complete with no ads at all. Ads only add optional bonuses.
- **Preferred format: opt-in rewarded ads** at natural pauses, like the report card or the mailbox. For example: *"Watch to double today's tenant rent," "Watch for a free restock," "Watch for one more lease offer."*
- **No ads during the day.** If interstitial ads are ever used, they'd come only between days, rarely, and a one-time **Remove Ads** purchase would turn them off.
- **Possible later purchases:** cosmetic decor packs. No pay-to-win and no energy timers.
- **Tech:** AdMob through a Capacitor plugin.

## 19. Multiplayer (later, but planned for now)

- **Visit a friend's mall:** load a snapshot of their layout, decor and ratings, and watch it run locally with simulated customers. Leave a like or send a gift (a shopper, a piece of decor).
- **Leaderboards:** mall rating, daily visitors, best day grade streak.
- **What this means for the code now:** keep the whole mall as plain serializable data (the grid plus entities), and keep the simulation separate from rendering. Saves go to local storage first. A backend added later only needs to store and fetch snapshots.

## 20. Scope plan

**Milestone 1: playable prototype (v0.1.0, built).** The goal is to find out whether one hands-on day is fun for 5 minutes.

v0.1.0 notes:
- **Stores:** 8 store types unlock across levels 1–6. Sweet Tooth is available from level 1 and Bean There at level 2, so the first night has something affordable to open.
- **Gus:** his visits, the first memories and the scrapbook text are already in, ahead of Milestone 2.
- **Not yet:** leasing and tenants.
- **Tuning:** the live numbers are in `mall/web/src/config.js`. The catalog table above is the long-term plan.

v0.2.0 changes, from playtest feedback:
- **Pacing:** days are 3 minutes, and prices are up about 35% while shoppers per minute stay about the same.
- **Litter:** a quarter of the old rate. Trash is drawn bigger, with a different item for each store (cups, bags, wrappers, cans, popcorn, banana peels), and flies show up on trash that's been sitting a while.
- **Trash cans:** most shoppers inside a can's range visibly toss their trash in.
- **Level ups:** they show exactly what you unlocked, at the top of the report card or in a popup at night.
- **Hiring:** the first night you can hire, Gus stops by, recommends Dee and walks you through the Staff screen.
- **Reset save:** on the pause screen, with a warning.

v0.3.0 changes, from playtest feedback:
- **Pacing:** days are 2½ minutes, with shoppers scaled down to match so each day earns about the same.
- **Routing:** clerks and the owner walk in through the store door and around the counter instead of cutting through walls.
- **Litter:** trash only lands in the open lanes, never on tiles hidden behind storefronts, kiosks, plants or signs.
- **Tips:** a queued tip is dropped if it no longer applies (no more "Open a store" after you've opened one).
- **Gus's dialog** sits higher, clear of the HUD buttons.
- **Hiring:** staff unlocked by a level up at night can be hired right away. Clerks unlock at level 4 with room for two, then one more per level (up to 6 at level 8). Janitors go 1 → 2 → 3 at levels 3, 5 and 7.

v0.4.0 changes, from playtest feedback:
- **Opening a store is one step:** pick a store under Build and every empty or boarded-up storefront it fits in lights up with its price. Tap one, then Open. Fixing up a boarded-up unit is part of the price, so there's no separate renovate step. Tapping a boarded-up storefront in the mall lists the stores that fit, the same way.
- **Storage clears as you build:** Build new puts up a storefront anywhere. If it lands on dusty storage, clearing that room is added to the price (shown before you confirm). Storage can still be cleared on its own from Fix up.
- **Tips:** "Fix up a unit", "Open a store" and "Storage rooms" are replaced by one "Opening a store" tip that only shows until you've opened a store, plus an "Out of storefronts" tip once every storefront is taken.
- **Prices you can't afford** are greyed out, and the bar says how much you need.

v0.5.0 changes, from playtest feedback:
- **Same-size storefronts:** a store only opens in a storefront of exactly its size (Sweet Tooth lights up only the 2×2s), so there's one clear price.
- **Store counts:** the store lists show how many of each you already have.
- **Staff stars:** every applicant has a 1–3 star rating. More stars means faster work and a higher wage (janitors $28/$36/$46, clerks $36/$46/$58 a day).
- **Dream jobs:** each clerk has a dream store, shown before you hire them. Working it, they check out 20% faster and customers spend 15% more. Hiring puts them there if it's free, and the register picker marks it with ♥.
- **Janitors:** slower, and they only notice trash within about 7 tiles. With two or more, each patrols their own slice of the mall, so a second janitor pays off in a busy mall. Dee is a 3-star janitor.
- **Story fixes:** Gus holds a real flashlight in the intro and sweeps it around, and on Day 1 he stands off to the side so the first customer walks past him, not through him.

v0.6.0 changes:
- **Levels 9–18:** the XP needed grows each level (5,600 for level 9, up to 57,000 for level 18). The balance bot gets there around day 37–40, a new level every two or three days.
- **Three new stores:** Scoops (ice cream kiosk, level 9), Mixtape Music (2×3 record store, level 11, teens love it) and Gadget Galaxy (3×3 electronics, level 14, the priciest goods in the mall).
- **Three new staff roles:** Stocker (level 10), Greeter (level 12) and Mascot (level 15), each rated 1–3 stars like the others. Janitor and clerk limits keep growing to 6 and 12.
- **Seven new decorations:** Flower planter and Lamp post (level 9, the lamp glows in the evening), Soda machine (10), Comfy sofa (11), Kiddie ride (12), Gumball machine and Mall directory (13). The machines earn a little money from shoppers (shown as "Machines" on the report card), and the directory gives shoppers more stores to visit.
- **Rotating decor:** benches, sofas, planters, machines and the directory can face four ways. Use Rotate while placing, or tap a placed piece and Rotate to turn it where it stands. Seats are sat on facing the right way.
- **Bigger malls:** each store past the tenth adds a bit less traffic than the first ten.

v0.6.1: leaving the app (home button, app switcher, screen off, a call) pauses the day and the sound. You come back to the Paused menu.

v0.7.0 changes, from playtest feedback:
- **Pausing in the background, for real:** the Android app now pauses the web view itself when you leave (Capacitor kept it running), and the game also comes back paused if it notices it was frozen.
- **Staff stars matter:** one-star staff take phone breaks every 35–60 seconds of work (about 24 seconds each), two-stars every two or three minutes (about 14 seconds), three-stars never. A clerk on break stops ringing people up; a janitor stops sweeping. Tap the phone bubble and the owner walks over and gets them back to work; otherwise the break runs out on its own.
- **Restrooms:** every mall has a set (the old 2×2 by the pretzel cart in new games; older saves convert a spare 2×2 or get one on open floor). Shoppers stop in, and each visit adds grime: flies at 30%, a tappable bubble at 50%. A grubby restroom upsets the people who use it and drags down Cleanliness. Janitors mop it first once it passes 40%; you can tap it to mop it yourself. The night crew leaves it spotless.
- **Expansions:** the East Wing ($20,000, level 8) reopens 12 more columns east of the old building with five spaced-out storefronts, a second set of restrooms and a little decor. The Garden Court ($45,000, level 13, after the East Wing) adds 10 more columns with a grass court, shade trees and four storefronts. Each wing adds $120 a day to utilities. Find them under Build → Fix up.
- **Gus suggests it:** the first night you can afford each wing, Gus stops by to talk about the old east wing (and Rose's garden), and the Build button lights up.
- **Shoppers show what they did:** they walk out holding what they bought (a cone, coffee, a pretzel, a lollipop, a book, a record, a gadget box, an arcade plush, or a shopping bag), drink the soda they bought, blow gum bubbles, play the arcade cabinets before buying, and kids ride the kiddie ride while the grown-up waits.
- **New decor:** the Shade tree (level 13).
- **Economy:** breaks, restrooms, wing utilities and the expansion costs keep late-game money in check. The balance bot now has about $12,000 on day 40 (it had $81,000 in v0.6.0) and reaches level 18 around day 35–41.

v0.8.0 changes, from playtest feedback:
- **New floor plan:** the starting building is 30×17 (was 26×15) with a four-row concourse, storefronts grouped side by side, and a small open alcove next to the restrooms. Older saves get remodeled automatically: stores move to storefronts of the same size (or get a new one on cleared floor), clerks stay with their stores, and decorations are refunded so they can be placed again.
- **Real restrooms:** 4×3, with three stalls (toilet, partitions, a door that shuts with a red light when someone's in) and two sinks. Shoppers take a free stall, then wash their hands on the way out; if every stall is taken they wait by the door for up to 12 seconds.
- **Supervisor (level 14):** walks from storefront to storefront, spots anyone on their phone within 4–6 tiles and gets them back to work. Staff near a supervisor work 18% faster and take breaks half as often. Up to two by level 17.
- **One-star staff are slower:** clerks take 2.5 seconds per checkout (two-stars 1.5), one-star janitors walk and sweep slower, one-star stockers are slower too.
- **Smaller crowds later on:** from level 4 to level 12, the crowd a mall draws tapers to 20% below what it was. Early days are unchanged.
- **Bigger East Wing:** 16 columns (was 12) with two big 5×4 plots, four storefronts and its own 4×3 restrooms. The Garden Court has a third big plot.
- **Attractions:** Starlight Cinema (level 12, $12,000) and Bounce Zone (level 15, $15,000) need a 5×4 plot. Tickets come from a machine at the door; there are 8 cinema seats and 6 trampolines, and a line forms outside when it's full (people give up if they wait too long). Cinema-goers sit facing an animated screen; jumpers bounce. Upkeep is $160 and $130 a day.
- **Pacing:** levels 10–18 need less XP to make up for the smaller crowds. The balance bot reaches level 18 around day 38–42 and opens the East Wing around day 42, with money staying tight rather than piling up.
- **Room to grow:** the map now reserves 58 columns for wings, so more expansions can be added later.

v0.9.0 changes, from playtest feedback:
- **Toilets look like toilets:** each stall has a tank, seat and bowl, and its door now stays open until the shopper has stepped inside, then shuts behind them.
- **Closing-time freeze fixed:** a v0.8.0 rewrite had dropped the code that walks shoppers out of the mall, so anyone who finished shopping froze in place (most visible at closing). They walk out again, and big malls get a little more closing time so far-off shoppers make it to the doors.
- **Claw machine (level 6, $350):** shoppers pay $2–3 for a try and win about a third of the time. Winners walk off hugging a random plush (bear, bunny, duck, alien or dino).
- **Kids play:** they rock on the kiddie ride (it tilts and its lights blink), bounce in the Bounce Zone, and play at the arcade cabinets and claw machine while the grown-up waits.
- **Supervisor from level 5, toned down:** one supervisor at level 5, two from level 12, with wages of $48/$62/$80 by stars. Staff within 3–5 tiles work 5–13% faster and take breaks a quarter less often (it was 18% faster and half as many breaks). They still walk the mall and get people off their phones.
- **More window shopping later on:** from level 8 to level 18, shoppers get up to 25% less likely to buy on a given visit, and browsers (who mostly look) make up more of the crowd.
- **Stricter report card:** cleanliness counts trash and restroom grime harder, service punishes waits more, variety needs more kinds of stores, and ambience needs more decor. Grades need 4.7 for S, 4.1 for A, 3.3 for B and 2.4 for C, and the star display rounds down, so five stars takes a really well run mall. The balance bot tops out around 4.3.
- **Mall styles (level 10):** Build → Style has five new wallpapers (Retro Wave, Sunset Plaza, Greenhouse, Art Deco, Modern Luxe) and five new concourse floors (Diner Checker, Terracotta Tile, Garden Flagstone, Herringbone Oak, Marble Hall), from $1,200 to $4,000, plus the original lilac and terrazzo. Tap one to see it on your mall, tap Next to flip through the rest, then Buy (or Use it for one you already own). Styles add to ambience and give a little XP the first time you buy one. The camera can now scroll a bit higher so the back wall shows clear of the top bar.
- **Polish (from a visual QA pass):**
  - Store signs on the back wall draw above tall shelves and arcade cabinets, the record store's posters moved off its sign, and neon names (Pixel Palace, Starlight Cinema) sit on a dark plate so they read in daylight.
  - Gus's notebook no longer breaks once he's suggested a wing.
  - People waiting for a stall each get their own spot (the doorway, two inside, then outside along the front) instead of piling onto one point.
  - Janitors and the owner mop inside the restroom instead of on the concourse.
  - Restrooms with the door facing up draw washers in front of the sinks, and every stall has a rail with a red or green light.
  - Claw machine players face the machine.
  - In a long line, only the first two show a bubble (plus anyone about to give up).
  - Shoppers spread out across the doors as they leave.
  - The placement bar no longer covers the Settings button.
  - Placing decor zooms in a little.
  - The report's Continue button stays visible when a level-up makes the sheet scroll.
  - The title's tagline lost its doubled shadow.
- **Pacing:** the balance bot reaches level 7 around day 11–12 (same as v0.8.0) and level 16–17 by day 43, with money staying tight.

v0.10.0 changes (art and animation polish):
- **Stores look like what they sell.** Each store has its own wallpaper, a wall piece (a giant lollipop, chalkboard menu, READ poster, dog poster, guitar, mirror, $1 tag, prize shelf, SALE screen), a sign with its icon, a counter in its colors with a real cash register, and its own furniture: candy gravity bins and a pick'n'mix barrel, an espresso machine and pastry case, fish tanks with swimming fish and bubbles, a clothes rail of shirts and a mannequin in a dress, a full bookcase and a NEW table, record crates and a listening station, a TV wall, arcade cabinets with marquees, and a SALE bargain bin.
- **Signs are never covered.** Back-wall signs draw after shelves and wall pieces, wide stores hang their wall piece beside the sign (above the clerk), and signs over storefronts that face up draw after people. Small signs on light colors use dark text.
- **Decor:** a proper mall trash can, slatted benches with metal arms, a cushioned sofa, a POP! soda machine that drops a can into its tray, padded cinema seats with armrests, and bigger kiosk signs with icon toppers and a pretzel rack.
- **Animation:** a fuller walk cycle (legs lift and swing, arms swing, a little sway), breathing and blinking when standing, a seated pose on benches, sofas, the fountain rim and cinema seats (side-facing seats show the legs to the side; kids sit beside their grown-up), sipping drinks and licking cones every few seconds, pressing the soda machine's buttons (standing by the buttons so the can drop shows), shadows that stay on the trampoline while jumpers fly up.
- **Economy:** foot traffic and store prices are both up 5%. The balance bot reaches level 18 around day 43–44 with higher daily profits.
- **Fixes from a player bot's playthrough:** shoppers no longer walk in place in a store's doorway on their way to a spot in line; a kiosk can't go where its line would block the mall doors or a storefront; on level-up nights the report shows the day's numbers first and the unlocks after; Open Doors says when Gus is still talking instead of doing nothing; rotating a piece of decor slides it to the nearest spot that works; the report says "Sales rung up · lost" (they count sales, not people); fast-forward is available from Day 2.

v0.11.0 changes, from playtest feedback:
- **A gentler start:** on the first night Gus walks you through hiring your first two clerks (they can be hired from night 1 now, at $28/$38/$50 a day by stars). Opening a second store is a Day 2 thing: Gus stops by on night 2 to suggest it, and the "open a store" tip waits until then. Fast-forward is available from Day 2.
- **Faster early levels:** levels 2–10 need about 15% less XP. Levels 11–18 need about 10% more, because the five new stores add XP and traffic; the balance bot still reaches level 18 around day 37–45.
- **Five new stores:** Toy Chest (3×3, level 6: toy shelves, a giant teddy, a toy train), Scent-sational (2×2, level 7: glass shelves of perfume, testers, an arched mirror), Level Up Games (2×3, level 8: a wall of games and a demo station), Sole Mates (2×3, level 9: shoe shelves, a try-on bench), and Big Bite Burgers (3×3, level 10: a kitchen with a grill and fryer, a lit menu board). At the burger place shoppers take a stool at one of the tables and eat before heading out (takeout when the tables are full). Each new store has its own take-home item.
- **Troublemakers (level 10+):** one to four rowdy teens a day wander in with a boombox. They blast music (shoppers nearby get upset and some leave in a huff) or kick over a trash can. Tap one (or its angry bubble) and the owner shoos them out. Acting up costs the day's ambience, and the report counts them.
- **Security guard (level 10):** the first night after troublemakers show up, Gus stops by to talk security. Guards walk the storefronts and walk troublemakers out of the mall within 4–6 tiles. One guard at level 10, two from level 14.
- **Restrooms, redone:** each stall has one cute toilet (tank, bowl and pedestal in a single shape). The door swings open when the stall is free and closes once someone's inside, with a red tab and the toilet's tank peeking over. Restrooms with the door facing up show the toilets from behind.
- **Mall styles by level:** each wallpaper and floor unlocks at its own milestone (levels 10 to 18) and costs more the later it comes ($1,200 to $6,000). Level-up screens list each one.
- **Side profiles:** people on side-facing benches, sofas and diner stools, and at side-facing soda machines, are drawn in profile, with one eye, a nose and their legs out to the side.
- **Bigger take-home items:** pretzels (and the new items) are about twice as big, so you can see what everyone bought.

v0.12.0 changes, from playtest feedback:
- **A second floor instead of the East Wing:** the expansions are now upstairs. The Second Floor ($20,000, level 8) and the Sky Garden at its far end ($45,000, level 13, under a glass roof) have the same plots, storefronts and restrooms the East Wing and Garden Court had. An escalator at the east end of the ground floor's concourse links them: shoppers and staff ride up the belt and come up out of a stairwell upstairs (and back down). A 2F/1F button switches floors, with a red dot when the other floor has a shopper about to give up, a troublemaker or a filthy restroom. Gus's two expansion scenes now talk about the second floor.
  - Under the hood both floors share one tile grid: the ground floor is columns 0–29, the second floor starts at column 40, and the empty columns between keep them from ever reaching each other. The landings are linked in pathfinding, so a walk to anywhere upstairs goes through the escalator.
  - Older saves: everything built in the East Wing or Garden Court moves upstairs untouched. Anything that was where the escalator goes (or blocking its front) moves to the nearest free spot on the same floor; only what can't fit anywhere is refunded. A one-time note explains the move.
- **Less lag:** the renderer only draws the floor on screen, only copies the visible part of the cached floor, and skips everything off screen (stores, decor, people, signs, lighting, bubbles). On a late-game save drawing went from about 24 ms to 4 ms a frame (headless, no GPU). The simulation itself costs under 1 ms, so both floors keep running at full detail.
- **Levels 19–28:** XP per level grows from about 5,600 to 10,100 (level 28 at 120,900). Every level adds staff slots and something new:
  - Top Dog hot dog stand (kiosk, level 19: a roller grill and condiments) and Slice Society pizzeria (3×3, level 22: brick oven, sit-down tables like the burger place).
  - Decor: topiary bunny (19), photo booth (20, coin-op: they step in, the curtain closes, flashes, and they come out holding a photo strip), aquarium (21), massage chair (23, coin-op: they sit and buzz), grand piano (25, plays itself) and flower arch (27).
  - Wallpapers Candy Stripe (19), Starry Night (21), Tropical Leaves (24), Golden Gala (27); floors Rainbow Mosaic (20), Starlight Carpet (23), Bamboo Deck (26), Gold Terrazzo (28). Prices run $6,500 to $14,000.
- **Kids play area (level 15):** a 3×2 soft-play with a slide and a ball pit. Families passing one usually stop; the kid goes down the slide or dives into the balls while the grown-up waits out front. Up to three kids at once. Free, and a nice mood boost.
- **Fewer late-game shoppers:** from level 12 to 18 the crowd shrinks by up to 15%, and stays that way. The balance bot reaches level 18 around day 45 and level 28 around day 80–85.
- **Two greeters** from level 20 (one each side of the door), more guards, mascots and supervisors at the new levels.

v0.13.0 changes, from playtest feedback:
- **Placement fix:** placing or moving something no longer fails with "would block the way to the restrooms" (or any store) when that place was already out of reach. Only what the new piece itself would cut off counts. On load (and when opening the second floor) the game also repairs anything nobody can reach, which could happen when the East Wing became a separate floor or the escalator closed off a corner: it moves the decor that walls it off, or failing that the stranded piece, to the nearest spot that works. Nothing is removed.
- **No more walking through walls:** wandering staff, troublemakers, seats and machines only use spots you can actually walk to, and nobody ever cuts across the gap between floors. At closing, upstairs shoppers ride the escalator down.
- **Closing time:** shoppers wrap up and leave over about five seconds instead of all at once, at a steadier pace, each with their own path through the hallway (people now walk in their own lane across each tile all day), so the crowd flows out instead of forming one squashed file.
- **Escalator:** on the ground floor riders appear partway up the belt and fade in, instead of sliding out of the dark at the top; the 2F sign sits above the bulkhead.
- **Staff panel:** tabs for All and each role you can hire, with the team grouped by role (best first) and applicants filtered to the role you're looking at.
- **Levels 29–35:** balloon cart (29, kids get a balloon), wishing fountain (30), arcade cabinet (32), bubble machine (33), koi pond (34); wallpapers Cherry Blossom (30), Ocean Waves (33), Crystal Palace (35); floors Seaside Tile (31), Royal Carpet (34), Crystal Marble (35). More staff slots each level. The balance bot reaches level 28 around day 85 and level 35 around day 115.
- **Evening light:** the end-of-day wash is about half as strong (warm gold turning to dusk) and stores start to glow from 7 PM, so the mall stays easy to see. Night mode is a little lighter too.

v0.14.0 changes, from playtest feedback:
- **Six more stores:** Leaf & Bloom plant shop (2×2, level 13: stepped plant stands; shoppers carry home a potted plant), Sparkle Jewelers (2×3, level 16: velvet display cabinets, the priciest goods in the mall), Boba Bliss (kiosk, level 20: tea dispensers; boba to sip), Virtual Voyage (3×3, level 25: a big game screen and glowing play pads; shoppers try a headset on before buying), Bake My Day bakery (2×2, level 28: a pastry case and an oven; cupcakes to go) and Comic Vault (2×3, level 31: racks of comics, covers out).
- **Store unlocks spread to level 35:** new stores now arrive at levels 13, 16, 18 (Top Dog, moved from 19), 20, 22, 25, 28 and 31, so there's a new store every two or three levels after 12.
- **Plenty of clerks:** the clerk limit now grows by one every level (3 at level 3, 10 at level 10, 35 at level 35), and the Staff panel offers enough clerk applicants to staff every register still without one (three at least, up to eight a day).
- **Pacing:** with every store staffed, service stays near 5 stars and walkouts almost vanish. The XP for levels 29–35 went up a little (level 35 at 232,000) so the last stretch doesn't fly by. The balance bot (now hiring a clerk for every register from level 8) reaches level 18 around day 45–48, 28 around day 80 and 35 around day 105–110.

v0.15.0 changes, from playtest feedback:
- **A third floor: the Lucky Star Casino** (level 30, $50,000, after the Second Floor). The first night you can afford it, Gus walks the whole mall, marvels at how far it's come, and tells you about the old Starlight Ballroom upstairs. A second escalator on the second floor goes up to it. The casino has its own look whatever style the rest of the mall uses: red velvet walls in gold frames with a marquee of bulbs, a busy gold-and-teal casino carpet, and the city at night (neon and lit windows) below the railing. It comes with five slot machines, a neon CASINO sign, velvet ropes, a Chip Cage (open from day one), lots for more stores and its own restrooms. The **High Roller Suite** (level 42, $120,000) extends it with gold carpet, golden slots and a champagne tower.
  - Under the hood floors are now general: floor 3 starts at grid column 80, escalators come in linked pairs (a rising end with a bulkhead, a sinking end with a stairwell), and paths run through both rides. The floor buttons are now ▲ / 3F / ▼, each with a dot when a floor that way needs you.
- **Casino games** (casino floor only), each with its own animation:
  - Slot machines (30) and golden slots (47): the player pulls the lever, the reels spin and land; on a win the window flashes, "7 7 7!" pops up and they cheer.
  - Table games run by a **dealer** (new role at 30; tables show CLOSED without one): blackjack (32: players sit, cards come out one by one, chips slide over on a win), roulette (36: the wheel and ball spin while players lean in to place chips), poker (38: players hold their cards, the pot grows, the flop and turn come out) and craps (41: the shooter throws, the dice tumble across, the rest cheer). Three seats each; the house takes the bets and now and then a player wins big ("WIN!", sparkles, arms up).
  - Prize wheel (44): anyone can spin it, kids included; it spins up and slows to a stop.
- **Casino decor:** neon sign (34), velvet rope (37), jackpot board with a climbing counter (40), golden dice (43), champagne tower (45). **Casino stores:** Chip Cage (30), Neon Lounge (39, sit-down drinks), Lucky Charms gift shop (46). **Casino host** (40) works the floor cheering players on. **High rollers** start showing up once the casino opens: big spenders in suits and gold chains who play two games.
- **Levels 36–50**, each with something casino-related or new styles (Neon Nights wallpaper at 48, Starburst Tile floor at 49), and more staff room every level: clerks keep growing (about 61 by level 50), up to 14 dealers. The balance bot buys the casino around day 120 and reaches level 50 around day 170.
- **Stockers are gone:** the role was hardly needed. Existing stockers become clerks at a register that needs one, and clerks now top up their own store from the back when it runs low and no one's in line (at restocking prices).

v0.15.1: **offline web build and an iPhone install tip.** The web build registers a small service worker (`web/sw.js`, published next to the page on GitHub Pages). It's network first, so a connection always gets the newest version, and offline the last copy that loaded opens, save and all (the whole game is one page; saves are in localStorage). On an iPhone or iPad in Safari, the title screen shows a one-time card: Share, then Add to Home Screen. Neither runs in the Android app or the claude.ai backup link.

Milestone 1 scope:
- One floor, free-form unit placement, renovating derelict units, 6 store types
- Owner tap-to-task, trash, register queues
- Janitor and clerk hiring
- Day/night cycle and the report card
- Levels 1–8, local save, first-pass 2D art, landscape layout
- The Day 1 tutorial and the first few notebook tips
- The test build pipeline: an HTML link plus an APK for every version

**Milestone 2: content and feel.**
- About 15 store types with size upgrades, decor, all customer types, wishes
- Leasing: the mailbox, tenant cards, traits, buy-out and hand-off
- Wing restoration, goals, Gus's visits, memories and scrapbook, the rest of the notebook tips
- The intro, art pass, sound and music

**Milestone 3: shippable 1.0.**
- 30 levels, land expansion, food court, second floor
- Events, away earnings, rewarded ads, balance pass
- Settings, Android release, store page assets

**Later:**
- iOS release (via Capacitor)
- Friend visits and leaderboards, seasonal events
- A third floor, animal characters, and the rival developer
- A prestige mode: open a second mall in a new town

## 21. Platforms and test builds (Decided: Android first, iOS later)

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

- **Landscape only:** the app locks to landscape. The HTML test link shows a "rotate your phone" card in portrait.
- **Touch-first controls:** tap, drag to pan, pinch to zoom. No hover states. Respect the safe-area insets around notches and the home bar.
- **Make the web build a proper home-screen web app:** a manifest, icons, full-screen mode, no rubber-band scrolling or double-tap zoom.
- **iOS Safari quirks:** sound only starts after the first tap. The browser has no vibration support, so haptics come from the Capacitor plugin in the real app. Safari can clear saved data for a site that hasn't been opened in a while, so web test builds should offer a save export/import code.
- **Performance:** aim for 60 fps on a mid-range Android phone and an older iPhone. Bake sprites once when the game loads, and cap the number of on-screen characters.

## 22. Tech approach (proposed)

- **Pipeline:** JavaScript and esbuild produce a single-file web build (the HTML test link). Capacitor wraps that build as the Android app, and later the iOS app.
- **Rendering (2D):**
  - Canvas 2D (or PixiJS if crowds get big) in the 3/4 projection.
  - Vector art is drawn by code into cached sprites at the device's pixel density.
  - Painter's-order sorting by each object's base row.
- **Rendering (3D, if chosen instead):** three.js with an orthographic camera and toon materials.
- **Audio:** muzak and sound effects synthesized with WebAudio, so there are no asset files.
- **Simulation:** runs on a fixed tick, separate from rendering. Customers find their way with grid pathfinding, using a cached flow field toward each store entrance.
- **Save:** JSON in local storage.

## 23. Open questions

1. **Monetization details:** rewarded ads only, or also a paid Remove Ads option?
2. **Day length:** is about 5 minutes per day right? This is easy to tune once the prototype is playable.
3. **Final name:** *Mall Revival* for now. Revisit before the store listing.

v0.16.0, from playtest feedback:
- **Diner families sit together.** At Big Bite Burgers a family takes a whole table: the grown-up on one stool, the kid on the stool across from them (no more kids on the floor).
- **Paws & Claws** has a puppy in the play pen instead of the bouncing duck. **Threads'** tee table is sorted on its own, so shoppers walk in front of and behind it properly, and they don't browse from inside it.
- **Walkouts** get an early tip: customers who wait too long get frustrated and leave.
- **Closing:** service progress bars clear when the doors close.
- **Clerks:** clerks without a register take newly opened or empty stores and stands on their own (dream store first), at night after any change and at the start of each night and day. At night, any store or stand still without a clerk puts out a Help Wanted sandwich board.
- **Casino swings:** table wins pay the player out of the house (most hands the house keeps the bet; about 1 in 3 the player wins 0.8× and 1 in 20 wins 2.5×), and slot jackpots pay 3×. The house edge stays positive overall, but a run of big winners can sink a day's casino take below zero, never more than $2,500 (past that, wins push). The report shows the casino line in red on those days.
- **Playground redone.** A colorful slide tower (blue cabin, ladder up the front, striped roof, pennant) with a wide orange chute and yellow rails at the back left; the ball pit moved to the back right, clear of the slide's mouth. Slide kids walk in from their grown-up, climb the ladder, slide down, run around to the ladder and go again, and always finish at the bottom of the slide before walking back out through the gap in the front rail. Pit kids hop in and out. The routines live in `web/src/play.js`, and a visit lasts as long as the routine.
- **Moving things** at night: the piece leaves its old spot (shown empty, floor and all) and the whole store, furniture included, follows the drag, drawn solid, so you can see the space you'd gain or lose.

v0.16.1: **a better slide.** The tower sits at the left with the chute running off the side of its deck and curving down to the right (level at the top, steepest in the middle, a flat run-out at the bottom), so it reads as one piece instead of a board leaning on the tower. The chute has side walls, an underside, yellow rail caps, grab bars at the top and a leg under the middle, and is drawn on its own layer (after the pit's near edge). The deck has a guard rail. Pit kids walk around the end of the slide to reach the pit.

v0.16.2: **the Mall Market.** The Build menu is now a full-screen shop in the game's style (cream, chunky outlines, sunburst card art), like a mobile game storefront. Three tabs in the header: Shop, Fix up, Style. Shop items sit on five shelves, Food, Shops, Fun, Decor and Casino, plus All and New (unlocked and not owned yet, with a count badge). Each card shows a big icon over a sunburst in its shelf's color, what kind of thing it is (Store 3×3, Stand, Attraction, Machine, Game table, Decor), New / Own N badges, a short fun pitch, the useful numbers (what it sells for, ambience, rotation, casino floor) and a big price button (green, red when short, a lock and level when locked). Cards scroll sideways (two rows on tall screens); buyable things come first (stores before decor, cheapest first), then what's coming by level. Shelves and pitches live in `web/src/catalog.js`; the store `cat` field is unchanged (the sim still uses Food). Store retail types fold into Shops; entertainment stores (arcade, toys, music, games, comics, VR, attractions) and coin-op/play decor go on Fun.

v0.16.3: tapping an empty or boarded-up storefront and choosing **Open a store here** shows the stores that fit it as full-screen Mall Market cards too (same pitches, badges and price buttons, prices including any fix-up), instead of the old side list.

v0.16.4:
- **Pause menu** no longer has Reset save (it's in Settings → Your save, behind a confirm). Pause shows the mall, day and level, with How to play (a short refresher), Settings and Resume.
- **Settings:** Master, Sound effects and Music volume sliders (0–100, 0 is off; older on/off settings carry over), Notebook tips, Battery saver (draws about 30 frames a second), and Your save: Back up (a copy-and-paste code of the last nightly save, for moving between devices, e.g. Android to iPhone or Safari to the home-screen app), Restore (paste a code, confirm, reload) and Reset save.
- **Mall Market Shop tab:** a type switch (All · Stores & Stands · Decor) and category chips (All · Food · Retail · Fun · Scenery · Casino; only the ones with something in them show). In All, cards are grouped: Not owned yet (buyable things you have none of), then each category (owned, then locked by level), with slim labeled dividers. A category shows Not owned yet / Owned / Coming soon. Shops was renamed Retail; plain decor is Scenery. The New tag now shows only the first time the market (or a storefront's list) opens after something unlocks (`flags.shopSeen`; on first run everything unlocked before the current level counts as seen). The New shelf is gone.

v0.16.5: the Shop tab's type switch is just **Stores & Stands** or **Decor** (no All); switching resets the category to All. The first group is now called **New to you**. **Fix up** lists only what's still to do: cleared storage, the running fountain and open expansions drop off (an all-done message shows when nothing's left).

v0.16.6: **a new title screen** (`web/src/titlescene.js`). The mall from the outside at dusk: a purple-to-orange sky with stars, a crescent moon and drifting pink clouds over the town; a peach building with lit shop windows and awnings, teal pilasters, an ENTRANCE awning, palms in planters, a neon OPEN sign and a pylon sign with your mall's name; a parking lot with stall lines, lamp posts throwing pools of light, parked cars, and cars cruising past with their headlights on. The big MALL REVIVAL sign over the entrance flickers on one letter at a time with marquee bulbs chasing around it, then the yellow tagline lights up, and now and then one letter sputters like real neon. Shoppers walk between the cars and the doors (leaving with bags), and the sliding doors open whenever someone's close, showing the bright mall inside. Continue or New game slides the doors open and pushes the camera through them into warm white, then the game (or the intro) fades in. The scene runs on its own canvas (the mall isn't drawn underneath while it's up), caches its still layers, and is thrown away once you're in.

v0.16.7, title screen polish: shoppers heading home walk up to the driver's side of their car, the door swings open, they climb in, it shuts and the lights blink; arriving shoppers climb out the same way and walk to the mall (front row of the lot). The street lamps stand along the front of the sidewalk, not in the lot, with light pools on the pavement. Parked cars are redrawn in the game's top-down-and-in-front view: roof, rear window sloping toward us, trunk, taillights, bumper and plate on the near end (headlights and grille for the cars facing us), wheels at the corners, mirrors, and a driver's door that opens.

v0.16.8: on the title screen the bushes moved from the curb to a row along the foot of the building, under the shop windows, with a few flowers.

v0.16.9: title screen bushes are taller and snug against the wall: clumps of leafy puffs with one outline, darker underneath and lit on top, leaf ticks, and little flowers on some.

v0.17.0: **the Staff Room.** The Staff button opens a full-screen page (styled like the Mall Market) with three tabs, plus the day's wage bill and your money in the header.
- **Overview:** tiles for registers staffed (red when any lack a clerk), clerks without a register, team size and daily wages, open spots to hire, and (with a casino) tables with a dealer. **Needs attention** lists each problem with its fix: free clerks and empty registers (Fill registers places them, dream store first), registers with no clerk (Hire clerks, or a note that the clerk team is full until the next level), clerks with nothing to run, casino tables with no dealer, roles you haven't hired yet and what you're missing without them, and one-star staff. All covered shows a green note. **Your team** shows every role's slots as a bar (filled of allowed), its wage range and a Hire button, plus the next role coming. **Registers** lists every store and stand (unstaffed first, in red as Help wanted, with a floor tag upstairs) with a picker to choose or swap its clerk.
- **Team:** everyone as cards, filterable by role, with stars and wage, their dream job, a register picker for clerks, and Let go.
- **Hire:** today's applicants as cards, filterable by role (each chip shows filled/allowed), with a "needs a clerk!" tag when a clerk's dream store is unstaffed right now. Hiring a clerk puts them at an empty register straight away (dream store first).
- The Staff button gets a red dot at night while a register lacks a clerk you could fill (or a table lacks a dealer). The night-1 clerk and Dee scenes open the Staff Room on Hire.

v0.17.1: **a new kiddie ride.** A fat little rocket on a teal coin-op base (coin box, chasing lights): side on it has a yellow nose cone, a white racing stripe, a porthole, fins, an exhaust nozzle and an open cockpit with a windshield; nose-on you see the round yellow nose and fins; tail-on, the nozzle (with flames while it runs). The kid hops up from beside their grown-up into the cockpit (`rideSeat`), sits in it with their legs hidden in the body while it rocks (pitching side on, rolling front and back) with exhaust puffs and chasing lights, and hops back down when the ride winds down (`RIDE_ON`/`RIDE_OFF` in art.js; the ride draws the seated kid, the renderer draws the hops). A ride lasts a little longer (5 s) so it reads.

v0.17.2: **four new places to shop** in levels 1–20, so there are registers for all those clerks (art in `web/src/art4.js`):
- **Lemon Drop** (level 4, stand): a lemonade cart with a big glass jug of lemonade and floating lemon slices, a stack of paper cups and a basket of lemons. Shoppers walk off with a cup.
- **Game Day** (level 12, 3×3 sporting goods): a gym-floor court, jerseys on a rail over bins of basketballs, soccer balls and footballs, team pennants and trophies, a bike on a display stand and a hoop with a ball bouncing under it. Shoppers carry a ball.
- **Glow Up** (level 17, 2×3 beauty bar): pink sparkle wallpaper, a lit makeup wall of lipsticks, palettes and bottles, a Hollywood mirror, a nail polish rack on the counter, a salon chair and a vanity. Shoppers carry a pink bag.
- **Taco Loco** (level 19, 2×2 tacos): terracotta tile, papel picado bunting, a griddle of tortillas and bowls of fillings, a chalk menu with a chili, chips and salsa on the counter, a high-top table with a cactus. Shoppers eat a taco.
Each has a Mall Market card and pitch, shoppers who want it (families love lemonade, teens love tacos, fashionistas love Glow Up, and so on), what they carry out and the litter they leave.

v0.17.3: **doors can't face the outside wall.** The rows past the mall's walls are the sidewalk outside, which counts as walkable, so a store (or a bench, machine, table) could be placed with its front opening onto the outer wall and shoppers walked through the wall to use it. Placement now refuses a front that isn't on the mall's own floor ("The door can't open onto the outside wall"). Saves that already have one get it fixed on load (`fixDoors` in map.js): turned around where it stands if that works, otherwise moved to the nearest spot that does (stores try both door directions); nothing is removed. The pause menu is just Settings and Resume (How to play is gone).

v0.17.4:
- **Tap an escalator** (day or night) to jump to the floor at its other end; the view lands by where it comes out.
- **The Second Floor opens as a blank slate**: just its restrooms in the top right, no storefronts or decor, to lay out however you like. Saves that already opened it keep everything they built.
- **Four new places, levels 23–27** (art in `web/src/art4.js`): **Noodle Nook** (23, 2×2 ramen: red wave wallpaper, steaming stock pots and drying noodles, paper lanterns, a ramen menu, a stool table), **Cotton Cloud** (24, stand: a spinning cotton candy machine with floss swirling and wisps floating up, a rack of pink and blue cones, sugar jars), **Crafty Corner** (26, 2×3 art supplies: paint-splatter wallpaper, a pegboard of tools, yarn cubbies and paint tubes, a rainbow painting, an easel with a landscape in progress, a craft table or yarn basket), **Sushi Spin** (27, 3×3 dine-in: indigo waves, a fish case, a conveyor belt of little sushi plates going round, a noren curtain, a waving lucky cat, tables to eat at).
- **Three new decorations:** a **Mall clock** (23, a grand clock on a post that shows the actual time of day), a **Food court** (24, 4×3: a tiled floor, FOOD COURT sign, four tables with two stools each around a center aisle, a planter rail with a gap to walk in; shoppers carrying food walk in, sit and eat it, families take a whole table, then walk back out; `court` in config, seats and entry in `courtSpots`), and a **Carousel** (26, 3×3 coin ride for families: painted horses on golden poles bobbing round under a striped canopy with chasing lights; the kid hops on, rides a horse around twice and hops off).

v0.17.5:
- **Noodle Nook is dine-in**: its little lacquered table for two (by the kitchen, clear of the line) seats shoppers to eat a steaming bowl with a fork; a family takes the whole table. A full table means takeout.
- **Eating looks like eating** at every dine-in table and the food court: each diner's food is set out in front of them (a bowl of noodles with an egg and steam, a slate of sushi, or a paper boat and a soda), and a bite comes up to the mouth every couple of seconds: noodles twirled on a fork, sushi in chopsticks, everything else out of the hand (`tablePlate` and `eatArm` in art.js).
- **The food court takes food from any restaurant.** About a third of dine-in customers take their food to the food court when there is one; food no longer runs out while it's being carried over; a food court on another floor counts (with the escalator ride added to the distance).
- **Guards, supervisors and mascots split up between floors.** With two or more of a role and shops on more than one floor, each keeps to their own floor (the ground floor gets the extra one); a lone one still covers the whole mall (`beatFloor` in sim.js).

v0.17.7: the title screen buttons sit higher, clear of the bottom of the screen. On itch.io, going full screen in Chrome on Android shows a "To exit full screen" notice across the bottom middle, right on top of where Continue / New game were.

v0.20.1: the title screen buttons are back at their original spot near the bottom of the screen (the v0.17.7 raise is undone at logan's request).

v0.20.2 polish:
- **Shop:** tapping something you can't afford in the Mall Market shakes the card and says how much it costs, instead of starting placement.
- **Eating:** diners' hands and food come up in front of the table at every eatery and the food court (the eating arm is drawn as its own layer after the table: `eatOverlay` in art.js, `drawEatArms` in render.js); the hand rests over the plate between bites.
- **Carousel:** real carousel horses (arched neck, flowing mane and tail, bridle, fringed saddle, galloping legs, six coats), poles that reach the canopy, a painted deck skirt with chasing bulbs, slower bobbing, and the rider sits in the saddle.
- **Crafty Corner:** a proper artist's palette icon, a craft table with a drawing, paint pots, pom-poms and a turning pinwheel, a finished landscape on the easel, and bunting along the wall.
- **Bake My Day:** a three-tier pastry case (croissants, sprinkle donuts, cupcakes, a layer cake), a bread rack, a brick oven with a live fire and steaming loaves, a chalkboard menu with a rolling pin and whisk, a cake under a glass dome on the counter, candy-stripe wallpaper with an awning, and pink harlequin tiles.

