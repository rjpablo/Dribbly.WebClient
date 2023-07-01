(function () {
    'use strict';

    angular.module('mainModule')
        .service('drbblyGamesService', ['drbblyhttpService',
            function (drbblyhttpService) {
                var api = 'api/Games/';

                function getAll() {
                    return drbblyhttpService.get(api + 'getAll');
                }

                function getGame(id) {
                    return drbblyhttpService.get(api + 'getGame/' + id);
                }

                function getGameTeam(gameId, teamId) {
                    return drbblyhttpService.get(api + `getGameTeam/${gameId}/${teamId}`);
                }

                function getAddGameModal(courtId) {
                    return drbblyhttpService.get(api + 'getAddGameModal/' + courtId);
                }

                function advancePeriod(gameId, period, remainingTime) {
                    return drbblyhttpService.post(api + `advancePeriod/${gameId}/${period}/${remainingTime}`);
                }

                function setNextPossession(gameId, nextPossession) {
                    return drbblyhttpService.post(api + `setNextPossession/${gameId}/${nextPossession}`);
                }

                function updateRemainingTime(input) {
                    return drbblyhttpService.post(api + `updateRemainingTime`, input);
                }

                function endGame(gameId, winningTeamId) {
                    return drbblyhttpService.post(api + `endGame/${gameId}/${winningTeamId}`);
                }

                function updateGame(GameDetails) {
                    return drbblyhttpService.post(api + 'updateGame', GameDetails);
                }

                function updateGameResult(result) {
                    return drbblyhttpService.post(api + 'updateGameResult', result);
                }

                function recordShot(shot) {
                    return drbblyhttpService.post(api + 'recordShot', shot);
                }

                function recordTimeout(input) {
                    return drbblyhttpService.post(api + 'recordTimeout', input);
                }

                function updateStatus(gameId, toStatus) {
                    return drbblyhttpService.post(api + 'updateStatus/' + gameId + '/' + toStatus);
                }

                function addGame(GameDetails) {
                    return drbblyhttpService.post(api + 'addGame', GameDetails);
                }

                function startGame(input) {
                    return drbblyhttpService.post(api + 'startGame', input);
                }

                var _service = {
                    addGame: addGame,
                    advancePeriod: advancePeriod,
                    endGame: endGame,
                    getAddGameModal: getAddGameModal,
                    getAll: getAll,
                    getGame: getGame,
                    getGameTeam: getGameTeam,
                    recordShot: recordShot,
                    recordTimeout: recordTimeout,
                    startGame: startGame,
                    setNextPossession: setNextPossession,
                    updateGame: updateGame,
                    updateGameResult: updateGameResult,
                    updateRemainingTime: updateRemainingTime,
                    updateStatus: updateStatus
                };

                return _service;
            }]);

})();