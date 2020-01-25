(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyHomeContainer', {
            bindings: {
                app: '<'
            },
            controllerAs: 'dhc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['modalService', 'drbblyToolbarService', 'drbblyCommonService', '$timeout'];
    function controllerFunc(modalService, drbblyToolbarService, drbblyCommonService, $timeout) {
        var dhc = this;

        dhc.$onInit = function () {
            drbblyToolbarService.setItems([]);
        };

        dhc.openModal = function () {
            modalService.confirm('site.WelcomeToDribblyExclamation',
                'site.WelcomeToDribblyExclamation', null, 'YesNoCancel')
                .then(function (response) {
                    console.log('alert response: ' + response);
                });
        };
    }
})();
