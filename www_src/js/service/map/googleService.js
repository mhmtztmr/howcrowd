
angular.module('google', ['config']).
	factory('googleService', ['$compile','$rootScope', 'configService', function($compile, $rootScope, configService) {
	
	var placeTypes = ['accounting',
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
	'zoo'], infowindow = null;

	function addYourLocationButton(map)	{
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

	function initMap(DOMElementId) {
		var map = new google.maps.Map(document.getElementById(DOMElementId), {
			zoom: 12,
			mapTypeControl: false,
			zoomControl: false,
			scaleControl: false,
			streetViewControl: false,
			fullscreenControl: false
		});

		addYourLocationButton(map);
		return map;
	}

	function setMapBoundingBox(map, swLat, swLng, neLat, neLng) {
		map.fitBounds(new google.maps.LatLngBounds({
			lat: swLat,
			lng: swLng
		}, {
			lat: neLat,
			lng: neLng
		}));
		map.setZoom(12);
	}

	function markLocationOnMap(map, location){
		var latLng = new google.maps.LatLng(location.latitude, location.longitude);
		var marker = new google.maps.Marker({
			map: map,
			position: latLng,
			icon: {
				url: 'img/markers/gpsloc.png',
				anchor: new google.maps.Point(12, 12),
				scaledSize: new google.maps.Size(24, 24)
			}
		});

		google.maps.event.addListener(marker, 'click', function() {
			if (infowindow) {
				infowindow.close();
			}

			infowindow = new google.maps.InfoWindow({
				content: "your location"
			});
			infowindow.open(map, marker);
		});
		return marker;
	}

	function markPlaceOnMap(map, placeBasedCrowd, clickEvent) {
		var latLng = new google.maps.LatLng(placeBasedCrowd.crowdLocation.latitude, placeBasedCrowd.crowdLocation.longitude);
		var marker = new google.maps.Marker({
			map: map,
			position: latLng,
			icon: {
				url: 'img/markers/' + (Math.ceil(placeBasedCrowd.crowdAverage / 10) * 10) + '.png',
				anchor: new google.maps.Point(7, 40),
				scaledSize: new google.maps.Size(14, 40)
			}
		});

		var scope = $rootScope.$new();
		scope.placeBasedCrowd = placeBasedCrowd;

    	scope.selectPlaceBasedCrowd = clickEvent;

		var contentString = '<div>'+
		'<div class="crowd-main-body crowd-info-window" ng-click="selectPlaceBasedCrowd(placeBasedCrowd)">' +
		'<div class="crowd-left">' +
		'<div class="crowd-source-icon">' +
		'<img ng-src="img/sources/{{placeBasedCrowd.placeSource}}.png" />' +
		'</div>' +
		'</div>' +
		'<div class="crowd-center">' +
		'<div class="crowd-place-name">{{placeBasedCrowd.placeName}}</div>' +
		'<div class="crowd-city" ng-show="placeBasedCrowd.placeDistrict"><ons-icon icon="ion-ios-location-outline"></ons-icon> {{placeBasedCrowd.placeDistrict}}</div>' +
		'<div class="crowd-time"><ons-icon icon="ion-ios-clock-outline"> {{placeBasedCrowd.crowdLast.lastUpdatePass}} {{$root.lang.SEE_CROWD_MENU.MIN_AGO}}</div>' +
		'</div>' +
		'<div class="crowd-right">' +
		'<div class="crowd-last-value">{{$root.lang.SEE_CROWD_MENU.LAST_VALUE}} {{placeBasedCrowd.crowdLast.crowdValue}}%</div>' +
		'<div class="crowd-circle">' +
		'<div class="c100 p{{placeBasedCrowd.crowdLast.crowdValue}} crowd-size center">' +
		'<div class="slice">' +
		'<div class="bar"></div>' +
		'<div class="fill"></div>' +
		'</div>' +
		'</div>' +
		'</div>' +
		'<div class="crowd-feedbacks">' +
		'<div ng-if="placeBasedCrowd.crowdLast.crowdFeedback.negativeFeedback !== 0" class="crowd-negative-feedback">{{placeBasedCrowd.crowdLast.crowdFeedback.negativeFeedback}}</div>' +
		'<div ng-if="placeBasedCrowd.crowdLast.crowdFeedback.positiveFeedback !== 0" class="crowd-positive-feedback">{{placeBasedCrowd.crowdLast.crowdFeedback.positiveFeedback}}</div>' +
		'</div>' +
		'</div>' +
		'</div>'+
		'<div class="crowd-average-container">'+
		'<div class="crowd-average-text">{{$root.lang.SEE_CROWD_MENU.AVERAGE_VALUE}} {{placeBasedCrowd.crowdAverage}}%</div>'+
		'<div class="crowd-average-indicator">'+
		'<div class="crowd-average-bar">'+
		'<div class="crowd-average-fill" style="width: {{placeBasedCrowd.crowdAverage}}%"></div>'+
		'</div>'+
		'</div>'+
		'</div>'+
		'</div>';

		var compiledContent = $compile(contentString)(scope);

		google.maps.event.addListener(marker, 'click', function() {
			if (infowindow) {
				infowindow.close();
			}

			infowindow = new google.maps.InfoWindow({
				content: compiledContent[0]
			});
			infowindow.open(map, marker);
		});
		return marker;
	}
	
	function getNearbyPlaces(location, onSuccess) {
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
	}

	function getDistrictFromVicinity(vicinity){
		if(vicinity)
			return vicinity.replace("No:", "<notoreplaceback>").replace("No, ", "").replace("No", "").replace("<notoreplaceback>", "No:");
	}

	function getAddressByLocation(location, onSuccess){
		if(location) {
			var geocoder = new google.maps.Geocoder;

			var latlng = {lat: location.latitude, lng: location.longitude};
			  geocoder.geocode({'location': latlng}, function(results, status) {
			    if (status === google.maps.GeocoderStatus.OK) {
			      if (results[1]) {
			      	onSuccess(results[1].formatted_address);
			      } else {
			        onSuccess();
			      }
			    } else {
			      onSuccess();
			    }
			  });
		 }
		 else {
		 	onSuccess();
		 }
	}

	return {
		initMap: initMap,
		setMapBoundingBox: setMapBoundingBox,
		markLocationOnMap: markLocationOnMap,
		markPlaceOnMap: markPlaceOnMap,
		getNearbyPlaces: getNearbyPlaces,
		getAddressByLocation: getAddressByLocation
	};
}]);