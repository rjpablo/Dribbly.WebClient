(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyAccounthome', {
            bindings: {
                account: '<',
                onUpdate: '<'
            },
            controllerAs: 'dad',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['constants', '$stateParams', 'authService', 'drbblyOverlayService', '$timeout'];
    function controllerFunc(constants, $stateParams, authService, drbblyOverlayService, $timeout) {
        var dad = this;

        dad.$onInit = function () {
            dad.username = $stateParams.username;
            dad.overlay = drbblyOverlayService.buildOverlay();
            dad.isOwned = authService.isCurrentUserId(dad.account.identityUserId);
            dad.postsOptions = {
                postedOnType: constants.enums.entityType.Account,
                postedOnId: dad.account.id
            };
            loadAccount();
        };

        function loadAccount() {
            dad.overlay.setToBusy();
            $timeout(dad.overlay.setToReady, 1000);
        }

        dad.edit = function () {
            drbblyAccountshelperService.editAccount(dad.account)
                .then(function () {
                    dad.onUpdate();
                })
                .catch(function () { /*do nothing*/ });
        };
    }
})();
