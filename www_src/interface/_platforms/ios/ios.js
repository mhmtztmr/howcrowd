var IOS = function(){

	this.Platform = "IOS";
  
	this.getConnectionType = function(callback){
		navigator.connection.getInfo(callback);
	};

	this.isLocationEnabled = function(callback){
		 // cordova.plugins.diagnostic.isLocationEnabled(function(enabled){
  //           callback(enabled);
  //       },
  //       function(){
  //       	callback(false);
  //       });
  		callback(true);
	};

	this.takePhoto = function(onSuccess, onFailure){
		navigator.camera.getPicture(function(photoData){
		  	onSuccess(photoData);
		}, function(){
		  	onFailure();
		}, {
			destinationType: Camera.DestinationType.DATA_URL,
			quality: 25
		});
	};

	return this;
};

IOS.prototype = new Platform();