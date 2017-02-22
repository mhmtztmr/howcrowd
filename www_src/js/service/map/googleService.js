angular.module('google', ['config', 'placeType', 'interface']).
	factory('googleService', ['$compile','$rootScope', 'configService', 'placeTypeConstants', 'placeTypeService', 'INTERFACE', function($compile, $rootScope, configService, placeTypeConstants, placeTypeService, INTERFACE) {
	
	var self = {}, mapDiv, serviceMap;

	self.initMap = function(DOMElementId, center, events) {
		return new Promise(function(resolve, reject) {
			INTERFACE.initMap(DOMElementId, center, events).then(function(_map, _serviceMap) {
				serviceMap = _serviceMap;
				resolve(_map);
			}, reject);
		});
	};

	self.setMapClickable = function(map, clickable) {
        INTERFACE.setMapClickable(map, clickable);
    };

	self.resetMapPosition = function(map, center) {
		self.setMapZoom(map, 16);
		self.setMapCenter(map, center);
	};

	self.getMapBoundingBox = function(map) {
		return INTERFACE.getMapBoundingBox(map);
	};

	self.getMapZoom = function(map) {
        return INTERFACE.getMapZoom(map);
    };

    self.getMapCenter = function(map) {
        return INTERFACE.getMapCenter(map);
    };

    self.setMapZoom = function(map, zoom) {
        INTERFACE.setMapZoom(map, zoom);
    };

    self.setMapCenter = function(map, center) {
        INTERFACE.setMapCenter(map, center);
    };

    self.moveMapTo = function(map, center, zoom) {
        INTERFACE.moveMapTo(map, center, zoom);
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

    self.isAutocompleteVisible = function() {
        var autocompleteElement = document.getElementsByClassName('pac-container')[0];
        return autocompleteElement && autocompleteElement.offsetParent !== null;
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

    self.createCurrentLocationMarker = function(map, location, markerData, onMarkerClick, infoWindowData, extraData){
    	return INTERFACE.createCurrentLocationMarker(map, location, markerData, onMarkerClick, infoWindowData, extraData);
    };

    self.removeMarker = function(marker) {
        INTERFACE.removeMarker(marker);
    };

    function getBoundsZoomLevel(bounds, mapDim) {
	    var WORLD_DIM = { height: 256, width: 256 };
	    var ZOOM_MAX = 21;

	    function latRad(lat) {
	        var sin = Math.sin(lat * Math.PI / 180);
	        var radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
	        return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
	    }

	    function zoom(mapPx, worldPx, fraction) {
	        return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
	    }

	    var ne = bounds.getNorthEast();
	    var sw = bounds.getSouthWest();

	    var latFraction = (latRad(ne.lat()) - latRad(sw.lat())) / Math.PI;

	    var lngDiff = ne.lng() - sw.lng();
	    var lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360;

	    var latZoom = zoom(mapDim.height, WORLD_DIM.height, latFraction);
	    var lngZoom = zoom(mapDim.width, WORLD_DIM.width, lngFraction);

	    return Math.min(latZoom, lngZoom, ZOOM_MAX);
	}

	self.searchPlaces = function(mapDOMElementId, query, location, radius){
		var placeTypes = Object.keys(placeTypeConstants.google), places = [],
		bounds = new google.maps.LatLngBounds();
		return new Promise(function(resolve, reject){
			if(!serviceMap) {
				var latLng = new google.maps.LatLng(location.latitude, location.longitude);
				var mapOptions = {
					zoom: 13,
					center: latLng
				};
				serviceMap = new google.maps.Map(document.createElement('div'), mapOptions);
			}
			var service = new google.maps.places.PlacesService(serviceMap);
			var request = {
	            location: new google.maps.LatLng(location.latitude, location.longitude),
	            radius:  (radius * 1000) + '',
	            types: placeTypes,
	            name : query
	        };
	                          
	        service.nearbySearch(request, function(results, status, pagination){
	          	if (status === google.maps.places.PlacesServiceStatus.OK) {
	          		var i, place, center, zoom;
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
	          		if(pagination.hasNextPage) {
	          			pagination.nextPage();
	          		}
	          		else {
	          			if(mapDOMElementId) {
		          			center = {
		          				latitude: bounds.getCenter().lat(),
		          				longitude: bounds.getCenter().lng()
		          			};
		          			zoom = getBoundsZoomLevel(bounds, {
			          			height: document.getElementById(mapDOMElementId).clientHeight,
			          			width: document.getElementById(mapDOMElementId).clientWidth
			          		});
		          		}
		            	resolve({
		            		places: places, 
		            		center: center,
		          			zoom: zoom
		          		});
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