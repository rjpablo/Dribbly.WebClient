(function () {
    'use strict';

    angular.module('mainModule')
        .service('drbblyTournamentsService', ['drbblyhttpService',
            function (drbblyhttpService) {
                var api = 'api/Tournaments/';

                function addTournament(TournamentDetails) {
                    return drbblyhttpService.post(api + 'addTournament', TournamentDetails);
                }

                function getNew(input) {
                    return drbblyhttpService.post(api + `getNew`, input);
                }

                function getTournamentviewer(leagueId) {
                    return drbblyhttpService.get(api + `getTournamentviewer/${leagueId}`);
                }

                var _service = {
                    addTournament: addTournament,
                    getNew: getNew,
                    getTournamentviewer: getTournamentviewer
                };

                return _service;
            }]);
0
})();