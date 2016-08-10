var Platform = function(){
  
	this.getConnectionType = function(callback){
		callback('wifi');
	};

	this.isLocationEnabled = function(callback){
		navigator.geolocation.getCurrentPosition(function(){
			callback(true);
		}, function(){
			callback(false);
		});
	};

	this.openGPSDialog = function(message, description, title, functionMap, labelMap){
		functionMap['YES']();
	};

	return this;
};