#!/usr/bin/env bash
# Builds the Google Play bundle (.aab), signed with the private upload key.
# Needs everything build-apk.sh needs, plus android/keystore.properties (see android/keystore/README.md).
set -euo pipefail
cd "$(dirname "$0")"

if [ ! -f android/keystore.properties ] && [ -z "${MALL_UPLOAD_STORE_FILE:-}" ]; then
  echo "No upload key: add android/keystore.properties (see android/keystore/README.md)." >&2
  exit 1
fi

(cd web && npm ci && npm run build && npx cap sync android)
(cd android && ./gradlew bundleRelease)

version=$(node -p "require('./web/package.json').version")
cp android/app/build/outputs/bundle/release/app-release.aab "MallRevival-v${version}.aab"
echo "Built MallRevival-v${version}.aab for Google Play"
