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

	return this;
};

IOS.prototype = new Platform();