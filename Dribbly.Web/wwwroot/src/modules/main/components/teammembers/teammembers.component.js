(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyTeammembers', {
            bindings: {
                team: '<',
                onUpdate: '<'
            },
            controllerAs: 'dad',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['constants', 'drbblyFileService', '$stateParams', 'authService', 'permissionsService',
        'drbblyOverlayService', 'modalService', 'i18nService', 'drbblyTeamsService'];
    function controllerFunc(constants, drbblyFileService, $stateParams, authService, permissionsService,
        drbblyOverlayService, modalService, i18nService, drbblyTeamsService) {
        var dad = this;

        dad.$onInit = function () {
            dad.teamId = $stateParams.id;
            dad.overlay = drbblyOverlayService.buildOverlay();
            dad.isOwned = authService.isCurrentUserId(dad.team.addedById);
            dad.overlay.setToBusy()
            dad.isBusy = true;
            drbblyTeamsService.getCurrentMembers(dad.teamId)
                .then(function (data) {
                    dad.isBusy = false;
                    dad.currentMembers = data;
                    dad.overlay.setToReady();
                }, function (error) {
                    dad.overlay.setToError();
                    dad.isBusy = false;
                });

            dad.memberListSettings = {
                wrapItems: true,
                loadSize: 6,
                initialItemCount: 0
            }
        };
    }
})();
