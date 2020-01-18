(function () {
    'use strict';

    angular.module('appModule')
        .controller('appController', ['$rootScope', 'drbblyOverlayService', '$timeout', ctrlFn]);
    function ctrlFn($rootScope, drbblyOverlayService, $timeout) {
        var app = this;
        app.overlay = drbblyOverlayService.buildOverlay();

        $rootScope.$on('set-app-overlay', function (evt, options) {
            app.overlay.setStatus(options.status, options.messageOverride);
        });

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

    }
})();
