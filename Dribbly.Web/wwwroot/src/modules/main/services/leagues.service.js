(function () {
    'use strict';

    angular.module('mainModule')
        .service('drbblyLeaguesService', ['drbblyhttpService',
            function (drbblyhttpService) {
                var api = 'api/Leagues/';

                function addLeague(LeagueDetails) {
                    return drbblyhttpService.post(api + 'addLeague', LeagueDetails);
                }

                var _service = {
                    addLeague: addLeague
                };

                return _service;
            }]);
0
})();