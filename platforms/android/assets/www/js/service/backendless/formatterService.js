var formatterService = function() {

  function formatCrowdToSee(crowd) {
    return {
      deviceId: crowd.deviceId,
      placeKey: crowd.placeKey,
      placeName: crowd.placeName,
      placeSource: crowd.placeSource,
      placeSid: crowd.placeSid,
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

  function formatPlaceToSet(crowd) {
    return {
      sid:crowd.placeSid,
      name: crowd.placeName,
      location: {
        latitude: crowd.crowdLocationLatitude,
        longitude: crowd.crowdLocationLongitude
      },
      source: crowd.placeSource
    };
  }

  return {
    formatCrowdToSee: formatCrowdToSee,
    formatPlaceToSet: formatPlaceToSet
  };
};

angular.module('formatter', [])
  .factory('formatterService', [formatterService]);
