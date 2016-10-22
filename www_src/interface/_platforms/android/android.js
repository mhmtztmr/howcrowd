var Android = function(){
  Platform.apply( this, arguments );
	this.Platform = "Android";

  this.getDeviceInfo = function() {
      return new Promise(function(resolve, reject) {
        device.getInfo(function(deviceInfo) {
          resolve(deviceInfo);
        }, reject);
      });
  };

	this.getConnectionType = function(){
		  return navigator.connection.type;
	};

  this.registerConnectionOfflineEvent = function(fn) {
    document.addEventListener("offline", fn, false);
  };

  this.registerConnectionOnlineEvent = function(fn) {
    document.addEventListener("online", fn, false);
  };

	this.isLocationEnabled = function(callback){
		cordova.plugins.diagnostic.isGpsLocationEnabled(function(enabled){
            callback(enabled);
        },
        function(){
        	callback(false);
        });
	};

	this.openGPSDialog = function(message, description, title, functionMap, labelMap){
		cordova.dialogGPS(message,//message
            description,//description
            function(buttonIndex){//callback
              switch(buttonIndex) {
                case 0:  functionMap['NO'](); break;//cancel
                case 1:  functionMap['LATER'](); break;//neutro option
                case 2:  functionMap['YES'](); break;//positive option
              }},
              title,//title
              [labelMap['NO'], labelMap['YES']]);//buttons
	};

  this.takePhoto = function(onSuccess, onFailure){
      navigator.camera.getPicture(function(photoData){
          onSuccess(photoData);
      }, function(){
          onFailure();
      }, {
          destinationType: Camera.DestinationType.DATA_URL,
          quality: 50,
          correctOrientation: true,
          targetWidth: 400
      });
  };

  this.hideSplashScreen = function() {
      navigator.splashscreen.hide();
  };

  this.socialShare = function(text){
      window.plugins.socialsharing.share(text);
  };

  this.initMap = function(DOMElementId, center, events) {
    function addEventsToMap(map, events){
      if(events) {
        var mousedownEvent = events.mousedown,
        idleEvent = events.idle,
        longpressEvent = events.longpress;
        if(mousedownEvent) {
          map.on(plugin.google.maps.event.MAP_CLICK, function(latLng) {
            mousedownEvent();
          });
        }
        if(idleEvent) {
          var idleTimer;

          map.on(plugin.google.maps.event.CAMERA_CHANGE, function(latLng) {
            if(idleTimer) {
              clearTimeout(idleTimer);
            }
            idleTimer = setTimeout(function(){
              if(idleTimer) {
                idleEvent();
                clearTimeout(idleTimer);
              }
            }, 1000);
          });
        }
        if(longpressEvent){
          map.on(plugin.google.maps.event.MAP_LONG_CLICK, function(latLng) {
            longpressEvent({
              latitude: latLng.lat,
              longitude: latLng.lng
            });
          });
        }
      }
    }

    var map = plugin.google.maps.Map.getMap(document.getElementById(DOMElementId), {
      'backgroundColor': 'white',
      'mapType': plugin.google.maps.MapTypeId.ROADMAP,
      'controls': {
        'compass': true,
        'myLocationButton': true,
        'indoorPicker': true,
        'zoom': true
      },
      'gestures': {
        'scroll': true,
        'tilt': true,
        'rotate': true,
        'zoom': true
      },
      'camera': {
        'latLng': new plugin.google.maps.LatLng(center.latitude, center.longitude),
        'zoom': 16
      }
    });

    var serviceMap = new google.maps.Map(document.createElement('div'), {
        center: {lat: center.latitude, lng: center.longitude},
    });


    addEventsToMap(map, events);

    return new Promise(function(resolve, reject) {
      // Wait until the map is ready status.
      map.addEventListener(plugin.google.maps.event.MAP_READY, function() {
        resolve(map, serviceMap);
      });
    });
  };

  this.setMapClickable = function(map, clickable) {
    if(map && clickable !== undefined) {
      map.setClickable(clickable);
    }
  };

  this.getMapBoundingBox = function(map) {
    return new Promise(function(resolve, reject) {
      map.getVisibleRegion(function(bounds) {
        resolve({
          latitude: {
            upper: bounds.northeast.lat,
            lower: bounds.southwest.lat
          },
          longitude: {
            upper: bounds.northeast.lng,
            lower: bounds.southwest.lng
          }
        });
      });      
    });
  };

  this.getMapZoom = function(map) {
    return new Promise(function(resolve) {
      map.getCameraPosition(function(camera) {
        resolve(camera.zoom);
      });
    });
  };

  this.getMapCenter = function(map) {
    return new Promise(function(resolve) {
      map.getCameraPosition(function(camera) {
        resolve({
          latitude: camera.target.lat,
          longitude: camera.target.lng
        });
      });
    });
  };

  this.setMapZoom = function(map, zoom) {
      map.setZoom(zoom);
  };

  this.setMapCenter = function(map, center) {
      map.setCenter(new plugin.google.maps.LatLng(center.latitude, center.longitude));
  };

  this.moveMapTo = function(map, center, zoom) {
    map.animateCamera({
      target: {lat: center.latitude, lng: center.longitude},
      zoom: zoom,
      duration: 1000
    }, function() {});
  };

  this.createMarker = function(map, location, markerData, onMarkerClick, infoWindowData, extraData){
    return new Promise(function(resolve, reject){
      var latLng = new plugin.google.maps.LatLng(location.latitude, location.longitude);
      map.addMarker({
        'position': latLng,
        'title': infoWindowData.title,
        'snippet': infoWindowData.snippet,
        'styles': (extraData && extraData.distanceTooFar) ? {color: 'red'} : undefined,
        'icon': {
          'url': 'www/img/markers/' + markerData.path + '.png'
        }
      }, function(marker) {
        marker.setIcon({
          'url': 'www/img/markers/' + markerData.path + '.png',
          'size': {
            width: markerData.scaledSize.w,
            height: markerData.scaledSize.h
          }
        });

        if(extraData && extraData.distanceTooFar) {
          marker.setSnippet(extraData.distanceTooFar);
        }

        //marker.setIconAnchor(markerData.anchor.x, markerData.anchor.y);

        if(onMarkerClick) {
          marker.addEventListener(plugin.google.maps.event.MARKER_CLICK, function() {
            onMarkerClick();
            //map.setCenter({lat: location.latitude, lng: location.longitude});
          });
        }

        resolve(marker);

      });
    });
  };

  this.removeMarker = function(marker) {
      marker.remove();
  };

  this.createCurrentLocationMarker = function(){
      return Promise.resolve();
  };

	return this;
};

Android.prototype = new Platform();