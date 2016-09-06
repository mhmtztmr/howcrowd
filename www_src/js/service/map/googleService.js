
angular.module('google', ['config']).
	factory('googleService', ['$compile','$rootScope', 'configService', function($compile, $rootScope, configService) {
	
	var self = {}, placeTypes = ['accounting',
	'airport',
	'amusement_park',
	'aquarium',
	'art_gallery',
	'atm',
	'bakery',
	'bank',
	'bar',
	'beauty_salon',
	'bicycle_store',
	'book_store',
	'bowling_alley',
	'bus_station',
	'cafe',
	'campground',
	'car_dealer',
	'car_rental',
	'car_repair',
	'car_wash',
	'casino',
	'cemetery',
	'church',
	'city_hall',
	'clothing_store',
	'convenience_store',
	'courthouse',
	'dentist',
	'department_store',
	'doctor',
	'electrician',
	'electronics_store',
	'embassy',
	'establishment',
	'finance',
	'fire_station',
	'florist',
	'food',
	'funeral_home',
	'furniture_store',
	'gas_station',
	'general_contractor',
	'grocery_or_supermarket',
	'gym',
	'hair_care',
	'hardware_store',
	'health',
	'hindu_temple',
	'home_goods_store',
	'hospital',
	'insurance_agency',
	'jewelry_store',
	'laundry',
	'lawyer',
	'library',
	'liquor_store',
	'local_government_office',
	'locksmith',
	'lodging',
	'meal_delivery',
	'meal_takeaway',
	'mosque',
	'movie_rental',
	'movie_theater',
	'moving_company',
	'museum',
	'night_club',
	'painter',
	'park',
	'parking',
	'pet_store',
	'pharmacy',
	'physiotherapist',
	'place_of_worship',
	'plumber',
	'police',
	'post_office',
	'real_estate_agency',
	'restaurant',
	'roofing_contractor',
	'rv_park',
	'school',
	'shoe_store',
	'shopping_mall',
	'spa',
	'stadium',
	'storage',
	'store',
	'subway_station',
	'synagogue',
	'taxi_stand',
	'train_station',
	'travel_agency',
	'university',
	'veterinary_care',
	'zoo'];

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
				if(imgX == '-18') imgX = '0';
				else imgX = '-18';
				document.getElementById('you_location_img').style.backgroundPosition = imgX+'px 0px';
			}, 500);
			if($rootScope.location.latitude){
        		var center = {lat: $rootScope.location.latitude, lng: $rootScope.location.longitude};
          		map.panTo(center);
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
			var mousedownEvent = events['mousedown'],
			longpressEvent = events['longpress'];
			if(mousedownEvent) {
				google.maps.event.addListener(map, 'mousedown', function () {
		            mousedownEvent();
		        });
			}
			if(longpressEvent){
		        var longpressTimer;
			    google.maps.event.addListener(map, 'mousedown', function(event){
			    	if(longpressTimer) {
				    	clearTimeout(longpressTimer);
				    }
	                start = new Date().getTime();
	                longpressTimer = setTimeout(function(){
	                	if(longpressEvent) {
	                		longpressEvent(event);
	                		clearTimeout(longpressTimer);
	                	}
	                }, 1000);
	            });
			    google.maps.event.addListener(map, 'mouseup', function(event){
	                if(longpressTimer) {
				    	clearTimeout(longpressTimer);
				    }
	            });
	            google.maps.event.addListener(map, 'dragstart', function(event){
	                if(longpressTimer) {
				    	clearTimeout(longpressTimer);
				    }
	            });
	            google.maps.event.addListener(map, 'bounds_changed', function(event){
	                if(longpressTimer) {
				    	clearTimeout(longpressTimer);
				    }
	            });
			}
		}	
	}

	self.initMap = function(DOMElementId, events) {
		var map = new google.maps.Map(document.getElementById(DOMElementId), {
			zoom: 15,
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

	self.setMapZoom = function(map, zoom){
		map.setZoom(zoom);
	};

	self.setMapBoundingBox = function(map, swLat, swLng, neLat, neLng) {
		map.fitBounds(new google.maps.LatLngBounds({
			lat: swLat,
			lng: swLng
		}, {
			lat: neLat,
			lng: neLng
		}));
		map.setZoom(15);
	};

    self.initAutocomplete = function(map, DOMElementId, boundingBox, onPlaceSelected){
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
          	onPlaceSelected(place);
        });
    };

    self.createInfoWindow = function(map, marker, infoWindowData, onInfoWindowClick){
    	var infowindow = new google.maps.InfoWindow({
			content: infoWindowData
		});
		google.maps.event.addListener(marker, 'click', function(){
			infowindow.open(map, marker);
		});
		return infowindow;
    };

    self.createMarker = function(map, location, markerData, onMarkerClick, infoWindowData, onInfoWindowClick){
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
          		map.panTo({lat: location.latitude, lng: location.longitude});
			});
		}
		return marker;
    };

	self.searchByText = function(query, location, radius, map, callback){
		var service = new google.maps.places.PlacesService(map);
		var request = {
            location: new google.maps.LatLng(location.latitude, location.longitude),
            radius:  (radius * 1000) + '',
            types: placeTypes,
            name : query
        };
                          
        service.nearbySearch(request, function(results, status){
          	if (status == google.maps.places.PlacesServiceStatus.OK) {
            	callback(results);
          	}
        });
	};
	
	self.getNearbyPlaces = function(location, onSuccess) {
		var nearPlaces = [];
		var latLng = new google.maps.LatLng(location.latitude, location.longitude);
		var mapOptions = {
			zoom: 13,
			center: latLng
		};
		var map = new google.maps.Map(document.createElement('div'), mapOptions);
		var service = new google.maps.places.PlacesService(map);
		var nearbyRequest = {
			location: latLng,
			radius: configService.NEARBY_DISTANCE*1000, //m
			types: placeTypes
		};
		service.nearbySearch(nearbyRequest, function(results, status) {
			if (status === google.maps.places.PlacesServiceStatus.OK) {
				for (var i = 0; i < results.length; i++) {
					var place = results[i];
					var nearPlace = {
						sid: place.place_id,
						name: place.name,
						location: {
							latitude: place.geometry.location.lat(),
							longitude: place.geometry.location.lng()
						},
						source: 'google',
						vicinity: place.vicinity,
						district: getDistrictFromVicinity(place.vicinity)
					};
					if(place.photos){
						nearPlace.photo = place.photos[0].getUrl({'maxWidth': 600, 'maxHeight': 600});
					}
					if(place.types && place.types.length > 0){
						nearPlace.type = place.types[0];
					}
						
					nearPlaces.push(nearPlace);
				}
			}
			onSuccess(nearPlaces);
		});
	};

	function getDistrictFromVicinity(vicinity){
		if(vicinity)
			return vicinity.replace("No:", "<notoreplaceback>").replace("No, ", "").replace("No", "").replace("<notoreplaceback>", "No:");
	}

	self.getAddressByLocation = function(map, location, onSuccess){
		if(location) {
			self.searchByText(undefined, location, configService.LONGPRESS_ASK_DISTANCE, map, onSuccess);
		 }
		 else {
		 	onSuccess();
		 }
	};

	return self;
}]);