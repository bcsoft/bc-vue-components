#!/usr/bin/env bash

echo "building..."

r.js -o tools/build.js

toDir=dist/bc/vue
if [ ! -d $toDir ]
then
  mkdir -p $todir
fi

componentsFile=bc/vue/components.js
#if [ -f dist/$componentsFile ]
#then
#  echo "delete dist/$componentsFile"
#  rm dist/$componentsFile
#fi
echo "copy to dist/$componentsFile"
cp -f temp/$componentsFile dist/$componentsFile

# https://github.com/mishoo/UglifyJS2
echo "build dist/bc/vue/components.min.js, dist/bc/vue/components.min.js.map"
uglifyjs dist/$componentsFile -o dist/bc/vue/components.min.js --source-map dist/bc/vue/components.min.js.map -m -c --comments --source-map-url components.min.js.map

echo "builded"
exit 0