angular.module('location', ['map.Service', 'interface'])
    .factory('locationService', ['$rootScope', 'mapService', 'INTERFACE', '$log', function($rootScope, mapService, INTERFACE, $log){
		var self = {}, locationInterval, oldLocation, watchId;
		var intervalTime = 6000, geolocationTimeout = 5000, cumulativeDeltaResetValue = 1; // km
		
		self.startLocationInterval = function() {
			$log.log('starting location interval...');
			if (!$rootScope.location) {
				$rootScope.location = {};
			}

			function findLocation(){
        		oldLocation = $rootScope.location;
				navigator.geolocation.getCurrentPosition(function(position) {
					$rootScope.location = {
						latitude: position.coords.latitude,
						longitude: position.coords.longitude,
						delta: 0
					};

					if(oldLocation.latitude) {
						$rootScope.location.delta = self.getDistanceBetweenLocations($rootScope.location, oldLocation);
						$rootScope.location.cumulativeDelta = oldLocation.cumulativeDelta;
						$rootScope.location.overallDelta = oldLocation.overallDelta;
					}

					if(!$rootScope.location.cumulativeDelta) {
						$rootScope.location.cumulativeDelta = $rootScope.location.delta;
					}
					else {
						$rootScope.location.cumulativeDelta += $rootScope.location.delta;
					}

					if($rootScope.location.cumulativeDelta > cumulativeDeltaResetValue) {
						$rootScope.location.cumulativeDelta = 0;
					}

					if(!$rootScope.location.overallDelta) {
						$rootScope.location.overallDelta = $rootScope.location.delta;
					}
					else {
						$rootScope.location.overallDelta += $rootScope.location.delta;
					}

					$log.log('location successfully gained: ' + JSON.stringify(
						$rootScope.location));
					if(!watchId) {
						watchId = navigator.geolocation.watchPosition(function() {});
					}
					localStorage.setItem('location', angular.toJson($rootScope.location));
					$rootScope.$broadcast('locationChanged', {
						oldLocation: oldLocation
					});
				}, function(err) {
					self.checkLocationAvailability(function(){

					}, function(){
						$log.error('location failed...');
						$rootScope.location = {
							error: {
								code: err.code,
								message: err.message
							}
						};
						if(watchId) {
							navigator.geolocation.clearWatch(watchId);
							watchId = undefined;
						}
						$rootScope.$broadcast('locationChanged', {
							oldLocation: oldLocation
						});
					}, function(){});
				}, {
					enableHighAccuracy: true,
					timeout: geolocationTimeout,
					maximumAge: intervalTime * 2
				});
			}

			findLocation();
			locationInterval = setInterval(findLocation, intervalTime);
		};
		
		self.stopLocationInterval = function() {
			$log.log('stopping location interval...');
			clearInterval(locationInterval);
			if(watchId) {
				navigator.geolocation.clearWatch(watchId);
				watchId = undefined;
			}
		};

		self.checkLocationAvailability = function(onEnabled, onDisabled){
			$log.log('Checking location availability...');
			INTERFACE.isLocationEnabled(function(enabled){
				$log.log('Location availability: ' + enabled);
				if(enabled) {
                    onEnabled();
                }
                else {
                	onDisabled();
                }
			});
		};

		self.openGPSDialog = function(onNo, onLater, onYes){
			$log.log('Opening GPS dialog...');
			INTERFACE.openGPSDialog($rootScope.lang.NATIVE_DIALOG.GPS.MESSAGE,
			 $rootScope.lang.NATIVE_DIALOG.GPS.DESCRIPTION, 
			 $rootScope.lang.NATIVE_DIALOG.GPS.TITLE, 
			 {
			 	'NO': onNo,
			 	'LATER': onLater,
			 	'YES': onYes
			 },
			 {
			 	'NO': $rootScope.lang.NATIVE_DIALOG.GPS.NO,
			 	'YES': $rootScope.lang.NATIVE_DIALOG.GPS.YES
			 });
		};

	    //in km
	    self.getDistanceBetweenLocations = function(location1, location2) {
	        // helper functions (degrees<–>radians)
	        Number.prototype.degToRad = function() {
	            return this * (Math.PI / 180);
	        };
	        Number.prototype.radToDeg = function() {
	            return (180 * this) / Math.PI;
	        };

	        var R = 6378.1; //Radius of the earth in km
	        var dLat = (location2.latitude - location1.latitude).degToRad(); //deg2rad below
	        var dLon = (location2.longitude - location1.longitude).degToRad();
	        var a =
	            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
	            Math.cos((location1.latitude).degToRad()) * Math.cos((
	                location2
	                .latitude).degToRad()) *
	            Math.sin(dLon / 2) * Math.sin(dLon / 2);
	        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	        var d = R * c; // Distance in km
	        return d;
	    };

	    /**
         * @param {number} distance - distance (km) from the point represented by centerPoint
         * @param {array} centerPoint - two-dimensional array containing center coords [latitude, longitude]
         * @description
         *   Computes the bounding coordinates of all points on the surface of a sphere
         *   that has a great circle distance to the point represented by the centerPoint
         *   argument that is less or equal to the distance argument.
         *   Technique from: Jan Matuschek <http://JanMatuschek.de/LatitudeLongitudeBoundingCoordinates>
         * @author Alex Salisbury
         */
        self.getBoundingBox = function(centerPoint, distance) {
            var MIN_LAT, MAX_LAT, MIN_LON, MAX_LON, R, radDist, degLat,
                degLon,
                radLat, radLon, minLat, maxLat, minLon, maxLon, deltaLon;
            if (distance < 0) {
                return 'Illegal arguments';
            }
            // helper functions (degrees<–>radians)
            Number.prototype.degToRad = function() {
                return this * (Math.PI / 180);
            };
            Number.prototype.radToDeg = function() {
                return (180 * this) / Math.PI;
            };
            // coordinate limits
            MIN_LAT = (-90).degToRad();
            MAX_LAT = (90).degToRad();
            MIN_LON = (-180).degToRad();
            MAX_LON = (180).degToRad();
            // Earth's radius (km)
            R = 6378.1;
            // angular distance in radians on a great circle
            radDist = distance / R;
            // center point coordinates (deg)
            degLat = centerPoint.latitude;
            degLon = centerPoint.longitude;
            // center point coordinates (rad)
            radLat = degLat.degToRad();
            radLon = degLon.degToRad();
            // minimum and maximum latitudes for given distance
            minLat = radLat - radDist;
            maxLat = radLat + radDist;
            // minimum and maximum longitudes for given distance
            minLon = void 0;
            maxLon = void 0;
            // define deltaLon to help determine min and max longitudes
            deltaLon = Math.asin(Math.sin(radDist) / Math.cos(radLat));
            if (minLat > MIN_LAT && maxLat < MAX_LAT) {
                minLon = radLon - deltaLon;
                maxLon = radLon + deltaLon;
                if (minLon < MIN_LON) {
                    minLon = minLon + 2 * Math.PI;
                }
                if (maxLon > MAX_LON) {
                    maxLon = maxLon - 2 * Math.PI;
                }
            }
            // a pole is within the given distance
            else {
                minLat = Math.max(minLat, MIN_LAT);
                maxLat = Math.min(maxLat, MAX_LAT);
                minLon = MIN_LON;
                maxLon = MAX_LON;
            }
            return {
                latitude: {
                    upper: maxLat.radToDeg(),
                    lower: minLat.radToDeg()
                },
                longitude: {
                    upper: maxLon.radToDeg(),
                    lower: minLon.radToDeg()
                }
            };
        };

		return self;
	}]);