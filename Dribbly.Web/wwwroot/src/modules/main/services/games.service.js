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

                function bookGame(GameDetails) {
                    return drbblyhttpService.post(api + 'bookGame', GameDetails);
                }

                function updateGame(GameDetails) {
                    return drbblyhttpService.post(api + 'updateGame', GameDetails);
                }

                var _service = {
                    getAll: getAll,
                    getGame: getGame,
                    bookGame: bookGame,
                    updateGame: updateGame
                };

                return _service;
            }]);

})();