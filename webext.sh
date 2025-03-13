#!/bin/bash

ignore="
	assets/src/icon.kra
	assets/src/icon-off.kra
	assets/compile.sh
	webext.sh"

find_firefox() {
	for ff in firefox firefox-nightly firefox-aurora; do
		if which "$ff" >/dev/null 2>/dev/null; then
			echo "$ff"
			return
		fi
	done

	if [ -d "/Applications/Firefox Developer Edition.app" ]; then
		echo "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox"
		return
	elif [ -d "/Applications/Firefox.app" ]; then
		echo "/Applications/Firefox.app/Contents/MacOS/firefox"
		return
	elif [ -d "Applications/Firefox Nightly.app" ]; then
		echo "/Applications/Firefox Nightly.app/Contents/MacOS/firefox"
		return
	fi
}

if [ "$1" = run ]; then
	firefox="$(find_firefox)"

	if [ -z "$firefox" ]; then
		echo "No firefox found."
		exit 1
	fi

	web-ext "$@" --firefox "$firefox" --ignore-files $ignore
else
	web-ext "$@" --ignore-files $ignore
fi
