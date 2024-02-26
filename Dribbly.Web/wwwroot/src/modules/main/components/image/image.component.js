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
            image.onload = function () {
                $timeout(() => {
                    dic.status = 'ready';
                });
            };
            image.src = dic.imageUrl;
            dic.status = 'loading';
            image.onerror = function () {
                $timeout(() => {
                    dic.status = 'error';
                });
            }
        };
    }
})();
