(function () {
    'use strict';

    angular.module('siteModule')
        .component('drbblyNavigator', {
            bindings: {},
            controllerAs: 'nav',
            templateUrl: '/shared/modules/site/components/navigator/navigator-template.html',
            controller: controllerFn
        });

    controllerFn.$inject = ['authService', '$state', '$window'];
    function controllerFn(authService, $state, $window) {
        var nav = this;
        
        nav.$onInit = function () {
            nav.$state = $state;
        };

        nav.searchClicked = function () {
            alert('Not yet implemented');
        };

        nav.logOut = function () {
            authService.logOut();
            $state.go('main.home', { reload: true })
                .finally(function () {
                    $window.location.reload();
                });
        };

        nav.isAuthenticated = function () {
            return authService.authentication.isAuthenticated;
        };
    }
})();
