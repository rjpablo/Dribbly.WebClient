(function () {
    'use strict';

    angular.module('siteModule')
        .component('drbblyAlertmodal', {
            bindings: {
                model: '<',
                context: '<'
            },
            controllerAs: 'dam',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$scope', 'drbblyEventsService'];
    function controllerFn($scope, drbblyEventsService) {
        var dam = this;

        dam.$onInit = function () {
            if (dam.model.options) {
                if (dam.model.options.buttonsPreset) {
                    dam.model.options.buttons = [];
                    switch (dam.model.options.buttonsPreset) {
                        case 'OkOnly':
                            dam.model.options.buttons.push(buildButton('site.Ok', true, 'btn btn-primary'));
                            break;
                        case 'YesNo':
                            dam.model.options.buttons.push(buildButton('site.Yes', true, 'btn btn-primary'),
                                buildButton('site.No', false, 'btn btn-secondary'));
                            break;
                        case 'YesCancel':
                            dam.model.options.buttons.push(buildButton('site.Yes', true, 'btn btn-primary'),
                                buildButton('site.Cancel', null, 'btn btn-secondary'));
                            break;
                        case 'YesNoCancel':
                            dam.model.options.buttons.push(buildButton('site.Yes', true, 'btn btn-primary'),
                                buildButton('site.No', false, 'btn btn-secondary'),
                                buildButton('site.Cancel', null, 'btn btn-secondary'));
                            break;
                        case 'OkCancel':
                            dam.model.options.buttons.push(buildButton('site.Ok', true, 'btn btn-primary'),
                                buildButton('site.Cancel', null, 'btn btn-secondary'));
                            break;
                        case 'ContinueCancel':
                            dam.model.options.buttons.push(buildButton('site.Continue', true, 'btn btn-primary'),
                                buildButton('site.Cancel', null, 'btn btn-secondary'));
                            break;
                    }
                }
            }

            dam.context.setOnInterrupt(dam.onInterrupt);
            drbblyEventsService.on('modal.closing', function (event, reason, result) {
                if (!dam.context.okToClose) {
                    event.preventDefault();
                    dam.context.okToClose = true;
                    dam.context.dismiss(reason);
                }
            }, $scope);
        };

        dam.onInterrupt = function () {
            dam.context.okToClose = true;
            dam.context.dismiss();
        };

        function buildButton(textKey, returnValue, buttonClass) {
            return {
                textKey: textKey,
                action: () => {
                    dam.context.okToClose = true;
                    dam.context.submit(returnValue);
                },
                class: buttonClass
            };
        }
    }
})();
