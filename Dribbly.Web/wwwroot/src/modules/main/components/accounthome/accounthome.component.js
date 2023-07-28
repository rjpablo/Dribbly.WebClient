﻿(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyAccounthome', {
            bindings: {
                account: '<',
                onUpdate: '<'
            },
            controllerAs: 'dad',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['constants', 'drbblyFileService', '$stateParams', 'authService', 'permissionsService',
        'drbblyOverlayService', 'modalService', 'drbblyFooterService', '$timeout', 'drbblyAccountsService',
        'drbblyCommonService'];
    function controllerFunc(constants, drbblyFileService, $stateParams, authService, permissionsService,
        drbblyOverlayService, modalService, drbblyFooterService, $timeout, drbblyAccountsService,
        drbblyCommonService) {
        var dad = this;
        var _priceComponent;

        dad.$onInit = function () {
            dad.username = $stateParams.username;
            dad.overlay = drbblyOverlayService.buildOverlay();
            dad.isOwned = authService.isCurrentUserId(dad.account.identityUserId);
            dad.account.profilePhoto = dad.account.profilePhoto || getDefaultProfilePhoto();
            dad.postsOptions = {
                postedOnType: constants.enums.entityType.Account,
                postedOnId: dad.account.identityUserId
            };
            loadAccount();
        };

        function getDefaultProfilePhoto() {
            return {
                url: '../../../../../' + constants.images.defaultProfilePhotoUrl
            };
        }

        function loadAccount() {
            dad.overlay.setToBusy();
            //drbblyAccountsService.getAccount(dad.accountId)
            //    .then(function (data) {
            //        dad.account = data;
            //        dad.isOwned = dad.account.ownerId === authService.authentication.userId;
            //        dad.onUpdate(dad.account);
            //        dad.overlay.setToReady();
            //    })
            //    .catch(dad.overlay.setToError);
            $timeout(dad.overlay.setToReady, 1000);
        }

        dad.edit = function () {
            drbblyAccountshelperService.editAccount(dad.account)
                .then(function () {
                    dad.onUpdate();
                })
                .catch(function () { /*do nothing*/ });
        };

        dad.onProfilePhotoClick = function () {
            modalService.showMenuModal({
                model: {
                    buttons: [
                        {
                            text: 'View Photo',
                            action: viewPrimaryPhoto,
                            class: 'btn-secondary'
                        },
                        {
                            text: 'Replace Primary Photo',
                            action: function () {
                                angular.element('#btn-replace-photo').triggerHandler('click');
                            },
                            isHidden: () => !dad.isOwned && !permissionsService.hasPermission('Account.UpdatePhotoNotOwned'),
                            class: 'btn-secondary'
                        }
                    ],
                    hideHeader: true
                },
                size: 'sm',
                backdrop: true
            });
        };

        function viewPrimaryPhoto() {
            drbblyAccountsService.getAccountPhotos(dad.account.id)
                .then(function (photos) {
                    dad.account.photos = massagePhotos(photos);
                    var primaryPhotoIndex = dad.account.photos.findIndex(value => value.id === dad.account.profilePhotoId);
                    dad.methods.open(primaryPhotoIndex);
                })
                .catch(function (error) {
                    // TODO: display error in a toast
                });
        }

        function massagePhotos(photos) {
            var canDeleteNotOwned = permissionsService.hasPermission('Account.DeletePhotoNotOwned');
            angular.forEach(photos, function (photo) {
                photo.deletable = photo.id !== dad.account.profilePhotoId &&
                    (dad.isOwned || canDeleteNotOwned);
            });
            return photos;
        }

        dad.onPrimaryPhotoSelect = function (file) {
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
                    var fileNameNoExt = (file.name.split('\\').pop().split('/').pop().split('.'))[0]
                    imageData.name = fileNameNoExt + '.png';
                    drbblyFileService.upload(imageData, 'api/account/uploadPrimaryPhoto/' + dad.account.id)
                        .then(function (result) {
                            if (result && result.data) {
                                dad.account.profilePhoto = result.data;
                                dad.account.profilePhotoId = result.data.id;
                                dad.onUpdate();
                            }
                        })
                        .catch(function (error) {
                            console.log(error);
                        });
                })
                .finally(function () {
                    URL.revokeObjectURL(url)
                });
        };

        dad.onDeletePhoto = function (img, callback) {
            modalService.confirm('app.DeletePhotoConfirmationMsg')
                .then(function (result) {
                    if (result) {
                        drbblyAccountsService.deletePhoto(img.id, dad.account.id)
                            .then(function () {
                                callback();
                            })
                            .catch(function (error) {
                                // TODO: display error in a toast
                                console.log('Error deleting photo', error);
                            });
                    }
                });
        };
    }
})();
