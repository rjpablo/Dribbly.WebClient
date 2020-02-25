(function () {
    'use strict';

    angular.module('mainModule')
        .service('drbblyGamesService', ['drbblyhttpService',
            function (drbblyhttpService) {
                var api = 'api/Games/';

                function getAllGames() {
                    return drbblyhttpService.get(api + 'getAllGames');
                }

                function getGame(id) {
                    return drbblyhttpService.get(api + 'getGame/' + id);
                }

                function createGame(GameDetails) {
                    return drbblyhttpService.post(api + 'register', GameDetails);
                }

                function updateGame(GameDetails) {
                    return drbblyhttpService.post(api + 'updateGame', GameDetails);
                }

                var _service = {
                    getAllGames: getAllGames,
                    getGame: getGame,
                    createGame: createGame,
                    updateGame: updateGame
                };

                return _service;
            }]);

})();