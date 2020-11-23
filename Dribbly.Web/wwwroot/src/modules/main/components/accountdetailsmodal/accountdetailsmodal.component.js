(function () {
    'use strict';

    angular.module('mainModule')
        .component('drbblyAccountdetailsmodal', {
            bindings: {
                model: '<',
                context: '<',
                options: '<'
            },
            controllerAs: 'adm',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['drbblyAccountsService', '$scope', 'modalService', 'drbblyEventsService', 'constants', '$timeout',
        'drbblyOverlayService', 'drbblyDatetimeService', 'drbblyFormshelperService'];
    function controllerFn(drbblyAccountsService, $scope, modalService, drbblyEventsService, constants, $timeout,
        drbblyOverlayService, drbblyDatetimeService, drbblyFormshelperService) {
        var adm = this;

        adm.$onInit = function () {
            adm.tempCourt = angular.copy(adm.model.court || {});
            adm.overlay = drbblyOverlayService.buildOverlay();
            adm.overlay.setToBusy();
            adm.ddlPositionOptions = drbblyFormshelperService.getDropDownListChoices({ enumKey: 'app.PlayerPositionEnum' });
            setTypeAheadConfig();

            drbblyAccountsService.getAccountDetailsModal(adm.model.accountId)
                .then(function (data) {
                    adm.overlay.setToReady();
                    adm.account = data.account;
                    adm.selectedHomeCourts = [];
                    if (data.homeCourtChoice) {
                        adm.selectedHomeCourt = data.homeCourtChoice;
                        adm.selectedHomeCourts.push(data.homeCourtChoice);
                    }
                    adm.account.birthDate = data.account.birthDate ?
                        drbblyDatetimeService.toLocalDateTime(data.account.birthDate) : null;
                    adm.height = {};
                    adm.height.feet = Math.floor(data.account.heightInches / 12);
                    adm.height.inches = data.account.heightInches % 12;
                })
                .catch(adm.overlay.setToError);

            adm.context.setOnInterrupt(adm.onInterrupt);
            drbblyEventsService.on('modal.closing', function (event, reason, result) {
                if (!adm.context.okToClose) {
                    event.preventDefault();
                    adm.onInterrupt();
                }
            }, $scope);
        };

        adm.onInterrupt = function (reason) {
            if (adm.frmAccountDetails.$dirty) {
                modalService.showUnsavedChangesWarning()
                    .then(function (response) {
                        if (response) {
                            adm.context.okToClose = true;
                            adm.context.dismiss(reason);
                        }
                    })
                    .catch(function (response) {
                        console.log(response);
                    });
            }
            else {
                adm.context.okToClose = true;
                adm.context.dismiss(reason);
            }
        };

        function setTypeAheadConfig() {
            adm.typeAheadConfig = {
                entityTypes: [constants.enums.entityType.Court]
            };
        }

        adm.submit = function () {
            var saveModel = angular.copy(adm.account);
            if (saveModel.birthDate) {
                saveModel.birthDate = drbblyDatetimeService.toUtcDate(saveModel.birthDate);
            }
            saveModel.heightInches = getHeightInches();
            saveModel.homeCourtId = adm.selectedHomeCourts.length ? adm.selectedHomeCourts[0].value : null;
            adm.overlay.setToBusy();
            drbblyAccountsService.updateAccount(saveModel)
                .then(function () {
                    adm.context.okToClose = true;
                    adm.context.submit(saveModel);
                })
                .catch(adm.overlay.setToReady);
        };

        function getHeightInches() {
            if (adm.height.inches || adm.height.feet) {
                return adm.height.inches + (adm.height.feet * 12);
            }
            return null;
        }

        adm.cancel = function () {
            adm.onInterrupt('cancelled');
        };
    }
})();
