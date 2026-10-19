# Mall Revival

A cozy 2D mall sim for Android and iPhone. You inherit your grandma's dead mall and bring it back to life one storefront at a time. The full concept is in [DESIGN.md](DESIGN.md).

## Play a test build

- **iPhone or any browser:** https://logancthompson1236-stack.github.io/Playing-around/mall/ (latest), or `/mall/vX.Y.Z/` for a specific version. On iPhone, tap Share → Add to Home Screen for a full-screen icon.
- **Android:** download `MallRevival-vX.Y.Z.apk` from the [Releases page](https://github.com/logancthompson1236-stack/Playing-around/releases) and open it. Every build is signed with the same test key, so updates install over the old one and keep your save.

Both are built automatically by `.github/workflows/mall-build.yml` on every push that changes `mall/`.

## How to play (v0.15)

- **iPhone:** open the GitHub Pages link in Safari, tap Share, then Add to Home Screen. It runs full screen and opens offline after the first visit (the home-screen app keeps its own save).

- **Day (about 2½ minutes):** tap a customer's bubble (or a store) to send yourself to that register. Tap trash to sweep it. You can queue up to 3 jobs.
- **Trash cans** (Build → Decor): most shoppers inside the green circle toss their trash in instead of dropping it.
- **Decor** unlocks as you level (a claw machine, planters, lamps, sofas, soda and gumball machines, a kiddie ride, a mall directory, shade trees, a kids play area at 15, and from level 19 a topiary bunny, a photo booth, an aquarium, a massage chair, a grand piano, a flower arch, a balloon cart, a wishing fountain, an arcade cabinet, a bubble machine and a koi pond). Tap **Rotate** while placing, or tap a placed piece, to turn it. Machines earn a little from shoppers.
- **Staff on their phones:** tap the phone bubble over a slacking employee to go get them back to work. One-star hires do it most.
- **Troublemakers** (level 10): tap a rowdy kid with a boombox to shoo them out, or hire a security guard under Staff.
- **Restrooms:** when one gets grubby (flies, then a bubble), tap it to mop it out, or let janitors handle it.
- **Second floor:** Build → Fix up has the Second Floor ($20,000, level 8) and its Sky Garden ($45,000, level 13), including big 5×4 plots for the Starlight Cinema and Bounce Zone attractions. An escalator at the east end of the concourse takes shoppers, staff and you up and down. Tap **2F ▲ / 1F ▼** on the left to switch floors; a red dot means something on the other floor needs you. Only the floor on screen is drawn; the other keeps running.
- **Casino (third floor, level 30, $50,000):** Gus brings it up the first night you can afford it. Slot machines, card tables (blackjack, roulette, poker, craps), a prize wheel and casino decor go only on the casino floor. Tables need a dealer (Staff); casino hosts cheer players on. The High Roller Suite ($120,000, level 42) extends it.
- **Staff panel:** tabs along the top show one role at a time (or All); the team is grouped by role.
- **Supervisor** (level 5): makes the rounds, gets staff off their phones for you, and gives nearby staff a small boost.
- **Mall styles** (level 10): Build → Style changes the wallpaper and the concourse floor. Tap one to preview it, **Next** to flip through, then **Buy** or **Use it**.
- **Pause → Reset save** starts over from the intro.
- **Night:** tap **Build** and pick a store. Every storefront of its size lights up with its price (fixing up a boarded-up one is included). Tap one, then **Open**. **Build new** puts up a brand-new storefront anywhere instead; building on dusty storage clears that room out as part of the price. Tap things in the mall to move, close or sell them, or to fix the fountain. **Staff** hires janitors (level 3), clerks (level 4, two at first; more at higher levels), stockers (10), a greeter (12) and Sunny the mascot (15). Applicants are rated 1–3 stars (better is faster and costs more), and clerks sell more in their dream store (♥). New hires are available the same night you unlock them.
- Drag to look around, pinch (or scroll) to zoom.

## Build from source

```bash
./build-apk.sh                        # web build + APK -> MallRevival-vX.Y.Z.apk
cd web && npm run dev                 # serves dist/index.html on http://localhost:8080
cd web && npm run balance -- 15 7     # plays 15 days headlessly with seed 7 and prints a summary per day
```

Requires Node 22+, JDK 21 and the Android SDK (platform 36). The version number lives in `web/package.json`; the APK's versionCode is derived from it.

## Project layout

```
web/src/
  main.js      game flow: title, intro, day, report, night
  sim.js       day simulation: customers, owner jobs, staff, trash, Gus, ratings, report
  map.js       tile grid, flow-field pathfinding, placement rules
  render.js    camera, cached floor layer, depth-sorted drawing, lighting, overlays
  art.js       all vector art (stores, characters, props, icons)
  night.js     night tools: tap cards, Build, Staff, placement, notebook
  guide.js     Day 1 walkthrough, notebook tips, Gus's memories
  ui.js        HUD, dialogs, panels, report card, intro, character creation
  story.js     all story text and tips
  config.js    tuning: stores, customers, levels, costs
  state.js     save file and settings
  audio.js     synthesized sound effects and muzak
web/tools/     balance bot, icon/splash generator
android/       Capacitor Android project (landscape, full screen, fixed test signing key)
```
