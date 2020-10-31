(function () {
    'use strict';

    angular.module('mainModule')
        .service('drbblyGameshelperService', ['modalService', 'authService',
            function (modalService, authService) {

                function openAddEditGameModal(game, options) {
                    return authService.checkAuthenticationThen(function () {
                        return modalService.show({
                            view: '<drbbly-gamedetailsmodal></drbbly-gamedetailsmodal>',
                            model: {
                                game: game
                            },
                            options: options
                        });
                    });
                }

                var _service = {
                    openAddEditGameModal: openAddEditGameModal
                };

                return _service;
            }]);

})();