(function () {
    'use strict';

    angular.module('siteModule')
        .component('drbblyMobiletoolbar', {
            bindings: {},
            controllerAs: 'mtb',
            templateUrl: '/shared/modules/site/components/mobiletoolbar/mobiletoolbar-template.html',
            controller: controllerFn
        });

    controllerFn.$inject = ['$element'];
    function controllerFn($element) {
        var mtb = this;
        
        mtb.$onInit = function () {
            $element.addClass('mobile-toolbar');
        };
    }
})();
