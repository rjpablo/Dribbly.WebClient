(function () {
    'use strict';

    angular
        .module('homeModule')
        .component('drbblyHomeContainer', {
            bindings: {},
            controllerAs: 'dhc',
            templateUrl: '/modules/home/components/home-container/home-container-template.html',
            controller: controllerFunc
        });

    controllerFunc.$inject = [];
    function controllerFunc() {
        var dhc = this;
    }
})();
