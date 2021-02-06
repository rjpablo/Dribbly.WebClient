﻿(function () {
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

                function getAddGameModal(courtId) {
                    return drbblyhttpService.get(api + 'getAddGameModal/' + courtId);
                }

                function updateGame(GameDetails) {
                    return drbblyhttpService.post(api + 'updateGame', GameDetails);
                }

                function updateGameResult(result) {
                    return drbblyhttpService.post(api + 'updateGameResult', result);
                }

                function updateStatus(gameId, toStatus) {
                    return drbblyhttpService.post(api + 'updateStatus/' + gameId + '/' + toStatus);
                }

                function addGame(GameDetails) {
                    return drbblyhttpService.post(api + 'addGame', GameDetails);
                }

                var _service = {
                    getAddGameModal: getAddGameModal,
                    getAll: getAll,
                    getGame: getGame,
                    addGame: addGame,
                    updateGame: updateGame,
                    updateGameResult: updateGameResult,
                    updateStatus: updateStatus
                };

                return _service;
            }]);

})();