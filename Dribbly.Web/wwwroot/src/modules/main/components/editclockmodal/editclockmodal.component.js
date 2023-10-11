(function () {
    'use strict';

    angular.module('mainModule')
        .component('drbblyEditclockmodal', {
            bindings: {
                model: '<',
                context: '<',
                options: '<'
            },
            controllerAs: 'ecm',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$scope', 'modalService', 'drbblyEventsService', 'drbblyGamesService', 'drbblyCommonService',
        'drbblyTimerhelperService', 'constants', 'drbblyOverlayService', 'drbblyFormshelperService', 'i18nService', '$timeout'];
    function controllerFn($scope, modalService, drbblyEventsService, drbblyGamesService, drbblyCommonService,
        drbblyTimerhelperService, constants, drbblyOverlayService, drbblyFormshelperService, i18nService, $timeout) {
        var ecm = this;

        ecm.$onInit = function () {
            ecm.overlay = drbblyOverlayService.buildOverlay();
            ecm.saveModel = drbblyTimerhelperService.breakupDuration(ecm.model.duration,
                ecm.model.isShotClock);

            ecm.context.setOnInterrupt(ecm.onInterrupt);
            drbblyEventsService.on('modal.closing', function (event, reason, result) {
                if (!ecm.context.okToClose) {
                    event.preventDefault();
                    ecm.onInterrupt();
                }
            }, $scope);
        };

        ecm.onInterrupt = function (reason) {
            if (ecm.frmEditClock.$dirty) {
                modalService.showUnsavedChangesWarning()
                    .then(function (response) {
                        if (response) {
                            ecm.context.okToClose = true;
                            ecm.context.dismiss(reason);
                        }
                    })
                    .catch(function (response) {
                        console.log(response);
                    });
            }
            else {
                ecm.context.okToClose = true;
                ecm.context.dismiss(reason);
            }
        };

        ecm.handleSubmitClick = function () {
            if (ecm.frmEditClock.$valid) {
                var saveModel = angular.copy(ecm.saveModel);
                saveModel.totalMs = drbblyTimerhelperService.getMsDuration(saveModel.min, saveModel.sec, saveModel.ms);
                close(saveModel);
            }
        };

        function close(result) {
            ecm.context.okToClose = true;
            ecm.context.submit(result);
        }

        ecm.cancel = function () {
            ecm.onInterrupt('cancelled');
        };
    }
})();
