(function () {
    'use strict';

    angular.module('mainModule')
        .service('drbblyLeaguesService', ['drbblyhttpService',
            function (drbblyhttpService) {
                var api = 'api/Leagues/';

                function addLeague(LeagueDetails) {
                    return drbblyhttpService.post(api + 'addLeague', LeagueDetails);
                }

                function getLeagueviewer(leagueId) {
                    return drbblyhttpService.get(api + `getLeagueviewer/${leagueId}`);
                }

                var _service = {
                    addLeague: addLeague,
                    getLeagueviewer: getLeagueviewer
                };

                return _service;
            }]);
0
})();