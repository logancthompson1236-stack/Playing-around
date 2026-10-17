# Shardfall

A 3D mobile space shooter. Dodge and shatter asteroids, dogfight enemy fighters across large sectors, collect power-ups, and warp deeper into the belt.

Built with [three.js](https://threejs.org) and packaged as an Android APK through a lightweight native WebView shell. Every sound effect and the soundtrack are synthesized at runtime with WebAudio, so there are no audio asset files.

## Install on Android

1. Grab `Shardfall.apk` (from a GitHub Actions run under **Build APK → Artifacts**, or build it yourself below).
2. Open it on your phone and allow "Install unknown apps" for your browser/file manager when prompted.
3. The game runs in landscape. Android 8.0+ is required.

> The APK is signed with a debug key. If an install fails because a previous build used a different key, uninstall the old version first.

## How to play

First launch runs a short guided tutorial (skippable, and replayable from **How to Play**).

| Control | Action |
| --- | --- |
| Left thumb (anywhere on the left half) | Floating joystick: steer |
| **FIRE** | Equipped cannon, with light aim assist. Once a target reads **LOCKED**, bolts turn gold and home in on it |
| **BOOST** / **BRAKE** | Burn the boost meter / slow down for tight turns |
| **Missile** (rocket icon) | Fires the equipped missile type at your locked target |
| **Ability** | Equipped ability: EMP Pulse, Drone Bay (wingman) or Phase Dash. Charges refill slowly |
| Tap the radar | Toggle the full sector map |

Slide your right thumb between buttons without lifting it. **Settings → Customize Controls** lets you drag every button anywhere and change button size and opacity. Settings also cover difficulty (Relaxed / Normal / Veteran), sensitivity, invert-Y, auto-fire, a left-handed layout, vibration, and graphics quality.

Keyboard (desktop testing): WASD/arrows to steer, Space to fire, Shift to boost, L to brake, E for missiles, Q for ability, R for map, P to pause.

### Each sector
- Survive 3 waves, then destroy the **capital ship** guarding the sector, then fly through the **warp gate** and pick 1 of 3 run upgrades.
- Every cleared wave drops two supply crates just ahead of you.
- Sectors roll 2–3 set pieces: a ringed planetoid with an orbiting asteroid belt, rock walls to thread through, crystal spires, a derelict capital-ship wreck, swirling debris storms, and dust clouds. Each theme has its own rock style.
- Large asteroids split into smaller ones. **Orange volatile** rocks explode and hurt everything nearby. **Cyan crystal** rocks drop power-ups. Monoliths, spires and wrecks can't be destroyed.
- Hitting rocks hurts based on how fast you hit and how big they are. A scrape is minor; ramming a mountain at full boost is not.

### Enemies
- **Raider**: fighter that flies its own flanking route, makes attack runs, then breaks off (climb, dive, split or loop).
- **Lancer**: fast interceptor that orbits and fires bursts.
- **Warden**: heavy gunship that holds range and fires spreads.
- **Hornet**: kamikaze drone swarms. Shoot them before they reach you.
- **Spinner**: minelayer that seeds your flight path with proximity mines (shoot mines from a distance).
- **Longbow**: sniper. A red targeting laser tracks you, then holds still just before it fires. Move off the line.

Only a few ships press an attack at once; the rest circle and weave, and anything that sits on your tail too long peels away.

### Bosses
- **Dreadnought** (odd sectors): a carrier with four turrets and two launch bays that release Hornets. Destroy them all to drop the reactor shield.
- **Sentinel** (even sectors): a ring station with four shield pylons and laser spokes that close in on you like an iris. Slide sideways when they converge.

### Hangar and credits
Kills, bosses and cleared sectors earn **credits** that persist between runs. Spend them in the **Hangar**:
- **Ships**: Kestrel (balanced), Wasp (fast interceptor), Bulwark (heavy, 3 module slots, shrugs off rocks), Specter (fast shields, harder to hit).
- **Cannons**: Twin Pulse, Ion Repeater, Scatter Cannon, Rail Lance (piercing).
- **Missiles**: Seeker, Swarm Pod (4 mini-missiles), Heavy Torpedo.
- **Abilities**: EMP Pulse, Drone Bay, Phase Dash.
- **Modules** (2–3 slots): Armor Plating, Shield Booster, Vector Thrusters, Afterburner Tank, Targeting Computer, Munitions Rack, Salvage Scanner.

Stat bars compare your current loadout against the item you're looking at.

### Power-ups
Hull Repair, Overshield, Rapid Fire, Spread Shot, Seeker Pack, Charge Cell (+1 ability charge), Wingman (a drone fights with you for 22s), Phase Shield (temporary invulnerability; fly through rock).

## Build from source

```bash
./build-apk.sh          # web bundle + APK -> ./Shardfall.apk
```

Or step by step:

```bash
cd web && npm ci && npm run build       # -> web/dist (also copies into android assets)
cd ../android && ./gradlew assembleRelease
```

Requires Node 18+, JDK 17+, and the Android SDK (platform 35). Set `ANDROID_HOME` or create `android/local.properties` with `sdk.dir=/path/to/sdk`.

`web/dist/shardfall.html` is a single-file build that also plays in any modern browser.

## Project layout

```
web/src/
  main.js         game loop, sectors/waves/bosses, collisions, scoring, credits, camera
  player.js       flight model, loadout stats, weapons, abilities, shields
  enemies.js      squad AI (attack tokens, flanking, break-offs), new enemy types, boss parts
  boss.js         Dreadnought and Sentinel capital ships
  hazards.js      mines and laser beams
  drone.js        wingman drones
  asteroids.js    instanced asteroid field, breakup, spatial hash, terrain set pieces
  terrain.js      crystal spires, derelict wreck, dust clouds
  content.js      hangar ships, weapons, abilities, modules
  profile.js      saved credits, purchases, loadout, tutorial and control layout
  hangar.js       hangar store UI
  tutorial.js     first-flight tutorial and one-time hints
  projectiles.js  bolts and homing missiles
  world.js        procedural nebula skybox, planets, lighting, space dust
  particles.js    explosions, sparks, trails, shockwaves
  hud.js          radar/sector map, target brackets, lock-on, bars
  input.js        touch joystick + buttons, keyboard
  audio.js        procedural SFX and adaptive music
  models.js       procedural ship, power-up and warp gate models
  ui.js           menus, settings, persistence
  config.js       tuning, themes, enemy/power-up/upgrade definitions
android/          native WebView wrapper (fullscreen, landscape, vibration bridge)
```
