(function () {
    'use strict';

    angular.module('siteModule')
        .service('drbblyEventsService', ['$rootScope', '$q',
            function ($rootScope, $q) {

                function broadcast(eventName, data) {
                    var deferred = $q.defer();
                    $rootScope.$broadcast(eventName, data);
                    return deferred;
                }

                function emit(eventName, data) {
                    var result = $rootScope.$emit(eventName, data);
                    return result;
                }

                function on(eventName, handler, scope) {
                    var result = (scope || $rootScope).$on(eventName, handler);
                    return result;
                }

                return {
                    broadcast: broadcast,
                    emit: emit,
                    on: on
                };

            }]);
})();