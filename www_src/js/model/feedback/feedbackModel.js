var feedbackModel = function() {
  var myFeedbacks = {};

  function insertFeedback(crowdId, isPositive) {
    var myTempFeedbacks = {},
      feedbackId, now = (new Date()).getTime();
    if (Object.keys(myFeedbacks).length > 20) {
      for (feedbackId in myFeedbacks) {
        var feedback = myFeedbacks[feedbackId];
        var timeDiff = now - feedback.time;
        if (timeDiff < 3600000) {
          myTempFeedbacks[feedbackId] = myFeedbacks[feedbackId];
        }
      }
      myFeedbacks = myTempFeedbacks;
    }
    myFeedbacks[crowdId] = {
      time: now,
      isPositive: isPositive
    };
    saveFeedbacks();
  }

  function getFeedback(crowdId) {
    return myFeedbacks[crowdId];
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
