#!/bin/bash

ignore="
	assets/src/icon.kra
	assets/src/icon-off.kra
	assets/compile.sh
	webext.sh"

if [ "$1" = run ]; then
	firefox=""
	for ff in firefox firefox-nightly firefox-aurora; do
		if which "$ff" >/dev/null 2>/dev/null; then
			firefox="$ff"
			break
		fi
	done

	if [ -z "$firefox" ]; then
		echo "No firefox found."
		exit 1
	fi

	web-ext "$@" --firefox "$firefox" --ignore-files $ignore
else
	web-ext "$@" --ignore-files $ignore
fi
