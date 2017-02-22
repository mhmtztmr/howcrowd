/* global Backendless */

function calculateAverageCrowdForPlace(crowds) {
  var total = 0, feedbackMargin, count = 0;
  if(crowds.length > 0) {
    for(i = 0 ; i < crowds.length; i++){
      var crowd = crowds[i];
      console.log('Crowd [' + (i+1) + ']: Timestamp: ' + crowd.datetime + 
        ', Value: ' + crowd.value + ', Positive Feedback: ' + crowd.positiveFeedback + ', Negative Feedback: ' + crowd.negativeFeedback);

      if(crowd.value) {
        //average algorithm including feedbacks
        feedbackMargin = 1 + crowd.positiveFeedback - crowd.negativeFeedback
        if(feedbackMargin > 0) {
            count += feedbackMargin;
            total += feedbackMargin * crowd.value;
        }
      }
    }
    if(total > 0) {
      return Math.round(total / count);
    }
    else {
      return null;
    }
  }
  return null;
}

function updatePlace(req, updateFunction) {
  var crowdStorage = Backendless.Persistence.of('Crowd');
  var placeStorage = Backendless.Persistence.of('Place');
  var now = new Date(req.item.datetime);

  function getDataQuery() {
    var q, j, query = new Backendless.DataQuery(),
    oneHourAgo = new Date(new Date(now).setHours(now.getHours() - 1));

    q = 'datetime >= ' + oneHourAgo.valueOf();
    q += ' and datetime <= ' + now.valueOf();
    q += " and place.objectId = '" + req.item.place.objectId + "'";

    console.log('Query: ' + q);

    query.condition = q;

    return query;
  }

  return new Promise(function(resolve, reject){
    req.item.place['___dates___'] = undefined;
    console.log('Finding recent crowds belonging to ' + req.item.place.name + '...');
    var query = getDataQuery();
    crowdStorage.find(query, new Backendless.Async(function(crowdObjectData) {
      console.log(crowdObjectData.data.length + ' recent crowds found. Calculating average...');
      var avg = calculateAverageCrowdForPlace(crowdObjectData.data);
      console.log('Average calculated: ' + avg);
      req.item.place.averageCrowdValue = avg;
      if(updateFunction) {
        updateFunction(now);
      }
      placeStorage.save(req.item.place, new Backendless.Async(function() {
        console.log('Place updated.');
        resolve();
      }, reject));
    }, reject));
  });
}



/**
* @param {Object} req The request object contains information about the request
* @param {Object} req.context The execution context contains an information about application, current user and event
* @param {Crowd} req.item An item to create
*
* @param {Object} res The response object
* @param {Crowd} res.result Created item
* @param {Object} res.error
*
* @returns {Crowd|Promise.<Crowd>|void} By returning a value you overwrite server's result
*/
Backendless.ServerCode.Persistence.afterCreate('Crowd', function(req, res) {
  console.log('Crowd created: Place: ' + req.item.place.name + ', Value: ' + req.item.value + ', Timestamp: ' + req.item.datetime);
  return new Promise(function(resolve, reject){
    updatePlace(req, function(now) {
      req.item.place.lastUpdateDatetime = now;
      if(req.item.text) {
          req.item.place.lastTextDatetime = now;
      }
      if(req.item.photoURL) {
          req.item.place.lastPhotoDatetime = now;
      }
      if(!req.item.value) {
          req.item.place.lastAskDatetime = now;
      }      
    }).then(resolve, reject);
  });
});


/* global Backendless */

/**
* @param {Object} req The request object contains information about the request
* @param {Object} req.context The execution context contains an information about application, current user and event
* @param {Crowd} req.item An item with changes
*
* @param {Object} res The response object
* @param {Crowd} res.result Updated item
* @param {Object} res.error
*
* @returns {Crowd|Promise.<Crowd>|void} By returning a value you overwrite server's result
*/
Backendless.ServerCode.Persistence.afterUpdate('Crowd', function(req, res) {
  console.log('Crowd updated: Place: ' + req.item.place.name + ', Value: ' + req.item.value + ', Timestamp: ' + req.item.datetime);
  return new Promise(function(resolve, reject){
    updatePlace(req).then(resolve, reject);
  });
});

module.exports = {
  updatePlace: updatePlace
};