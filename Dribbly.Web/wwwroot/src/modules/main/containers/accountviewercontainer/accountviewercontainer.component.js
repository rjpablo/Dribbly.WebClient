(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyAccountviewercontainer', {
            bindings: {
                app: '<'
            },
            controllerAs: 'avc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyAccountsService', 'authService', '$stateParams', '$state', 'permissionsService'];
    function controllerFunc(drbblyAccountsService, authService, $stateParams, $state, permissionsService) {
        var avc = this;
        var _username;

        avc.$onInit = function () {
            _username = $stateParams.username;
            loadAccount();
        };

        function loadAccount() {
            drbblyAccountsService.getAccountByUsername(_username)
                .then(function (data) {
                    avc.account = data;
                    avc.isOwned = authService.isCurrentUserId(avc.account.identityUserId);
                    avc.shouldDisplayAsPublic = avc.account.isPublic || avc.isOwned ||
                        permissionsService.hasPermission('Account.UpdateNotOwned');
                    avc.app.mainDataLoaded();
                    buildSubPages();
                }, function (error) {

                });
        }

        avc.onAccountUpdate = function () {
            loadAccount();
        };

        avc.$onDestroy = function () {
            avc.app.toolbar.clearNavItems();
        };

        function buildSubPages() {
            avc.app.toolbar.setNavItems([
                {
                    textKey: 'site.Home',
                    targetStateName: 'main.account.home',
                    targetStateParams: { username: _username },
                    action: function () {
                        $state.go(this.targetStateName, this.targetStateParams);
                    }
                },
                {
                    textKey: 'app.Details',
                    targetStateName: 'main.account.details',
                    targetStateParams: { username: _username },
                    action: function () {
                        $state.go(this.targetStateName, this.targetStateParams);
                    }
                },
                {
                    textKey: 'app.Photos',
                    targetStateName: 'main.account.photos',
                    targetStateParams: { username: _username }
                },
                {
                    textKey: 'site.Videos',
                    targetStateName: 'main.account.videos',
                    targetStateParams: { username: _username }
                },
                {
                    textKey: 'app.Settings',
                    targetStateName: 'main.account.settings',
                    targetStateParams: { username: _username },
                    action: function () {
                        $state.go(this.targetStateName, this.targetStateParams);
                    },
                    isRemoved: !(avc.isOwned || permissionsService.hasPermission('Account.UpdateNotOwned'))
                }
            ]);
        }
    }
})();
