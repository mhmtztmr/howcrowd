angular.module('placeType', [])
	.factory('placeTypeService', ['placeTypeConstants', function(placeTypeConstants) {
		var self = {};

		self.getTypeObject = function(place) {
			var typeObject;
			if(place.source && place.type && placeTypeConstants[place.source]) {
	            typeObject = placeTypeConstants[place.source][place.type];
	        }
	        else {
	            typeObject = placeTypeConstants['default']['default'];
	        }
	        return typeObject;
		};

		return self;
	}])
   	.constant('placeTypeConstants', {
        'google': {
        	'accounting':{
        		ID: 'accounting', NAME: 'Accounting', LANG_KEY: 'ACCOUNTING', FA_ICON: 'money', ICON_PATH: ''
        	},
			'airport':{
				ID: 'airport', NAME: 'Airport', LANG_KEY: 'AIRPORT', FA_ICON: 'plane', ICON_PATH: ''
			},
			'amusement_park':{ID: 'amusement_park', NAME: 'Amusement Park', LANG_KEY: 'AMUSEMENT_PARK', FA_ICON: 'gamepad', ICON_PATH: ''},
			'aquarium':{ID: 'aquarium', NAME: 'Aquarium', LANG_KEY: 'AQUARIUM', FA_ICON: 'building', ICON_PATH: ''},
			'art_gallery':{ID: 'art_gallery', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'atm':{ID: 'atm', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'bakery':{ID: 'bakery', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'bank':{ID: 'bank', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'bar':{ID: 'bar', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'beauty_salon':{ID: 'beauty_salon', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'bicycle_store':{ID: 'bicycle_store', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'book_store':{ID: 'book_store', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'bowling_alley':{ID: 'bowling_alley', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'bus_station':{ID: 'bus_station', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'cafe':{ID: 'cafe', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'campground':{ID: 'campground', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'car_dealer':{ID: 'car_dealer', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'car_rental':{ID: 'car_rental', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'car_repair':{ID: 'car_repair', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'car_wash':{ID: 'car_wash', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'casino':{ID: 'casino', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'cemetery':{ID: 'cemetery', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'church':{ID: 'church', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'city_hall':{ID: 'city_hall', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'clothing_store':{ID: 'clothing_store', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'convenience_store':{ID: 'convenience_store', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'courthouse':{ID: 'courthouse', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'dentist':{ID: 'dentist', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'department_store':{ID: 'department_store', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'doctor':{ID: 'doctor', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'electrician':{ID: 'electrician', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'electronics_store':{ID: 'electronics_store', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'embassy':{ID: 'embassy', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'establishment':{ID: 'establishment', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'finance':{ID: 'finance', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'fire_station':{ID: 'fire_station', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'florist':{ID: 'florist', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'food':{ID: 'food', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'funeral_home':{ID: 'funeral_home', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'furniture_store':{ID: 'furniture_store', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'gas_station':{ID: 'gas_station', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'general_contractor':{ID: 'general_contractor', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'grocery_or_supermarket':{ID: 'grocery_or_supermarket', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'gym':{ID: 'gym', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'hair_care':{ID: 'hair_care', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'hardware_store':{ID: 'hardware_store', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'health':{ID: 'health', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'hindu_temple':{ID: 'hindu_temple', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'home_goods_store':{ID: 'home_goods_store', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'hospital':{ID: 'hospital', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'insurance_agency':{ID: 'insurance_agency', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'jewelry_store':{ID: 'jewelry_store', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'laundry':{ID: 'laundry', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'lawyer':{ID: 'lawyer', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'library':{ID: 'library', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'liquor_store':{ID: 'liquor_store', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'local_government_office':{ID: 'local_government_office', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'locksmith':{ID: 'locksmith', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'lodging':{ID: 'lodging', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'meal_delivery':{ID: 'meal_delivery', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'meal_takeaway':{ID: 'meal_takeaway', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'mosque':{ID: 'mosque', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'movie_rental':{ID: 'movie_rental', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'movie_theater':{ID: 'movie_theater', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'moving_company':{ID: 'moving_company', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'museum':{ID: 'museum', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'night_club':{ID: 'night_club', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'painter':{ID: 'painter', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'park':{ID: 'park', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'parking':{ID: 'parking', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'pet_store':{ID: 'pet_store', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'pharmacy':{ID: 'pharmacy', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'physiotherapist':{ID: 'physiotherapist', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'place_of_worship':{ID: 'place_of_worship', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'plumber':{ID: 'plumber', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'point_of_interest':{ID: 'point_of_interest', NAME: '', LANG_KEY: '', FA_ICON: 'thumb-tack', ICON_PATH: ''},
			'police':{ID: 'police', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'post_office':{ID: 'post_office', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'real_estate_agency':{ID: 'real_estate_agency', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'restaurant':{ID: 'restaurant', NAME: '', LANG_KEY: '', FA_ICON: 'cutlery', ICON_PATH: ''},
			'roofing_contractor':{ID: 'roofing_contractor', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'rv_park':{ID: 'rv_park', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'school':{ID: 'school', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'shoe_store':{ID: 'shoe_store', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'shopping_mall':{ID: 'shopping_mall', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'spa':{ID: 'spa', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'stadium':{ID: 'stadium', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'storage':{ID: 'storage', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'store':{ID: 'store', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'subway_station':{ID: 'subway_station', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'synagogue':{ID: 'synagogue', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'taxi_stand':{ID: 'taxi_stand', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'train_station':{ID: 'train_station', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'travel_agency':{ID: 'travel_agency', NAME: '', LANG_KEY: '', FA_ICON: 'suitcase', ICON_PATH: ''},
			'university':{ID: 'university', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'veterinary_care':{ID: 'veterinary_care', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''},
			'zoo':{ID: 'zoo', NAME: '', LANG_KEY: '', FA_ICON: 'building', ICON_PATH: ''}
		},
		'custom': {
			'custom':{ID: 'custom', NAME: '', LANG_KEY: '', FA_ICON: 'map-signs', ICON_PATH: ''}
		},
		'default': {
			'default':{ID: 'default', NAME: '', LANG_KEY: '', FA_ICON: 'map-signs', ICON_PATH: ''}
		}
    });