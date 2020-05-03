(function () {
    'use strict';

    angular.module('appModule')
        .component('drbblyFooter', {
            bindings: {
                onContentChange: '<'
            },
            controllerAs: 'ftr',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['authService', 'drbblyFooterService', '$compile',
        '$timeout'];
    function controllerFn(authService, drbblyFooterService, $compile,
        $timeout) {
        var ftr = this;
        var _dynamicContentContainer;
        var _dynamicElementInd;

        ftr.$onInit = function () {
            _dynamicElementInd = 0;
            _dynamicContentContainer = angular.element('[id=dynamic-footer-contents]');
            drbblyFooterService.setFooter(ftr);
            ftr.dynamicContents = [];
        };

        ftr.addDynamicContent = function (scope, template) {
            var content = $compile(template)(scope);
            var id = 'toolbar-item-' + _dynamicElementInd++;
            content.attr('id', id);
            _dynamicContentContainer.append(content);
            $timeout(ftr.onContentChange, 100);
            return angular.element('[id=' + id + ']');
        };

        ftr.isAuthenticated = function () {
            return authService.authentication.isAuthenticated;
        };
    }
})();
