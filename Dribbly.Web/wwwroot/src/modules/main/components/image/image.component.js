(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyImage', {
            bindings: {
                imageUrl: '@',
                onClick: '<'
            },
            controllerAs: 'dic',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['$timeout', '$scope'];
    function controllerFunc($timeout, $scope) {
        var dic = this;

        dic.$onInit = function () {
            var image = new Image();
            image.onloadstart = function () {
                $scope.$apply(() => {
                    dic.status = 'loading';
                });
            }
            image.onload = function () {
                $scope.$apply(() => {
                    dic.status = 'ready';
                });
            };
            image.src = dic.imageUrl;
            dic.status = 'ready';
            image.onerror = function () {
                $scope.$apply(() => {
                    dic.status = 'error';
                });
            }
        };
    }
})();
