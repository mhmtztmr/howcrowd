function Crowd(args) {
    args = args || {};
    this.objectId = args.objectId;
    this.datetime = args.datetime;
    this.value = args.value;
    this.text = args.text;
    this.photoURL = args.photoURL;
    this.positiveFeedback = args.positiveFeedback;
    this.negativeFeedback = args.negativeFeedback;
    this.place = args.place;
    this.device = args.device;
    this.__class = 'Crowd';
}