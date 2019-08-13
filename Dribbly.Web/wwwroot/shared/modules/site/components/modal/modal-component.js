(function () {
    'use strict';

    angular.module('siteModule')
        .component('drbblyModal', {
            bindings: {
                model: '<',
                context: '<'
            },
            controllerAs: 'mod',
            templateUrl: '/shared/modules/site/components/modal/modal-template.html',
            controller: controllerFn
        });

    controllerFn.$inject = [];
    function controllerFn() {
        var mod = this;

        mod.submit = function () {
            mod.context.submit('submitted');
        };

        mod.close = function () {
            mod.context.dismiss('dismissed');
        };
    }
})();
