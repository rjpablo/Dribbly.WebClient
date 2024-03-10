(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyAccountdetails', {
            bindings: {
                account: '<',
                onUpdate: '<',
                editDetails: '<',
                app: '<'
            },
            controllerAs: 'dad',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['$stateParams', 'authService', 'drbblyOverlayService', '$timeout', 'modalService', 'mapService',
        'constants'];
    function controllerFunc($stateParams, authService, drbblyOverlayService, $timeout, modalService, mapService,
        constants) {
        var dad = this;
        var _map;

        dad.$onInit = function () {
            dad.username = $stateParams.username;
            dad.overlay = drbblyOverlayService.buildOverlay();
            dad.isOwned = authService.isCurrentUserId(dad.account.identityUserId);
            dad.mapOptions = {
                id: 'account-details-map',
                zoom: 10,
                height: '300px'
            };
            if (dad.account.latitude && dad.account.longitude) {
                dad.accountLatLng = {
                    lat: dad.account.latitude,
                    lng: dad.account.longitude,
                    type: constants.enums.mapMarkerTypeEnum.Player
                };
                dad.mapOptions.center = dad.accountLatLng;
            }
            loadAccount();
            dad.app.updatePageDetails({
                title: dad.account.name + ' - Account Details',
                image: dad.account.profilePhoto.url
            });
        };

        dad.$onChanges = function (changes) {
            if (changes.account?.currentValue && _map) {
                if (dad.account.latitude && dad.account.longitude) {
                    dad.accountLatLng = {
                        lat: dad.account.latitude,
                        lng: dad.account.longitude,
                        type: constants.enums.mapMarkerTypeEnum.Player
                    };
                    _map.resetMarkers([]);
                    _map.addPlayerMarker(dad.account);
                }
                else {
                    dad.accountLatLng = null;
                }
            }
        }

        function loadAccount() {
            dad.overlay.setToBusy();
            $timeout(dad.overlay.setToReady, 1000);
        }

        dad.onMapReady = function (map) {
            _map = map;
            if (dad.accountLatLng) {
                _map.addPlayerMarker(dad.account);
            }
        };

        dad.edit = function () {
            dad.editDetails();
        };
    }
})();
