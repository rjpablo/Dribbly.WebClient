(function () {
    'use strict';

    angular.module('siteModule')
        .component('drbblySidenavigator', {
            bindings: {
                widget: '='
            },
            controllerAs: 'dsn',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['authService', '$state', '$window', '$element', 'modalService'];
    function controllerFn(authService, $state, $window, $element, modalService) {
        var dsn = this;
        var _widget;

        dsn.$onInit = function () {
            dsn.widget = dsn;
            dsn.$state = $state;
            dsn.user = authService.authentication;

            $element.addClass('drbbly-sidenavigator');
            var elements = document.getElementsByClassName('sidenav-content');
            dsn.contentElement = angular.element(elements[0]);
            dsn.isCollapsed = true;
            setClass();

            dsn.navItems = [{
                textKey: 'site.Home',
                targetState: 'main.home',
                icon: 'players'
            //}, {
            //    textKey: 'site.Courts',
            //    targetState: 'main.courts',
            //    icon: 'court-inclined'
            }, {
                textKey: 'site.Players',
                targetState: 'main.players',
                icon: 'players'
            }, {
                textKey: 'site.Teams',
                targetState: 'main.teams',
                icon: 'players'
            }];

            _widget = {};
            _widget.toggle = toggle;
            dsn.widget = _widget;

        };

        dsn.close = function () {
            toggle(false);
        };

        function toggle(expand) {
            if (expand === null || expand === undefined) {
                dsn.isCollapsed = !dsn.isCollapsed;
            }
            else {
                dsn.isCollapsed = !expand;
            }
            setClass();
        };

        function setClass() {
            if (dsn.isCollapsed) {
                dsn.contentElement.removeClass('drrbly-expanded');
            }
            else {
                dsn.contentElement.addClass('drrbly-expanded');
            }
        }

        dsn.searchClicked = function () {
            alert('Not yet implemented');
        };

        dsn.logOut = function () {
            modalService.confirm('site.LogOutConfirmationMsg1', 'site.LogOutConfirmationMsg2', null, 'YesCancel')
                .then(function (response) {
                    if (response) {
                        authService.logOut();
                        $state.go('main.home', { reload: true })
                            .finally(function () {
                                $window.location.reload();
                            });
                    }
                });
        };

        dsn.isAuthenticated = function () {
            return dsn.user.isAuthenticated;
        };

        //TEST FUNCTIONALITY ONLY
        dsn.test = function () {
            authService.test();
        };
    }
})();
