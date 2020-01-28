(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyCourtdetails', {
            bindings: {
                court: '<',
                onUpdate: '<'
            },
            controllerAs: 'dcd',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = [];
    function controllerFunc() {
        var dcd = this;

        dcd.$onInit = function () {
            dcd.tempCourt = angular.copy(dcd.court);
        };

        dcd.edit = function () {
            dcd.isEditing = true;
        };

        dcd.save = function () {
            dcd.isEditing = false;
            dcd.onUpdate(dcd.tempCourt);
        };

        dcd.cancel = function () {
            dcd.isEditing = false;
        };
    }
})();
