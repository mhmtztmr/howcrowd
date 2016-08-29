app.controller('askCrowdController', ['$rootScope', '$scope', 'mapService', '$filter',
    function($rootScope, $scope, mapService, $filter) {

        var map;
        var service;
        var infoWindow;
        var pyrmont;
        var markers = [];

        function initialize() {
            pyrmont = new google.maps.LatLng($rootScope.location.latitude, $rootScope.location.longitude);

            map = new google.maps.Map(document.getElementById('askMap'), {
                center: pyrmont,
                zoom: 15
            });

            service = new google.maps.places.PlacesService(map);
        }

        function createMarker(place) {
          var marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location,
            icon: {
                url: 'img/markers/0.png',
                anchor: new google.maps.Point(7, 40),
                scaledSize: new google.maps.Size(14, 40)
            }
          });

          google.maps.event.addListener(marker, 'click', function() {
            service.getDetails(place, function(result, status) {
              if (status !== google.maps.places.PlacesServiceStatus.OK) {
                console.error(status);
                return;
              }

              if (infoWindow) {
                infoWindow.close();
                }

                infoWindow = new google.maps.InfoWindow({
                    content: result.name
                });
                  infoWindow.open(map, marker);
            });
          });

          markers.push(marker);
        }

        function callback(results, status) {
          if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
              var place = results[i];
              createMarker(results[i]);
            }
          }
        }

        //initialize();

        $scope.searchInput = {value: ''};

        $scope.searchPlace = function() {
            if ($scope.searchInput.value.length > 1) {

                for (var i = 0; i < markers.length; i++ ) {
                    markers[i].setMap(null);
                }
                markers.length = 0

                var request = {
                    location: pyrmont,
                    radius: (configService.FAR_DISTANCE * 1000) + '',
                    query: $scope.searchInput.value
                };
                          
                service.textSearch(request, callback);
            } 
        };



    //     $scope.selectPlace = function(place) {
            
    //     };

    //     $scope.searchInputChange = function() {
    //         if ($scope.searchInput.value.length > 1) {
    //             $scope.places = $filter('filter')(
    //                 places, $scope.searchInput.value);
    //         } else {
    //             $scope.nearbyPlaces = nearbyPlaces;
    //         }
    //     };
    //     $scope.clearSearchInput = function(){
    //         $scope.searchInput.value = '';
    //         $scope.searchInputChange();
    //     };
    
    }
]);
