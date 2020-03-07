(function () {
    'use strict';

    angular.module('mainModule')
        .component('drbblyAddeditcourtmodal', {
            bindings: {
                model: '<',
                context: '<',
                options: '<'
            },
            controllerAs: 'aec',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['drbblyCourtsService', '$scope', 'modalService', 'drbblyEventsService'];
    function controllerFn(drbblyCourtsService, $scope, modalService, drbblyEventsService) {
        var aec = this;

        aec.$onInit = function () {
            aec.tempCourt = angular.copy(aec.model.court || {});

            if (aec.options.isEdit) {
                if (aec.tempCourt.latitude || aec.tempCourt.longitude) {
                    aec.initialPosition = {
                        latLng: {
                            lat: aec.tempCourt.latitude,
                            lng: aec.tempCourt.longitude
                        }
                    };
                }
            }

            aec.context.setOnInterrupt(aec.onInterrupt);
            drbblyEventsService.on('modal.closing', function (event, reason, result) {
                if (!aec.context.okToClose) {
                    event.preventDefault();
                    aec.onInterrupt();
                }
            }, $scope);
        };

        aec.onInterrupt = function (reason) {
            if (aec.frmCourtDetails.$dirty) {
                modalService.showUnsavedChangesWarning()
                    .then(function (response) {
                        if (response) {
                            aec.context.okToClose = true;
                            aec.context.dismiss(reason);
                        }
                    })
                    .catch(function (response) {
                        console.log(response);
                    });
            }
            else {
                aec.context.okToClose = true;
                aec.context.dismiss(reason);
            }
        };

        aec.locationSelected = function (latLng) {
            aec.tempCourt.latitude = latLng.latitude;
            aec.tempCourt.longitude = latLng.longitude;
            aec.frmCourtDetails.txtLatitude.$setDirty();
            aec.frmCourtDetails.txtLongitude.$setDirty();
        };

        aec.submit = function () {
            aec.isBusy = true;
            if (aec.options.isEdit) {
                editCourt(aec.tempCourt);
            }
            else {
                addCourt(aec.tempCourt);
            }
        };

        function editCourt(court) {
            drbblyCourtsService.updateCourt(court)
                .then(function () {
                    close(court);
                })
                .catch(function () {
                    //TODO: handle error
                })
                .finally(function () {
                    aec.isBusy = false;
                });
        }

        function addCourt(court) {
            drbblyCourtsService.register(court)
                .then(function (id) {
                    court.id = id;
                    close(court);
                })
                .catch(function () {
                    //TODO: handle error
                })
                .finally(function () {
                    aec.isBusy = false;
                });
        }

        function close(court) {
            aec.context.okToClose = true;
            aec.context.submit(court);
        }

        aec.cancel = function () {
            aec.onInterrupt('cancelled');
        };
    }
})();
