﻿(function () {
    'use strict';

    angular.module('mainModule')
        .component('drbblyAccountdetailswizardmodal', {
            bindings: {
                model: '<',
                context: '<',
                options: '<'
            },
            controllerAs: 'adm',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['drbblyAccountsService', '$scope', 'modalService', 'drbblyEventsService', 'constants', '$timeout',
        'drbblyOverlayService', 'drbblyDatetimeService', 'drbblyFormshelperService', 'drbblyCommonService', 'drbblyFileService'];
    function controllerFn(drbblyAccountsService, $scope, modalService, drbblyEventsService, constants, $timeout,
        drbblyOverlayService, drbblyDatetimeService, drbblyFormshelperService, drbblyCommonService, drbblyFileService) {
        var adm = this;

        adm.$onInit = function () {
            adm.tempCourt = angular.copy(adm.model.court || {});
            adm.overlay = drbblyOverlayService.buildOverlay();
            adm.overlay.setToBusy();
            adm.ddlPositionOptions = drbblyFormshelperService.getDropDownListChoices({ enumKey: 'app.PlayerPositionEnum' });
            adm._searchOptions = {
                types: ['locality', 'administrative_area_level_3']
            };
            setTypeAheadConfig();
            adm.steps = adm.model.steps || ['Primary Photo', 'Player Profile', 'Personal Information', 'Location', 'Links'];
            adm.currentStepIndex = 0;

            drbblyAccountsService.getAccountDetailsModal(adm.model.accountId)
                .then(function (data) {
                    adm.overlay.setToReady();
                    adm.account = data.account;
                    adm.selectedHomeCourts = [];
                    if (data.homeCourtChoice) {
                        adm.selectedHomeCourt = data.homeCourtChoice;
                        adm.selectedHomeCourts.push(data.homeCourtChoice);
                    }
                    adm.account.birthDate = data.account.birthDate ?
                        drbblyDatetimeService.toLocalDateTime(data.account.birthDate) : null;
                    adm.height = {};
                    adm.height.feet = Math.floor(data.account.heightInches / 12);
                    adm.height.inches = data.account.heightInches % 12;
                    if (adm.account.latitude && adm.account.longitude) {
                        adm.location = {
                            latitude: adm.account.latitude,
                            longitude: adm.account.longitude
                        };
                    }
                })
                .catch(adm.overlay.setToError);

            adm.context.setOnInterrupt(adm.onInterrupt);
            drbblyEventsService.on('modal.closing', function (event, reason, result) {
                if (!adm.context.okToClose) {
                    event.preventDefault();
                    adm.onInterrupt();
                }
            }, $scope);
        };

        adm.next = () => {
            adm.currentStepIndex = Math.min(adm.currentStepIndex + 1, adm.steps.length - 1);
            if (adm.steps[adm.currentStepIndex] === 'Location') {
                $timeout(adm.map.rerender);
            }
        }

        adm.back = () => {
            adm.currentStepIndex = Math.max(adm.currentStepIndex - 1, 0);
        }

        adm.hasNextPage = () => adm.currentStepIndex + 1 < adm.steps.length;

        adm.canGoBack = () => adm.currentStepIndex > 0;

        adm.onMapReady = map => adm.map = map;

        adm.onPrimaryPhotoSelect = function (file) {
            if (!file) { return; }

            var url = URL.createObjectURL(file);

            return modalService.show({
                view: '<drbbly-croppermodal></drbbly-croppermodal>',
                model: {
                    imageUrl: url,
                    cropperOptions: {
                        aspectRatio: 1
                    }
                }
            })
                .then(function (imageData) {
                    adm.overlay.setToBusy('');
                    var fileNameNoExt = (file.name.split('\\').pop().split('/').pop().split('.'))[0]
                    imageData.name = fileNameNoExt + '.png';
                    drbblyFileService.upload([imageData], 'api/account/uploadPrimaryPhoto/' + adm.account.id)
                        .then(function (result) {
                            if (result && result.data) {
                                adm.account.profilePhoto = result.data;
                                adm.account.profilePhotoId = result.data.id;
                            }
                        })
                        .catch(err => {
                            drbblyCommonService.handleError(err);
                        })
                        .finally(function () {
                            URL.revokeObjectURL(url)
                            adm.overlay.setToReady();
                        });
                })

        };

        adm.onLocationPickerReady = function (locationPicker) {
            adm.locationPicker = locationPicker;
        }

        adm.locationSelected = function (place) {
            adm.location = place;
            adm.frmAccountDetails.txtLatitude.$setDirty();
            adm.frmAccountDetails.txtLongitude.$setDirty();
        };

        adm._placeChanged = function (place) {
            adm.account.cityId = null;
            if (place) {
                adm.account.city = {
                    googleId: place.id,
                    lat: place.latitude,
                    lng: place.longitude,
                    name: place.name
                };
            }
            else {
                adm.account.city.city = null;
            }
            adm.editingCity = !!!place;
        };

        adm.onInterrupt = function (reason) {
            if (adm.frmAccountDetails.$dirty) {
                modalService.showUnsavedChangesWarning()
                    .then(function (response) {
                        if (response) {
                            adm.context.okToClose = true;
                            adm.context.dismiss(reason);
                        }
                    })
                    .catch(function (response) {
                        console.log(response);
                    });
            }
            else {
                adm.context.okToClose = true;
                adm.context.dismiss(reason);
            }
        };

        adm.editCity = () => {
            adm.editingCity = true;
            if (adm.account.city) {
                adm.citySearchKeyword = adm.account.city.name;
            }
        };

        adm.removeCity = () => {
            adm.account.cityId = null;
            adm.account.city = null;
        };

        function setTypeAheadConfig() {
            adm.typeAheadConfig = {
                entityTypes: [constants.enums.entityType.Court]
            };
        }

        adm.submit = function () {
            adm.invalidLink = adm.account.fbLink &&
                !/https?:\/\/(?:(www|web)\.)?(mbasic\.facebook|m\.facebook|facebook|fb)\.(com|me)(\/?(#!))?(\/[\w\.(#!)-\?]*)+/ig
                    .test(adm.account.fbLink);
            adm.invalidIgLink = adm.account.igLink &&
                !/(http|https):\/\/(?:www\.)?(?:instagram\.com|instagr\.am)\/([A-Za-z0-9-_\.]+)/im
                    .test(adm.account.igLink);
            if (adm.invalidLink || adm.invalidIgLink) {
                return;
            }
            var saveModel = angular.copy(adm.account);
            if (saveModel.birthDate) {
                saveModel.birthDate = drbblyDatetimeService.toUtcDate(saveModel.birthDate);
            }

            saveModel.latitude = adm.location?.latitude;
            saveModel.longitude = adm.location?.longitude;

            saveModel.heightInches = getHeightInches();
            adm.overlay.setToBusy();
            drbblyAccountsService.updateAccount(saveModel)
                .then(function () {
                    adm.context.okToClose = true;
                    adm.context.submit(saveModel);
                })
                .catch(adm.overlay.setToReady);
        };

        function getHeightInches() {
            if (adm.height.inches || adm.height.feet) {
                return adm.height.inches + (adm.height.feet * 12);
            }
            return null;
        }

        adm.cancel = function () {
            adm.onInterrupt('cancelled');
        };
    }
})();