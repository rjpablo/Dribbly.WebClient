(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyCourtprice', {
            bindings: {
                court: '<',
                onBookNow: '<'
            },
            controllerAs: 'cpc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = [];
    function controllerFunc() {
        var dcd = this;
    }
})();
