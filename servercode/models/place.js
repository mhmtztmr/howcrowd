/* global Backendless */

'use strict';

class Place extends Backendless.ServerCode.PersistenceItem {
  constructor() {
    super();
    
    /**
     @name Place#longitude
     @type Number
     */
    this.longitude = undefined;

    /**
     @name Place#source
     @type String
     */
    this.source = undefined;

    /**
     @name Place#lastAskDatetime
     @type Number
     */
    this.lastAskDatetime = undefined;

    /**
     @name Place#lastTextDatetime
     @type Number
     */
    this.lastTextDatetime = undefined;

    /**
     @name Place#photoURL
     @type String
     */
    this.photoURL = undefined;

    /**
     @name Place#lastUpdateDatetime
     @type Number
     */
    this.lastUpdateDatetime = undefined;

    /**
     @name Place#type
     @type String
     */
    this.type = undefined;

    /**
     @name Place#latitude
     @type Number
     */
    this.latitude = undefined;

    /**
     @name Place#name
     @type String
     */
    this.name = undefined;

    /**
     @name Place#averageCrowdValue
     @type Number
     */
    this.averageCrowdValue = undefined;

    /**
     @name Place#sourceID
     @type String
     */
    this.sourceID = undefined;

    /**
     @name Place#lastPhotoDatetime
     @type Number
     */
    this.lastPhotoDatetime = undefined;

    /**
     @name Place#address
     @type String
     */
    this.address = undefined;

  }
}

module.exports = Backendless.ServerCode.addType(Place);