#!/usr/bin/env bash

dir=${PWD##*/}
if [ ! $dir = 'bc-vue-components' ]
then
  echo 'please run this script in project root dir'
  exit 0
else
  echo 'check project dir: ok'
fi

# check nodejs installation
if ! [ -x "$(command -v node)" ]; then
  echo 'please install nodejs first'
  exit 0
else
  echo 'check nodejs installation: ok'
fi

# check npm init
if [ ! -d node_modules ]
then
  echo 'npm install'
  npm install
else
  echo 'check npm init: ok'
fi

# install bower if it is not global
if ! [ -x "$(command -v bower)" ]; then
  echo 'npm install -g bower'
  npm install -g bower
else
  echo 'check bower installation: ok'
fi

# check bower init
if [ ! -d bower_components ]
then
  echo 'bower install'
  bower install
else
  echo 'check bower init: ok'
fi

# install r.js if it is not global
if ! [ -x "$(command -v r.js)" ]; then
  echo 'npm install -g requirejs'
  npm install -g requirejs
else
  echo 'check r.js installation: ok'
fi

# install UglifyJS if it is not global
if ! [ -x "$(command -v uglifyjs)" ]; then
  echo 'npm install -g uglify-js@2.4.x'
  npm install -g uglify-js@2.4.x
else
  echo 'check uglify-js installation: ok'
fi

./tools/build.sh

node server.js

exit 0