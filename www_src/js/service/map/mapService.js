var mapService = function($q, $rootScope, googleService) {

    //in km
    function getDistanceBetweenLocations(location1, location2) {
        // helper functions (degrees<–>radians)
        Number.prototype.degToRad = function() {
            return this * (Math.PI / 180);
        };
        Number.prototype.radToDeg = function() {
            return (180 * this) / Math.PI;
        };

        R = 6378.1; //Radius of the earth in km
        var dLat = (location2.latitude - location1.latitude).degToRad(); //deg2rad below
        var dLon = (location2.longitude - location1.longitude).degToRad();
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((location1.latitude).degToRad()) * Math.cos((
                location2
                .latitude).degToRad()) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        return d;
    }

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
    function getBoundingBox(centerPoint, distance) {
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
    }

    function initMap(DOMElementId, swLat, swLng, neLat, neLng) {
        var map = googleService.initMap(DOMElementId);
        setMapBoundingBox(map, swLat, swLng, neLat, neLng);
        return map;
    }

    function setMapBoundingBox(map, swLat, swLng, neLat, neLng) {
        googleService.setMapBoundingBox(map, swLat, swLng, neLat, neLng);
    }

    function markPlaceOnMap(map, placeBasedCrowd, clickEvent) {
        googleService.markPlaceOnMap(map, placeBasedCrowd, clickEvent);
    }

    function retrieveNearbyPlaces(location) {
        var def = $q.defer();
        googleService.getNearbyPlaces(location, function(nearbyPlaces) {
                def.resolve(nearbyPlaces);
            },
            function() {
                def.resolve([]);
            });
        return def.promise;
    }

    function getAddressByLocation(location, onSuccess){
        googleService.getAddressByLocation(location, onSuccess);
    }

    return {
        getBoundingBox: getBoundingBox,
        retrieveNearbyPlaces: retrieveNearbyPlaces,
        initMap: initMap,
        setMapBoundingBox: setMapBoundingBox,
        markPlaceOnMap: markPlaceOnMap,
        getDistanceBetweenLocations: getDistanceBetweenLocations,
        getAddressByLocation: getAddressByLocation
    };
};

angular.module('map.Service', ['google'])
    .factory('mapService', ['$q', '$rootScope', 'googleService', mapService
    ]);
