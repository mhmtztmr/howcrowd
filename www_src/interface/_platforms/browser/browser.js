var Browser = function(){
  	
	this.Platform = "Browser";

	this.socialShare = function(text){
		window.location.href='mailto:?body=' + text;
  	};

  	return this;
};


Browser.prototype = new Platform();