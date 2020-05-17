(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyCourtlist', {
            bindings: {
                courts: '<',
                titleKey: '@',
                wrapItems: '<'
            },
            controllerAs: 'dcl',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['modalService', '$element'];
    function controllerFunc(modalService, $element) {
        var dcl = this;

        dcl.$onInit = function () {
            $element.addClass('drbbly-court-list');
            if (!dcl.wrapItems) {
                $element.addClass('no-wrap');
            }
            console.log(dcl.courts.length);
        };

        dcl.onItemClick = function (court) {
            modalService.show({
                view: '<drbbly-courtpreviewmodal></drbbly-courtpreviewmodal>',
                model: { court: court }
            })
                .then(function () { /*do nothing*/ })
                .catch(function () { /*do nothing*/ });
        };
    }
})();
