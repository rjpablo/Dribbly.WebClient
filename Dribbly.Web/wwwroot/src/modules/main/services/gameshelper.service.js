(function () {
    'use strict';

    angular.module('mainModule')
        .service('drbblyGameshelperService', ['modalService', 'authService',
            function (modalService, authService) {

                function openAddEditGameModal(model) {
                    return authService.checkAuthenticationThen(function () {
                        return modalService.show({
                            view: '<drbbly-gamedetailsmodal></drbbly-gamedetailsmodal>',
                            model: model
                        });
                    });
                }

                var _service = {
                    openAddEditGameModal: openAddEditGameModal
                };

                return _service;
            }]);

})();