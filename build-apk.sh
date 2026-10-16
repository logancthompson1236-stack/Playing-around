#!/usr/bin/env bash
# Builds the web bundle and the Android APK in one go.
# Requires: Node 18+, JDK 17+, Android SDK (ANDROID_HOME or android/local.properties).
set -euo pipefail
cd "$(dirname "$0")"

(cd web && npm ci && npm run build)
(cd android && ./gradlew assembleRelease)

cp android/app/build/outputs/apk/release/app-release.apk Shardfall.apk
echo "Built Shardfall.apk"
