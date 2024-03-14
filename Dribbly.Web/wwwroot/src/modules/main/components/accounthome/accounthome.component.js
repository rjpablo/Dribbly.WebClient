(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyAccounthome', {
            bindings: {
                account: '<',
                onUpdate: '<',
                app: '<'
            },
            controllerAs: 'dad',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['constants', '$stateParams', 'authService', 'drbblyOverlayService', '$timeout',
        'drbblyAccountsService', 'modalService'];
    function controllerFunc(constants, $stateParams, authService, drbblyOverlayService, $timeout,
        drbblyAccountsService, modalService) {
        var dad = this;

        dad.$onInit = function () {
            dad.username = $stateParams.username;
            dad.overlay = drbblyOverlayService.buildOverlay();
            dad.isOwned = authService.isCurrentUserId(dad.account.identityUserId);
            dad.postsOptions = {
                postedOnType: constants.enums.entityType.Account,
                postedOnId: dad.account.id,
                canPost: dad.isOwned
            };
            dad.highlights = dad.account.highlights.map(h => h.file);
            loadAccount();
            dad.app.updatePageDetails({
                title: dad.account.name + ' - Profile',
                image: dad.account.profilePhoto.url
            });
            dad.highlightsOptions = {
                hideDetails: true,
                menuItems: [{
                    text: 'Remove',
                    action: removeHighlight,
                    isHidden: () => !dad.isOwned
                }]
            }
        };

        function removeHighlight(video) {
            modalService.confirm({ msg1Raw: 'Remove from highlights?' })
                .then(confirmed => {
                    if (confirmed) {
                        drbblyAccountsService.removeHighlight(video.id)
                            .then(() => {
                                dad.highlights.drbblyRemove(h => h.id === video.id);
                            })
                    }
                })
                .catch(function (error) {
                    drbblyCommonService.handleError(error);
                });
        }

        function loadAccount() {
            dad.overlay.setToBusy();
            $timeout(dad.overlay.setToReady, 1000);
        }

        dad.edit = function () {
            drbblyAccountshelperService.editAccount(dad.account)
                .then(function () {
                    dad.onUpdate();
                })
                .catch(function () { /*do nothing*/ });
        };

        dad.addHighlight = function (files) {
            if (files && files.length) {
                var vid = files[0];
                if (vid.type !== 'video/mp4') {
                    modalService.show({ msg1Raw: 'Only .mp4 files are currently supported.', msgTitleRaw: 'Invalid File Type' });
                    return;
                }
                modalService.show({
                    view: '<drbbly-uploadvideomodal></drbbly-uploadvideomodal>',
                    model: {
                        file: vid,
                        accountId: dad.account.id,
                        isAccount: true,
                        onSubmit: function (file, video) {
                            return drbblyAccountsService.addAccountVideo(dad.account.id, video, file, true);
                        }
                    },
                    size: 'lg',
                    backdrop: 'static'
                }).then(function (result) {
                    if (result) {
                        dad.highlights.unshift(result);
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
