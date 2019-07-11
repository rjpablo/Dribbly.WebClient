(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyCourtsContainer', {
            bindings: {
                app: '<'
            },
            controllerAs: 'dcc',
            templateUrl: '/modules/main/components/courts/courts-container/courts-container-template.html',
            controller: controllerFunc
        });

    controllerFunc.$inject = [];
    function controllerFunc() {
        var dcc = this;

        dcc.$onInit = function () {
            dcc.app.showMobileToolbar();
            dcc.app.showNavBar();
        };
    }
})();
