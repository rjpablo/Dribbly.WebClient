(function () {
    'use strict';

    angular.module('mainModule')
        .service('drbblyCourtshelperService', ['modalService', 'authService', 'mapService',
            function (modalService, authService, mapService) {

                function registerCourt() {
                    return authService.checkAuthenticationThen(function () {
                        return modalService.show({
                            view: '<drbbly-addeditcourtmodal></drbbly-addeditcourtmodal>',
                            model: {}
                        });
                    });
                }

                function editCourt(court) {
                    return authService.checkAuthenticationThen(function () {
                        return modalService.show({
                            view: '<drbbly-addeditcourtmodal></drbbly-addeditcourtmodal>',
                            model: { court: court },
                            options: { isEdit: true }
                        });
                    });
                }

                function openBookGameModal(game, options) {
                    return authService.checkAuthenticationThen(function () {
                        return modalService.show({
                            view: '<drbbly-bookgamemodal></drbbly-bookgamemodal>',
                            model: {
                                game: game
                            },
                            options: options
                        });
                    });
                }

                function populateDistance(courts, refLatLng) {
                    angular.forEach(courts, function (court) {
                        court.distance = mapService
                            .computeDistanceBetween(refLatLng, new google.maps.LatLng(court.latitude, court.longitude));
                    });
                }

                var _service = {
                    editCourt: editCourt,
                    openBookGameModal: openBookGameModal,
                    populateDistance: populateDistance,
                    registerCourt: registerCourt
                };

                return _service;
            }]);

})();