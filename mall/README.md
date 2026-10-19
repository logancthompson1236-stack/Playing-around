# Mall Revival

A cozy 2D mall sim for Android and iPhone. You inherit your grandma's dead mall and bring it back to life one storefront at a time. The full concept is in [DESIGN.md](DESIGN.md).

## Play a test build

- **iPhone or any browser:** https://logancthompson1236-stack.github.io/Playing-around/mall/ (latest), or `/mall/vX.Y.Z/` for a specific version. On iPhone, tap Share → Add to Home Screen for a full-screen icon.
- **Android:** download `MallRevival-vX.Y.Z.apk` from the [Releases page](https://github.com/logancthompson1236-stack/Playing-around/releases) and open it. Every build is signed with the same test key, so updates install over the old one and keep your save.

Both are built automatically by `.github/workflows/mall-build.yml` on every push that changes `mall/`.

## How to play (v0.19)

- **Mall Market** (Build, at night): a full-screen shop. **Shop** has every store, stand and decor piece as a card with a little pitch: switch between Stores & Stands and Decor, and pick a category (Food, Retail, Fun, Scenery, Casino). Things you don't own yet come first; a New tag marks anything just unlocked; **Fix up** has whatever storage, fountain work and expansions are still to do; **Style** has wallpaper and floors. Swipe the cards sideways.

- **iPhone:** open the GitHub Pages link in Safari, tap Share, then Add to Home Screen. It runs full screen and opens offline after the first visit (the home-screen app keeps its own save).

- **Day (about 2½ minutes):** tap a customer's bubble (or a store) to send yourself to that register. Tap trash to sweep it. You can queue up to 3 jobs.
- **Trash cans** (Build → Decor): most shoppers inside the green circle toss their trash in instead of dropping it.
- **Decor** unlocks as you level (a claw machine, planters, lamps, sofas, soda and gumball machines, a kiddie ride, a mall directory, shade trees, a kids play area at 15, and from level 19 a topiary bunny, a photo booth, an aquarium, a massage chair, a grand piano, a flower arch, a balloon cart, a wishing fountain, an arcade cabinet, a bubble machine and a koi pond; from level 36 a popcorn cart, a hot air balloon, an ice swan and a penny press). Tap **Rotate** while placing, or tap a placed piece, to turn it. Machines earn a little from shoppers.
- **Later stores (v0.18):** Hat Trick (21, shoppers try hats on), Wick & Wax candles (33), Bear Hugs Workshop (35, kids stuff a bear and carry it out), Board Room skate shop (39), Spec-tacular glasses (41, shoppers try frames on) and the Blend Bar smoothie stand (44).
- **Strike Zone and Putt Paradise** (levels 29 and 37): 5×4 attractions. Bowlers step up, bowl and watch the pins fly; golfers line up a putt on four themed holes (windmill, bridge, pond, lighthouse) and walk up to pick the ball out of the cup.
- **Staff on their phones:** tap the phone bubble over a slacking employee to go get them back to work. One-star hires do it most.
- **Troublemakers** (level 10): rowdy kids with a boombox head for the busiest part of the mall. Left alone they get louder: shoppers nearby give up and leave (lines and stores near them empty out), and after a while new arrivals turn around at the door. Tap one to shoo them out, or hire a security guard under Staff; guards walk the busy storefronts, spot trouble in sight at once and hear about it anywhere on their floor (better guards sooner).
- **Restrooms:** when one gets grubby (flies, then a bubble), tap it to mop it out, or let janitors handle it.
- **Second floor:** Build → Fix up has the Second Floor ($20,000, level 8: an empty floor with restrooms, to build on) and its Sky Garden ($45,000, level 13, with big 5×4 plots for the Starlight Cinema and Bounce Zone). An escalator at the east end of the concourse takes shoppers, staff and you up and down. Tap an escalator, or **2F ▲ / 1F ▼** on the left, to switch floors; a red dot means something on the other floor needs you. Only the floor on screen is drawn; the other keeps running.
- **Casino (third floor, level 30, $50,000):** Gus brings it up the first night you can afford it. Slot machines, card tables (blackjack, roulette, poker, craps), a prize wheel and casino decor go only on the casino floor. Tables need a dealer (Staff); casino hosts cheer players on. The house usually comes out ahead, but big winners can put the casino in the red for a day (never more than $2,500). The High Roller Suite ($120,000, level 42) extends it.
- **Staff Room** (Staff, at night): Overview shows what needs attention (empty registers, free clerks, tables without dealers, roles not hired yet) with a fix for each, every role's open spots, and every register with a picker for its clerk. Team lists everyone; Hire lists today's applicants.
- **Supervisor** (level 5): makes the rounds where they're most useful (busy registers, shaky one-star staff, anyone due a break), gets staff off their phones for you (spotting phones across the floor after a while), and gives nearby staff a small boost.
- **Mall styles** (level 10): Build → Style changes the wallpaper and the concourse floor. Tap one to preview it, **Next** to flip through, then **Buy** or **Use it**.
- **Settings:** volume sliders, battery saver, save backup/restore (move your mall between devices), and Reset save (it's only in Settings now).
- **Night:** tap **Build** and pick a store. Every storefront of its size lights up with its price (fixing up a boarded-up one is included). Tap one, then **Open**. **Build new** puts up a brand-new storefront anywhere instead; building on dusty storage clears that room out as part of the price. Tap things in the mall to move, close or sell them, or to fix the fountain. A store or piece being moved follows your finger, and its old spot shows empty. Stores and stands with nobody to run the register put out a **Help Wanted** sign at night; clerks without a register take new and empty ones on their own (their dream store first). **Staff** hires janitors (level 3), clerks (level 4, two at first; more at higher levels), a greeter (12) and Sunny the mascot (15). Applicants are rated 1–3 stars (better is faster and costs more), and clerks sell more in their dream store (♥). New hires are available the same night you unlock them.
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
  titlescene.js the title screen: the mall's outside at dusk, the neon sign, walking in through the doors
  play.js      kids play area layout and the kids' slide / ball pit routines (shared by sim and art)
  map.js       tile grid, flow-field pathfinding, placement rules
  render.js    camera, cached floor layer, depth-sorted drawing, lighting, overlays
  art.js       all vector art (stores, characters, props, icons)
  art5.js      v0.18 art: the later stores, bowling and mini golf, new decor and styles
  night.js     night tools: tap cards, Build, Staff, placement, notebook
  guide.js     Day 1 walkthrough, notebook tips, Gus's memories
  ui.js        HUD, dialogs, panels, report card, intro, character creation
  story.js     all story text and tips
  config.js    tuning: stores, customers, levels, costs
  state.js     save file and settings
  audio.js     synthesized sound effects and muzak
web/tools/     balance bot, icon/splash generator, animation preview (node tools/anim-preview.mjs: frame strips + a live page of people walking, eating and using decor)
android/       Capacitor Android project (landscape, full screen, fixed test signing key)
```
