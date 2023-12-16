(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyPostcontainer', {
            bindings: {
                app: '<'
            },
            controllerAs: 'dpc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyPostsService', 'drbblyCommonService', 'modalService',
        'drbblyOverlayService', '$stateParams', '$state'];
    function controllerFunc(drbblyPostsService, drbblyCommonService, modalService,
        drbblyOverlayService, $stateParams, $state) {
        var dpc = this;

        dpc.$onInit = function () {
            dpc.postId = $stateParams.id;
            dpc.overlay = drbblyOverlayService.buildOverlay();
            loadPost();
        };

        function loadPost() {
            dpc.overlay.setToBusy();
            drbblyPostsService.getPost(dpc.postId)
                .then(post => {
                    dpc.post = post;
                    if (post) {
                        dpc.app.updatePageDetails({
                            title: post.addedBy.firstName + '\'s Post',
                            description: post.content
                        });
                    }
                    else {
                        dpc.app.updatePageDetails({
                            title: 'Post Not Found',
                            description: ''
                        });
                    }
                    dpc.app.mainDataLoaded();
                    dpc.overlay.setToReady();
                })
                .catch(e => {
                    dpc.overlay.setToError();
                });
        }

        dpc.onPostDelete = function () {
            return modalService.confirm("app.DeletePostConfirmationMsg")
                .then(function (response) {
                    if (response) {
                        return drbblyPostsService.deletePost(dpc.postId)
                            .then(function () {
                                $state.go('main.home');
                                drbblyCommonService.toast.info('Post deleted');

                            })
                            .catch(function (error) {
                                drbblyCommonService.handleError(error);
                            })
                    }

                    return false;
                });
        }
    }
})();
