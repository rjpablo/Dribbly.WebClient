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

    controllerFunc.$inject = ['drbblyAccountsService', 'drbblyOverlayService', '$stateParams', '$state', '$timeout'];
    function controllerFunc(drbblyAccountsService, drbblyOverlayService, $stateParams, $state, $timeout) {
        var avc = this;
        var _username;

        avc.$onInit = function () {
            _username = $stateParams.username;
            loadAccount();
            buildSubPages();
        };

        function loadAccount() {
            drbblyAccountsService.getAccountByUsername(_username)
                .then(function (data) {
                    avc.account = data;
                    avc.app.mainDataLoaded();
                })
                .catch(function (error) {
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
                    }
                }
            ]);
        }
    }
})();
