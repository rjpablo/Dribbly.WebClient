(function () {
    'use strict';

    angular.module('mainModule')
        .service('drbblyBlogsService', ['drbblyhttpService',
            function (drbblyhttpService) {
                var api = 'api/Blogs/';

                return {
                    getBlog: function (slug) {
                        return drbblyhttpService.get(api + slug);
                    },
                    getBlogs: function () {
                        return drbblyhttpService.get(api);
                    }
                };
            }]);

})();