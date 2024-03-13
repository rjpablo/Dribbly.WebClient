(function () {
    'use strict';

    angular
        .module('mainModule')
        .service('drbblyVideoManager', function () {
            var _playingVideo;

            function setCurrentVideo(video) {
                if (_playingVideo !== video) {
                    if (_playingVideo) {
                        _playingVideo.pause();
                        _playingVideo = video;
                    }
                }
            }

            return {
                setCurrentVideo
            };
        })
        .component('drbblyVideo', {
            bindings: {
                video: '<',
                options: '<',
                onClick: '<?'
            },
            controllerAs: 'vli',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['$element', '$scope', 'drbblyVideoManager', '$timeout'];
    function controllerFunc($element, $scope, drbblyVideoManager, $timeout) {
        var vli = this;
        var _videoElement;
        var _player;

        vli.$onInit = function () {
            $timeout(function () {
                _videoElement = $element.find('video-js')[0];
                _player = videojs(_videoElement, {
                    children: [
                        'bigPlayButton',
                        'controlBar'
                    ],
                    fluid: true,
                    controls: true,
                    autoplay: false,
                    preload: 'auto'
                });

                _player.src({ type: 'video/' + vli.video.extension, src: vli.video.url + '#t=0.1' });

                _player.on('play', () => {
                    if (_player) {
                        drbblyVideoManager.setCurrentVideo(_player);
                    }
                });

                _videoElement.onloadedmetadata = function (e) {
                    $timeout(() => {
                        var date = new Date(0);
                        date.setSeconds(e.currentTarget.duration);
                        var duration = date.toISOString().substr(11, 8);
                        vli.duration = duration;
                    });
                };
            });
        };

        vli.$onChanges = function (changes) {
            if (changes.video && changes.video.currentValue) {

            }
        }

        vli.onEnterView = (data) => {
            if (_player && data.changed) {
                if (data.inView) {
                    _player.play();
                }
                else {
                    _player.pause();
                }
            }
        }

        vli.clicked = function () {
            //_player.play();
        };
    }
})();
