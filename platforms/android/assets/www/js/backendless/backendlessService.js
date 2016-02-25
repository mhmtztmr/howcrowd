var backendlessService = function($q) {

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
  }

  function Device(args) {
    args = args || {};
    this.deviceId = args.deviceId || "";
    this.positiveFeedback = args.positiveFeedback || 1;
    this.negativeFeedback = args.negativeFeedback || 0;
  }

  function init() {
    var APPLICATION_ID = 'A556DD00-0405-02E1-FFF4-43454755FC00',
      SECRET_KEY = '98B3E3B5-F807-2E77-FF87-8A7D553DE200',
      VERSION = 'v1'; //default application version;
    Backendless.initApp(APPLICATION_ID, SECRET_KEY, VERSION);
  }

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

  function getPlace(placeSid, placeSource, onSuccess) {
    var query = new Parse.Query("Place");

    query.equalTo("placeSid", placeSid);
    query.equalTo("placeSource", placeSource);
    query.find({
      success: function(results) {
        if (results.length > 0) {
          onSuccess(results[0]);
        } else {
          onSuccess();
        }
      },
      error: function(error) {
        alert("Error: " + error.code + " " + error.message);
      }
    });
  }

  function insertPlace(place, onSuccess, onFailure) {

    getPlace(place.sid, place.source, function(existingPlaceObject) {
      if (existingPlaceObject) {
        onSuccess(existingPlaceObject);
      } else {
        var PlaceObject = Parse.Object.extend("Place");

        placeObject = new PlaceObject();
        placeObject.set('palceSid', place.sid);
        placeObject.set('placeName', place.name);
        placeObject.set('placeLocation', new Parse.GeoPoint(place.location));
        placeObject.set('placeSource', place.source);
        placeObject.save(null, {
          success: function(savedPlaceObject) {
            onSuccess(savedPlaceObject);
          },
          error: function(model, error) {
            onFailure();
          }
        });
      }
    });
  }

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

  function retrieveCrowds(filter) {
    var def = $q.defer();
    var q = '1 = 1';

    if (filter) {
      if (filter.date) {
        if (filter.date.start) {
          //q += ' and crowdDate >= ' + filter.date.start.valueOf();
        }
        if (filter.date.end) {
          //q += ' and crowdDate <= ' + filter.date.end.valueOf();
        }

        if (filter.location && filter.location.latitude && filter.location.latitude
          .upper && filter.location.latitude.lower && filter.location.longitude &&
          filter.location.longitude.upper && filter.location.longitude.lower
        ) {
          // q += ' and crowdLocationLatitude >= ' + filter.location.latitude.lower;
          // q += ' and crowdLocationLatitude <= ' + filter.location.latitude.upper;
          // q += ' and crowdLocationLongitude >= ' + filter.location.longitude.lower;
          // q += ' and crowdLocationLongitude <= ' + filter.location.longitude.upper;
        }
      }
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
        formattedResults.push(formatCrowd(result.data[i]));
      }
      var nextPage = result._nextPage;
      while (nextPage) {
        result = result.nextPage();
        for (i = 0; i < result.data.length; i++) {
          formattedResults.push(formatCrowd(result.data[i]));
        }
        nextPage = result._nextPage;
      }
      def.resolve(formattedResults);
    }, function(error) {
      def.reject();
    }));

    return def.promise;
  }

  function giveFeedback(crowd, isPositive) {
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
    };

    var failureCallback = function(fault) {
      console.log("error - " + fault.message);
    };

    var callback = new Backendless.Async(successCallback, failureCallback);

    // ************************************************
    // Backendless.Counters.of() approach
    // ************************************************
    var myCounter = Backendless.Counters.of(counterName);

    // async call
    myCounter.incrementAndGet(callback);
  }

  function formatCrowd(crowd) {
    return {
      placeKey: crowd.placeKey,
      placeName: crowd.placeName,
      placeSource: crowd.placeSource,
      crowdId: crowd.objectId,
      crowdLocation: {
        latitude: crowd.crowdLocationLatitude,
        longitude: crowd.crowdLocationLongitude
      },
      crowdValue: crowd.crowdValue,
      crowdDate: crowd.crowdDate,
      crowdFeedback: {
        positiveFeedback: crowd.crowdPositiveFeedback,
        negativeFeedback: crowd.crowdNegativeFeedback
      }
    };
  }

  return {
    init: init,
    insertCrowd: insertCrowd,
    retrieveCrowds: retrieveCrowds,
    giveFeedback: giveFeedback,
    insertDevice: insertDevice,
    retrieveDevice: retrieveDevice
  };
};

angular.module('backendless', [])
  .factory('backendlessService', ['$q', backendlessService]);
