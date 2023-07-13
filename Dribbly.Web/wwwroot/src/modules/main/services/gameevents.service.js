(function () {
    'use strict';

    angular.module('mainModule')
        .service('drbblyGameeventsService', ['drbblyhttpService',
            function (drbblyhttpService) {
                var api = 'api/Gameevents/';                

                return {
                    update: function (input) {
                        return drbblyhttpService.post(api + 'update', input);
                    },
                    upsertFoul: function (input) {
                        return drbblyhttpService.post(api + 'upsertFoul', input);
                    },
                };
            }]);
0
})();