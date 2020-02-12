(function () {
    'use strict';

    angular.module('siteModule')
        .controller('siteController', [function () {
            var site = this;
            site.message = 'Message from Site';
        }]);
})();
