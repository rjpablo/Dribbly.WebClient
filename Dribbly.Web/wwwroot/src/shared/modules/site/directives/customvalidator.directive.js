(function () {
    'use strict';

    angular.module('siteModule')
        .directive('drbblyCustomvalidator', function (i18nService, $sanitize) {

            function linkFunc(scope, elm, attrs, ctrl) {

                if (scope.validators) {
                    if (angular.isArray(scope.validators)) {
                        forEach(scope.validators, function (validator) {
                            ctrl.$validators[validator.name] = validator;
                        });
                    }
                    else {
                        ctrl.$validators[scope.validators.name] = scope.validators;
                    }
                }

                if (scope.asyncValidators) {
                    if (angular.isArray(scope.asyncValidators)) {
                        forEach(scope.asyncValidators, function (validator) {
                            ctrl.$asyncValidators[validator.name] = validator;
                        });
                    }
                    else {
                        ctrl.$asyncValidators[scope.asyncValidators.name] = scope.asyncValidators;
                    }
                }
            }

            return {
                restrict: 'A',
                require: 'ngModel',
                link: linkFunc,
                scope: {
                    validators: '<',
                    asyncValidators: '<'
                }
            };
        });
})();
