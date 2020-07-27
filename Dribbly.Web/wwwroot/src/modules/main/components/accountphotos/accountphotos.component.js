(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyAccountphotos', {
            bindings: {
                onUpdate: '<',
                account: '<'
            },
            controllerAs: 'dap',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['authService', 'modalService', '$stateParams', 'permissionsService',
        'drbblyCommonService', 'drbblyAccountsService'];
    function controllerFunc(authService, modalService, $stateParams, permissionsService,
        drbblyCommonService, drbblyAccountsService) {
        var dap = this;

        dap.$onInit = function () {
            dap.isOwned = dap.account.id === authService.authentication.userId;
            drbblyAccountsService.getAccountPhotos(dap.account.id)
                .then(function (photos) {
                    dap.photos = massagePhotos(photos);
                }, function () {
                    // TODO: show error in a toast
                });
        };

        dap.deletePhoto = function (photo, done) {
            modalService.confirm('app.DeletePhotoConfirmationMsg')
                .then(function (result) {
                    if (result) {
                        drbblyAccountsService.deletePhoto(photo.id, dap.account.id)
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
            var canDeleteNotOwned = permissionsService.hasPermission('Account.DeletePhotoNotOwned');
            for (var i = 0; i < photos.length; i++) {
                photos[i].deletable = photos[i].id !== dap.account.profilePhoto.id &&
                    (dap.isOwned || canDeleteNotOwned);
            }
            return photos;
        }

        dap.addPhotos = function (files) {
            //drbblyFileService.upload(files, 'api/accounts/addPhotos/' + dap.account.i)
            if (files && files.length) {
                drbblyAccountsService.addAccountPhotos(files, dap.account.id)
                    .then(function (result) {
                        dap.photos.unshift(...result);
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
            }
        };
    }
})();
