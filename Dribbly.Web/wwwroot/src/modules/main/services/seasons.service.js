(function () {
    'use strict';

    angular.module('mainModule')
        .service('drbblySeasonsService', ['drbblyhttpService',
            function (drbblyhttpService) {
                var api = 'api/Seasons/';

                function addSeason(SeasonDetails) {
                    return drbblyhttpService.post(api + 'addSeason', SeasonDetails);
                }

                var _service = {
                    addSeason: addSeason
                };

                return _service;
            }]);
0
})();