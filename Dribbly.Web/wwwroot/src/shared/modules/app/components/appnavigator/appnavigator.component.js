(function () {
    'use strict';

    angular.module('appModule')
        .component('drbblyAppnavigator', {
            bindings: {
                onInit: '<',
                navItems: '<'
            },
            controllerAs: 'dan',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$state'];
    function controllerFn($state) {
        var dan = this;

        dan.$onInit = function () {

        };

        dan.getHref = function (item) {
            return $state.href(item.targetStateName, item.targetStateParams);
        };

        dan.itemClicked = function (item, e) {
            setActiveItem(item);
            if (item.action) {
                e.preventDefault();
                item.action();
            }
        };

        function setActiveItem(activeItem){
            dan.navItems.forEach(function (item) {
                item.isActive = item.targetStateName === activeItem.targetStateName;
            });
        };
    }
})();
