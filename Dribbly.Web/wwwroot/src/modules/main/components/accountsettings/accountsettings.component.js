(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyAccountsettings', {
            bindings: {
                account: '<',
                onUpdate: '<'
            },
            controllerAs: 'das',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['constants', 'drbblyFileService', '$stateParams',
        'drbblyOverlayService', 'drbblyAccountsService', 'drbblyFooterService', '$timeout'];
    function controllerFunc(constants, drbblyFileService, $stateParams,
        drbblyOverlayService, drbblyAccountsService, drbblyFooterService, $timeout) {
        var das = this;

        das.$onInit = function () {
            das.username = $stateParams.username;
            das.overlay = drbblyOverlayService.buildOverlay();
            das.overlay.setToBusy();

            drbblyAccountsService.getAccountSettings(das.account.identityUserId)
                .then(loadData)
                .catch(das.overlay.setToError);
        };

        function loadData(data) {
            das.accountSettings = data;
            das.overlay.setToReady();
        }
    }
})();
