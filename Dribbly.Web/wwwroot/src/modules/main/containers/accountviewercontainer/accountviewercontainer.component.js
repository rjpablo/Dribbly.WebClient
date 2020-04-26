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
            avc.accountsDetailsOverlay = drbblyOverlayService.buildOverlay();
            loadAccount();
            avc.accountsDetailsOverlay.setToReady();
            buildSubPages();
        };

        function loadAccount() {
            avc.accountsDetailsOverlay.setToBusy();
            drbblyAccountsService.getAccountByUsername(_username)
                .then(function (data) {
                    avc.account = data;
                    avc.accountsDetailsOverlay.setToReady();
                })
                .catch(function (error) {
                    avc.accountsDetailsOverlay.setToError();
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
                }
            ]);
        }
    }
})();
