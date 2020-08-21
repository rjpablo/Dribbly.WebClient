(function () {
    'use strict';

    angular.module('appModule')
        .controller('appController', ctrlFn);

    ctrlFn.$inject = ['$rootScope', 'drbblyOverlayService', 'drbblyToolbarService', '$timeout', 'constants'];
    function ctrlFn($rootScope, drbblyOverlayService, drbblyToolbarService, $timeout, constants) {
        var app = this;
        var _adjustingSections;
        app.overlay = drbblyOverlayService.buildOverlay();

        app.$onInit = function () {
            app.toolbar = drbblyToolbarService.buildToolbar();
        };

        function adjustSections() {
            if (!_adjustingSections) {
                _adjustingSections = true;
                $timeout(function () {
                    setSections();
                    var headerHeight = app.sections.header.outerHeight();
                    app.sections.body.css('padding-top', headerHeight);
                    if (isScreenSmall()) {
                        var footerHeight = app.sections.footer_mobile.outerHeight();
                        app.sections.body.css('padding-bottom', footerHeight);
                    }
                    else {
                        app.sections.body.css('padding-bottom', 0);
                    }
                    _adjustingSections = false;
                }, 300);
            }
        }

        function isScreenSmall() {
            return window.innerWidth < constants.bootstrap.breakpoints.sm;
        }

        app.mainDataLoaded = function () {
            adjustSections();
        };

        function setSections() {
            app.sections = {
                body: angular.element('[id="page-body-container"]'),
                header: angular.element('[id="page-header-container"]'),
                footer: angular.element('[id="page-footer-container"]'),
                footer_mobile: angular.element('[id="page-footer-container"] drbbly-footer > div.mobile-only')
            };
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
