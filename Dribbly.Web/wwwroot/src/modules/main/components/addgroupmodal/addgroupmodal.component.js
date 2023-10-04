(function () {
    'use strict';

    angular.module('mainModule')
        .component('drbblyAddgroupmodal', {
            bindings: {
                model: '<',
                context: '<',
                options: '<'
            },
            controllerAs: 'agm',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$scope', 'modalService', 'drbblyEventsService', 'drbblyGroupsService', 'drbblyCommonService',
        '$element', '$timeout', 'drbblyOverlayService'];
    function controllerFn($scope, modalService, drbblyEventsService, drbblyGroupsService, drbblyCommonService,
        $element, $timeout, drbblyOverlayService) {
        var agm = this;

        agm.$onInit = function () {
            agm.overlay = drbblyOverlayService.buildOverlay();
            agm.saveModel = angular.copy(agm.model);

            $timeout(() => {
                $element.find('[name="txtName"]').focus();
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
            if (agm.frmGroupDetails.$dirty) {
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
            if (agm.frmGroupDetails.$valid) {
                var saveModel = angular.copy(agm.saveModel);
                agm.isBusy = true;
                if (agm.model.isEdit) {
                    drbblyGroupsService.updateGroup(saveModel)
                        .then(function (result) {
                            agm.isBusy = false;
                            close(saveModel);
                        }, function (error) {
                            agm.isBusy = false;
                            drbblyCommonService.handleError(error);
                        });
                }
                else {
                    drbblyGroupsService.createGroup(saveModel)
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

        function close(result) {
            agm.context.okToClose = true;
            agm.context.submit(result);
        }

        agm.cancel = function () {
            agm.onInterrupt('cancelled');
        };
    }
})();
