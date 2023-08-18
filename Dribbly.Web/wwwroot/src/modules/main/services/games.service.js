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

                function currentUserIsGameManager(gameId) {
                    return drbblyhttpService.get(api + 'currentUserIsGameManager/' + gameId);
                }

                function getGameTeam(gameId, teamId) {
                    return drbblyhttpService.get(api + `getGameTeam/${gameId}/${teamId}`);
                }

                function getAddGameModal(input) {
                    return drbblyhttpService.post(api + 'getAddGameModal', input);
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

                function getGames(input) {
                    return drbblyhttpService.post(api + `getGames`, input);
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

                function setTimeoutsLeft(gameTeamId, timeoutsLeft) {
                    return drbblyhttpService.post(api + 'setTimeoutsLeft/' + gameTeamId + '/' + timeoutsLeft);
                }

                function setTeamFoulCount(gameTeamId, foulCount) {
                    return drbblyhttpService.post(api + 'setTeamFoulCount/' + gameTeamId + '/' + foulCount);
                }

                function setBonusStatus(gameTeamId, isInBonus) {
                    return drbblyhttpService.post(api + 'setBonusStatus/' + gameTeamId + '/' + isInBonus);
                }

                function updateLineup(input) {
                    return drbblyhttpService.post(api + 'updateLineup', input);
                }

                var _service = {
                    addGame: addGame,
                    advancePeriod: advancePeriod,
                    currentUserIsGameManager: currentUserIsGameManager,
                    endGame: endGame,
                    getAddGameModal: getAddGameModal,
                    getAll: getAll,
                    getGame: getGame,
                    getGames: getGames,
                    getGameTeam: getGameTeam,
                    recordTimeout: recordTimeout,
                    startGame: startGame,
                    setBonusStatus: setBonusStatus,
                    setNextPossession: setNextPossession,
                    setTimeoutsLeft: setTimeoutsLeft,
                    setTeamFoulCount: setTeamFoulCount,
                    updateGame: updateGame,
                    updateGameResult: updateGameResult,
                    updateLineup: updateLineup,
                    updateRemainingTime: updateRemainingTime,
                    updateStatus: updateStatus
                };

                return _service;
            }]);

})();