# Test signing key

`mall-revival-test.jks` signs every test APK (local builds and GitHub Actions), so each new build installs over the previous one without uninstalling, and your save survives.

It is committed on purpose and its password is in `app/build.gradle`, so treat it as public. Never use it for a Google Play upload: create a separate private upload key when the game goes to the store.
