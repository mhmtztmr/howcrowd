/* global Backendless */

'use strict';

class Device extends Backendless.ServerCode.PersistenceItem {
  constructor() {
    super();
    
    /**
     @name Device#ID
     @type String
     */
    this.ID = undefined;

  }
}

module.exports = Backendless.ServerCode.addType(Device);