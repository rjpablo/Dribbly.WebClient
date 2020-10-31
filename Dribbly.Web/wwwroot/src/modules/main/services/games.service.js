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

                function updateGame(GameDetails) {
                    return drbblyhttpService.post(api + 'updateGame', GameDetails);
                }

                function addGame(GameDetails) {
                    return drbblyhttpService.post(api + 'addGame', GameDetails);
                }

                var _service = {
                    getAll: getAll,
                    getGame: getGame,
                    addGame: addGame,
                    updateGame: updateGame
                };

                return _service;
            }]);

})();