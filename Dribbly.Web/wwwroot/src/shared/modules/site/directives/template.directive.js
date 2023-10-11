(function () {
    'use strict';

    angular.module('siteModule')
        .directive('drbblyTemplate', ['$parse', function ($parse) {

            function linkFunc(scope, element, attrs) {
                var compiledFunc = $parse(attrs.drbblyTemplate); //compile the angular expression into a func
                var outerScope = $(element).scope(); //capture the scope that the expression lives within
                compiledFunc.assign(outerScope, element.html()); //assign the value 
            }

            return {
                restrict: 'A',
                scope: {
                    drbblyTemplate: '='
                },
                link: linkFunc
            };
        }]);
})();
