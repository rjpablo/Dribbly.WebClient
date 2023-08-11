﻿(function () {
    'use strict';

    angular.module('appModule')
        .component('drbblyAppnavigator', {
            bindings: {
                onInit: '<',
                navItems: '<',
                app: '<'
            },
            controllerAs: 'dan',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$state', '$transitions', '$timeout'];
    function controllerFn($state, $transitions, $timeout) {
        var dan = this;
        var _removeStateChangeListener;

        dan.$onInit = function () {
            setActiveItem($state.current.name);

            _removeStateChangeListener = $transitions.onSuccess({}, function (trans) {
                setActiveItem($state.current.name);
                dan.app.scrollToAppBodyTop();
            });
        };

        dan.$onDestroy = function () {
            _removeStateChangeListener();
        }

        dan.getHref = function (item) {
            return $state.href(item.targetStateName, item.targetStateParams);
        };

        dan.itemClicked = function (item, e) {
            setActiveItem(item.targetStateName);
            if (item.action) {
                e.preventDefault();
                item.action();
            }
        };

        function setActiveItem(stateName){
            dan.navItems.forEach(function (item) {
                item.isActive = item.targetStateName === stateName;
            });
        };
    }
})();
