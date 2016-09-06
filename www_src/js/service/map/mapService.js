angular.module('map.Service', ['google'])
    .factory('mapService', ['$q', '$rootScope', 'googleService',  
        function($q, $rootScope, googleService) {
        var self = {};

        /**
         * @param {number} distance - distance (km) from the point represented by centerPoint
         * @param {array} centerPoint - two-dimensional array containing center coords [latitude, longitude]
         * @description
         *   Computes the bounding coordinates of all points on the surface of a sphere
         *   that has a great circle distance to the point represented by the centerPoint
         *   argument that is less or equal to the distance argument.
         *   Technique from: Jan Matuschek <http://JanMatuschek.de/LatitudeLongitudeBoundingCoordinates>
         * @author Alex Salisbury
         */
        self.getBoundingBox = function(centerPoint, distance) {
            var MIN_LAT, MAX_LAT, MIN_LON, MAX_LON, R, radDist, degLat,
                degLon,
                radLat, radLon, minLat, maxLat, minLon, maxLon, deltaLon;
            if (distance < 0) {
                return 'Illegal arguments';
            }
            // helper functions (degrees<–>radians)
            Number.prototype.degToRad = function() {
                return this * (Math.PI / 180);
            };
            Number.prototype.radToDeg = function() {
                return (180 * this) / Math.PI;
            };
            // coordinate limits
            MIN_LAT = (-90).degToRad();
            MAX_LAT = (90).degToRad();
            MIN_LON = (-180).degToRad();
            MAX_LON = (180).degToRad();
            // Earth's radius (km)
            R = 6378.1;
            // angular distance in radians on a great circle
            radDist = distance / R;
            // center point coordinates (deg)
            degLat = centerPoint.latitude;
            degLon = centerPoint.longitude;
            // center point coordinates (rad)
            radLat = degLat.degToRad();
            radLon = degLon.degToRad();
            // minimum and maximum latitudes for given distance
            minLat = radLat - radDist;
            maxLat = radLat + radDist;
            // minimum and maximum longitudes for given distance
            minLon = void 0;
            maxLon = void 0;
            // define deltaLon to help determine min and max longitudes
            deltaLon = Math.asin(Math.sin(radDist) / Math.cos(radLat));
            if (minLat > MIN_LAT && maxLat < MAX_LAT) {
                minLon = radLon - deltaLon;
                maxLon = radLon + deltaLon;
                if (minLon < MIN_LON) {
                    minLon = minLon + 2 * Math.PI;
                }
                if (maxLon > MAX_LON) {
                    maxLon = maxLon - 2 * Math.PI;
                }
            }
            // a pole is within the given distance
            else {
                minLat = Math.max(minLat, MIN_LAT);
                maxLat = Math.min(maxLat, MAX_LAT);
                minLon = MIN_LON;
                maxLon = MAX_LON;
            }
            return {
                latitude: {
                    upper: maxLat.radToDeg(),
                    lower: minLat.radToDeg()
                },
                longitude: {
                    upper: maxLon.radToDeg(),
                    lower: minLon.radToDeg()
                }
            };
        };

        self.initMap = function(DOMElementId, swLat, swLng, neLat, neLng, events) {
            var map = googleService.initMap(DOMElementId, events);
            self.setMapBoundingBox(map, swLat, swLng, neLat, neLng);
            return map;
        };

        self.setMapBoundingBox = function(map, swLat, swLng, neLat, neLng) {
            googleService.setMapBoundingBox(map, swLat, swLng, neLat, neLng);
        };

        self.createMarker = function(map, location, markerData, onMarkerClick, infoWindowData, onInfoWindowClick) {
            return googleService.createMarker(map, location, markerData, onMarkerClick, infoWindowData, onInfoWindowClick);
        };

        self.initAutocomplete = function(map, DOMElementId, boundingBox, onPlaceSelected){
            googleService.initAutocomplete(map, DOMElementId, boundingBox, onPlaceSelected);
        };

        self.searchByText = function(query, location, radius, map, callback){
            googleService.searchByText(query, location, radius, map, callback);
        };

        self.retrieveNearbyPlaces = function() {
            var def = $q.defer();
            googleService.getNearbyPlaces(angular.fromJson(localStorage.getItem('location')), function(nearbyPlaces) {
                def.resolve(nearbyPlaces);
            },
            function() {
                def.resolve([]);
            });
            return def.promise;
        };

        self.getAddressByLocation = function(map, location, onSuccess){
            googleService.getAddressByLocation(map, location, onSuccess);
        };

        return self;
    }])
    .constant('mapConstants', {
        MARKERS: {
            CROWD: {
                INFO: {
                    anchor: {x:7, y: 40},
                    scaledSize: {w: 14, h: 40}
                },
                PATHS: {
                    '0': '0',
                    '10': '10',
                    '20': '20',
                    '30': '30',
                    '40': '40',
                    '50': '50',
                    '60': '60',
                    '70': '70',
                    '80': '80',
                    '90': '90',
                    '100': '100',
                    'ASK': 'ask'
                }
            },
            OTHER: {
                INFO: {
                    anchor: {x:12, y: 12},
                    scaledSize: {w: 24, h: 24}
                },
                PATHS: {
                    'CURRENT_LOCATION': 'gpsloc'
                }
            }
            
        }
    });