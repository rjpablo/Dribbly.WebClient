(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyAccountdetails', {
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

        function createPriceComponent() {

            if (_priceComponent) {
                _priceComponent.remove();
            }

            _priceComponent = drbblyFooterService.addFooterItem({
                scope: $scope,
                template: '<drbbly-accountprice account="dad.account"></dribbly-accountprice>'
            });
        }

        dad.edit = function () {
            drbblyAccountshelperService.editAccount(dad.account)
                .then(function () {
                    dad.onUpdate();
                })
                .catch(function () { /*do nothing*/ });
        };

        dad.onProfilePhotoClick = function () {
            var options = {
                items: [{
                    textKey: 'app.ViewPrimaryPhoto',
                    action: viewPrimaryPhoto
                }]
            };
            if (dad.isOwned || permissionsService.hasPermission('Account.UpdatePhotoNotOwned')) {
                options.items.push({
                    textKey: 'app.ReplacePrimaryPhoto',
                    action: function () {
                        angular.element('#btn-replace-photo').triggerHandler('click');
                    }
                });
            }
            if (options.items.length) {
                modalService.showOptionsList(options);
            }
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
            drbblyFileService.upload(file, 'api/account/uploadPrimaryPhoto/' + dad.account.id)
                .then(function (newProfilePhoto) {
                    if (newProfilePhoto) {
                        dad.account.profilePhoto = newProfilePhoto;
                        dad.onUpdate();
                    }
                })
                .catch(function (error) {
                    console.log(error);
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
