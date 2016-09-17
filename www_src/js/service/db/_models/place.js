 function Place(args) {
    args = args || {};
    this.objectId = args.objectId;
    this.name = args.name;
    this.latitude = args.latitude; //double
    this.longitude = args.longitude; //double
    this.source = args.source;
    this.type = args.type;
    this.photoURL = args.photoURL;
    this.address = args.address;
    this.sourceID = args.sourceID;
    this.averageCrowdValue = args.averageCrowdValue;
    this.lastUpdateDatetime = args.lastUpdateDatetime;
    this.lastTextDatetime = args.lastTextDatetime;
    this.lastPhotoDatetime = args.lastPhotoDatetime;
    this.lastAskDatetime = args.lastAskDatetime;
    this.__class = 'Place';
    this.___class = 'Place';
}