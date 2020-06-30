(function () {
    'use strict';

    angular.module('siteModule')
        .service('permissionsService', ['drbblyhttpService',
            function (drbblyhttpService) {
                var api = 'api/permissions/';
                var _permissions;

                return {
                    getUserPermissionNames: function (userId) {
                        return drbblyhttpService.get(api + 'getUserPermissionNames/' + userId)
                            .then(function (data) {
                                _permissions = data || [];
                                return _permissions;
                            });
                    },
                    hasPermission: function (permissionName) {
                        return (_permissions || []).indexOf(permissionName) > -1;
                    },
                    setPermissions: function (permissions) {
                        _permissions = permissions || [];
                    }
                };

            }]);
})();
