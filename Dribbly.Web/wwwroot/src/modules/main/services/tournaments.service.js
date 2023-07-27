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

                function getTournamentTeamsAsChoices(tournamentId, stageId) {
                    return drbblyhttpService.get(api + `getTournamentTeamsAsChoices/${tournamentId}/${stageId}`);
                }

                function isCurrentUserManager(tournamentId) {
                    return drbblyhttpService.get(api + `isCurrentUserManager/${tournamentId}`);
                }

                function joinTournament(tournamentId, teamId) {
                    return drbblyhttpService.post(api + `joinTournament/${tournamentId}/${teamId}`);
                }

                function removeTournamentTeam(tournamentId, teamId) {
                    return drbblyhttpService.post(api + `removeTournamentTeam/${tournamentId}/${teamId}`);
                }

                function setStageTeams(input) {
                    return drbblyhttpService.post(api + `setStageTeams`, input);
                }

                function updateTournamentSettings(input) {
                    return drbblyhttpService.post(api + `updateTournamentSettings`, input);
                }

                function setTeamBracket(teamId, stageId, bracketId) {
                    return drbblyhttpService.post(api + `setTeamBracket/${teamId}/${stageId}/${bracketId}`);
                }

                function deleteStageBracket(bracketId) {
                    return drbblyhttpService.post(api + `deleteStageBracket/${bracketId}`);
                }

                function deleteStage(stageId) {
                    return drbblyhttpService.post(api + `deleteStage/${stageId}`);
                }

                function addStageBracket(bracketName, stageId) {
                    return drbblyhttpService.post(api + `addStageBracket/${bracketName}/${stageId}`);
                }

                function renameStage(stageId, name) {
                    return drbblyhttpService.post(api + `renameStage/${stageId}/${name}`);
                }

                function processJoinRequest(requestId, shouldApprove) {
                    return drbblyhttpService.post(api + `processJoinRequest/${requestId}/${shouldApprove}`);
                }

                var _service = {
                    addStageBracket: addStageBracket,
                    addTournament: addTournament,
                    addTournamentStage: addTournamentStage,
                    deleteStage: deleteStage,
                    deleteStageBracket: deleteStageBracket,
                    getNew: getNew,
                    getTournamentStages: getTournamentStages,
                    getTournamentTeamsAsChoices: getTournamentTeamsAsChoices,
                    getTournamentviewer: getTournamentviewer,
                    isCurrentUserManager: isCurrentUserManager,
                    joinTournament: joinTournament,
                    processJoinRequest: processJoinRequest,
                    removeTournamentTeam: removeTournamentTeam,
                    renameStage: renameStage,
                    setStageTeams: setStageTeams,
                    setTeamBracket: setTeamBracket,
                    updateTournamentSettings: updateTournamentSettings
                };

                return _service;
            }]);
    0
})();