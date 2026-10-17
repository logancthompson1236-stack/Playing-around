# Mall Revival

A cozy 2D mall sim for Android and iPhone. You inherit your grandma's dead mall and bring it back to life one storefront at a time. The full concept is in [DESIGN.md](DESIGN.md).

## Play a test build

- **iPhone or any browser:** https://logancthompson1236-stack.github.io/Playing-around/mall/ (latest), or `/mall/vX.Y.Z/` for a specific version. On iPhone, tap Share → Add to Home Screen for a full-screen icon.
- **Android:** download `MallRevival-vX.Y.Z.apk` from the [Releases page](https://github.com/logancthompson1236-stack/Playing-around/releases) and open it. Every build is signed with the same test key, so updates install over the old one and keep your save.

Both are built automatically by `.github/workflows/mall-build.yml` on every push that changes `mall/`.

## How to play (v0.2)

- **Day (about 3 minutes):** tap a customer's bubble (or a store) to send yourself to that register. Tap trash to sweep it. You can queue up to 3 jobs.
- **Trash cans** (Build → Decor): most shoppers inside the green circle toss their trash in instead of dropping it.
- **Pause → Reset save** starts over from the intro.
- **Night:** tap anything in the mall to see what you can do with it: renovate boarded-up units, open stores, clear storage rooms, fix the fountain. **Build** adds new stores and decorations anywhere there's clean floor. **Staff** hires janitors (level 3) and clerks (level 4).
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
