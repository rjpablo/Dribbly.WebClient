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

    controllerFn.$inject = ['$scope', '$sce', 'drbblyEventsService', '$element', '$timeout'];
    function controllerFn($scope, $sce, drbblyEventsService, $element, $timeout) {
        var vpm = this;
        var _okToClose;
        var _api;
        var _player;

        vpm.$onInit = function () {
            vpm.isBusy = true;
            vpm.video = angular.copy(vpm.model.video);

            vpm.context.setOnInterrupt(vpm.onInterrupt);
            drbblyEventsService.on('modal.closing', function (event) {
                if (!_okToClose) {
                    event.preventDefault();
                    vpm.onInterrupt();
                }
            }, $scope);

            $timeout(function () {
                var vidEl = $element.find('video-js')[0];
                _player = videojs(vidEl, {
                    controls: true,
                    autoplay: false,
                    preload: 'auto'
                });

                _player.src({ type: 'video/mp4', src: vpm.video.url + '#t=0.1' });

                _player.ready(() => {
                    _player.play();
                });
            })

        };

        vpm.$onDestroy = function () {
            _player.dispose();
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
