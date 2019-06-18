(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyCourtsContainer', {
            bindings: {},
            controllerAs: 'dhc',
            templateUrl: '/modules/main/components/courts/courts-container/courts-container-template.html',
            controller: controllerFunc
        });

    controllerFunc.$inject = [];
    function controllerFunc() {
        var dhc = this;
    }
})();
