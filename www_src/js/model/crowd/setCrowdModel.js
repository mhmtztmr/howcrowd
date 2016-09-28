angular.module('setCrowd.Model', ['setCrowd.Service', 'map.Service', 'config'])
    .factory('setCrowdModel', ['$rootScope', 'configService', 'setCrowdService', 'mapService',
        function($rootScope, configService, setCrowdService, mapService) {

            var self = {};

            self.insertCrowd = function(place, crowd, device, onSuccess, onFailure) {
                setCrowdService.insertCrowd(place, crowd, device, onSuccess, onFailure);
            };

            self.selectPlace = function(place) {
                return new Promise(function(resolve) {
                    resolve(place);
                });
            };

            self.loadNearbyPlaces = function() {
                return new Promise(function(resolve, reject){
                    var p1 = mapService.searchPlaces(undefined, undefined, $rootScope.location, configService.NEARBY_DISTANCE);
                    Promise.all([p1]).then(function(result) {
                        resolve(result[0]);
                    }, reject);
                });
            };

            return self;
        }
    ]);