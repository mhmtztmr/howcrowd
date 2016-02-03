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

    // infoWindow = new google.maps.InfoWindow({
    //     content: "holding..."
    //   }),
    // var infoWindow = new google.maps.InfoWindow();
    // google.maps.event.addListener(marker, 'click', function() {
    //   infoWindow.setContent(kermesItem.title);
    //   infoWindow.open(map, marker);
    //   // service.getDetails(place, function(result, status) {
    //   //   if (status !== google.maps.places.PlacesServiceStatus.OK) {
    //   //     console.error(status);
    //   //     return;
    //   //   }
    //   //   infoWindow.setContent(result.name);
    //   //   infoWindow.open(map, marker);
    //   // });
    // });
  }

  // function initialize() {
  //   geocoder = new google.maps.Geocoder();
  //   var latlng = new google.maps.LatLng(41, 29);
  //   var mapOptions = {
  //     zoom: 8,
  //     center: latlng
  //   };
  //   infoWindow = new google.maps.InfoWindow();
  //   map = new google.maps.Map(document.getElementById("map"), mapOptions);
  //
  //   var textRequest = {
  //     location: latlng,
  //     radius: '1000',
  //     query: 'erbap'
  //   };
  //
  //   var nearbyRequest = {
  //     location: latlng,
  //     radius: 1000,
  //     types: ['restaurant']
  //   }
  //
  //   service = new google.maps.places.PlacesService(map);
  //   //service.textSearch(textRequest, callback);
  //   service.nearbySearch(nearbyRequest, callback);
  // }


  // function callback(results, status) {
  //   if (status == google.maps.places.PlacesServiceStatus.OK) {
  //     for (var i = 0; i < results.length; i++) {
  //       var place = results[i];
  //       addMarker(results[i]);
  //     }
  //   }
  // }

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

  // function addMarker(place) {
  //   var marker = new google.maps.Marker({
  //     map: map,
  //     position: place.geometry.location,
  //     icon: {
  //       url: 'http://maps.gstatic.com/mapfiles/circle.png',
  //       anchor: new google.maps.Point(10, 10),
  //       scaledSize: new google.maps.Size(10, 17)
  //     }
  //   });
  //
  //   google.maps.event.addListener(marker, 'click', function() {
  //     service.getDetails(place, function(result, status) {
  //       if (status !== google.maps.places.PlacesServiceStatus.OK) {
  //         console.error(status);
  //         return;
  //       }
  //       infoWindow.setContent(result.name);
  //       infoWindow.open(map, marker);
  //     });
  //   });
  // }

  return {
    initMap: initMap,
    setMapBoundingBox: setMapBoundingBox,
    markPlaceOnMap: markPlaceOnMap,
    getNearbyPlaces: getNearbyPlaces
  };
};

angular.module('google', [])
  .factory('googleService', [googleService]);
