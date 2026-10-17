#!/usr/bin/env bash
# Builds the Mall Revival web game and its Android APK in one go.
# Requires: Node 22+, JDK 21, Android SDK (ANDROID_HOME or android/local.properties).
set -euo pipefail
cd "$(dirname "$0")"

(cd web && npm ci && npm run build && npx cap sync android)
(cd android && ./gradlew assembleRelease)

version=$(node -p "require('./web/package.json').version")
cp android/app/build/outputs/apk/release/app-release.apk "MallRevival-v${version}.apk"
echo "Built MallRevival-v${version}.apk and web/dist/index.html"
