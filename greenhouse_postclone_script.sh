#!/bin/sh
sudo apt-get install ruby-full
gem install sass
npm install -g grunt-cli
npm install
grunt alpha
cordova prepare