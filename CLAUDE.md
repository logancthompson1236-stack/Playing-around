# Notes for Claude

## Delivering test builds

The user tests every playable version on their phone, on both Android and iPhone. Whenever a game in this repo gets a new playable version, give them **both**:

1. **An HTML link:** the single-file web build, hosted at a URL that opens in a phone browser (GitHub Pages for this public repo). This is the only way to test on iPhone, which can't install APKs.
2. **An APK:** attach it in the chat with SendUserFile, and also put it on a GitHub Release so it has a permanent download link.

Every version also needs:

- A version bump (`package.json` version, Android `versionCode`/`versionName`), with the version shown on the title screen.
- An APK signed with the same key as the last one, so it installs over the previous build without wiping the save. Never fall back to a per-machine debug key.

## Projects

- `web/`, `android/`: **Shardfall**, a 3D space shooter (see README.md).
- `mall/`: **Mall Revival** (working title), a mall sim for Android and iPhone. The design lives in `mall/DESIGN.md`. Read it before working on the game.
