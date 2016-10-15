angular.module('google', ['config', 'placeType']).
	factory('googleService', ['$compile','$rootScope', 'configService', 'placeTypeConstants', 'placeTypeService', function($compile, $rootScope, configService, placeTypeConstants, placeTypeService) {
	
	var self = {};

	function addYourLocationButtonToMap(map)	{
		var controlDiv = document.createElement('div');
		
		var firstChild = document.createElement('button');
		firstChild.style.backgroundColor = '#fff';
		firstChild.style.border = 'none';
		firstChild.style.outline = 'none';
		firstChild.style.width = '28px';
		firstChild.style.height = '28px';
		firstChild.style.borderRadius = '2px';
		firstChild.style.boxShadow = '0 1px 4px rgba(0,0,0,0.3)';
		firstChild.style.cursor = 'pointer';
		firstChild.style.marginRight = '10px';
		firstChild.style.padding = '0px';
		firstChild.title = 'Your Location';
		controlDiv.appendChild(firstChild);
		
		var secondChild = document.createElement('div');
		secondChild.style.margin = '5px';
		secondChild.style.width = '18px';
		secondChild.style.height = '18px';
		secondChild.style.backgroundImage = 'url(https://maps.gstatic.com/tactile/mylocation/mylocation-sprite-1x.png)';
		secondChild.style.backgroundSize = '180px 18px';
		secondChild.style.backgroundPosition = '0px 0px';
		secondChild.style.backgroundRepeat = 'no-repeat';
		secondChild.id = 'you_location_img';
		firstChild.appendChild(secondChild);
		
		google.maps.event.addListener(map, 'dragend', function() {
			document.getElementById('you_location_img').style.backgroundPosition = '0px 0px';
		});

		firstChild.addEventListener('click', function() {
			var imgX = '0';
			var animationInterval = setInterval(function(){
				if(imgX === '-18') {
					imgX = '0';
				}
				else {
					imgX = '-18';
				}
				document.getElementById('you_location_img').style.backgroundPosition = imgX+'px 0px';
			}, 500);
			if($rootScope.location.latitude){
        		var center = {lat: $rootScope.location.latitude, lng: $rootScope.location.longitude};
          		map.setZoom(16);
          		map.setCenter(center);
          		clearInterval(animationInterval);
				document.getElementById('you_location_img').style.backgroundPosition = '-144px 0px';
        	}
        	else {
        		clearInterval(animationInterval);
        		document.getElementById('you_location_img').style.backgroundPosition = '0px 0px';
        	}
		});
		
		controlDiv.index = 1;
		controlDiv.className = 'pinpoint';
		map.controls[google.maps.ControlPosition.LEFT_TOP].push(controlDiv);
	}

	function addEventsToMap(map, events){
		if(events) {
			var mousedownEvent = events.mousedown,
			idleEvent = events.idle,
			longpressEvent = events.longpress;
			if(mousedownEvent) {
				google.maps.event.addListener(map, 'mousedown', function () {
		            mousedownEvent();
		        });
			}
			if(idleEvent) {
				google.maps.event.addListener(map, 'idle', function(){
					idleEvent();
	            });
			}
			if(longpressEvent){
		        var longpressTimer;
			    google.maps.event.addListener(map, 'mousedown', function(event){
			    	if(longpressTimer) {
				    	clearTimeout(longpressTimer);
				    }
	                longpressTimer = setTimeout(function(){
	                	if(longpressEvent) {
	                		longpressEvent(event);
	                		clearTimeout(longpressTimer);
	                	}
	                }, 1000);
	            });
			    google.maps.event.addListener(map, 'mouseup', function(){
	                if(longpressTimer) {
				    	clearTimeout(longpressTimer);
				    }
	            });
	            google.maps.event.addListener(map, 'dragstart', function(){
	                if(longpressTimer) {
				    	clearTimeout(longpressTimer);
				    }
	            });
	            google.maps.event.addListener(map, 'bounds_changed', function(){
	                if(longpressTimer) {
				    	clearTimeout(longpressTimer);
				    }
	            });
			}
		}	
	}

	self.initMap = function(DOMElementId, center, events) {
		var map = new google.maps.Map(document.getElementById(DOMElementId), {
			zoom: 16,
			center: {lat: center.latitude, lng: center.longitude},
			mapTypeControl: false,
			zoomControl: false,
			scaleControl: false,
			streetViewControl: false,
			fullscreenControl: false,
			clickableIcons: false
		});

		addEventsToMap(map, events);
		addYourLocationButtonToMap(map);

		return map;
	};

	self.resetMap = function(map, center) {
		map.setZoom(16);
		map.setCenter({lat: center.latitude, lng: center.longitude});
	};

	self.setMapZoom = function(map, zoom){
		map.setZoom(zoom);
	};

	self.getMapBoundingBox = function(map) {
		var bounds = map.getBounds();

		return {
			latitude: {
				upper: bounds.getNorthEast().lat(),
				lower: bounds.getSouthWest().lat()
			},
			longitude: {
				upper: bounds.getNorthEast().lng(),
				lower: bounds.getSouthWest().lng()
			}
		};
	};

	self.setMapBoundingBox = function(map, swLat, swLng, neLat, neLng) {
		map.fitBounds(new google.maps.LatLngBounds({
			lat: swLat,
			lng: swLng
		}, {
			lat: neLat,
			lng: neLng
		}));
		map.setZoom(16);
	};

	function getFormattedPlace(place) {
		var address, type, location = {}, photoURL;
        if (place.address_components) {
            address = [
                (place.address_components[0] && place.address_components[0].short_name || ''),
                (place.address_components[1] && place.address_components[1].short_name || ''),
                (place.address_components[2] && place.address_components[2].short_name || '')
            ].join(' ');
        }
        else if(place.vicinity) {
        	address = place.vicinity;
        }
        if(place.types && place.types.length > 0){
			type = place.types[0];
		}
		if(place.geometry) {
			location = {
				latitude: place.geometry.location.lat(),
            	longitude: place.geometry.location.lng(),
			};
		}
		if(place.photos && place.photos.length > 0) {
			photoURL = place.photos[0].getUrl({'maxWidth': 600, 'maxHeight': 600});
		}

		var placeObject =  new Place({
			source: 'google',
			name: place.name,
			latitude: location.latitude,
            longitude: location.longitude,
			type: type,
			photoURL: photoURL,
			address: address,
			sourceID: place.place_id
		});

		placeObject.location = location;
		placeObject.typeObject = placeTypeService.getTypeObject(placeObject);

		return placeObject;
	}

    self.initAutocomplete = function(map, DOMElementId, boundingBox, onPlaceSelected){
    	return new Promise(function(resolve, reject){
	        var input = document.getElementById(DOMElementId);
	        var defaultBounds = new google.maps.LatLngBounds(
	            new google.maps.LatLng(boundingBox.latitude.lower, boundingBox.longitude.lower),
	            new google.maps.LatLng(boundingBox.latitude.upper, boundingBox.longitude.upper));
	        var options = {
	            bounds: defaultBounds,
	            types: ['establishment']
	        };
	        var autocomplete = new google.maps.places.Autocomplete(input, options);

	        autocomplete.addListener('place_changed', function() {
	          	var place = autocomplete.getPlace();
	          	onPlaceSelected(getFormattedPlace(place));
	        });
	        resolve();
        });
    };

    self.createInfoWindow = function(map, marker, infoWindowData){
    	var infowindow = new google.maps.InfoWindow({
			content: infoWindowData
		});
		google.maps.event.addListener(marker, 'click', function(){
			infowindow.open(map, marker);
		});
		return infowindow;
    };

    self.createMarker = function(map, location, markerData, onMarkerClick, infoWindowData){
    	var latLng = new google.maps.LatLng(location.latitude, location.longitude);
    	var marker = new google.maps.Marker({
			map: map,
			position: latLng,
			icon: {
				url: 'img/markers/' + markerData.path + '.png',
				anchor: new google.maps.Point(markerData.anchor.x, markerData.anchor.y),
				scaledSize: new google.maps.Size(markerData.scaledSize.w, markerData.scaledSize.h)
			}
		});

		if(onMarkerClick) {
			google.maps.event.addListener(marker, 'click', function(){
				var infowindow;
				if(infoWindowData) {
					infowindow = new google.maps.InfoWindow({
						content: infoWindowData
					});
					infowindow.open(map, marker);
				}
				onMarkerClick(infowindow);
          		map.setCenter({lat: location.latitude, lng: location.longitude});
			});
		}
		return marker;
    };

	self.searchPlaces = function(map, query, location, radius){
		var placeTypes = Object.keys(placeTypeConstants.google);
		return new Promise(function(resolve, reject){
			var tmpMap = map;
			if(!tmpMap) {
				var latLng = new google.maps.LatLng(location.latitude, location.longitude);
				var mapOptions = {
					zoom: 13,
					center: latLng
				};
				tmpMap = new google.maps.Map(document.createElement('div'), mapOptions);
			}
			var service = new google.maps.places.PlacesService(tmpMap);
			var request = {
	            location: new google.maps.LatLng(location.latitude, location.longitude),
	            radius:  (radius * 1000) + '',
	            types: placeTypes,
	            name : query
	        };
	                          
	        service.nearbySearch(request, function(results, status){
	          	if (status === google.maps.places.PlacesServiceStatus.OK) {
	          		var i, place, places = [], bounds = new google.maps.LatLngBounds();
	          		for(i = 0 ; i < results.length; i++) {
	          			place = results[i];
	          			if (place.geometry.viewport) {
			              	// Only geocodes have viewport.
			              	bounds.union(place.geometry.viewport);
			            } else {
			              	bounds.extend(place.geometry.location);
			            }
	          			places.push(getFormattedPlace(place));
	          		}
	            	resolve(places);
	            	if(map) {
	          			map.fitBounds(bounds);
	            	}
	          	}
	          	else {
	          		reject();
	          	}
	        });
        });
	};
	
	return self;
}]);