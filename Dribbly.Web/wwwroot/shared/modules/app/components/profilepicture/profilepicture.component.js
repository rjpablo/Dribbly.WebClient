(function () {
    'use strict';

    angular.module('appModule')
        .component('drbblyProfilepicture', {
            bindings: {
                user: '<'
            },
            controllerAs: 'dpp',
            templateUrl: '/shared/modules/app/components/profilepicture/profilepicture.component.html',
            controller: controllerFn
        });

    controllerFn.$inject = ['$element'];
    function controllerFn($element) {
        var dpp = this;

        dpp.$onInit = function () {
            $element.addClass('drbbly-profilepicture');
            console.log(dpp.user.profilePicture);
        };
    }
})();
