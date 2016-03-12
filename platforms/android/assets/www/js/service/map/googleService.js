var googleService = function() {
	
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
		'zoo'];

  function initMap(DOMElementId) {
    return new google.maps.Map(document.getElementById(DOMElementId));
  }

  function setMapBoundingBox(map, swLat, swLng, neLat, neLng) {
    map.fitBounds(new google.maps.LatLngBounds({
      lat: swLat,
      lng: swLng
    }, {
      lat: neLat,
      lng: neLng
    }));
  }

  function markPlaceOnMap(map, latitude, longitude, crowdValue, clickEvent) {
    var latLng = new google.maps.LatLng(latitude, longitude);
    var marker = new google.maps.Marker({
      map: map,
      position: latLng,
      icon: {
        url: 'img/markers/' + (Math.ceil(crowdValue / 10) * 10) + '.png',
        anchor: new google.maps.Point(7, 35),
        scaledSize: new google.maps.Size(14, 35)
      }
    });
    google.maps.event.addListener(marker, 'click', clickEvent);
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
      radius: 75,
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
            source: 'google'
          };
          nearPlaces.push(nearPlace);
        }
      }
      onSuccess(nearPlaces);
    });
  }

  return {
    initMap: initMap,
    setMapBoundingBox: setMapBoundingBox,
    markPlaceOnMap: markPlaceOnMap,
    getNearbyPlaces: getNearbyPlaces
  };
};

angular.module('google', [])
  .factory('googleService', [googleService]);
