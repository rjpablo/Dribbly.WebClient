(function () {
    'use strict';

    angular.module('appModule')
        .controller('appController', ctrlFn);

    ctrlFn.$inject = ['$rootScope', 'drbblyOverlayService', 'drbblyToolbarService', '$timeout', 'constants',
        'authService', 'drbblyEventsService'];
    function ctrlFn($rootScope, drbblyOverlayService, drbblyToolbarService, $timeout, constants,
        authService, drbblyEventsService) {
        var app = this;
        var _adjustingSections;
        app.overlay = drbblyOverlayService.buildOverlay('busy');
        $('#site-loader').hide();

        app.$onInit = async function () {
            app.authVerified = authService.isAuthVerified();
            if (app.authVerified) {
                window.Dribbly.authentication = authService.authentication;
                app.toolbar = drbblyToolbarService.buildToolbar();
            }
            else {
                drbblyEventsService.on('dribbly.auth.verified', () => {
                    window.Dribbly.authentication = authService.authentication;
                    app.toolbar = drbblyToolbarService.buildToolbar();
                    app.authVerified = true;
                });
            }
        };

        function adjustSections() {
            if (!_adjustingSections) {
                _adjustingSections = true;
                $timeout(function () {
                    setSections();
                    var headerHeight = app.sections.header.outerHeight() || 0;
                    app.sections.cokieBanner.css('top', headerHeight);
                    app.sections.body.css('padding-top', headerHeight);
                    app.sections.appNavigationContainer.css('top', headerHeight + 'px');
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
                cokieBanner: angular.element('[id="cookieConsent"]'),
                appNavigationContainer: angular.element('[id="app-navigation-container"]'),
                appHeader: angular.element('[id="app-header"]'),
                appBody: angular.element('[id="app-body"]'),
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

        app.scrollTo = function (element, offset) {
            var el = document.getElementById('drbbly-root-container');
            var scrollTop = element.getBoundingClientRect().top + el.scrollTop + (offset || 0)
                - app.sections.header.outerHeight() - app.sections.appNavigationContainer.outerHeight();
            el.scrollTop = scrollTop;
        }

        app.hideChat = function () {
            app.chatIsHidden = true;
        };

        app.showChat = function () {
            app.chatIsHidden = false;
        };

        app.scrollToAppBodyTop = function () {
            var appBody = document.getElementById('app-body');
            var root = document.getElementById('drbbly-root-container');
            var scrollTop = appBody.getBoundingClientRect().top + root.scrollTop
                - app.sections.header.outerHeight() - app.sections.appNavigationContainer.outerHeight();
            // scroll only if root is scrolled past appBody
            if (root.scrollTop > scrollTop) {
                root.scrollTop = scrollTop;
            }
        }

        app.updatePageDetails = function (data) {
            var title = data.title ? `${data.title} - ${constants.site.name}` : constants.site.name;
            var description = data.description ? data.description :
                data.title ? title : constants.site.description;
            document.title = title;
            document.querySelector('meta[name="description"]')
                .setAttribute("content", description);
            document.querySelector('meta[property="og:title"]')
                .setAttribute("content", title);
            document.querySelector('meta[property="og:description"]')
                .setAttribute("content", description);
            document.querySelector('meta[property="og:image"]')
                .setAttribute("content", data.image || constants.site.shareImageUrl);
        }

    }
})();
