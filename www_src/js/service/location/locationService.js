
angular.module('location.Service', ['map.Service'])
    .factory('locationService', ['$rootScope', 'mapService', function($rootScope, mapService){
		var locationInterval, oldLocation, watchId;
		var intervalTime = 8000, geolocationTimeout = 5000, cumulativeDeltaResetValue = 1; // km
		
		function startLocationInterval() {
			console.log('starting location interval...');
			if (!$rootScope.location) {
				$rootScope.location = {};
			}
		
			locationInterval = setInterval(function(){
        		oldLocation = $rootScope.location;
				navigator.geolocation.getCurrentPosition(function(position) {
					$rootScope.location = {
						latitude: position.coords.latitude,
						longitude: position.coords.longitude,
						delta: 0
					};

					if(oldLocation.latitude) {
						$rootScope.location.delta = mapService.getDistanceBetweenLocations($rootScope.location, oldLocation);
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

					console.log('location successfully gained: ' + JSON.stringify(
						$rootScope.location));
					if(!watchId) {
						watchId = navigator.geolocation.watchPosition(function() {});
					}
					localStorage.setItem('location', angular.toJson($rootScope.location));
					$rootScope.$broadcast('locationChanged', {
						oldLocation: oldLocation
					});
				}, function(err) {
					checkLocationAvailability(function(){

					}, function(){
						console.log('location failed...');
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
					maximumAge: 0
				});
			}, intervalTime);
		}
		
		function stopLocationInterval() {
			console.log('stopping location interval...');
			clearInterval(locationInterval);
			if(watchId) {
				navigator.geolocation.clearWatch(watchId);
				watchId = undefined;
			}
		}

		function checkLocationAvailability(onEnabled, onDisabled, failure){
			if(myApp.isCordovaApp) {
				document.addEventListener("deviceready",function() {
		            cordova.plugins.diagnostic.isLocationEnabled(function(enabled){
		                if(enabled) {
		                    onEnabled();
		                }
		                else {
		                	onDisabled();
		                }
		            },failure);
		        });
			}
			else {
				onEnabled();
			}
		}

		function openLocationDialog(onNo, onLater, onYes){
			document.addEventListener("deviceready",function() {
				cordova.dialogGPS("Your GPS is Disabled, this app needs to be enable to works.",//message
                            "Use GPS, with wifi or 3G.",//description
                            function(buttonIndex){//callback
                              switch(buttonIndex) {
                                case 0:  onNo(); break;//cancel
                                case 1:  onLater(); break;//neutro option
                                case 2:  onYes(); break;//positive option
                              }},
                              "Please Turn on GPS",//title
                              ["No","Yes"]);//buttons
			 });
		}

		return {
			openLocationDialog: openLocationDialog,
			checkLocationAvailability: checkLocationAvailability,
			startLocationInterval: startLocationInterval,
			stopLocationInterval: stopLocationInterval
		};
	}]);