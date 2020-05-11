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

    controllerFunc.$inject = ['i18nService', 'authService', '$stateParams',
        'drbblyOverlayService', 'drbblyAccountsService', 'drbblyToastService'];
    function controllerFunc(i18nService, authService, $stateParams,
        drbblyOverlayService, drbblyAccountsService, drbblyToastService) {
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

        das.changePassword = function () {
            authService.showChangePasswordModal()
                .then(function (result) {
                    if (result) {
                        drbblyToastService.success(i18nService.getString('auth.PasswordChangedSuccessfully'));
                    }
                })
                .catch(function () { /*cancelled*/ });
        };
    }
})();
