(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyCourtdetails', {
            bindings: {
                court: '<',
                onUpdate: '<'
            },
            controllerAs: 'dcd',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['authService', 'drbblyCourtshelperService', 'drbblyFileService', '$stateParams', 'i18nService',
        'drbblyOverlayService', 'drbblyCourtsService', 'drbblyFooterService', 'permissionsService', 'modalService'];
    function controllerFunc(authService, drbblyCourtshelperService, drbblyFileService, $stateParams, i18nService,
        drbblyOverlayService, drbblyCourtsService, drbblyFooterService, permissionsService, modalService) {
        var dcd = this;
        var _priceComponent;

        dcd.$onInit = function () {
            dcd.courtId = $stateParams.id;
            dcd.overlay = drbblyOverlayService.buildOverlay();
            dcd.isOwned = dcd.court.ownerId === authService.authentication.userId;
            dcd.mapOptions = {
                id: 'location-picker-map'
            };
            dcd.overlay.setToReady();
            //loadCourt();
        };

        dcd.onPrimaryPhotoClick = function () {
            drbblyCourtsService.getCourtPhotos(dcd.courtId)
                .then(function (photos) {
                    dcd.photos = massagePhotos(photos);
                    var primaryPhotoIndex = dcd.photos.findIndex(photo => photo.id === dcd.court.primaryPhoto.id);
                    dcd.methods.open(primaryPhotoIndex);
                })
                .catch(function (error) {
                    // TODO: Display error in toast
                });
        };

        dcd.onMapReady = function () {
            this.addMarkers([dcd.court]);
        };

        function massagePhotos(photos) {
            var canDeleteNotOwned = permissionsService.hasPermission('Court.DeletePhotoNotOwned');
            for (var i = 0; i < photos.length; i++) {
                photos[i].deletable = photos[i].id !== dcd.court.primaryPhoto.id &&
                    (dcd.isOwned || canDeleteNotOwned);
            }
            return photos;
        }

        // CLEAN UP
        function loadCourt() {
            dcd.overlay.setToBusy();
            drbblyCourtsService.getCourt(dcd.courtId)
                .then(function (data) {
                    dcd.court = data;
                    dcd.isOwned = dcd.court.ownerId === authService.authentication.userId;
                    dcd.onUpdate(dcd.court);
                    dcd.overlay.setToReady();
                })
                .catch(dcd.overlay.setToError);
        }

        // CLEAN UP
        function createPriceComponent() {

            if (_priceComponent) {
                _priceComponent.remove();
            }

            _priceComponent = drbblyFooterService.addFooterItem({
                scope: $scope,
                template: '<drbbly-courtprice court="dcd.court"></dribbly-courtprice>'
            });
        }

        dcd.showContact = function () {
            if (dcd.court.contact) {
                var template = i18nService.getString('app.PleaseContactTheFollowingNumberForInquiries',
                    { number: dcd.court.contact.number });
                modalService.alert({ bodyTemplate: template });
            }
            else {
                modalService.alert('app.CourtNoContact');
            }
        };

        dcd.follow = function () {
            dcd.isBusy = true;
            drbblyCourtsService.followCourt(dcd.court.id, !dcd.court.isFollowed)
                .then(function (result) {
                    dcd.isBusy = false;
                    if (result.isSuccessful) {
                        dcd.court.isFollowed = !dcd.court.isFollowed;
                        dcd.court.followerCount = result.newFollowerCount;
                    }
                    else {
                        dcd.court.isFollowed = result.isAlreadyFollowing;
                        //TODO show error
                        console.log('Failed to save court following');
                    }
                }, function (error) {
                    dcd.isBusy = false;
                    console.log('FollowCourt Failed', error);
                });
        };

        dcd.deletePhoto = function (photo, done) {
            modalService.confirm('app.DeletePhotoConfirmationMsg')
                .then(function (result) {
                    if (result) {
                        drbblyCourtsService.deletePhoto(dcd.courtId, photo.id)
                            .then(function () {
                                done();
                            })
                            .catch(function (error) {
                                // TODO: Display error in toast
                            });
                    }
                });
        };

        dcd.edit = function () {
            drbblyCourtshelperService.editCourt(dcd.court)
                .then(function () {
                    dcd.onUpdate();
                })
                .catch(function () { /*do nothing*/ });
        };

        dcd.changePrimaryPicture = function (file) {
            if (!file) { return; }
            drbblyFileService.upload(file, 'api/courts/updateCourtPhoto/' + dcd.court.id)
                .then(function (result) {
                    //loadCourt();
                    dcd.onUpdate();
                })
                .catch(function (error) {
                    console.log(error);
                });
        };
    }
})();
