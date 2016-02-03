var googleService = function() {

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
      radius: 100
        // ,
        // types: ['restaurant']
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
