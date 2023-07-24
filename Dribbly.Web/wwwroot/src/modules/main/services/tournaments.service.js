(function () {
    'use strict';

    angular.module('mainModule')
        .service('drbblyTournamentsService', ['drbblyhttpService',
            function (drbblyhttpService) {
                var api = 'api/Tournaments/';

                function addTournament(TournamentDetails) {
                    return drbblyhttpService.post(api + 'addTournament', TournamentDetails);
                }

                function addTournamentStage(input) {
                    return drbblyhttpService.post(api + 'addTournamentStage', input);
                }

                function getNew(input) {
                    return drbblyhttpService.post(api + `getNew`, input);
                }

                function getTournamentviewer(leagueId) {
                    return drbblyhttpService.get(api + `getTournamentviewer/${leagueId}`);
                }

                function getTournamentStages(tournamentId) {
                    return drbblyhttpService.get(api + `getTournamentStages/${tournamentId}`);
                }

                function joinTournament(tournamentId, teamId) {
                    return drbblyhttpService.post(api + `joinTournament/${tournamentId}/${teamId}`);
                }

                function removeTournamentTeam(tournamentId, teamId) {
                    return drbblyhttpService.post(api + `removeTournamentTeam/${tournamentId}/${teamId}`);
                }

                function processJoinRequest(requestId, shouldApprove) {
                    return drbblyhttpService.post(api + `processJoinRequest/${requestId}/${shouldApprove}`);
                }

                var _service = {
                    addTournament: addTournament,
                    addTournamentStage: addTournamentStage,
                    getNew: getNew,
                    getTournamentStages: getTournamentStages,
                    getTournamentviewer: getTournamentviewer,
                    joinTournament: joinTournament,
                    processJoinRequest: processJoinRequest,
                    removeTournamentTeam: removeTournamentTeam
                };

                return _service;
            }]);
    0
})();