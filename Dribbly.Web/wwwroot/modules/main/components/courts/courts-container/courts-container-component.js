﻿(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyCourtsContainer', {
            bindings: {
                app: '<'
            },
            controllerAs: 'dcc',
            templateUrl: '/modules/main/components/courts/courts-container/courts-container-template.html',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['courtsService', '$element'];
    function controllerFunc(courtsService, $element) {
        var dcc = this;

        dcc.$onInit = function () {
            $element.addClass('drbbly-courts-container');

            courtsService.getAllCourts()
                .then(function (data) {
                    dcc.courts = data;
                })
                .catch(function (error) {
                    console.log('failed to retrieve courts:' + error.exceptionMessage);
                });
        };
    }
})();
