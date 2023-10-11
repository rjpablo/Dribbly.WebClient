(function () {
    'use strict';

    angular.module('siteModule')
        .service('permissionsService', ['drbblyhttpService', '$injector',
            function (drbblyhttpService, $injector) {
                var api = 'api/permissions/';
                var _permissions;
                var _bypassPermissions = false;

                return {
                    getUserPermissionNames: function (userId) {
                        return drbblyhttpService.get(api + 'getUserPermissionNames/' + userId)
                            .then(function (data) {
                                _permissions = data || [];
                                return _permissions;
                            });
                    },
                    hasPermission: function (permissionName) {
                        if (_bypassPermissions) {
                            var authentication = $injector.get('authService').authentication;
                            return authentication && authentication.isAuthenticated;
                        }

                        return (_permissions || []).indexOf(permissionName) > -1;
                    },
                    setPermissions: function (permissions) {
                        _permissions = permissions || [];
                    }
                };

            }]);
})();
