(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyHomeContainer', {
            bindings: {
                app: '<'
            },
            controllerAs: 'dhc',
            templateUrl: '/modules/main/components/home/home-container/home-container-template.html',
            controller: controllerFunc
        });

    controllerFunc.$inject = [];
    function controllerFunc() {
        var dhc = this;

        dhc.$onInit = function () {
            dhc.app.showNavBar();
        };
    }
})();
