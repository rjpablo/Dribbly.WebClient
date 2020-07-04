(function () {
    'use strict';

    angular.module('siteModule')
        .component('drbblyOptionsmodal', {
            bindings: {
                model: '<',
                context: '<'
            },
            controllerAs: 'dom',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$scope', 'drbblyEventsService'];
    function controllerFn($scope, drbblyEventsService) {
        var dom = this;

        dom.$onInit = function () {
            drbblyEventsService.on('modal.closing', function (event, reason) {
                if (!dom.context.okToClose) {
                    event.preventDefault();
                    dom.context.okToClose = true;
                    dom.context.dismiss(reason);
                }
            }, $scope);
        };

        dom.onItemClick = function (item) {
            dom.context.okToClose = true;
            dom.context.submit(item);
            if (item.action) {
                item.action(item);
            }
        };
    }
})();
