(function () {
    'use strict';

    angular.module('mainModule')
        .controller('mainController', [function () {
            var main = this;
            main.welcomeMessage = "Main - Welcome!";
        }]);
})();
