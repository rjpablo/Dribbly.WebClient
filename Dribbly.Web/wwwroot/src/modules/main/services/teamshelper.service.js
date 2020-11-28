(function () {
    'use strict';

    angular.module('mainModule')
        .service('drbblyTeamshelperService', ['modalService', 'authService',
            function (modalService, authService) {

                function openAddTeamModal(model) {
                    return authService.checkAuthenticationThen(function () {
                        return modalService.show({
                            view: '<drbbly-addteammodal></drbbly-addteammodal>',
                            model: model
                        });
                    });
                }

                var _service = {
                    openAddTeamModal: openAddTeamModal
                };

                return _service;
            }]);

})();