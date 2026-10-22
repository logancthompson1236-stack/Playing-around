# Signing keys

## Test key

`mall-revival-test.jks` signs every test APK (local builds and GitHub Actions), so each new build installs over the previous one without uninstalling, and your save survives.

It is committed on purpose and its password is in `app/build.gradle`, so treat it as public. Never use it for a Google Play upload.

## Google Play upload key

Play builds (`.aab`) are signed with a separate, private **upload key**. It is never committed (`.gitignore` blocks `keystore.properties` and `keystore/upload*.jks`). Google Play App Signing holds the real app-signing key; if the upload key is ever lost or leaked, it can be reset from Play Console (Setup → App signing).

**On your own machine:** put the key at `android/keystore/upload.jks` and create `android/keystore.properties`:

```
storeFile=keystore/upload.jks
storePassword=...
keyAlias=upload
keyPassword=...
```

Then run `mall/build-aab.sh`. With that file present, `assembleRelease` signs with the upload key too, so leave it out on machines that build test APKs.

**In GitHub Actions:** add these repository secrets (Settings → Secrets and variables → Actions), then push a tag named `mall-play-vX.Y.Z` on the commit to ship (the **Mall Revival Play bundle** workflow builds it):

- `MALL_UPLOAD_KEYSTORE_BASE64`: the `.jks` file, base64-encoded (`base64 -w0 upload.jks`)
- `MALL_UPLOAD_STORE_PASSWORD`, `MALL_UPLOAD_KEY_ALIAS`, `MALL_UPLOAD_KEY_PASSWORD`

The workflow attaches the `.aab` to its run as an artifact (only people with access to the repo can download it); upload that to Play Console.

Play-installed copies and test APKs are signed differently, so a phone can't update from one to the other: uninstall first, which deletes the save.
