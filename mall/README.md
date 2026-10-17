# Mall Revival

A cozy 2D mall sim for Android and iPhone. You inherit your grandma's dead mall and bring it back to life one storefront at a time. The full concept is in [DESIGN.md](DESIGN.md).

## Play a test build

- **iPhone or any browser:** https://logancthompson1236-stack.github.io/Playing-around/mall/ (latest), or `/mall/vX.Y.Z/` for a specific version. On iPhone, tap Share → Add to Home Screen for a full-screen icon.
- **Android:** download `MallRevival-vX.Y.Z.apk` from the [Releases page](https://github.com/logancthompson1236-stack/Playing-around/releases) and open it. Every build is signed with the same test key, so updates install over the old one and keep your save.

Both are built automatically by `.github/workflows/mall-build.yml` on every push that changes `mall/`.

## How to play (v0.6)

- **Day (about 2½ minutes):** tap a customer's bubble (or a store) to send yourself to that register. Tap trash to sweep it. You can queue up to 3 jobs.
- **Trash cans** (Build → Decor): most shoppers inside the green circle toss their trash in instead of dropping it.
- **Decor** unlocks as you level (planters, lamps, sofas, soda and gumball machines, a kiddie ride, a mall directory). Tap **Rotate** while placing, or tap a placed piece, to turn it. Machines earn a little from shoppers.
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
