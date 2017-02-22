var Browser = function(){
  	Platform.apply( this, arguments );
	this.Platform = "Browser";

  	return this;
};


Browser.prototype = new Platform();