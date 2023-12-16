(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyAccountdetails', {
            bindings: {
                account: '<',
                onUpdate: '<',
                app: '<'
            },
            controllerAs: 'dad',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['$stateParams', 'authService', 'drbblyOverlayService', '$timeout', 'modalService'];
    function controllerFunc($stateParams, authService, drbblyOverlayService, $timeout, modalService) {
        var dad = this;

        dad.$onInit = function () {
            dad.username = $stateParams.username;
            dad.overlay = drbblyOverlayService.buildOverlay();
            dad.isOwned = authService.isCurrentUserId(dad.account.identityUserId);
            loadAccount();
            dad.app.updatePageDetails({
                title: dad.account.name + ' - Account Details',
                image: dad.account.profilePhoto.url
            });
        };

        function loadAccount() {
            dad.overlay.setToBusy();
            $timeout(dad.overlay.setToReady, 1000);
        }

        dad.edit = function () {
            authService.checkAuthenticationThen(function () {
                modalService.show({
                    view: '<drbbly-accountdetailsmodal></drbbly-accountdetailsmodal>',
                    model: { accountId: dad.account.id },
                    backdrop: 'static'
                })
                    .then(function (result) {
                        if (result) {
                            dad.onUpdate();
                        }
                    });
            });
        };
    }
})();
