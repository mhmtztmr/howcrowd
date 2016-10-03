var Android = function(){

	this.Platform = "Android";

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
		cordova.plugins.diagnostic.isGpsLocationEnabled(function(enabled){
            callback(enabled);
        },
        function(){
        	callback(false);
        });
	};

	this.openGPSDialog = function(message, description, title, functionMap, labelMap){
		cordova.dialogGPS(message,//message
            description,//description
            function(buttonIndex){//callback
              switch(buttonIndex) {
                case 0:  functionMap['NO'](); break;//cancel
                case 1:  functionMap['LATER'](); break;//neutro option
                case 2:  functionMap['YES'](); break;//positive option
              }},
              title,//title
              [labelMap['NO'], labelMap['YES']]);//buttons
	};

  this.takePhoto = function(onSuccess, onFailure){
      navigator.camera.getPicture(function(photoData){
          onSuccess(photoData);
      }, function(){
          onFailure();
      }, {
          destinationType: Camera.DestinationType.DATA_URL,
          quality: 50,
          correctOrientation: true,
          targetWidth: 400
      });
  };

  this.socialShare = function(text){
      window.plugins.socialsharing.share(text);
  };

	return this;
};

Android.prototype = new Platform();