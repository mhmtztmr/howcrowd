
angular.module('location.Service', [])
    .factory('locationService', ['$rootScope', function($rootScope){
		var locationInterval, oldLocation, watchId;
		
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
						longitude: position.coords.longitude
					};
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
					timeout: 5000,
					maximumAge: 0
				});
			}, 8000);
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