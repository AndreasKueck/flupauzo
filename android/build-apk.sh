#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

# Bei abweichendem SDK-Pfad kann ANDROID_JAR gesetzt werden.
android_jar="${ANDROID_JAR:-$HOME/flupauzo-sdk/android-28/android.jar}"
if [[ ! -r "$android_jar" ]]; then
  printf 'android.jar nicht lesbar: %s\n' "$android_jar" >&2
  exit 1
fi

# Genau die Paketversionen aus package-lock.json verwenden.
npm ci --include=dev --no-audit --no-fund
env -u NODE_PATH npm run bundle

db="node_modules/@slackwater/database/dist/generated/slackwater.tcdb"
printf '%s  %s\n' \
  '0aeb476e985f882c39fa5eda141ddd57198d4ece651ea8193aa5c221ff4291b9' \
  "$db" | sha256sum -c -

# Nur ausdrücklich ausgewählte Dateien in die APK übernehmen.
work="$(mktemp -d build/apk-XXXXXX)"
trap 'rm -rf -- "$work"' EXIT
mkdir -p "$work/assets/js" "$work/assets/generated" "$work/classes"
cp assets/index.html "$work/assets/"
cp build/assets/js/app.js "$work/assets/js/"
cp "$db" "$work/assets/generated/"

javac -encoding UTF-8 --release 8 -classpath "$android_jar" \
  -d "$work/classes" src/org/flupauzo/app/MainActivity.java
dx --dex --output="$work/classes.dex" "$work/classes"

aapt2 link -I "$android_jar" --manifest AndroidManifest.xml \
  -A "$work/assets" -o "$work/basis.apk"
zip -q -0 -j "$work/basis.apk" "$work/classes.dex"
zipalign -f 4 "$work/basis.apk" "$work/ausgerichtet.apk"
zipalign -c 4 "$work/ausgerichtet.apk"

out="build/Flupauzo-0.9-unsigned.apk"
mv -- "$work/ausgerichtet.apk" "$out"
printf 'Unsignierte APK: %s\n' "$out"
