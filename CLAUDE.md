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
- `mall/`: **Mall Revival**, a mall sim for Android and iPhone. The design lives in `mall/DESIGN.md`; build and layout notes are in `mall/README.md`. Read both before working on the game.

## Mall Revival builds

- Bump `mall/web/package.json` `version` for each new playable version. The APK's versionCode/versionName are derived from it, and the title screen shows it.
- Pushing changes under `mall/` runs `.github/workflows/mall-build.yml`, which publishes the HTML to GitHub Pages (`/Playing-around/mall/` and `/mall/vX.Y.Z/`) and the APK to the GitHub Release `mall-vX.Y.Z`.
- For the chat copy of the APK, build locally: `mall/build-apk.sh` (needs the Android SDK; in a fresh cloud container install it under `/root/android-sdk`). If Maven Central rate-limits the container, add a local Gradle init script pointing at `https://maven-central.storage-download.googleapis.com/maven2/`; don't commit it.
- Run `npm run balance` in `mall/web` after tuning changes to check pacing.
