# HowCrowd #

HowCrowd is a mobile hybrid app providing a platform to users to share crowd data of places to each other momentarily and anonymously.

## What is used? ##

The app is developed using [AngularJS1](https://angularjs.org/), [OnsenUI](https://onsen.io/v2/docs/angular1.html) in frontend, running on [Apache Cordova](https://cordova.apache.org/docs/en/6.x/guide/cli/).
[Backendless](https://backendless.com/) is used as backend platform.

## How to set up? ##

### Prerequisities ###

* Install [NodeJS](https://nodejs.org/en/download/)
* Install [Cordova](https://cordova.apache.org/docs/en/6.x/guide/cli/)
* Install [http-server](https://www.npmjs.com/package/http-server) as a local Node server
* Install [GruntJS](http://gruntjs.com/installing-grunt)
* Install [Sass](http://sass-lang.com/install)
* Run `npm install` to install dependencies

### Build ###

* Run `grunt dev`. It will mainly create the folder "www" and "config.xml" for Cordova build.
* Run `cordova prepare`. It will install all platforms and plugins defined in "config.xml"

### Run ###

* **Mobile (e.g. Android):** Run `cordova build android` to create apks. Run `cordova run android --device` to run the app on a plugged Android device.
* **Web:** Go to "www" via `cd www`. Run `http-server -o`. It will run a local Node server and open the browser automatically.

## Whom to contact? ##

* The app is also published as alpha in [Google Play](https://play.google.com/apps/testing/com.oztemur.howcrowd). You can become an alpha user and provide feedbacks through the store, or directly mailing to [me](mailto:mahmutoztemur@gmail.com).
