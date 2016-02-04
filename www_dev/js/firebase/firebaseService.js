var firebaseService = function($q, $firebaseArray) {
  var rootRef;

  function init() {
    rootRef = new Firebase("https://oztemur-crowd-test.firebaseio.com");
  }

  function getPlaceById(id, source) {
    var placeRef = rootRef.child('places');
  }

  function insertCrowd(place, crowd, device, onSuccess, onFailure) {
    // var placeRef = rootRef.child('places');
    // placeRef.push({
    //   place: place,
    //   value: crowd.value,
    //   date: crowd.date.valueOf(),
    //   device: device
    // });
    // // var placeObject = {};
    // // placeObject[place.key] = place;
    // // placeRef.set(placeObject);
    //
    // var deviceRef = rootRef.child('devices');
    // var deviceObject = {};
    // deviceObject[device.id] = device;
    // deviceRef.set(deviceObject);

    // var placeRef = rootRef.child('places');
    //
    // var millisecondsDate = new Date(crowd.date.setMilliseconds(0));
    // var secondsDate = new Date(millisecondsDate.setSeconds(0));
    // var minutesDate = new Date(secondsDate.setMinutes(0));
    // var hourlyDate = minutesDate.valueOf();
    //
    // var placeKeyRef = placeRef.child(place.key);
    // if (!placeKeyRef) {
    //   var placeObject = {};
    //   placeObject[place.key] = {
    //     placeSource: place.source,
    //     placeId: place.sid,
    //     placeName: place.name,
    //     placeLocationLatitude: place.location.latitude,
    //     placeLocationLongitude: place.location.longitude,
    //     crowdLastUpdateDate: crowd.date.valueOf(),
    //     hourlyDate: {
    //       crowdCount: 1,
    //       crowdValue: crowd.value
    //     }
    //   };
    //   placeRef.set(placeObject);
    // } else {
    //   var placeObject = {};
    //   var placeHourlyDateRef = placeKeyRef.child(hourlyDate);
    //   if (!placeHourlyDateRef) {
    //     placeSource: place.source,
    //     placeId: place.sid,
    //     placeName: place.name,
    //     placeLocationLatitude: place.location.latitude,
    //     placeLocationLongitude: place.location.longitude,
    //     crowdLastUpdateDate: crowd.date.valueOf(),
    //     hourlyDate: {
    //       crowdCount: 1,
    //       crowdValue: crowd.value
    //     }
    //   } else {
    //     placeSource: place.source,
    //     placeId: place.sid,
    //     placeName: place.name,
    //     placeLocationLatitude: place.location.latitude,
    //     placeLocationLongitude: place.location.longitude,
    //     crowdLastUpdateDate: crowd.date.valueOf(),
    //     hourlyDate: {
    //       crowdCount: 1,
    //       crowdValue: crowd.value
    //     }
    //   }
    // }

    // var placeRef = rootRef.child('places');
    // placeRef.push({
    //   place: place,
    //   value: crowd.value,
    //   date: crowd.date.valueOf(),
    //   device: device
    // });

    var crowdRef = rootRef.child('crowds');
    crowdRef.push({
      placeSource: place.source,
      placeId: place.sid,
      placeName: place.name,
      placeLocationLatitude: place.location.latitude,
      placeLocationLongitude: place.location.longitude,
      deviceId: device.id,
      deviceReliability: 1,
      crowdValue: crowd.value,
      crowdDate: crowd.date.valueOf(),
      crowdAgree: crowd.agree,
      crowdDisagree: crowd.disagree
    });
    // crowdRef.push({
    //   placeKey: place.key,
    //   value: crowd.value,
    //   date: crowd.date.valueOf(),
    //   deviceId: device.id
    // });
  }

  function retrieve(filter) {
    var defered = $q.defer();
    var crowdRef = rootRef.child('crowds').orderByChild("crowdDate").startAt(
      1452885285517);
    $firebaseArray(crowdRef).$loaded().then(function(response) {
      console.log('show response: [' + response + ']');
      defered.resolve(response);
    });

    return defered.promise;

    //
    // return $firebaseArray(crowdRef);

  }

  function formatItem(item) {
    return {
      placeName: item.place.name,
      location: item.place.location,
      crowdValue: item.crowdValue
    };
  }

  return {
    init: init,
    insertCrowd: insertCrowd,
    retrieve: retrieve
  };
};

angular.module('myFirebase', ['firebase'])
  .factory('firebaseService', ['$q', '$firebaseArray', firebaseService]);
