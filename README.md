# Shardfall

A 3D mobile space shooter. Dodge and shatter asteroids, dogfight enemy fighters across large sectors, collect power-ups, and warp deeper into the belt.

Built with [three.js](https://threejs.org) and packaged as an Android APK through a lightweight native WebView shell. Every sound effect and the soundtrack are synthesized at runtime with WebAudio, so there are no audio asset files.

## Install on Android

1. Grab `Shardfall.apk` (from a GitHub Actions run under **Build APK → Artifacts**, or build it yourself below).
2. Open it on your phone and allow "Install unknown apps" for your browser/file manager when prompted.
3. The game runs in landscape. Android 8.0+ is required.

> The APK is signed with a debug key. If an install fails because a previous build used a different key, uninstall the old version first.

## How to play

| Control | Action |
| --- | --- |
| Left thumb (anywhere on the left half) | Floating joystick: steer |
| **FIRE** | Twin cannons, with light aim assist near targets |
| **BOOST** / **BRAKE** | Burn the boost meter / slow down for tight turns |
| **Seeker** (rocket icon) | Homing missile; locks onto the target in the lock ring |
| **Nova** (rings icon) | Shockwave that destroys everything nearby |
| Tap the radar | Toggle the full sector map |

Slide your right thumb between buttons without lifting it. Settings include sensitivity, invert-Y, auto-fire, a left-handed layout, vibration, and graphics quality.

Keyboard (desktop testing): WASD/arrows to steer, Space to fire, Shift to boost, L to brake, E for missiles, Q for nova, P to pause.

### Each sector
- Survive 3 waves of hostiles, then fly through the **warp gate** and pick 1 of 3 ship upgrades.
- Large asteroids split into smaller ones. **Orange volatile** rocks explode and damage everything nearby, enemies included. **Cyan crystal** rocks drop power-ups.
- Huge monolith asteroids can't be destroyed. Fly around them.
- Kills in quick succession build a combo multiplier.

### Enemies
- **Raider**: standard fighter. Makes strafing runs, then breaks away.
- **Lancer**: fast interceptor. Orbits you and fires bursts.
- **Warden**: heavy gunship. Holds range and fires spreads; appears more from sector 2 on.

### Power-ups
Hull Repair, Overshield, Rapid Fire, Spread Shot, Seeker Pack (+3 missiles), Nova Bomb, Phase Shield (temporary invulnerability; fly through rock).

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
  main.js         game loop, sectors/waves, collisions, scoring, camera
  player.js       flight model, weapons, shields
  enemies.js      enemy AI (pursuit, evasion, obstacle avoidance)
  asteroids.js    instanced asteroid field, breakup, spatial hash
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
