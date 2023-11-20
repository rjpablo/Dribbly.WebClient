(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyAccountviewercontainer', {
            bindings: {
                app: '<'
            },
            controllerAs: 'avc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyAccountsService', 'authService', '$stateParams', '$state', 'permissionsService',
        'modalService', 'drbblyFileService', 'constants', 'drbblyEventsService', 'drbblyOverlayService', 'drbblyCommonService'];
    function controllerFunc(drbblyAccountsService, authService, $stateParams, $state, permissionsService,
        modalService, drbblyFileService, constants, drbblyEventsService, drbblyOverlayService, drbblyCommonService) {
        var avc = this;
        var _username;
        var flagKeys = {
            uploadPrimaryPhoto: 'upload_primary_photo'
        };

        avc.$onInit = function () {
            avc.overlay = drbblyOverlayService.buildOverlay();
            _username = $stateParams.username;
            loadAccount();
        };

        function loadAccount() {
            drbblyAccountsService.getAccountViewerData(_username)
                .then(function (data) {
                    avc.account = data.account;
                    avc.account.profilePhoto = avc.account.profilePhoto || constants.images.defaultProfilePhoto;
                    avc.stats = data.stats;
                    avc.isOwned = authService.isCurrentUserId(avc.account.identityUserId);
                    avc.shouldDisplayAsPublic = avc.account.isPublic || avc.isOwned ||
                        permissionsService.hasPermission('Account.UpdateNotOwned');
                    avc.app.mainDataLoaded();
                    buildSubPages();

                    if (avc.isOwned && data.flags.drbblyAny(f => f.key === flagKeys.uploadPrimaryPhoto)) {
                        promptForProfilePhoto();
                    }
                }, function (error) {

                });
        }

        function promptForProfilePhoto() {
            return modalService.show({
                view: '<drbbly-alertmodal></drbbly-alertmodal>',
                model: {
                    msg1Raw: 'Upload a profile photo so other users would recognize you.',
                    options: {
                        buttons: [
                            {
                                textKey: 'app.SelectPhoto',
                                action: (modalContext) => {
                                    angular.element('#btn-replace-photo').triggerHandler('click');
                                    modalContext.okToClose = true;
                                    modalContext.submit();
                                    drbblyAccountsService.removeFlag(flagKeys.uploadPrimaryPhoto)
                                },
                                class: 'btn btn-primary'
                            },
                            {
                                textKey: 'site.Skip',
                                action: (modalContext) => {
                                    modalContext.okToClose = true;
                                    modalContext.dismiss();
                                    drbblyAccountsService.removeFlag(flagKeys.uploadPrimaryPhoto)
                                },
                                class: 'btn btn-secondary'
                            },
                        ]
                    }
                },
                backdrop: 'static'
            })
        }

        avc.editDetails = function () {
            authService.checkAuthenticationThen(function () {
                modalService.show({
                    view: '<drbbly-accountdetailsmodal></drbbly-accountdetailsmodal>',
                    model: { accountId: avc.account.id }
                })
                    .then(function (result) {
                        if (result) {
                            avc.onAccountUpdate();
                        }
                    });
            });
        }

        avc.onAccountUpdate = function () {
            loadAccount();
        };

        avc.$onDestroy = function () {
            avc.app.toolbar.clearNavItems();
        };
       
        avc.onProfilePhotoClick = function () {
            if (!avc.isOwned) {
                viewPrimaryPhoto();
                return;
            }

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
                            isHidden: () => !avc.isOwned && !permissionsService.hasPermission('Account.UpdatePhotoNotOwned'),
                            class: 'btn-secondary'
                        }
                    ],
                    hideHeader: true
                },
                size: 'sm',
                backdrop: true
            })
                .catch(() => { /*do nothing*/ });
        };

        avc.fbShare = function () {
            var url = `https://www.facebook.com/sharer/sharer.php?s=100&p[url]=${location.host}/account/${_username}`;
            window.open(url, 'targetWindow', 'toolbar=no,location=0,status=no,menubar=no,scrollbars=yes,resizable=yes,width=600,height=250');
            return false;
        }

        avc.message = function () {
            authService.checkAuthenticationThen(() => {
                if (!avc.isOwned) {
                    drbblyEventsService.broadcast('drbbly.chat.openChat',
                        {
                            withParticipant: {
                                id: avc.account.id,
                                name: avc.account.name,
                                photo: avc.account.profilePhoto
                            },
                            type: constants.enums.chatTypeEnum.Private
                        });
                }
            })
        };

        function viewPrimaryPhoto() {
            drbblyAccountsService.getAccountPhotos(avc.account.id)
                .then(function (photos) {
                    avc.account.photos = massagePhotos(photos);
                    var primaryPhotoIndex = avc.account.photos.findIndex(value => value.id === avc.account.profilePhotoId);
                    avc.methods.open(primaryPhotoIndex);
                })
                .catch(function (error) {
                    // TODO: display error in a toast
                });
        }

        function massagePhotos(photos) {
            var canDeleteNotOwned = permissionsService.hasPermission('Account.DeletePhotoNotOwned');
            angular.forEach(photos, function (photo) {
                photo.deletable = photo.id !== avc.account.profilePhotoId &&
                    (avc.isOwned || canDeleteNotOwned);
            });
            return photos;
        }

        avc.onPrimaryPhotoSelect = function (file) {
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
                    avc.overlay.setToBusy('');
                    var fileNameNoExt = (file.name.split('\\').pop().split('/').pop().split('.'))[0]
                    imageData.name = fileNameNoExt + '.png';
                    drbblyFileService.upload([imageData], 'api/account/uploadPrimaryPhoto/' + avc.account.id)
                        .then(function (result) {
                            if (result && result.data) {
                                avc.account.profilePhoto = result.data;
                                avc.account.profilePhotoId = result.data.id;
                            }
                        })
                        .catch(err => {
                            drbblyCommonService.handleError(err);
                        })
                        .finally(function () {
                            URL.revokeObjectURL(url)
                            avc.overlay.setToReady();
                        });
                })

        };

        avc.onDeletePhoto = function (img, callback) {
            modalService.confirm('app.DeletePhotoConfirmationMsg')
                .then(function (result) {
                    if (result) {
                        drbblyAccountsService.deletePhoto(img.id, avc.account.id)
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

        function buildSubPages() {
            avc.app.toolbar.setNavItems([
                {
                    textKey: 'site.Home',
                    targetStateName: 'main.account.home',
                    targetStateParams: { username: _username },
                    action: function () {
                        $state.go(this.targetStateName, this.targetStateParams);
                    }
                },
                {
                    textKey: 'app.Games',
                    targetStateName: 'main.account.games',
                    targetStateParams: { username: _username }
                },
                {
                    textKey: 'app.Photos',
                    targetStateName: 'main.account.photos',
                    targetStateParams: { username: _username }
                },
                {
                    textKey: 'site.Videos',
                    targetStateName: 'main.account.videos',
                    targetStateParams: { username: _username }
                },
                {
                    textKey: 'app.Details',
                    targetStateName: 'main.account.details',
                    targetStateParams: { username: _username },
                    action: function () {
                        $state.go(this.targetStateName, this.targetStateParams);
                    }
                },
                {
                    textKey: 'app.Settings',
                    targetStateName: 'main.account.settings',
                    targetStateParams: { username: _username },
                    action: function () {
                        $state.go(this.targetStateName, this.targetStateParams);
                    },
                    isRemoved: !(avc.isOwned || permissionsService.hasPermission('Account.UpdateNotOwned'))
                }
            ]);
        }
    }
})();
