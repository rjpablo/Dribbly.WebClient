(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyBlogscontainer', {
            bindings: {
                app: '<'
            },
            controllerAs: 'dhc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyToolbarService', 'drbblyCommonService', 'drbblyBlogsService',
        'drbblyOverlayService', '$timeout', 'drbblyCarouselhelperService', 'constants', '$q', '$filter'];
    function controllerFunc(drbblyToolbarService, drbblyCommonService, drbblyBlogsService,
        drbblyOverlayService, $timeout, drbblyCarouselhelperService, constants, $q, $filter) {
        var dhc = this;

        dhc.$onInit = function () {
            dhc.app.updatePageDetails({
                title: 'Blogs',
                description: 'Blogs about Basketball and more'
            });
            dhc.overlay = drbblyOverlayService.buildOverlay();
            drbblyToolbarService.setItems([]);

            dhc.blogs = [];
            dhc.app.mainDataLoaded();
            loadBlogs();
        };

        function loadBlogs() {
            drbblyBlogsService.getBlogs()
                .then(result => {
                    dhc.blogs = result;
                })
        }
    }
})();
