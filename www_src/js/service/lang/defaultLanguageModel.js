var defaultLanguageModel = function() {
    return {
        "MAIN_MENU": {
            "SEE_CROWD": "See Crowd",
            "SET_CROWD": "Set Crowd",
            "ASK_CROWD": "Ask Crowd",
            "SETTINGS": "Settings",
            "ABOUT": "About",
            "REPORT_ISSUE": "Report Issue",
            "EXIT": "Exit",
            "CLOSE": "Close",
            "LOADING": "Loading..."
        },
        "SEE_CROWD_MENU": {
            "HERE": "Here",
            "ON_MAP": "On Map",
            "IN_CITY": "In City",
            "LIST": "List",
            "MAP": "Map",
            "DATE": "Date",
            "NAME": "Place Name",
            "LAST_VALUE": "Last",
            "AVERAGE_VALUE": "Avg.",
            "MIN_AGO": "min(s) ago",
            "NO_CROWD": "No recent crowd to display. You can set one or ask for it!",
            "SET_CROWD": "Tap to set a crowd!",
            "ASK_CROWD": "Tap to ask for a crowd!",
            "NO_LOCATION": "No location data. Make sure your device's location service is accessible!",
            "SEARCH_INPUT": "Last 1h, Around 15kms",
            "YOU": "You",
            "JUST_NOW": "Just now"
        },
        "SEE_CROWD_DETAIL_POPOVER_MENU": {
            "INFO": "Info",
            "SHARE": "Share",
            "REPORT": "Report"
        },
        "CROWD_REPORT_MENU": {
            "REPORT": "Report",
            "INAPPROPRIATE": "Inappropriate",
            "PRIVATE": "Private",
            "MISLEADING": "Misleading"
        },
        "SET_CROWD_MENU": {
            "SELECT_PLACE": "Select Place",
            "ENTER_CUSTOM_PLACE": "Enter Custom Place",
            "PLACE_NAME": "Place Name",
            "NO_PLACE": "No places around. Tap to enter a custom place!",
            "NO_LOCATION": "No location data. Make sure your device's location service is accessible!",
            "PULL_TO_REFRESH": "Pull down to refresh",
            "RELEASE_TO_REFRESH": "Release to refresh",
            "SEARCH_INPUT": "Search"
        },
        "SET_CROWD_ATTACHMENT": {
            "ATTACH_PHOTO": "Attach Photo",
            "TEXT_PLACEHOLDER_APPENDIX": " is...",
            "ADD_CROWD": "Add Crowd"
        },
        "ASK_CROWD_MENU": {
            "SEARCH_INPUT": "Ask crowd by search",
            "TOO_FAR_TO_ASK": "Unavailable - Too far"
        },
        "MAP": {
            "YOUR_LOCATION": "Your location"
        },
        "CROWD_VALUES" : {
            "0": "Empty",
            "1": "Quiet",
            "2": "Moderate",
            "3": "Crowded",
            "4": "Congested"
        },
        "ABOUT": {
            "DESCRIPTION": "Crowd (Kalabalık), etrafınızdaki yerlerin yoğunluk bilgilerini başkalarıyla kimliğinizi belirtmeden paylaşabileceğiniz, başkalarının paylaştığı yoğunluk bilgilerini de anlık takip edebileceğiniz interaktif bir uygulamadır.Uygulamayı daha etkin kullanabilmek için aygıtınızın konum bilgisinin açık olması gerekmektedir.",
            "SEE_CROWD": {
                "TITLE": "Kalabalık Gör",
                "DESCRIPTION": "Uygulamanın ana modüllerinden biri kalabalık bilgilerini görebileceğiniz kısımdır. Bu modülde kalabalık bilgileri hakkında detayları, geri bildirimleri görebilir ve paylaşabilirsiniz. Özel olarak girilen yoğunluk bilgilerinden uygulama kriterlerine uygun olmayanlarını bildirebilirsiniz.",
                "IN_CITY": {
                    "TITLE": "Şehirde",
                    "DESCRIPTION": "Şehirde konum bilgilerini görmek demek, 15 km uzağınızdaki son 1 saatte girilen yoğunluk bilgilerini görmek demektir. (İleriki aşamada yer ve zaman ayarlanabilir olacaktır.)"
                },
                "HERE": {
                    "TITLE": "Burada",
                    "DESCRIPTION": "Bu seçenek sayesinde hemen yakınınızdaki kalabalık bilgilerini görebilirsiniz. Girilen bilgilerin yararlılığını geri bildirimler vererek diğer kullanıcılarla paylaşabilirsiniz."
                },
                "ON_MAP": {
                    "TITLE": "Haritada",
                    "DESCRIPTION": "Şehirdeki kalabalık bilgilerini haritada üzerinde görebilirsiniz."
                }
            },
            "SET_CROWD": {
                "TITLE": "Kalabalık Gir",
                "DESCRIPTION": "Uygulamanın ana modüllerinden biri kalabalık bilgilerini başkalarıyla paylaşabileceğiniz kısımdır. Yakınınızda, Google Maps'in sağladığı ya da diğer kullanıcıların paylaştığı yerlerden istediğiniz için bir yoğunluk değeri girebilirsiniz."
            }
        },
        "SETTINGS": {
            "CONTENT_SETTINGS": "Content Settings",
            "DISPLAY_CUSTOM_PLACES": "Display custom places"
        },
        "NATIVE_DIALOG": {
            "GPS": {
                "MESSAGE": "Your GPS is Disabled, this app needs to be enable to works.",
                "DESCRIPTION": "Use GPS, with wifi or 3G.",
                "TITLE": "Please Turn on GPS",
                "YES": "Yes",
                "NO": "No"
            }
        },
        "CONFIRM": {
            "CONFIRM": "Confirm",
            "QUIT_CONFIRM": "Are you sure you want to quit?",
            "OK": "Ok",
            "CANCEL": "Cancel"
        },
        "ALERT": {
            "ALERT": "Alert",
            "SUCCESS": "Successful!",
            "FAIL": "Failure!",
            "LOAD_FAIL": "Loading failure!",
            "OK": "Ok"
        },
        "DIALOG": {
            "CLOSE": "Close"
        },
        "WARNING": {
            "ZOOM_FOR_ASK": "No places around. Zoom and retry longpress!",
            "NO_RESULT_BY_SEARCH": "No result found. Try another search!"
        }
    };
};
angular.module('lang', [])
    .factory('defaultLanguageModel', [defaultLanguageModel]);
