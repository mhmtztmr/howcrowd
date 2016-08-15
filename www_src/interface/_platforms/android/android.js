var Android = function(){

	this.Platform = "Android";

	this.getConnectionType = function(callback){
		navigator.connection.getInfo(callback);
	};

	this.isLocationEnabled = function(callback){
		cordova.plugins.diagnostic.isLocationEnabled(function(enabled){
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
          quality: 25,
          correctOrientation: true
      });
  };

	return this;
};

Android.prototype = new Platform();