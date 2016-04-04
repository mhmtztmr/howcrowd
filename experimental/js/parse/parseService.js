var parseService = function($q) {

  function init() {
    Parse.initialize("2MwsBBdgHEq7qoZU6WtS1VjOlVJUbQir0u9u8HES",
      "okdR5CxHByZwJP6UkDwcykdYtrgdDaX8rChtUBfB");
  }

  function insertCrowd(place, crowd, device, onSuccess, onFailure) {
    var Crowd = Parse.Object.extend("Crowd");

    insertDevice(device, function(deviceObject) {
      insertPlace(place, function(placeObject) {
        var crowdObject = new Crowd();
        crowdObject.set('deviceId', device.id);
        crowdObject.set('placeKey', place.key);
        crowdObject.set('placeName', place.name);
        crowdObject.set('placeSource', place.source);
        crowdObject.set('placeSid', place.sid);
        crowdObject.set('crowdValue', crowd.value);
        crowdObject.set('crowdDate', crowd.date);
        crowdObject.set('crowdLocation', new Parse.GeoPoint(place.location));

        crowdObject.relation('place').add(placeObject);
        crowdObject.relation('device').add(deviceObject);
        //
        // placeObject.relation('crowds').add(crowdObject);
        // deviceObject.relation('crowds').add(crowdObject);

        crowdObject.save(null, {
          success: function(object) {
            onSuccess();
          },
          error: function(model, error) {
            onFailure();
          }
        });
      }, function() {
        console.log('place insert failed');
      });
    }, function() {
      console.log('device insert failed');
    });
  }

  function getPlace(placeSid, placeSoruce, onSuccess) {
    var query = new Parse.Query("Place");

    query.equalTo("placeSid", placeSid);
    query.equalTo("placeSource", placeSoruce);
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

  function getDevice(deviceId, onSuccess) {
    var query = new Parse.Query("Device");

    query.equalTo("deviceId", deviceId);
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

  function insertDevice(device, onSuccess, onFailure) {

    getDevice(device.id, function(existingDeviceObject) {
      if (existingDeviceObject) {
        onSuccess(existingDeviceObject);
      } else {
        var DeviceObject = Parse.Object.extend("Device");

        deviceObject = new DeviceObject();
        deviceObject.set('deviceId', device.id);
        deviceObject.save(null, {
          success: function(savedDeviceObject) {
            onSuccess(savedDeviceObject);
          },
          error: function(model, error) {
            onFailure();
          }
        });
      }
    });
  }

  function retrieveCrowds(filter) {
    var def = $q.defer();
    var query = new Parse.Query("Crowd");
    //      query.include("place");

    if (filter) {
      if (filter.date) {
        if (filter.date.start) {
          query.greaterThanOrEqualTo('crowdDate', filter.date.start);
        }
        if (filter.date.end) {
          query.lessThanOrEqualTo('crowdDate', filter.date.end);
        }

        if (filter.location && filter.location.latitude && filter.location.latitude
          .upper && filter.location.latitude.lower && filter.location.longitude &&
          filter.location.longitude.upper && filter.location.longitude.lower) {
          var southwest = new Parse.GeoPoint(filter.location.latitude.lower,
            filter.location.longitude.lower);
          var northeast = new Parse.GeoPoint(filter.location.latitude.upper,
            filter.location.longitude.upper);

          query.withinGeoBox("crowdLocation", southwest, northeast);
        }
      }
    }

    query.descending("crowdDate");

    query.find({
      success: function(results) {
        var i, formattedResults = [];
        for (i = 0; i < results.length; i++) {
          formattedResults.push(formatCrowd(results[i].attributes));
        }
        def.resolve(formattedResults);
      },
      error: function(error) {
        def.reject();
      }
    });
    return def.promise;
  }

  function formatCrowd(crowd) {
    return {
      placeKey: crowd.placeKey,
      placeName: crowd.placeName,
      crowdLocation: {
        latitude: crowd.crowdLocation._latitude,
        longitude: crowd.crowdLocation._longitude
      },
      crowdValue: crowd.crowdValue,
      crowdDate: crowd.crowdDate
    };
  }

  return {
    init: init,
    insertCrowd: insertCrowd,
    retrieveCrowds: retrieveCrowds
  };
};

angular.module('parse', [])
  .factory('parseService', ['$q', parseService]);
