#!/bin/bash

ignore="
	assets/src/icon.kra
	assets/src/icon-off.kra
	assets/compile.sh
	run.sh"

echo web-ext "$@" --ignore-files $ignore
web-ext "$@" --ignore-files $ignore
