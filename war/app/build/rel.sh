#!/bin/sh

echo '\nRnning grunt to build release..'
grunt 

echo '\nNow deploying release..'

REL_PATH_IOS=/Users/samiadranly/dev-research/projects-pg/local5/platforms/ios/www
REL_PATH_AND=/Users/samiadranly/dev-research/projects-pg/local5/platforms/android/assets/www



## IOS AREA

cp -r ../../* $REL_PATH_IOS
cp ../../index-prod.html $REL_PATH_IOS/index.html

# del folders
rm -rf $REL_PATH_IOS/app/comp
rm -rf $REL_PATH_IOS/app/build
rm -rf $REL_PATH_IOS/app/res-art
rm -rf $REL_PATH_IOS/app/tests
rm -rf $REL_PATH_IOS/WEB-INF

# del files
rm -rf $REL_PATH_IOS/app/lib/sa/sa.js
rm -rf $REL_PATH_IOS/app/lib/app/app.js
rm -rf $REL_PATH_IOS/index-prod.html
rm -rf $REL_PATH_IOS/favicon.ico


## ANDROID AREA

cp -r ../../* $REL_PATH_AND
cp ../../index-prod.html $REL_PATH_AND/index.html

# del folders
rm -rf $REL_PATH_AND/app/comp
rm -rf $REL_PATH_AND/app/build
rm -rf $REL_PATH_AND/app/res-art
rm -rf $REL_PATH_AND/app/tests
rm -rf $REL_PATH_AND/WEB-INF

# del files
rm -rf $REL_PATH_AND/app/lib/sa/sa.js
rm -rf $REL_PATH_AND/app/lib/app/app.js
rm -rf $REL_PATH_AND/index-prod.html
rm -rf $REL_PATH_AND/favicon.ico



