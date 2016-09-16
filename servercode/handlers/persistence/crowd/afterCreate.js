/* global Backendless */

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
  //add your code here
  var crowdStorage = Backendless.Persistence.of('Crowd');
  var placeStorage = Backendless.Persistence.of('Place');
  var now = new Date(parseInt(req.item.datetime));

  function calculateAverageCrowdForPlace(crowds) {
  	var total = 0;
  	if(crowds.length > 0) {
      for(i = 0 ; i < crowds.length; i++){
      	console.log('Crowd [' + (i+1) + ']: Timestamp: ' + crowds[i].datetime + ', Value: ' + crowds[i].value);
        total += crowds[i].value;
      }
      return Math.round(total / crowds.length);
    }
    return;
  }

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

  		placeStorage.save(req.item.place, new Backendless.Async(function() {
			console.log('Place updated.');
  			resolve();
  		}, reject));
    }, reject));
  });
});