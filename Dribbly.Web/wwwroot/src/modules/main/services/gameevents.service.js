(function () {
    'use strict';

    angular.module('mainModule')
        .service('drbblyGameeventsService', ['drbblyhttpService',
            function (drbblyhttpService) {
                var api = 'api/Gameevents/';

                function upsertFoul(input) {
                    return drbblyhttpService.post(api + 'upsertFoul', input);
                }

                var _service = {
                    upsertFoul: upsertFoul
                };

                return _service;
            }]);
0
})();