/* global Backendless */

'use strict';

class Crowd extends Backendless.ServerCode.PersistenceItem {
  constructor() {
    super();
    
    /**
     @name Crowd#datetimePass
     @type Number
     */
    this.datetimePass = undefined;

    /**
     @name Crowd#feedbackable
     @type Boolean
     */
    this.feedbackable = undefined;

    /**
     @name Crowd#datetime
     @type Number
     */
    this.datetime = undefined;

    /**
     @name Crowd#myFeedback
     @type Boolean
     */
    this.myFeedback = undefined;

    /**
     @name Crowd#device
     @type Device
     */
    this.device = undefined;

    /**
     @name Crowd#negativeFeedback
     @type Number
     */
    this.negativeFeedback = undefined;

    /**
     @name Crowd#value
     @type Number
     */
    this.value = undefined;

    /**
     @name Crowd#text
     @type String
     */
    this.text = undefined;

    /**
     @name Crowd#photoURL
     @type String
     */
    this.photoURL = undefined;

    /**
     @name Crowd#positiveFeedback
     @type Number
     */
    this.positiveFeedback = undefined;

    /**
     @name Crowd#place
     @type Place
     */
    this.place = undefined;

  }
}

module.exports = Backendless.ServerCode.addType(Crowd);