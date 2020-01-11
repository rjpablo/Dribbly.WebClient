(function () {
    'use strict';

    angular.module('siteModule')
        .component('drbblyMobiletoolbar', {
            bindings: {},
            controllerAs: 'mtb',
            templateUrl: '/shared/modules/site/components/mobiletoolbar/mobiletoolbar-template.html',
            controller: controllerFn
        });

    controllerFn.$inject = ['$element', 'authService', '$state', '$window', '$rootScope'];
    function controllerFn($element, authService, $state, $window, $rootScope) {
        var mtb = this;

        mtb.$onInit = function () {
            $element.addClass('mobile-toolbar');
        };

        mtb.logOut = function () {
            authService.logOut();
            $state.go('main.home', { reload: true })
                .finally(function () {
                    $window.location.reload();
                });
        };

        mtb.isAuthenticated = function () {
            return authService.authentication.isAuthenticated;
        };

        mtb.toggleSideNavigator = () => $rootScope.$broadcast('toggle-sidenavigator');

    }
})();
