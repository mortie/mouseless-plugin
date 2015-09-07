#!/bin/sh

TARGET="$1"

if [ ! -d "$TARGET" ]; then
	if [ "$TARGET" = "" ]; then
		echo "Usage: $0 <target>"
	else
		echo "Target not found: $TARGET"
	fi
	echo "Targets available:"

	for F in *; do
		if [ -d "$F" ]; then
			echo "* $F"
		fi
	done

	exit 1
fi

cd "$TARGET"

# Create complete script file
SCRIPT=$(cat bridge.js ../script.js)

# Run target's build script
mkdir -p build
echo "$SCRIPT" | ./build.sh "mouseless-$TARGET"

mv build/* ..
cd ..
