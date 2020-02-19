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

    controllerFunc.$inject = ['authService', 'drbblyCourtshelperService', 'drbblyFileService', '$stateParams',
        'drbblyOverlayService', 'drbblyCourtsService'];
    function controllerFunc(authService, drbblyCourtshelperService, drbblyFileService, $stateParams,
        drbblyOverlayService, drbblyCourtsService) {
        var dcp = this;

        dcp.$onInit = function () {
            dcp.courtId = $stateParams.id;
            drbblyCourtsService.getCourtPhotos(dcp.courtId)
                .then(function (photos) {
                    dcp.photos = photos;
                })
                .catch(function (error) {

                });
        };
               
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
