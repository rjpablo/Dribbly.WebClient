(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyCourtvideos', {
            bindings: {
                onUpdate: '<',
                court: '<'
            },
            controllerAs: 'dcv',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['authService', 'modalService', '$stateParams', 'permissionsService',
        'drbblyCommonService', 'drbblyCourtsService', 'settingsService'];
    function controllerFunc(authService, modalService, $stateParams, permissionsService,
        drbblyCommonService, drbblyCourtsService, settingsService) {
        var dcv = this;

        dcv.$onInit = function () {
            dcv.courtId = $stateParams.id;
            dcv.isOwned = dcv.court.ownerId === authService.authentication.userId;
            dcv.maxSize = settingsService.maxVideoUploadMb + 'MB';

            drbblyCourtsService.getCourtVideos(dcv.courtId)
                .then(function (videos) {
                    dcv.videos = videos || [];
                }, function () {
                    // todo: show error overlay
                });
        };

        dcv.deleteVideo = function (video, done) {
            modalService.confirm('app.DeleteVideoConfirmationMsg')
                .then(function (result) {
                    if (result) {
                        drbblyCourtsService.deleteVideo(dcv.courtId, video.id)
                            .then(function () {
                                done();
                            })
                            .catch(function (error) {
                                drbblyCommonService.handleError(error);
                            });
                    }
                });
        };

        function massageVideos(videos) {
            var canDeleteNotOwned = permissionsService.hasPermission('Court.DeleteVideoNotOwned');
            for (var i = 0; i < videos.length; i++) {
                videos[i].deletable = videos[i].id !== dcv.court.primaryVideo.id &&
                    (dcv.isOwned || canDeleteNotOwned);
            }
            return videos;
        }

        dcv.addVideos = function (files) {
            if (files && files.length) {
                modalService.show({
                    view: '<drbbly-uploadvideomodal></drbbly-uploadvideomodal>',
                    model: {
                        file: files[0],
                        courtId: dcv.courtid,
                        isCourt: true,
                        onSubmit: function (file, video) {
                            return drbblyCourtsService.addCourtVideo(dcv.courtId, video, file);
                        }
                    },
                    size: 'lg',
                    backdrop: 'static'
                }).then(function (result) {
                    if (result) {
                        dcv.videos.unshift(result);
                    }
                    else {
                        // TODO: display error
                    }
                }, function (err) {

                });
            }
            //drbblyCourtsService.addCourtVideo(files, dcv.courtId)
            //    .then(function (result) {
            //        if (result) {
            //            dcv.videos.unshift(result);
            //        }
            //        else {
            //            // TODO: display error
            //        }
            //    })
            //    .catch(function (error) {
            //        console.log(error);
            //    });
        };
    }
})();
