(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyAccountdetails', {
            bindings: {
                account: '<',
                onUpdate: '<',
                app: '<'
            },
            controllerAs: 'dad',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['$stateParams', 'authService', 'drbblyOverlayService', '$timeout', 'modalService', 'mapService'];
    function controllerFunc($stateParams, authService, drbblyOverlayService, $timeout, modalService, mapService) {
        var dad = this;
        var _map;

        dad.$onInit = function () {
            dad.username = $stateParams.username;
            dad.overlay = drbblyOverlayService.buildOverlay();
            dad.isOwned = authService.isCurrentUserId(dad.account.identityUserId);
            dad.mapOptions = {
                id: 'account-details-map',
                center: {
                    lat: dad.account.latitude,
                    lng: dad.account.longitude
                },
                zoom: 10,
                height: '300px'
            };
            loadAccount();
            dad.app.updatePageDetails({
                title: dad.account.name + ' - Account Details',
                image: dad.account.profilePhoto.url
            });
        };

        dad.$onChanges = function (changes) {
            if (changes.account?.currentValue && _map) {
                _map.resetMarkers([{ lat: dad.account.latitude, lng: dad.account.longitude }]);
                mapService.panTo(_map, { lat: dad.account.latitude, lng: dad.account.longitude });
            }
        }

        function loadAccount() {
            dad.overlay.setToBusy();
            $timeout(dad.overlay.setToReady, 1000);
        }

        dad.onMapReady = function (map) {
            _map = this;
            this.addMarkers([{ lat: dad.account.latitude, lng: dad.account.longitude }]);
        };

        dad.edit = function () {
            authService.checkAuthenticationThen(function () {
                modalService.show({
                    view: '<drbbly-accountdetailsmodal></drbbly-accountdetailsmodal>',
                    model: { accountId: dad.account.id },
                    backdrop: 'static'
                })
                    .then(function (result) {
                        if (result) {
                            dad.onUpdate();
                        }
                    });
            });
        };
    }
})();
