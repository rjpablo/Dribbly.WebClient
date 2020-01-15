(function () {
    'use strict';

    angular
        .module('appModule')
        .component('drbblyCourtlist', {
            bindings: {
                courts: '<',
                titleKey: '@'
            },
            controllerAs: 'dcl',
            templateUrl: '/modules/main/components/court-list/court-list.component.html',
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
