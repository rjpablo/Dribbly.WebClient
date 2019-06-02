(function () {
    'use strict';

    angular.module('homeModule')
        .controller('homeController', [function () {
            var home = this;
            home.welcomeMessage = "Home - Welcome!";
        }]);
})();
