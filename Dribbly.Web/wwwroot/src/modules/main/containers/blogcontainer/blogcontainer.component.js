(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyBlogcontainer', {
            bindings: {
                app: '<'
            },
            controllerAs: 'dbc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyBlogsService', 'drbblyCommonService', 'modalService',
        'drbblyOverlayService', '$stateParams', '$state'];
    function controllerFunc(drbblyBlogsService, drbblyCommonService, modalService,
        drbblyOverlayService, $stateParams, $state) {
        var dbc = this;

        dbc.$onInit = function () {
            dbc.slug = $stateParams.slug;
            dbc.overlay = drbblyOverlayService.buildOverlay();
            loadBlog();
        };

        function loadBlog() {
            dbc.overlay.setToBusy();
            drbblyBlogsService.getBlog(dbc.slug)
                .then(blog => {
                    dbc.blog = blog;
                    if (blog) {
                        dbc.app.updatePageDetails({
                            title: blog.name,
                            description: blog.content
                        });
                        dbc.contentParts = dbc.blog.content.split('<!--<drbbly-slice>-->');
                    }
                    else {
                        dbc.app.updatePageDetails({
                            title: 'Blog Not Found',
                            description: ''
                        });
                    }
                    dbc.app.mainDataLoaded();
                    dbc.overlay.setToReady();
                })
                .catch(e => {
                    dbc.overlay.setToError();
                });
        }
    }
})();
