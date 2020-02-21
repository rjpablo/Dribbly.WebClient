(function () {
    'use strict';

    angular.module('appModule')
        .controller('appController', ['$rootScope', 'drbblyOverlayService', 'drbblyToolbarService', ctrlFn]);
    function ctrlFn($rootScope, drbblyOverlayService, drbblyToolbarService) {
        var app = this;
        app.overlay = drbblyOverlayService.buildOverlay();

        app.$onInit = function () {
            app.sections = {};
            app.toolbar = drbblyToolbarService.buildToolbar();
        };

        function adjustSections() {
            if (!app.sections.body) {
                app.sections.body = angular.element('[id="page-body-container"]');
            }
            var footerHeight = app.sections.footer.offsetHeight;
            app.sections.body.css('margin-bottom', footerHeight);
        }

        $rootScope.$on('set-app-overlay', function (evt, options) {
            app.overlay.setStatus(options.status, options.messageOverride);
        });

        app.setToolbarNavItems = function (navItems) {
            app.toolbar.navItems = navItems;
        };

        app.onFooterInit = function (footerComponent) {
            app.sections.footer = footerComponent.element[0];
        };

        app.onSectionResize = function () {
            adjustSections();
        };

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
