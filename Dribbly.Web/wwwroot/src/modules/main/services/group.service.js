(function () {
    'use strict';

    angular.module('mainModule')
        .service('drbblyGroupsService', ['drbblyhttpService', 'drbblyFileService', '$q', 'authService',
            'modalService',
            function (drbblyhttpService, drbblyFileService, $q, authService,
                modalService) {
                var api = 'api/Groups/';

                return {
                    createGroup: function (input) {
                        return drbblyhttpService.post(api + 'createGroup', input);
                    },
                    getGroupViewerData: function (groupId) {
                        return drbblyhttpService.get(api + 'getGroupViewerData/' + groupId);
                    },
                    openGroupDetailsModal: function (data) {
                        return authService.checkAuthenticationThen(function () {
                            return modalService.show({
                                view: '<drbbly-addgroupmodal></drbbly-addgroupmodal>',
                                model: data || {},
                                backdrop: 'static'
                            });
                        });
                    },
                    updateGroup: function (input) {
                        return drbblyhttpService.post(api + 'updateGroup', input);
                    }
                }
            }]);

})();