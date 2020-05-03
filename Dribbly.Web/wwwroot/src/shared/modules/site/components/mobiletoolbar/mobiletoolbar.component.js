(function () {
    'use strict';

    angular.module('siteModule')
        .component('drbblyMobiletoolbar', {
            bindings: {
                toolbar: '<',
                app: '<'
            },
            controllerAs: 'mtb',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$element', 'authService', '$state', '$window', '$rootScope',
        'drbblyToolbarService', 'modalService'];
    function controllerFn($element, authService, $state, $window, $rootScope,
        drbblyToolbarService, modalService) {
        var mtb = this;

        mtb.$onInit = function () {
            $element.addClass('mobile-toolbar');
            drbblyToolbarService.onSetItems(onSetToolbarItems);
        };

        mtb.logOut = function () {
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

        mtb.isAuthenticated = function () {
            return authService.authentication.isAuthenticated;
        };

        function onSetToolbarItems(data) {
            setItems(data.items);
            mtb.app.onSectionResize();
        }

        function setItems(items) {
            mtb.items = items;
        }

        mtb.toggleSideNavigator = () => $rootScope.$broadcast('toggle-sidenavigator');

    }
})();
