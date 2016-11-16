angular.module('app')
    .config(['$logProvider', function($logProvider) {
        $logProvider.debugEnabled(true);
    }])
    .config(['$provide', function($provide) {
        $provide.decorator('$log', ['$delegate', function($delegate) {
            var logArray = [],
                logFn = $delegate.log,
                infoFn = $delegate.info,
                debugFn = $delegate.debug,
                warnFn = $delegate.warn,
                errorFn = $delegate.error;

            function formatLogObject(logObject) {
            	return logObject.timestamp + ' - ' + logObject.level + ' - ' + logObject.message;
            }

            function printAndStoreLog(handler, logObject) {
                var printFormat = formatLogObject(logObject);
                logArray.push(printFormat);

                if (logArray.length > 1000) {
                    logArray.shift();
                }

                if (logObject.args) {
                    handler(printFormat, logObject.args);
                } else {
                    handler(printFormat);
                }
            }

            function createLogObject(message, logLevel, args) {
                return {
                    timestamp: Date.now(),
                    level: logLevel,
                    message: message,
                    args: args
                };
            }

            $delegate.log = function(msg, args) {
                printAndStoreLog(logFn, createLogObject(msg, 'LOG', args));
            };

            $delegate.info = function(msg, args) {
                printAndStoreLog(infoFn, createLogObject(msg, 'INFO', args));
            };

            $delegate.debug = function(msg, args) {
                printAndStoreLog(debugFn, createLogObject(msg, 'DEBUG', args));
            };

            $delegate.warn = function(msg, args) {
                printAndStoreLog(warnFn, createLogObject(msg, 'WARN', args));
            };

            $delegate.error = function(msg, args) {
                printAndStoreLog(errorFn, createLogObject(msg, 'ERROR', args));
            };

            $delegate.getAllLogs = function() {
                return logArray;
            };

            $delegate.getAllLogsAsString = function() {
                return logArray.join("\r\n");
            };

            return $delegate;
        }]);
    }]);
