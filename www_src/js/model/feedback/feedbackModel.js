var feedbackModel = function() {
  var self = {}, myFeedbacks = {};

  self.insertFeedback = function(crowdObjectId, isPositive) {
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
  };

  self.getFeedback = function(crowdObjectId) {
    return myFeedbacks[crowdObjectId];
  };

  function saveFeedbacks() {
    localStorage.setItem('feedbacks', angular.toJson(myFeedbacks));
  }

  self.loadFeedbacks = function() {
    return new Promise(function(resolve, reject){
      myFeedbacks = angular.fromJson(localStorage.getItem('feedbacks'));
      if (!myFeedbacks) {
        myFeedbacks = {};
      }
      resolve();
    });
  };

  return self;
};

angular.module('feedback', [])
  .factory('feedbackModel', feedbackModel);
