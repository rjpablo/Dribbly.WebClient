(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyCourtphotos', {
            bindings: {
                onUpdate: '<',
                court: '<',
                app: '<'
            },
            controllerAs: 'dcp',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['authService', 'modalService', '$stateParams', 'permissionsService',
        'drbblyCommonService', 'drbblyCourtsService', 'constants'];
    function controllerFunc(authService, modalService, $stateParams, permissionsService,
        drbblyCommonService, drbblyCourtsService, constants) {
        var dcp = this;

        dcp.$onInit = function () {
            dcp.courtId = $stateParams.id;
            dcp.isOwned = authService.isCurrentAccountId(dcp.court.ownerId);
            dcp.methods = {};
            drbblyCourtsService.getCourtPhotos(dcp.courtId)
                .then(function (photos) {
                    dcp.photos = massagePhotos(photos);
                }, function () {
                    // TODO: show error in a toast
                });
            dcp.app.updatePageDetails({
                title: dcp.court.name + ' - Photos',
                image: (dcp.court.primaryPhoto || constants.images.defaultCourtLogo).url
            });
        };

        dcp.deletePhoto = function (photo, done) {
            modalService.confirm('app.DeletePhotoConfirmationMsg')
                .then(function (result) {
                    if (result) {
                        drbblyCourtsService.deletePhoto(dcp.courtId, photo.id)
                            .then(function () {
                                done();
                            })
                            .catch(function (error) {
                                drbblyCommonService.handleError(error);
                            });
                    }
                });
        };

        function massagePhotos(photos) {
            var canDeleteNotOwned = permissionsService.hasPermission('Court.DeletePhotoNotOwned');
            for (var i = 0; i < photos.length; i++) {
                photos[i].deletable = photos[i].id !== dcp.court.primaryPhoto.id &&
                    (dcp.isOwned || canDeleteNotOwned);
            }
            return photos;
        }

        dcp.addPhotos = function (files) {
            if (files && files.length) {
                authService.checkAuthenticationThen(function () {
                    drbblyCourtsService.addCourtPhotos(files, dcp.courtId)
                        .then(function (result) {
                            dcp.photos.unshift(...result);
                        })
                        .catch(function (error) {
                            console.log(error);
                        });
                });
            }
        };
    }
})();
