#!/bin/sh

cat - > data/onload.js
rm -f *.xpi

jpm xpi

mv *.xpi "build/${1}.xpi"
