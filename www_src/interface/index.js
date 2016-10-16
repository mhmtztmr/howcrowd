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
            device.getInfo(function(deviceInfo) {
                window.console.log("device is ready. Platform: " + device.platform + ", Version: " + device.version);
                var platform = instanceLookupTable[device.platform] || instanceLookupTable["Browser"];
                Interface.instance = platform[device.version] || platform["Default"];
                if(Interface.instance) {
                    Interface.instance.deviceInfo = JSON.stringify(deviceInfo);
                    window.console.log("Instance created.");
                }
                else {
                    window.console.log("Instance creation failed.");
                }
                onInstanceReady();
            });
        }, false);
    }
    else {
        Interface.instance = instanceLookupTable["Browser"]["Default"];
        if(Interface.instance) {
            window.deviceInfo = (function(){
                var ua= navigator.userAgent, tem, 
                M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
                if(/trident/i.test(M[1])){
                    tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
                    return 'IE '+(tem[1] || '');
                }
                if(M[1]=== 'Chrome'){
                    tem= ua.match(/\b(OPR|Edge)\/(\d+)/);
                    if(tem!= null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
                }
                M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
                if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
                return M.join(' ');
            })();
            Interface.instance.deviceInfo = window.deviceInfo;
            window.console.log("Instance created.");
        }
        else {
            window.console.log("Instance creation failed.");
        }
        onInstanceReady();
    }
};