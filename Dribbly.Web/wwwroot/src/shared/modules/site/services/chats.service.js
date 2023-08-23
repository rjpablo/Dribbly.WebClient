(function () {
    'use strict';

    angular.module('siteModule')
        .service('drbblyChatsService', serviceFn);
    serviceFn.$inject = ['drbblyhttpService'];
    function serviceFn(drbblyhttpService) {
        var baseApiRoute = 'api/Chats/';

        var _service = {
            getChats: () => drbblyhttpService.get(baseApiRoute + 'GetChats/'),
            getChat: (chatId) => drbblyhttpService.get(baseApiRoute + 'GetChat/' + chatId),
            getUnviewedCount: (chatId) => drbblyhttpService.get(baseApiRoute + 'GetUnviewedCount/' + chatId),
            getPrivateChat: (withUserId) => drbblyhttpService.get(baseApiRoute + 'GetPrivateChat/' + withUserId),
            getOrCreatePrivateChat: (withUserId, chat) => drbblyhttpService.post(baseApiRoute + 'GetOrCreatePrivateChat/' + withUserId, chat),
            joinGroup: (connectionId, groupName) => drbblyhttpService.post(baseApiRoute + 'JoinGroup/' + connectionId + '/' + groupName),
            markMessageAsSeen: (chatId, messageId) => drbblyhttpService.post(baseApiRoute + 'MarkMessageAsSeen/' + chatId + '/' + messageId),
            sendMessage: (input) => drbblyhttpService.post(baseApiRoute + 'SendMessage/', input),
            createChat: (input) => drbblyhttpService.post(baseApiRoute + 'CreateChat/', input)
        }

        return _service;
    }
})();