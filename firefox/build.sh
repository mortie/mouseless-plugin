#!/bin/sh

mkdir -p data
cat - > data/onload.js
rm -f *.xpi

if [ "$2" = "" ]; then
	cp package-qwerty.json package.json
else
	cp "package-$2.json" package.json
fi
jpm xpi
rm package.json
rm data/onload.js

mv *.xpi "build/${1}.xpi"
