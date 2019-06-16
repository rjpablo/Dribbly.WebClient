(function () {
    'use strict';

    angular.module('siteModule')
        .component('drbblyNavigator', {
            bindings: {},
            controllerAs: 'nav',
            templateUrl: '/shared/modules/site/components/navigator/navigator-template.html',
            controller: controllerFn
        });

    controllerFn.$inject = [];
    function controllerFn() {
        var nav = this;
        
        nav.$onInit = function () {
            nav.activeNavigationItem = 'courts';
        };

        nav.setActiveNavigationItem = function () {

        }
    }
})();
