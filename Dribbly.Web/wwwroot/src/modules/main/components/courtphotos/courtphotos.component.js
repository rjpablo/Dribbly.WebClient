(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyCourtphotos', {
            bindings: {
                onUpdate: '<'
            },
            controllerAs: 'dcp',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['authService', 'drbblyCourtshelperService', 'modalService', '$stateParams',
        'drbblyCommonService', 'drbblyCourtsService'];
    function controllerFunc(authService, drbblyCourtshelperService, modalService, $stateParams,
        drbblyCommonService, drbblyCourtsService) {
        var dcp = this;

        dcp.$onInit = function () {
            dcp.courtId = $stateParams.id;
            drbblyCourtsService.getCourtPhotos(dcp.courtId)
                .then(function (photos) {
                    dcp.photos = massagePhotos(photos);
                })
                .catch(function (error) {
                    drbblyCommonService.handleError(error);
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
            for (var i = 0; i < photos.length; i++) {
                photos[i].deletable = authService.isCurrentUserId(photos[i].uploadedById);
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
