#!/usr/bin/env bash
# Compiles public/cv/cv.css with Tailwind v3 + typography in a throwaway folder, so the
# project's own Tailwind v4 dependency is untouched.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
cp "$here/tailwind.config.js" "$here/input.css" "$tmp/"
sed -i.bak "s#path.join(__dirname, \"../../public/cv/index.html\")#\"$here/../../public/cv/index.html\"#" "$tmp/tailwind.config.js"
(cd "$tmp" && npm init -y >/dev/null && npm i --silent tailwindcss@3 @tailwindcss/typography@0.5 >/dev/null)
(cd "$tmp" && npx tailwindcss -c tailwind.config.js -i input.css -o "$here/../../public/cv/cv.css" --minify)
