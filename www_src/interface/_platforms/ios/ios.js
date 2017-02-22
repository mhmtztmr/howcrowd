var IOS = function(){
	Platform.apply( this, arguments );
	this.Platform = "IOS";

	this.getDeviceInfo = function() {
      	return new Promise(function(resolve, reject) {
        	device.getInfo(function(deviceInfo) {
          		resolve(deviceInfo);
        	}, reject);
      	});
  	};
  
	this.getConnectionType = function(){
		return navigator.connection.type;
	};

	this.registerConnectionOfflineEvent = function(fn) {
	    document.addEventListener("offline", fn, false);
	  };

	  this.registerConnectionOnlineEvent = function(fn) {
	    document.addEventListener("online", fn, false);
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

	this.socialShare = function(text){
	    window.plugins.socialsharing.share(text);
	};

	return this;
};

IOS.prototype = new Platform();