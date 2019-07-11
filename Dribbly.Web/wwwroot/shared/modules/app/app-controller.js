(function () {
    'use strict';

    angular.module('appModule')
        .controller('appController', [function () {
            var app = this;

            app.showNavBar = function () {
                app.navBarIsVisible = true;
            };

            app.hideNavBar = function () {
                app.navBarIsVisible = false;
            };

            app.showMobileToolbar = function () {
                app.mobileToolBarIsVisible = true;
            };

            app.hideMobileToolbar = function () {
                app.mobileToolBarIsVisible = false;
            };

        }]);
})();
