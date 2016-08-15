var instanceLookupTable = {
    "Android": {
        "Default": new Android()
    },
    "iOS": {
        "Default": new IOS()
    },
    "Browser": {
        "Default": new Browser()
  }
};

function Interface() {};
Interface.getInstance = function(onInstanceReady){
    window.console.log("getting platform instance...");
    if(window.cordova) {
        window.console.log("waiting for device ready event...");
        document.addEventListener('deviceready', function(){
            window.console.log("device is ready. Platform: " + device.platform + ", Version: " + device.version);
            var platform = instanceLookupTable[device.platform] || instanceLookupTable["Browser"];
            Interface.instance = platform[device.version] || platform["Default"];
            if(Interface.instance) {
                window.console.log("Instance created.");
            }
            else {
                window.console.log("Instance creation failed.");
            }
            onInstanceReady();
        }, false);
    }
    else {
        Interface.instance = instanceLookupTable["Browser"]["Default"];
        if(Interface.instance) {
            window.console.log("Instance created.");
        }
        else {
            window.console.log("Instance creation failed.");
        }
        onInstanceReady();
    }
};