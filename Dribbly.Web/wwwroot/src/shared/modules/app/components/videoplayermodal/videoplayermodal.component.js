(function () {
    'use strict';

    angular.module('appModule')
        .component('drbblyVideoplayermodal', {
            bindings: {
                model: '<',
                context: '<',
                options: '<'
            },
            controllerAs: 'vpm',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$scope', '$sce', 'drbblyEventsService'];
    function controllerFn($scope, $sce, drbblyEventsService) {
        var vpm = this;
        var _okToClose;
        var _video;
        var _api;

        vpm.$onInit = function () {
            vpm.isBusy = true;
            _video = vpm.model.video;
            buildConfig();

            vpm.context.setOnInterrupt(vpm.onInterrupt);
            drbblyEventsService.on('modal.closing', function (event) {
                if (!_okToClose) {
                    event.preventDefault();
                    vpm.onInterrupt();
                }
            }, $scope);
        };

        function buildConfig() {
            vpm.config = {
                autoplay: true,
                sources: [
                    { src: $sce.trustAsResourceUrl(_video.src), type: _video.type , preload: 'metadata'}
                ],
                theme: "src/lib/videogular/themes/default/videogular.css",
                plugins: {
                    controls: {
                        autoHide: true,
                        autoHideTime: 5000
                    }
                }
            };
        }

        vpm.menuItemClick = function (menuItem, event) {
            menuItem.action(vpm.model.video, event, function () {
                if (menuItem.isDelete) {
                    _api.stop();
                    vpm.onInterrupt();
                }
            });
        };

        vpm.onPlayerReady = function (api) {
            _api = api;
        };

        vpm.onInterrupt = function (reason) {
            _okToClose = true;
            vpm.context.dismiss(reason);
        };

        vpm.cancel = function () {
            vpm.onInterrupt('cancelled');
        };
    }
})();
