(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyPrivacypolicycontainer', {
            bindings: {
                app: '<'
            },
            controllerAs: 'ppc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = [];
    function controllerFunc() {
        var ppc = this;

        ppc.$onInit = function () {
            ppc.app.updatePageDetails({
                title: 'Privacy Policy'
            });
            ppc.app.mainDataLoaded();
        };
    }
})();
