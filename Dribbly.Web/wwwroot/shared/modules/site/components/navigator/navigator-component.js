(function () {
    'use strict';

    angular.module('siteModule')
        .component('drbblyNavigator', {
            bindings: {},
            controllerAs: 'nav',
            templateUrl: '/shared/modules/site/components/navigator/navigator-template.html',
            controller: controllerFn
        });

    controllerFn.$inject = ['authService', '$state', '$window', 'settingsService', 'modalService'];
    function controllerFn(authService, $state, $window, settingsService, modalService) {
        var nav = this;

        nav.$onInit = function () {
            nav.$state = $state;
            nav.usingSideNavigator = settingsService.useSideNavigator;
        };

        nav.searchClicked = function () {
            alert('Not yet implemented');
        };

        nav.logOut = function () {
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

        nav.isAuthenticated = function () {
            return authService.authentication.isAuthenticated;
        };

        //TEST FUNCTIONALITY ONLY
        nav.test = function () {
            authService.test();
        };
    }
})();
