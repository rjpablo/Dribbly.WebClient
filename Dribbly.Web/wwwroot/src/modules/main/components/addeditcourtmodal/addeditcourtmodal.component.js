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

    controllerFn.$inject = ['drbblyCourtsService', '$scope', 'modalService', 'drbblyEventsService', 'constants', '$timeout',
        '$q'];
    function controllerFn(drbblyCourtsService, $scope, modalService, drbblyEventsService, constants, $timeout,
        $q) {
        var aec = this;

        aec.$onInit = function () {
            aec.tempCourt = angular.copy(aec.model.court || {});
            aec.contactIsVerified = Boolean(aec.tempCourt.contactId);

            if (aec.options.isEdit) {
                aec.tempCourt.isManaged = Boolean(aec.tempCourt.contactId);
                aec.fullMobileNumber = aec.tempCourt.contact && aec.tempCourt.contact.number;
                if (aec.tempCourt.latitude || aec.tempCourt.longitude) {
                    aec.initialPosition = {
                        lat: aec.tempCourt.latitude,
                        lng: aec.tempCourt.longitude
                    };
                }
            }
            else {
                aec.tempCourt.isFreeToPlay = true;
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
            aec.frmCourtDetails.$setSubmitted();
            if (aec.frmCourtDetails.$valid) {
                aec.isBusy = true;
                if (!aec.tempCourt.isManaged) {
                    aec.tempCourt.mobileNumber = null;
                }
                if (aec.options.isEdit) {
                    editCourt(aec.tempCourt);
                }
                else {
                    addCourt(aec.tempCourt);
                }
            }
        };

        aec.verifyPhone = function verifyPhone(modelValue) {
            return !aec.tempCourt.isManaged || !aec.tenDigitNumber || aec.frmCourtDetails.txtMobileNo.$error.pattern ||
                aec.contactIsVerified;
        };

        aec.shouldHighligthMobileNo = function () {
            return aec.frmCourtDetails.txtMobileNo.$touched && aec.frmCourtDetails.txtMobileNo.$invalid &&
                // if only phone verification is the violation, do not highlight until form is submitted
                (!aec.frmCourtDetails.txtMobileNo.$error.verifyPhone || aec.frmCourtDetails.$submitted);
        };

        aec.verify = function () {
            aec.fullMobileNumber = constants.countryCodes.ph + aec.tenDigitNumber.replace(/[\s-]/g, '');
            aec.isBusy = true;
            modalService.show({
                view: '<drbbly-verifycontactmodal></drbbly-verifycontactmodal>',
                model: { contactNumber: aec.fullMobileNumber }
            }).then(function (result) {
                aec.isBusy = false;
                if (result) {
                    aec.contactIsVerified = true;
                    aec.tempCourt.contactId = result;
                }
            }, function () {
                aec.isBusy = false;
            });
        };

        aec.removeContact = function () {
            aec.contactIsVerified = false;
            aec.fullMobileNumber = null;
            aec.tempCourt.contact = null;
            aec.tempCourt.contactId = null;
            aec.frmCourtDetails.$setDirty();
        };

        aec.isManagedChange = function () {
            if (aec.tempCourt.isManaged) {
                $timeout(function () {
                    aec.frmCourtDetails.txtMobileNo.$$element.focus();
                });
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
