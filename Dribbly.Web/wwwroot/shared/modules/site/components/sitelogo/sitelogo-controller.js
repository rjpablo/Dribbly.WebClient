(function () {
    'use strict';

    angular.module('siteModule')
        .component('drbblySitelogo', {
            bindings: {},
            controllerAs: 'dsl',
            templateUrl: '/shared/modules/site/components/sitelogo/sitelogo-template.html',
            controller: controllerFn
        });

    controllerFn.$inject = [];
    function controllerFn() {
        var dsl = this;
    }
})();
