(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyHomeContainer', {
            bindings: {
                app: '<'
            },
            controllerAs: 'dhc',
            templateUrl: '/modules/main/containers/home-container/home-container.component.html',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['modalService'];
    function controllerFunc(modalService) {
        var dhc = this;

        dhc.$onInit = function () {

        };

        dhc.openModal = function () {
            modalService.show({
                view: '<drbbly-modal></drbbly-modal>',
                model: { msg: 'Hello modal!' }
            }).then(function (result) {
                alert(result);
            }).catch(function (reason) {
                alert(reason);
            });
        };
    }
})();
