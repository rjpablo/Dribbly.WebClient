(function () {
    'use strict';

    var module = angular.module('siteModule', [
        'ui.router',
        'ngSanitize',
        'ngAnimate',
        'toaster',
        'ngTouch',
        'ui.bootstrap',
        'ui.bootstrap.datetimepicker',
        'infinite-scroll',
        'aa.formExtensions',
        'aa.notify'
    ]);

    module.constant('constants', {
        site: {
            name: 'Dribbly'
        }
    });

    module.value('THROTTLE_MILLISECONDS', 500);

    module.config(['$provide', function ($provide) {
        /* Information about AngularJS decorator can be found at: 
         * https://docs.angularjs.org/api/auto/service/$provide
         */
        $provide.decorator('$log', [
            '$delegate',
            function (
                // delegate is the original instance of $log 
                $delegate
            ) {
                var levels = ['debug', 'info', 'warn', 'error'];

                angular.forEach(levels, function (level) {

                    // storing the original function
                    var original = $delegate[level];

                    // creating a wrapped version of each $log level function
                    // _.wrap is from the underscore.js library
                    $delegate[level] = function () {

                        // logger data to be sent/logged to console
                        var data = arguments[0];

                        if (angular.isObject(data)) {
                            /* The angular $http service cannot be used in the $log 
                             * decorator because it will cause a circular dependecy.
                             * To overcome this  a direct ajax call should be made.
                             */
                            window.Dribbly.logClientException(data.message, data.errorMessage || data.description,
                                data.url, data.errorCode, data.stack, data.lineNo, data.column);
                        }

                        // call to the original function which will write to the console
                        original.apply($delegate, arguments);
                    };
                });
                // returning to $log object with the new wrapped log-level functions
                return $delegate;
            }
        ]);

        $provide.decorator('$exceptionHandler', ['$log', function ($log) {
            return function (exception, cause) {
                $log.error(exception);
            };
        }]);
    }
    ]);

})();
