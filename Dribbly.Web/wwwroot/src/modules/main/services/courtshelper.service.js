(function () {
    'use strict';

    angular.module('mainModule')
        .service('drbblyCourtshelperService', ['modalService', 'authService',
            function (modalService, authService) {

                function registerCourt() {
                    return authService.checkAuthenticationThen(function () {
                        return modalService.show({
                            view: '<drbbly-addeditcourtmodal></drbbly-addeditcourtmodal>',
                            model: {}
                        });
                    });
                }

                function editCourt(court) {
                    return authService.checkAuthenticationThen(function () {
                        return modalService.show({
                            view: '<drbbly-addeditcourtmodal></drbbly-addeditcourtmodal>',
                            model: { court: court },
                            options: { isEdit: true }
                        });
                    });
                }

                function openBookGameModal(game, options) {
                    return authService.checkAuthenticationThen(function () {
                        return modalService.show({
                            view: '<drbbly-bookgamemodal></drbbly-bookgamemodal>',
                            model: {
                                game: game
                            },
                            options: options
                        });
                    });
                }

                var _service = {
                    editCourt: editCourt,
                    openBookGameModal: openBookGameModal,
                    registerCourt: registerCourt
                };

                return _service;
            }]);

})();