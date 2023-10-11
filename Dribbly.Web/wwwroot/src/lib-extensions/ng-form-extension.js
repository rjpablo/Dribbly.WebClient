/**
 * @ngdoc directive
 * @name ngForm
 *
 * @description
 * Description place holder.
 **/
(function () {
    'use strict';

    function aaFormFactory(isNgForm) {
        return {
            restrict: isNgForm ? 'EAC' : 'E',
            require: 'form',
            compile: function () {
                return {
                    pre: function (scope, element, attrs, thisForm) {
                        thisForm.$drbbly = {
                            $getChanges: function (ogModel) {
                                var dirtyControls = thisForm.$$controls.drbblyWhere({ $dirty: true });
                                var changes = [];
                                angular.forEach(dirtyControls, function (control) {
                                    var propertyName = control.$$attr.ngModel.match(/(?<=\.)\w+$/)[0];
                                    if (ogModel[propertyName] !== control.$modelValue) {
                                        changes.push({
                                            value: control.$modelValue,
                                            key: propertyName
                                        });
                                    }
                                });
                                return changes;
                            }
                        };
                    },
                    post: function (scope, element, attrs, thisForm) {
                        thisForm.$drbbly = {
                            $getChanges: function (ogModel) {
                                var dirtyControls = thisForm.$$controls.drbblyWhere({ $dirty: true });
                                var changes = {};
                                angular.forEach(dirtyControls, function (control) {
                                    var propertyName = control.$$attr.ngModel.match(/(?<=\.)\w+$/)[0];
                                    if (ogModel[propertyName] !== control.$modelValue) {
                                        changes[propertyName] = control.$modelValue;
                                    }
                                });
                                return changes;
                            }
                        };
                    }
                };
            }
        };
    }

    angular.module('siteModule')
        //extend Angular form to have $aaFormExtensions and also keep track of the parent form
        .directive('ngForm', function () {
            return aaFormFactory(true);
        })
        .directive('form', function () {
            return aaFormFactory(true);
        });
})();