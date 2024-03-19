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


        // :::Next, hide video element and just show thumbnail, if available, until it is played

        vli.$onInit = function () {
            if (!vli.video.thumbnailUrl) {
                createVideoElement();
            }
        };

        function createVideoElement(play) {
            vli.videoShown = true;
            $timeout(function () {
                _videoElement = document.createElement("video");
                _videoElement.src = vli.video.url;
                _videoElement.controls = true;
                _videoElement.preload = 'metadata';
                //_player = videojs(_videoElement, {
                //    children: [
                //        'bigPlayButton',
                //        'controlBar'
                //    ],
                //    fluid: true,
                //    controls: true,
                //    autoplay: false,
                //    preload: 'metadata'
                //});

                if (vli.video.thumbnailUrl) {
                    _videoElement.setAttribute('poster', vli.video.thumbnailUrl);
                }
                if (!vli.video.extension && vli.video.file?.type) { // happens when the video is a blob
                    vli.video.extension = vli.video.file.type.substr(vli.video.file.type.lastIndexOf('/') + 1);
                }

                //_player.src({ type: 'video/' + vli.video.extension, src: vli.video.url + '#t=0.1' });

                //_player.on('play', () => {
                //    if (_player) {
                //        drbblyVideoManager.setCurrentVideo(_player);
                //    }
                //});

                _videoElement.onplay = () => {
                    $timeout(() => {
                        drbblyVideoManager.setCurrentVideo(_player);
                        vli.isLoading = false;
                        vli.hasPlayed = true;
                    });
                };

                _videoElement.onloadedmetadata = function (e) {
                    $timeout(() => {
                        var date = new Date(0);
                        date.setSeconds(e.srcElement.duration);
                        var duration = date.toISOString().substr(11, 8);
                        vli.duration = duration;
                    });
                };

                var wrapper = $element.find('.video-wrapper')[0];
                wrapper.append(_videoElement);
                if (play) {
                    vli.isLoading = true;
                    _videoElement.play()
                        .catch(() => {
                            vli.isLoading = false;
                        });
                }
            }, 500);
        }

        vli.onPlayButtonClick = () => {
            createVideoElement(true);
        }

        vli.$onDestroy = function () {
            if (_videoElement) {
                _videoElement.pause();
            }
        };

        vli.onEnterView = (data) => {
            if (data.changed) {
                if (data.inView) {
                    if (_videoElement) {
                        _videoElement.play();
                    }
                    else {
                        createVideoElement(true);
                    }
                }
                else {
                    _videoElement && _videoElement.pause();
                }
            }
        }

        vli.clicked = function () {
            //_player.play();
        };
    }
})();
