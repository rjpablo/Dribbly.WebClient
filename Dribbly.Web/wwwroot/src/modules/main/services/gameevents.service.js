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
                    recordShot: function (shot) {
                        return drbblyhttpService.post(api + 'recordShot', shot);
                    },
                    recordTurnover: function (input) {
                        return drbblyhttpService.post(api + 'recordTurnover', input);
                    },
                    update: function (input) {
                        return drbblyhttpService.post(api + 'update', input);
                    },
                    upsert: function (input) {
                        return drbblyhttpService.post(api + 'upsert', input);
                    },
                    upsertFoul: function (input) {
                        return drbblyhttpService.post(api + 'upsertFoul', input);
                    },
                    upsertFreeThrow: function (shot) {
                        return drbblyhttpService.post(api + 'upsertFreeThrow', shot);
                    }
                };
            }]);
    0
})();