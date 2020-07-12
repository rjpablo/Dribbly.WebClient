(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyVideolistitem', {
            bindings: {
                video: '<',
                onClick: '<?'
            },
            controllerAs: 'vli',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['$element', '$scope'];
    function controllerFunc($element, $scope) {
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

        vli.clicked = function ($event) {
            console.log('clicked');
        };

        vli.vlicked = function (e) {
            if (vli.onClick) {
                vli.onClick(vli.court);
                e.preventDefault();
            }
        };
    }
})();
