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

    controllerFunc.$inject = ['i18nService', 'authService', '$stateParams', 'modalService', '$state',
        'drbblyOverlayService', 'drbblyAccountsService', 'drbblyToastService', 'constants'];
    function controllerFunc(i18nService, authService, $stateParams, modalService, $state,
        drbblyOverlayService, drbblyAccountsService, drbblyToastService, constants) {
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

        das.deactivate = function () {
            modalService.confirm({ msg2Key: 'site.DeactivateAccountPrompt' })
                .then(function (result) {
                    if (result) {
                        das.isBusy = true;
                        drbblyAccountsService.setStatus(das.account.id, constants.enums.accountStatus.Inactive)
                            .then(function () {
                                authService.logOut();
                                $state.go('main.home', { reload: true })
                                    .finally(function () {
                                        $window.location.reload();
                                    });
                            })
                            .finally(function () {
                                das.isBusy = false;
                            });
                    }
                });
        };

        das.reactivate = function () {
            das.isBusy = true;
            drbblyAccountsService.setStatus(das.account.id, constants.enums.accountStatus.Active)
                .then(function () {
                    das.onUpdate();
                })
                .finally(function () {
                    das.isBusy = false;
                });
        };

        das.deleteAccount = function () {
            modalService.confirm({ msg2Key: 'site.DeleteAccountPrompt' })
                .then(function (result) {
                    if (result) {
                        das.isBusy = true;
                        drbblyAccountsService.setStatus(das.account.id, constants.enums.accountStatus.Deleted)
                            .then(function () {
                                authService.logOut();
                                $state.go('main.home', { reload: true })
                                    .finally(function () {
                                        $window.location.reload();
                                    });
                            })
                            .finally(function () {
                                das.isBusy = false;
                            });
                    }
                });
        };
    }
})();
