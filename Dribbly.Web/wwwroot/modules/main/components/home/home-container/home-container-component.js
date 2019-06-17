(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyHomeContainer', {
            bindings: {},
            controllerAs: 'dhc',
            templateUrl: '/modules/main/components/home/home-container/home-container-template.html',
            controller: controllerFunc
        });

    controllerFunc.$inject = [];
    function controllerFunc() {
        var dhc = this;
    }
})();
