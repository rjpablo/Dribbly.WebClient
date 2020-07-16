(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyVideolistitem', {
            bindings: {
                video: '<',
                options: '<',
                onClick: '<?'
            },
            controllerAs: 'vli',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['$element', '$scope', 'modalService'];
    function controllerFunc($element, $scope, modalService) {
        var vli = this;
        var _videoElement;

        vli.$onInit = function () {
            _videoElement = $element.find('video')[0];
            _videoElement.src = vli.video.src + '#t=0.1';
            _videoElement.onloadedmetadata = function (e) {
                var date = new Date(0);
                date.setSeconds(e.currentTarget.duration);
                var duration = date.toISOString().substr(11, 8);
                vli.duration = duration;
                $scope.$apply(); // needed to display the duration because onloadedmetadata does not run within angular scope
            };
        };

        vli.clicked = function () {
            modalService.show({
                view: '<drbbly-videoplayermodal></drbbly-videoplayermodal>',
                model: {
                    video: vli.video,
                    options: vli.options
                },
                isFull: true
            })
                .then(function () { /*do nothing*/ })
                .catch(function () { /*do nothing*/ });
        };
    }
})();
