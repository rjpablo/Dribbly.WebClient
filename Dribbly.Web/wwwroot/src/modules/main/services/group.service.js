(function () {
    'use strict';

    angular.module('mainModule')
        .service('drbblyGroupsService', ['drbblyhttpService', 'authService', 'modalService',
            function (drbblyhttpService, authService, modalService) {
                var api = 'api/Groups/';

                return {
                    cancelJoinRequest: function (groupId) {
                        return drbblyhttpService.post(api + 'cancelJoinRequest/' + groupId);
                    },
                    createGroup: function (input) {
                        return drbblyhttpService.post(api + 'createGroup', input);
                    },
                    getGroupViewerData: function (groupId) {
                        return drbblyhttpService.get(api + 'getGroupViewerData/' + groupId);
                    },
                    joinGroup: function (groupId) {
                        return drbblyhttpService.post(api + 'joinGroup/' + groupId);
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