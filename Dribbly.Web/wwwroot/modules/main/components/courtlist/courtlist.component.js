(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyCourtlist', {
            bindings: {
                courts: '<',
                titleKey: '@'
            },
            controllerAs: 'dcl',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['authService', '$rootScope', 'settingsService', '$element'];
    function controllerFunc(authService, $rootScope, settingsService, $element) {
        var dcl = this;

        dcl.$onInit = function () {
            $element.addClass('drbbly-court-list');
            console.log(dcl.courts.length);
        };
    }
})();
