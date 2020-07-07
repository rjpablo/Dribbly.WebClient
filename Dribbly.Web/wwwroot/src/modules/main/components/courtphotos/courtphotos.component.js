(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyCourtphotos', {
            bindings: {
                onUpdate: '<',
                court: '<'
            },
            controllerAs: 'dcp',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['authService', 'modalService', '$stateParams', 'permissionsService',
        'drbblyCommonService', 'drbblyCourtsService'];
    function controllerFunc(authService, modalService, $stateParams, permissionsService,
        drbblyCommonService, drbblyCourtsService) {
        var dcp = this;

        dcp.$onInit = function () {
            dcp.courtId = $stateParams.id;
            dcp.isOwned = dcp.court.ownerId === authService.authentication.userId;
            drbblyCourtsService.getCourtPhotos(dcp.courtId)
                .then(function (photos) {
                    dcp.photos = massagePhotos(photos);
                }, function () {
                    // TODO: show error in a toast
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
            //drbblyFileService.upload(files, 'api/courts/addPhotos/' + dcp.court.i)
            drbblyCourtsService.addCourtPhotos(files, dcp.courtId)
                .then(function (result) {
                    dcp.photos.unshift(...result);
                })
                .catch(function (error) {
                    console.log(error);
                });
        };
    }
})();
