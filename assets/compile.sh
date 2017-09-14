#!/bin/bash

await() {
	for j in $(jobs -p); do
		wait "$j"
	done
}

exportpng() {
	krita --export --export-filename "$1-128.png" "src/$1.kra"
	convert "$1-128.png" -scale 64x64 "$1-64.png" &
	convert "$1-128.png" -scale 48x48 "$1-48.png" &
	convert "$1-128.png" -scale 32x32 "$1-32.png" &
	await
}

exportpng icon &
exportpng icon-off &
await

find . -name '*~' -print0 | xargs -0 rm
