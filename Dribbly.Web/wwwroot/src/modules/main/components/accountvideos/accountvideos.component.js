﻿(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyAccountvideos', {
            bindings: {
                onUpdate: '<',
                account: '<'
            },
            controllerAs: 'dav',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['authService', 'modalService', '$stateParams', 'drbblyOverlayService',
        'drbblyCommonService', 'drbblyAccountsService', 'settingsService'];
    function controllerFunc(authService, modalService, $stateParams, drbblyOverlayService,
        drbblyCommonService, drbblyAccountsService, settingsService) {
        var dav = this;

        dav.$onInit = function () {
            dav.username = $stateParams.username;
            dav.overlay = drbblyOverlayService.buildOverlay();
            dav.isOwned = authService.isCurrentUserId(dav.account.identityUserId);
            dav.accountId = dav.account.id;
            dav.maxSize = settingsService.maxVideoUploadMb + 'MB';

            dav.overlay.setToBusy();
            drbblyAccountsService.getAccountVideos(dav.accountId)
                .then(function (videos) {
                    dav.videos = videos || [];
                    dav.overlay.setToReady();
                }, dav.overlay.setToError);
        };

        dav.deleteVideo = function (video, done) {
            modalService.confirm('app.DeleteVideoConfirmationMsg')
                .then(function (result) {
                    if (result) {
                        drbblyAccountsService.deleteVideo(dav.accountId, video.id)
                            .then(function () {
                                done();
                            })
                            .catch(function (error) {
                                drbblyCommonService.handleError(error);
                            });
                    }
                });
        };

        dav.addVideo = function (files) {
            if (files && files.length) {
                modalService.show({
                    view: '<drbbly-uploadvideomodal></drbbly-uploadvideomodal>',
                    model: {
                        file: files[0],
                        accountId: dav.accountid,
                        isAccount: true,
                        onSubmit: function (file, video) {
                            return drbblyAccountsService.addAccountVideo(dav.accountId, video, file);
                        }
                    },
                    size: 'lg',
                    backdrop: 'static'
                }).then(function (result) {
                    if (result) {
                        dav.videos.unshift(result);
                    }
                    else {
                        // TODO: display error
                    }
                }, function (err) {

                });
            }
        };
    }
})();
