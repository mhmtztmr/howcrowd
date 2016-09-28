var feedbackModel = function() {
  var myFeedbacks = {};

  function insertFeedback(crowdObjectId, isPositive) {
    var myTempFeedbacks = {},
      feedbackId, now = (new Date()).getTime();
    if (Object.keys(myFeedbacks).length > 20) {
      for (feedbackId in myFeedbacks) {
        if(myFeedbacks.hasOwnProperty(feedbackId)) {
          var feedback = myFeedbacks[feedbackId];
          var timeDiff = now - feedback.time;
          if (timeDiff < 3600000) { //one hour
            myTempFeedbacks[feedbackId] = myFeedbacks[feedbackId];
          }
        }
      }
      myFeedbacks = myTempFeedbacks;
    }
    myFeedbacks[crowdObjectId] = {
      time: now,
      isPositive: isPositive
    };
    saveFeedbacks();
  }

  function getFeedback(crowdObjectId) {
    return myFeedbacks[crowdObjectId];
  }

  function saveFeedbacks() {
    localStorage.setItem('feedbacks', angular.toJson(myFeedbacks));
  }

  function loadFeedbacks() {
    myFeedbacks = angular.fromJson(localStorage.getItem('feedbacks'));
    if (!myFeedbacks) {
      myFeedbacks = {};
    }
  }

  return {
    loadFeedbacks: loadFeedbacks,
    insertFeedback: insertFeedback,
    getFeedback: getFeedback
  };
};

angular.module('feedback', [])
  .factory('feedbackModel', feedbackModel);
