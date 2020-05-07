﻿(function () {
    'use strict';

    angular.module('appModule')
        .controller('appController', ctrlFn);

    ctrlFn.$inject = ['$rootScope', 'drbblyOverlayService', 'drbblyToolbarService', '$timeout'];
    function ctrlFn($rootScope, drbblyOverlayService, drbblyToolbarService, $timeout) {
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
                    var footerHeight = app.sections.footer.outerHeight();
                    app.sections.body.css('padding-top', headerHeight);
                    app.sections.body.css('padding-bottom', footerHeight);
                    _adjustingSections = false;
                }, 300);
            }
        }

        app.mainDataLoaded = function () {
            adjustSections();
        };

        function setSections() {
            app.sections = {
                body: angular.element('[id="page-body-container"]'),
                header: angular.element('[id="page-header-container"]'),
                footer: angular.element('[id="page-footer-container"]')
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
