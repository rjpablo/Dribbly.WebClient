(function () {
    'use strict';

    angular.module('courtsModule')
        .controller('courtsController', [function () {
            var crt = this;
            crt.welcomeMessage = "Courts - Welcome!";
        }]);
})();
