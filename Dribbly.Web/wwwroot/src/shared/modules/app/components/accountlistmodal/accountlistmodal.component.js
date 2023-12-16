(function () {
    'use strict';

    angular.module('appModule')
        .component('drbblyAccountlistmodal', {
            bindings: {
                model: '<',
                context: '<',
                options: '<'
            },
            controllerAs: 'alm',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['drbblyPostsService', '$scope', 'modalService', 'drbblyEventsService', 'drbblyFileService',
        'drbblyCommonService', 'constants', 'drbblyOverlayService', '$sce', '$element', '$timeout'];
    function controllerFn(drbblyPostsService, $scope, modalService, drbblyEventsService, drbblyFileService,
        drbblyCommonService, constants, drbblyOverlayService, $sce, $element, $timeout) {
        var alm = this;

        alm.$onInit = function () {         
            
        };

        alm.close = function(post) {
            alm.context.okToClose = true;
            alm.context.submit(post);
        }
    }
})();
