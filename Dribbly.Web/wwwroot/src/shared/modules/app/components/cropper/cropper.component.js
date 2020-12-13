(function () {
    'use strict';

    angular.module('appModule')
        .component('drbblyCropper', {
            bindings: {
                imageUrl: '<',
                methods: '<',
                options: '<'
            },
            controllerAs: 'dus',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$timeout', 'constants', '$state'];
    function controllerFn($timeout, constants, $state) {
        var dus = this;
        var _cropper;

        dus.$onInit = function () {
            dus._options = getOptions(dus.options || {});
            $timeout(configure);
        };

        function configure() {
            var img = document.getElementById('cropImg');
            _cropper = new Cropper(img, dus._options);

            dus.methods = dus.methods || {}; //make sure it's not null/undefined
            dus.methods.getCroppedImageData = function (cb) {
                return _cropper.getCroppedCanvas().toBlob(cb, 'image/png');
            };
        }

        function getOptions(overrides) {
            var defaultOptions = {
                viewMode: 1,
                dragMode: 'none',
                autoCropArea: 1,
                movable: false,
                rotatable: false,
                scalabled: false,
                zoomabled: false,
                zoomOnTouch: false,
                zoomOnWheel: false,
                toggleDragModeOnDblclick: false,
            };

            return Object.assign(overrides, defaultOptions);
        }
    }
})();
