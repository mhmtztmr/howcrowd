angular.module('google', ['config', 'placeType', 'interface']).
	factory('googleService', ['$compile','$rootScope', 'configService', 'placeTypeConstants', 'placeTypeService', 'INTERFACE', function($compile, $rootScope, configService, placeTypeConstants, placeTypeService, INTERFACE) {
	
	var self = {};

	self.initMap = function(DOMElementId, center, events) {
		return INTERFACE.initMap(DOMElementId, center, events);
	};

	// self.resetMap = function(map, center) {
	// 	map.setZoom(16);
	// 	map.setCenter({lat: center.latitude, lng: center.longitude});
	// };

	// self.setMapZoom = function(map, zoom){
	// 	map.setZoom(zoom);
	// };

	self.getMapBoundingBox = function(map) {
		return INTERFACE.getMapBoundingBox(map);
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
    	return INTERFACE.initAutocomplete(map, DOMElementId, boundingBox, function(place) {
    		onPlaceSelected(getFormattedPlace(place));
    	});
    };

  //   self.createInfoWindow = function(map, marker, infoWindowData){
  //   	var infowindow = new google.maps.InfoWindow({
		// 	content: infoWindowData
		// });
		// google.maps.event.addListener(marker, 'click', function(){
		// 	infowindow.open(map, marker);
		// });
		// return infowindow;
  //   };

    self.createMarker = function(map, location, markerData, onMarkerClick, infoWindowData, extraData){
    	return INTERFACE.createMarker(map, location, markerData, onMarkerClick, infoWindowData, extraData);
    };

    self.removeMarker = function(marker) {
        INTERFACE.removeMarker(marker);
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