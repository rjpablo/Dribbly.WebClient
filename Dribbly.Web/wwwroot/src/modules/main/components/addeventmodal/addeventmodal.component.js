(function () {
    'use strict';

    angular.module('mainModule')
        .component('drbblyAddeventmodal', {
            bindings: {
                model: '<',
                context: '<',
                options: '<'
            },
            controllerAs: 'agm',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$scope', 'modalService', 'drbblyEventsService', 'drbblyEvtService', 'drbblyCommonService',
        '$element', '$timeout', 'drbblyOverlayService', 'drbblyDatetimeService', 'constants'];
    function controllerFn($scope, modalService, drbblyEventsService, drbblyEvtService, drbblyCommonService,
        $element, $timeout, drbblyOverlayService, drbblyDatetimeService, constants) {
        var agm = this;

        agm.$onInit = function () {
            agm.overlay = drbblyOverlayService.buildOverlay();
            agm.saveModel = angular.copy(agm.model);
            setStartDateOptions();
            setTypeAheadConfig();

            if (agm.model.isEdit) {
                if (agm.saveModel.court) {
                    agm.selectedCourts = [{ text: agm.saveModel.court.name, value: agm.saveModel.court.id }];
                }
            }
            else {
                agm.saveModel.requireApproval = true;
                agm.saveModel.startDate = agm.saveModel.startDate || new Date();
            }

            $timeout(() => {
                $element.find('[name="txtTitle"]').focus();
            })

            agm.context.setOnInterrupt(agm.onInterrupt);
            drbblyEventsService.on('modal.closing', function (event, reason, result) {
                if (!agm.context.okToClose) {
                    event.preventDefault();
                    agm.onInterrupt();
                }
            }, $scope);
        };

        agm.onInterrupt = function (reason) {
            if (agm.frmEventDetails.$dirty) {
                modalService.showUnsavedChangesWarning()
                    .then(function (response) {
                        if (response) {
                            agm.context.okToClose = true;
                            agm.context.dismiss(reason);
                        }
                    })
                    .catch(function (response) {
                        console.log(response);
                    });
            }
            else {
                agm.context.okToClose = true;
                agm.context.dismiss(reason);
            }
        };

        agm.submit = function () {
            if (agm.frmEventDetails.$valid) {
                var saveModel = angular.copy(agm.saveModel);
                agm.isBusy = true;
                if (agm.model.isEdit) {
                    drbblyEvtService.updateEvent(saveModel)
                        .then(function (result) {
                            agm.isBusy = false;
                            close(saveModel);
                        }, function (error) {
                            agm.isBusy = false;
                            drbblyCommonService.handleError(error);
                        });
                }
                else {
                    drbblyEvtService.createEvent(saveModel)
                        .then(function (result) {
                            agm.isBusy = false;
                            close(result);
                        }, function (error) {
                            agm.isBusy = false;
                            drbblyCommonService.handleError(error);
                        });
                }
            }
        };

        agm.startChanged = function (newValue) {
            agm.saveModel.startDate = newValue;
        };

        function setStartDateOptions() {
            agm.startDateOptions = {
                datepicker: {
                    dateDisabled: function (params) {
                        return params.mode === 'day' && drbblyDatetimeService.compareDatesOnly(params.date, new Date()) === -1;
                    }
                }
            };
        }

        function setTypeAheadConfig() {
            agm.typeAheadConfig = {
                entityTypes: [constants.enums.entityType.Court]
            };
        }

        function close(result) {
            agm.context.okToClose = true;
            agm.context.submit(result);
        }

        agm.cancel = function () {
            agm.onInterrupt('cancelled');
        };
    }
})();
