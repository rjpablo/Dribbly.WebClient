(function () {
    'use strict';

    angular
        .module('appModule')
        .component('drbblyCourtlistitem', {
            bindings: {
                court: '<'
            },
            controllerAs: 'cli',
            templateUrl: '/modules/main/components/shared/courtlistitem/courtlistitem.component.html',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['$element'];
    function controllerFunc($element) {
        var cli = this;

        cli.$onInit = function () {
            $element.addClass('drbbly-court-list-item');
        };
    }
})();
