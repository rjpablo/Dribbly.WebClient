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
        'drbblyOverlayService', 'drbblyAccountsService', 'drbblyToastService', 'constants', 'drbblyCommonService'];
    function controllerFunc(i18nService, authService, $stateParams, modalService, $state,
        drbblyOverlayService, drbblyAccountsService, drbblyToastService, constants, drbblyCommonService) {
        var das = this;

        das.$onInit = function () {
            das.username = $stateParams.username;
            das.overlay = drbblyOverlayService.buildOverlay();
            das.overlay.setToBusy();

            drbblyAccountsService.getAccountSettings(das.account.identityUserId)
                .then(loadData, function (err) {
                    das.overlay.setToError();
                });
        };

        function loadData(data) {
            das.accountSettings = data;
            das.isPrivate = !data.isPublic;
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

        das.replaceEmail = function () {
            modalService.input({
                model: {
                    prompt: "New Email:",
                    titleRaw: "Replace Email",
                    type: 'email',
                    required: true,
                    value: das.account.email,
                    isValid: value => value !== das.account.email
                }
            })
                .then(email => {
                    drbblyAccountsService.replaceEmail({ newEmail: email })
                        .then(() => {
                            das.account.email = email;
                        })
                        .catch(e => drbblyCommonService.handleError(e));
                })
                .catch(function () { /* cancelled, do nothing */ })
        };

        das.handleIsPublicChanged = function () {
            das.isBusy = true;
            drbblyAccountsService.setIsPublic(das.account.identityUserId, !das.isPrivate)
                .then(function () {
                    das.onUpdate();
                }, function () {
                    // flip back if it fails
                    das.isPrivate = !das.isPrivate;
                })
                .finally(function () { das.isBusy = false; });
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
                                $state.go('main.home', { reload: true });
                            })
                            .finally(function () {
                                das.isBusy = false;
                            });
                    }
                });
        };
    }
})();
