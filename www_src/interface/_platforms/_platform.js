var Platform = function(){

	this.getDeviceInfo = function() {
      	return new Promise(function(resolve) {
        	resolve(window.deviceInfo);
      	});
  	};

	this.getConnectionType = function(){
		return 'wifi';
	};

	this.registerConnectionOfflineEvent = function(fn) {
	    document.addEventListener("offline", fn, false);
	  };

	  this.registerConnectionOnlineEvent = function(fn) {
	    document.addEventListener("online", fn, false);
	  };

	this.isLocationEnabled = function(callback){
		navigator.geolocation.getCurrentPosition(function(){
			callback(true);
		}, function(){
			callback(false);
		}, {
			enableHighAccuracy: true,
			timeout: 5000,	
			maximumAge: 60000
		});
	};

	this.openGPSDialog = function(message, description, title, functionMap, labelMap){
		functionMap['YES']();
	};

	this.takePhoto = function(onSuccess, onFailure){
		onSuccess("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");
	};

	this.socialShare = function(text){
		window.location.href='mailto:?body=' + text;
  	};

	this.hideSplashScreen = function() {
		return;
	};

	this.initMap = function(DOMElementId, center, events) {

		function addYourLocationButtonToMap(map)	{
			var controlDiv = document.createElement('div');

			var firstChild = document.createElement('button');
			firstChild.style.backgroundColor = '#fff';
			firstChild.style.border = 'none';
			firstChild.style.outline = 'none';
			firstChild.style.width = '28px';
			firstChild.style.height = '28px';
			firstChild.style.borderRadius = '2px';
			firstChild.style.boxShadow = '0 1px 4px rgba(0,0,0,0.3)';
			firstChild.style.cursor = 'pointer';
			firstChild.style.marginRight = '10px';
			firstChild.style.padding = '0px';
			firstChild.title = 'Your Location';
			controlDiv.appendChild(firstChild);

			var secondChild = document.createElement('div');
			secondChild.style.margin = '5px';
			secondChild.style.width = '18px';
			secondChild.style.height = '18px';
			secondChild.style.backgroundImage = 'url(https://maps.gstatic.com/tactile/mylocation/mylocation-sprite-1x.png)';
			secondChild.style.backgroundSize = '180px 18px';
			secondChild.style.backgroundPosition = '0px 0px';
			secondChild.style.backgroundRepeat = 'no-repeat';
			secondChild.id = 'you_location_img';
			firstChild.appendChild(secondChild);

			google.maps.event.addListener(map, 'dragend', function() {
				document.getElementById('you_location_img').style.backgroundPosition = '0px 0px';
			});

			firstChild.addEventListener('click', function() {
				var imgX = '0';
				var animationInterval = setInterval(function(){
					if(imgX === '-18') {
						imgX = '0';
					}
					else {
						imgX = '-18';
					}
					document.getElementById('you_location_img').style.backgroundPosition = imgX+'px 0px';
				}, 500);
				if(center){
	        		var ctr = {lat: center.latitude, lng: center.longitude};
	          		map.setZoom(16);
	          		map.setCenter(ctr);
	          		clearInterval(animationInterval);
					document.getElementById('you_location_img').style.backgroundPosition = '-144px 0px';
	        	}
	        	else {
	        		clearInterval(animationInterval);
	        		document.getElementById('you_location_img').style.backgroundPosition = '0px 0px';
	        	}
			});

			controlDiv.index = 1;
			controlDiv.className = 'pinpoint';
			map.controls[google.maps.ControlPosition.LEFT_TOP].push(controlDiv);
		}

		function addEventsToMap(map, events){
			if(events) {
				var mousedownEvent = events.mousedown,
				idleEvent = events.idle,
				longpressEvent = events.longpress;
				if(mousedownEvent) {
					google.maps.event.addListener(map, 'mousedown', function () {
			            mousedownEvent();
			        });
				}
				if(idleEvent) {
					google.maps.event.addListener(map, 'idle', function(){
						idleEvent();
		            });
				}
				if(longpressEvent){
			        var longpressTimer;
				    google.maps.event.addListener(map, 'mousedown', function(event){
				    	if(longpressTimer) {
					    	clearTimeout(longpressTimer);
					    }
		                longpressTimer = setTimeout(function(){
		                	if(longpressEvent) {
		                		longpressEvent({
		                			latitude: event.latLng.lat(),
		                			longitude: event.latLng.lng()
		                		});
		                		clearTimeout(longpressTimer);
		                	}
		                }, 1000);
		            });
				    google.maps.event.addListener(map, 'mouseup', function(){
		                if(longpressTimer) {
					    	clearTimeout(longpressTimer);
					    }
		            });
		            google.maps.event.addListener(map, 'dragstart', function(){
		                if(longpressTimer) {
					    	clearTimeout(longpressTimer);
					    }
		            });
		            google.maps.event.addListener(map, 'bounds_changed', function(){
		                if(longpressTimer) {
					    	clearTimeout(longpressTimer);
					    }
		            });
				}
			}
		}

		return new Promise(function(resolve, reject) {
			var map = new google.maps.Map(document.getElementById(DOMElementId), {
				zoom: 16,
				center: {lat: center.latitude, lng: center.longitude},
				mapTypeControl: false,
				zoomControl: false,
				scaleControl: false,
				streetViewControl: false,
				fullscreenControl: false,
				clickableIcons: false
			});

			addEventsToMap(map, events);
			addYourLocationButtonToMap(map);

			resolve(map, map);
		});
	};

	this.setMapClickable = function() {/*No need to implement*/};

	this.getMapBoundingBox = function(map) {
		return new Promise(function(resolve, reject) {
			var bounds = map.getBounds();
			resolve({
				latitude: {
					upper: bounds.getNorthEast().lat(),
					lower: bounds.getSouthWest().lat()
				},
				longitude: {
					upper: bounds.getNorthEast().lng(),
					lower: bounds.getSouthWest().lng()
				}
			});
		});
	};

	this.getMapZoom = function(map) {
		return new Promise(function(resolve) {
			resolve(map.getZoom());
		});
	};

	this.getMapCenter = function(map) {
		return new Promise(function(resolve) {
			var center = map.getCenter();
			resolve({
				latitude: center.lat(),
				longitude: center.lng()
			});
		});
	};

	this.setMapZoom = function(map, zoom) {
		map.setZoom(zoom);
	};

	this.setMapCenter = function(map, center) {
  		map.setCenter({lat: center.latitude, lng: center.longitude});
	};

	this.moveMapTo = function(map, center, zoom) {
		if(center) {
			map.setCenter({lat: center.latitude, lng: center.longitude});
		}
	    if(zoom) {
	    	map.setZoom(zoom);
	    }
	};

	this.initAutocomplete = function(map, DOMElementId, boundingBox, onPlaceSelected){
    	return new Promise(function(resolve, reject){
	        var input = document.getElementById(DOMElementId);
	        var defaultBounds = new google.maps.LatLngBounds(
	            new google.maps.LatLng(boundingBox.latitude.lower, boundingBox.longitude.lower),
	            new google.maps.LatLng(boundingBox.latitude.upper, boundingBox.longitude.upper));
	        var options = {
	            bounds: defaultBounds,
	            types: ['establishment']
	        };
	        var autocomplete = new google.maps.places.Autocomplete(input, options);

	        autocomplete.addListener('place_changed', function() {
	          	var place = autocomplete.getPlace();
	          	onPlaceSelected(place);
	        });
	        resolve();
        });
    };

    this.createMarker = function(map, location, markerData, onMarkerClick, infoWindowData, extraData){
    	return new Promise(function(resolve, reject){
	    	var latLng = new google.maps.LatLng(location.latitude, location.longitude);
	    	var marker = new google.maps.Marker({
					map: map,
					position: latLng,
					icon: {
						url: 'img/markers/' + markerData.scaledSize.w + 'x' + markerData.scaledSize.h + '/' + markerData.path + '.png',
						anchor: new google.maps.Point(markerData.anchor.x, markerData.anchor.y),
						scaledSize: new google.maps.Size(markerData.scaledSize.w, markerData.scaledSize.h)
					}
				});

				if(onMarkerClick) {
					google.maps.event.addListener(marker, 'click', function(){
						var infowindow, infoWindowContent;
						if(infoWindowData) {
							infoWindowContent = '<div><strong>' + infoWindowData.title + '</strong>';
							if(infoWindowData.snippet) {
								infoWindowContent += ('<br>' + infoWindowData.snippet);
							}
							if(extraData && extraData.distanceTooFar) {
								infoWindowContent += ('<br><div style="color:red; font-style: italic">' + extraData.distanceTooFar +'</div>');
							}
							infoWindowContent += '</div>';
							infowindow = new google.maps.InfoWindow({
								content: infoWindowContent
							});
							infowindow.open(map, marker);
						}
						onMarkerClick(infowindow);
		          		map.setCenter({lat: location.latitude, lng: location.longitude});
					});
				}
				resolve(marker);
			});
    };

    this.removeMarker = function(marker) {
        marker.setMap(null);
    };

    this.createCurrentLocationMarker = function(map, location, markerData, onMarkerClick, infoWindowData, extraData){
    	return this.createMarker(map, location, markerData, onMarkerClick, infoWindowData, extraData);
    };

	return this;
};
