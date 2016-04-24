var backendlessService = function($rootScope, $q, crowdRest, formatterService) {

    function init() {
        var APPLICATION_ID = 'A556DD00-0405-02E1-FFF4-43454755FC00',
            SECRET_KEY = '98B3E3B5-F807-2E77-FF87-8A7D553DE200',
            VERSION = 'v1'; //default application version;
        Backendless.initApp(APPLICATION_ID, SECRET_KEY, VERSION);
    }

    /******* DB Models */
    function Crowd(args) {
        args = args || {};
        this.deviceId = args.deviceId || "";
        this.deviceReliability = args.deviceReliability || 1;
        this.placeKey = args.placeKey || "";
        this.placeName = args.placeName || "";
        this.placeSource = args.placeSource || "";
        this.placeSid = args.placeSid || "";
        this.crowdValue = args.crowdValue || "";
        this.crowdDate = args.crowdDate || "";
        this.crowdLocationLatitude = args.crowdLocationLatitude || "";
        this.crowdLocationLongitude = args.crowdLocationLongitude || "";
        this.crowdPositiveFeedback = args.crowdPositiveFeedback || 0;
        this.crowdNegativeFeedback = args.crowdNegativeFeedback || 0;
        this.crowdReportReason = args.crowdReportReason || '';
    }

    function Device(args) {
        args = args || {};
        this.deviceId = args.deviceId || "";
        this.positiveFeedback = args.positiveFeedback || 1;
        this.negativeFeedback = args.negativeFeedback || 0;
    }

    function Place(args) {
        args = args || {};
        this.placeKey = args.placeKey || "";
        this.placeName = args.placeName || "";
        this.placeSource = args.placeSource || "";
        this.placeSid = args.placeSid || "";
        this.placeLocationLatitude = args.placeLocationLatitude || "";
        this.placeLocationLongitude = args.placeLocationLongitude || "";
    }
    /* DB Models ******/

    function insertCrowd(place, crowd, device, onSuccess, onFailure) {
        var crowds = Backendless.Persistence.of(Crowd);
        var crowdObject = new Crowd({
            deviceId: device.id,
            deviceReliability: device.positiveFeedback / (device.positiveFeedback +
                device.negativeFeedback),
            placeKey: place.key,
            placeName: place.name,
            placeSource: place.source,
            placeSid: place.sid,
            crowdValue: crowd.value,
            crowdDate: crowd.date,
            crowdLocationLatitude: place.location.latitude,
            crowdLocationLongitude: place.location.longitude
        });
        crowds.save(crowdObject, new Backendless.Async(onSuccess, onFailure));
    }

    // function retrievePlace(placeKey, onSuccess) {
    //   var def = $q.defer();
    //   var places = Backendless.Persistence.of(Place);
    //   var query = new Backendless.DataQuery();
    //   query.condition = "placeKey = '" + placeKey + "'";
    //   places.find(query, new Backendless.Async(function(result) {
    //     if (result.data.length > 0) {
    //       def.resolve(result.data[0]);
    //     } else {
    //       def.resolve(undefined);
    //     }
    //   }, function(error) {
    //     def.resolve(undefined);
    //   }));
    //   return def.promise;
    // }
    //
    // function insertPlace(place, onSuccess, onFailure) {
    //
    //   retrievePlace(place.placeKey).then(function(existingPlace) {
    //       if (existingPlace) {
    //         onSuccess(existingPlace);
    //       } else {
    //         var places = Backendless.Persistence.of(Place);
    //         var placeObject = new Place({
    //           placeKey: place.key,
    //           placeName: place.name,
    //           placeSource: place.source,
    //           placeSid: place.sid,
    //           placeLocationLatitude: place.location.latitude,
    //           placeLocationLongitude: place.location.longitude
    //         });
    //         places.save(placeObject, new Backendless.Async(onSuccess,
    //           onFailure));
    //       }
    //     },
    //     function() {
    //       def.reject;
    //     });
    // }

    function insertDevice(device, onSuccess, onFailure) {
        var devices = Backendless.Persistence.of(Device);
        var deviceObject = new Device({
            deviceId: device.id,
            positiveFeedback: device.positiveFeedback,
            negativeFeedback: device.negativeFeedback
        });
        devices.save(deviceObject, new Backendless.Async(onSuccess, onFailure));
    }

    function retrieveDevice(deviceId) {
        var def = $q.defer();
        var devices = Backendless.Persistence.of(Device);
        var query = new Backendless.DataQuery();
        query.condition = "deviceId = '" + deviceId + "'";
        devices.find(query, new Backendless.Async(function(result) {
            if (result.data.length > 0) {
                def.resolve(result.data[0]);
            } else {
                def.resolve(undefined);
            }
        }, function(error) {
            def.resolve(undefined);
        }));
        return def.promise;
    }

    function retrieveCrowdsAndFormat(filter, formatterFunction) {
        var def = $q.defer();
        var q = '1 = 1';

        if (filter) {
            if (filter.date) {
                if (filter.date.start) {
                    q += ' and crowdDate >= ' + filter.date.start.valueOf();
                }
                if (filter.date.end) {
                    q += ' and crowdDate <= ' + filter.date.end.valueOf();
                }

                if (filter.location && filter.location.latitude && filter.location.latitude
                    .upper && filter.location.latitude.lower && filter.location.longitude &&
                    filter.location.longitude.upper && filter.location.longitude.lower
                ) {
                    q += ' and crowdLocationLatitude >= ' + filter.location.latitude.lower;
                    q += ' and crowdLocationLatitude <= ' + filter.location.latitude.upper;
                    q += ' and crowdLocationLongitude >= ' + filter.location.longitude.lower;
                    q += ' and crowdLocationLongitude <= ' + filter.location.longitude.upper;
                }
            }
        }

        q += " and (crowdReportReason is null or crowdReportReason = '')";

        if ($rootScope.settings.isCustomPlacesEnabled !== true) {
          q += " and placeSource != 'custom'";
        }

        var query = new Backendless.DataQuery();
        query.options = {
            sortBy: 'crowdDate desc',
            pageSize: 100
        };
        query.condition = q;

        var crowds = Backendless.Persistence.of(Crowd);
        crowds.find(query, new Backendless.Async(function(result) {
            var i, formattedResults = [];
            for (i = 0; i < result.data.length; i++) {
                formattedResults.push(formatterFunction(result.data[
                    i]));
            }
            var nextPage = result._nextPage;
            while (nextPage) {
                result = result.nextPage();
                for (i = 0; i < result.data.length; i++) {
                    formattedResults.push(formatterFunction(
                        result.data[i]));
                }
                nextPage = result._nextPage;
            }
            def.resolve(formattedResults);
        }, function(error) {
            def.reject();
        }));

        return def.promise;
    }

    function retrieveCrowds(filter) {
        return retrieveCrowdsAndFormat(filter, formatterService.formatCrowdToSee);
    }

    function retrieveNearbyPlaces(filter) {
        var def = $q.defer(),
            uniquePlaces = {};
        retrieveCrowdsAndFormat(filter, formatterService.formatPlaceToSet).then(function(entries) {
            for (i = 0; i < entries.length; i++) {
                uniquePlaces[entries[i].sid] = entries[i];
            }
            def.resolve(Object.keys(uniquePlaces).map(function(key) {
                return uniquePlaces[key]
            }));
        });
        return def.promise;
    }

    function giveFeedback(crowd, isPositive, onSuccess, onFailure) {
        var counterName = "counter for " + crowd.crowdId + (isPositive ?
            "positive" : "negative") + " feedback";
        var successCallback = function(response) {
            console.log("[ASYNC] counter value is - " + response);
            var crowdStorage = Backendless.Persistence.of(Crowd);
            var dbCrowd = crowdStorage.findById(crowd.crowdId);
            if (isPositive) {
                dbCrowd.crowdPositiveFeedback = response;
            } else {
                dbCrowd.crowdNegativeFeedback = response;
            }
            crowdStorage.save(dbCrowd);
            onSuccess();
        };

        var failureCallback = function(fault) {
            console.log("error - " + fault.message);
            onFailure();
        };

        var callback = new Backendless.Async(successCallback, failureCallback);
        var myCounter = Backendless.Counters.of(counterName);
        // async call
        myCounter.incrementAndGet(callback);
    }

    function reportCrowd(crowd, reportReason, onSuccess, onFailure) {
        crowdRest.update({
            placeKey: crowd.placeKey
        }, {
            crowdReportReason: reportReason
        });
    }

    return {
        init: init,
        insertCrowd: insertCrowd,
        retrieveCrowds: retrieveCrowds,
        giveFeedback: giveFeedback,
        insertDevice: insertDevice,
        retrieveDevice: retrieveDevice,
        //insertPlace: insertPlace,
        reportCrowd: reportCrowd,
        retrieveNearbyPlaces: retrieveNearbyPlaces
    };
};

angular.module('backendless', ['rest', 'formatter'])
    .factory('backendlessService', ['$rootScope', '$q', 'crowdRest', 'formatterService', backendlessService]);
