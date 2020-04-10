(function () {
    'use strict';

    angular.module('siteModule')
        .directive('drbblyEmailinput', [function () {
            var EMAIL_REGEXP = /^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/;

            return {
                require: 'ngModel',
                restrict: 'A',
                link: function (scope, elm, attrs, ctrl) {
                    ctrl.$validators.email = function (modelValue) {
                        return ctrl.$isEmpty(modelValue) || EMAIL_REGEXP.test(modelValue);
                    };
                }
            };
        }
        ]);
})();
