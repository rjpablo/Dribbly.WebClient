(function () {
    'use strict';

    angular.module('siteModule')
        .component('drbblyNavigator', {
            bindings: {},
            controllerAs: 'nav',
            templateUrl: '/shared/modules/site/components/navigator/navigator-template.html',
            controller: controllerFn
        });

    controllerFn.$inject = ['$state'];
    function controllerFn($state) {
        var nav = this;
        
        nav.$onInit = function () {
            nav.$state = $state;
        };
    }
})();
