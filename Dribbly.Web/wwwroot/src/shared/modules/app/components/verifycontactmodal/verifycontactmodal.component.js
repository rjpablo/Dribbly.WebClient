(function () {
    'use strict';

    angular.module('appModule')
        .component('drbblyVerifycontactmodal', {
            bindings: {
                model: '<',
                context: '<'
            },
            controllerAs: 'vcm',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$scope', 'drbblyEventsService', 'drbblyContactsService', 'modalService', 'i18nService'];
    function controllerFn($scope, drbblyEventsService, drbblyContactsService, modalService, i18nService) {
        var vcm = this;
        var _generatedContactId;

        vcm.$onInit = function () {
            vcm.context.setOnInterrupt(vcm.onInterrupt);
            drbblyEventsService.on('modal.closing', function (event, reason, result) {
                if (!vcm.context.okToClose) {
                    event.preventDefault();
                    vcm.onInterrupt();
                }
            }, $scope);
        };

        vcm.sendCode = function () {
            vcm.isBusy = true;
            vcm.codeHasBeenSent = false;
            vcm.codeGenerationError = '';
            drbblyContactsService.sendVerificationCode({ contactNumber: vcm.model.contactNumber })
                .then(function () {
                    vcm.codeHasBeenSent = true;
                    vcm.isBusy = false;
                }, function () {
                    vcm.codeGenerationError = i18nService.getString('site.Error_PhoneVerification_CouldNotSend');
                    vcm.isBusy = false;
                });
        };

        vcm.submitCode = function () {
            vcm.isBusy = true;
            vcm.verificationError = '';
            drbblyContactsService.verifyMobileNumber({ contactNumber: vcm.model.contactNumber, code: vcm.code })
                .then(function (result) {
                    if (result.successful) {
                        _generatedContactId = result.generatedContactId;
                        vcm.isVerificationComplete = true;
                    }
                    else if (result.codeWasIncorrect) {
                        vcm.verificationError = i18nService.getString('site.Error_PhoneVerification_IncorrectCode');
                        vcm.isBusy = false;
                    }
                    else {
                        vcm.verificationError = i18nService.getString('site.Error_Common_UnexpectedError');
                        vcm.isBusy = false;
                    }
                }, function () {
                    vcm.verificationError = i18nService.getString('site.Error_Common_UnexpectedError');
                    vcm.isBusy = false;
                });
        };

        vcm.close = function () {
            vcm.context.okToClose = true;
            vcm.context.submit(_generatedContactId);
        };

        vcm.onInterrupt = function (reason) {
            if (vcm.frmContactVerification.$dirty || vcm.codeHasBeenSent) {
                modalService.showUnsavedChangesWarning()
                    .then(function (response) {
                        if (response) {
                            vcm.context.okToClose = true;
                            vcm.context.dismiss(reason);
                        }
                    })
                    .catch(function (response) {
                        console.log(response);
                    });
            }
            else {
                vcm.context.okToClose = true;
                vcm.context.dismiss(reason);
            }
        };
    }
})();
