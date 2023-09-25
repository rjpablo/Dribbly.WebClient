(function () {
    'use strict';

    angular.module('siteModule')
        .component('drbblyInputmodal', {
            bindings: {
                model: '<',
                context: '<'
            },
            controllerAs: 'inp',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$scope', 'drbblyEventsService', 'modalService', '$element', '$timeout'];
    function controllerFn($scope, drbblyEventsService, modalService, $element, $timeout) {
        var inp = this;

        inp.$onInit = function () {

            if (inp.model.type === 'typeahead') {
                setTypeAheadConfig(inp.model.typeAheadConfig);
            }

            inp.context.setOnInterrupt(inp.onInterrupt);
            drbblyEventsService.on('modal.closing', function (event, reason, result) {
                if (!inp.context.okToClose) {
                    event.preventDefault();
                    inp.context.okToClose = true;
                    inp.context.dismiss(reason);
                }
            }, $scope);

            $timeout(() => {
                $element.find('input[name=input]').select();
            });
        };

        inp.onInterrupt = function (reason) {
            if (inp.frmInput.$dirty) {
                modalService.showUnsavedChangesWarning()
                    .then(function (response) {
                        if (response) {
                            inp.context.okToClose = true;
                            inp.context.dismiss(reason);
                        }
                    })
                    .catch(function (response) {
                        console.log(response);
                    });
            }
            else {
                inp.context.okToClose = true;
                inp.context.dismiss(reason);
            }
        };

        inp.submit = function () {
            if (inp.frmInput.$valid && (!inp.model.isValid || inp.model.isValid(inp.model.value))) {
                inp.context.okToClose = true;
                inp.context.submit(inp.model.value);
            }
        };

        inp.cancel = function () {
            inp.onInterrupt('cancelled');
        };

        function setTypeAheadConfig(config) {
            inp.selectedItems = config.selectedItems;
            var defaultConfig = {
                onUnselect: () => {
                    inp.frmInput.$setDirty();
                }
            };
            inp.typeAheadConfig = Object.assign(defaultConfig, config);
        }
    }
})();
