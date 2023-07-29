(function () {
    'use strict';

    angular.module('mainModule')
        .service('drbblyGameeventsService', ['drbblyhttpService',
            function (drbblyhttpService) {
                var api = 'api/Gameevents/';                

                return {
                    delete: function (eventId) {
                        return drbblyhttpService.post(api + 'delete/' + eventId);
                    },
                    recordTurnover: function (input) {
                        return drbblyhttpService.post(api + 'recordTurnover', input);
                    },
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