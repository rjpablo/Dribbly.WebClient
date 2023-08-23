(function () {
    'use strict';

    angular.module('siteModule')
        .component('drbblyChat', {
            bindings: {
            },
            controllerAs: 'cht',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['drbblyChatsService', 'authService', 'drbblyEventsService', 'constants', '$element', '$timeout',
        'drbblyCommonService', 'settingsService', '$q', 'drbblyFileService', '$scope'];
    function controllerFn(drbblyChatsService, authService, drbblyEventsService, constants, $element, $timeout,
        drbblyCommonService, settingsService, $q, drbblyFileService, $scope) {
        var cht = this;
        var _chatHub;
        var _connectionId;
        var _shiftKeyPressed;
        var _tempMediaId;
        var _filesToUpload;
        var _unregisterOpenChat;
        var _unregisterLoginSuccessful;

        cht.$onInit = function () {
            cht.isOpen = false;
            cht.rooms = [];
            cht.methods = {};
            cht.messageRecipientStatusEnum = constants.enums.messageRecipientStatusEnum;
            _filesToUpload = []; // the actual files retrieved from the input
            cht.previewImages = []; // the files used for the gallery
            _tempMediaId = -1;
            cht.maxPhotoSize = (settingsService.maxVideoUploadMb || 2) + 'MB';
            cht.hubIsConnecting = true;
            cht.isAuthenticated = authService.authentication.isAuthenticated;

            _unregisterLoginSuccessful = drbblyEventsService.on('badLoginSuccessful', (event, data) => {
                cht.isAuthenticated = true;
                initialize();
            });

            _unregisterOpenChat = drbblyEventsService.on('drbbly.chat.openChat', async (event, data) => {
                var chatCode = '';
                if (data.type === constants.enums.chatTypeEnum.Private) {
                    var participantIds = [data.withParticipant.id, authService.authentication.accountId]
                    chatCode = 'pr' + Math.min(...participantIds) + '-' + Math.max(...participantIds);
                }
                //check if the rooom has been loaded and then set it to active if so
                var room = cht.rooms.drbblyFirstOrDefault(r => r.code === chatCode);
                if (room) {
                    cht.setActiveRoom(room);
                    focusInput();
                }
                else {

                    if (data.type === constants.enums.chatTypeEnum.Private) {
                        room = await createPrivateChat(data);
                    }

                    if (room) {
                        massageRooms([room]);
                        cht.rooms.unshift(room);
                        cht.setActiveRoom(room);
                        focusInput();
                    }
                }
            });

            function focusInput() {
                cht.isOpen = true;
                $timeout(() => $element.find('#drbbly-chat-input').focus(), 100);
            }

            if (cht.isAuthenticated) {
                initialize();
            }
        };

        cht.$onDestroy = function () {
            _unregisterOpenChat();
            _unregisterLoginSuccessful();
        };

        async function createPrivateChat(data) {
            var tempChat = {
                title: data.withParticipant.name,
                isTemporary: true, // create the chat only when an actual message is sent
                participantIds: [data.withParticipant.id, authService.authentication.accountId],
                messages: [],
                type: data.type
            };
            return await drbblyChatsService.getOrCreatePrivateChat(data.withParticipant.id, tempChat)
                .catch(err => {
                    // TODO: handle properly
                    drbblyCommonService.handleError(err, null, 'Failed to retrieve messages');
                });
        }

        cht.addPhotos = function (images) {
            images.forEach(file => {
                file.id = _tempMediaId;
                _filesToUpload.unshift(file);
                cht.previewImages.unshift({ id: _tempMediaId, url: URL.createObjectURL(file), deletable: true });
                _tempMediaId--;
            });
        }

        cht.onRemovePhoto = function (file) {
            cht.previewImages.drbblyRemove(file);
            _filesToUpload.drbblyRemove(f => f.id === file.id);
            return $q.resolve();
        };

        function initialize() {
            _chatHub = $.connection.chatHub;

            _chatHub.client.UnviewedCountChanged = data => {
                var room = cht.rooms.drbblySingleOrDefault(r => (r.chatId != null && r.chatId === data.chatId));
                if (room) {
                    room.unviewedCount = data.unviewedCount;
                    updateTotalUnviewedCount();
                    $scope.$apply();
                }
            };

            _chatHub.client.ReceiveMessage = message => {
                massageMessage(message);
                var room = cht.rooms.drbblySingleOrDefault(r => (r.chatId != null && r.chatId === message.chatId)
                    || (r.isTemporary && r.type == data.type && r.participants.drbblyAny(p => p.participantId == data.withParticipant.id))); //if a temporary chat room exists
                if (room) {
                    if (room.isTemporary) {
                        room.chatId = message.chatId;
                        room.isTemporary = false;
                    }
                    if (!room.messages.drbblyAny(m => m.messageId === message.messageId)) {
                        room.messages.push(message);
                        scrollToBottom();
                        if (!message.isSender) {
                            room.unviewedCount++;
                            updateTotalUnviewedCount();
                        }
                    }
                    room.lastUpdateTime = new Date().toISOString();
                    $scope.$apply();
                }
                else {
                    drbblyChatsService.getChat(message.chatId)
                        .then(room => {
                            if (room) {
                                cht.rooms.push(room);
                                _chatHub.server.joinGroup(_connectionId, room.chatId)
                                    .then(() => { })
                                    .catch(err => { drbblyCommonService.handleError(err); })
                                updateTotalUnviewedCount();
                                $scope.$apply();
                            }
                        })
                        .catch(err => {
                            // TODO: handle properly
                            drbblyCommonService.handleError(err);
                        });
                }
            };

            $.connection.hub.reconnecting(function () {
                cht.isReconnecting = true;
                $scope.$apply();
            });

            $.connection.hub.reconnected(function () {
                cht.isReconnecting = false;
                $scope.$apply();
            });

            $.connection.hub.disconnected(function () {
                cht.isReconnecting = true;
                $scope.$apply();
                setTimeout(function () {
                    $.connection.hub.start()
                        .done(function () {
                            cht.isReconnecting = false;
                            $scope.$apply();
                            _connectionId = $.connection.hub.id;
                            onConnectionRenewed();
                        })
                        .fail(function (err) {
                            console.log('Could not re-establish connection!');
                        });
                }, 5000); // Restart connection after 5 seconds.
            });

            $.connection.hub.url = settingsService.serviceBase + settingsService.chatHubName;
            $.connection.hub.start()
                .done(function () {
                    cht.hubIsConnecting = false;
                    _connectionId = $.connection.hub.id;
                    loadChats()
                        .then(joinPersonalHub);
                })
                .fail(function (err) {
                    console.log('Could not Connect!');
                });
        }

        function onConnectionRenewed() {
            joinPersonalHub();
        }

        function joinPersonalHub() {
            _chatHub.server.joinGroup(_connectionId, authService.authentication.accountId);
        }

        function reset() {
            cht.previewImages = [];
            _filesToUpload = [];
            cht.text = '';
        }

        function loadChats() {
            return drbblyChatsService.getChats()
                .then(rooms => {
                    massageRooms(rooms);
                    cht.rooms = rooms;
                    updateTotalUnviewedCount();
                })
                .catch(err => {
                    // TODO: handle properly
                    drbblyCommonService.handleError(err);
                });
        }

        function massageRooms(rooms) {
            rooms.forEach(room => {
                if (room.type === constants.enums.chatTypeEnum.Private) {
                    var otherParticipant = room.participants.drbblySingle(p => p.id !== authService.authentication.accountId);
                    room.title = otherParticipant.name;
                    room.roomIcon = otherParticipant.profilePhoto;
                }
            })
        }

        function massageMessage(message) {
            message.isSender = message.senderId === authService.authentication.accountId;
        }

        cht.setActiveRoom = (room) => {
            cht.hasSelectedRoom = true;
            if (!cht.activeRoom || (room.chatId && cht.activeRoom.chatId !== room.chatId)) {
                room.messages.forEach(massageMessage)
                cht.activeRoom = room;
                reset();
                scrollToBottom();
            }
        };

        cht.exitRoom = () => {
            cht.hasSelectedRoom = false;
            cht.activeRoom = null;
        }

        cht.toggle = () => {
            cht.isOpen = !cht.isOpen;
            if (cht.isOpen) {
                scrollToBottom();
            }
        }

        cht.onKeypress = (event) => {
            if (!_shiftKeyPressed && event.charCode == 13) {
                cht.send();
                event.preventDefault();
            }
        }

        cht.onKeydown = ($event) => {
            if ($event.shiftKey) {
                _shiftKeyPressed = true;
            }
        }

        cht.onFocus = () => {
            _shiftKeyPressed = false;
        }

        cht.onKeyup = ($event) => {
            if ($event.shiftKey) {
                _shiftKeyPressed = false;
            }
        }

        cht.send = async function () {
            if (!cht.isBusy && (cht.text || _filesToUpload.length > 0)) {
                var message = {
                    text: cht.text,
                    isSender: true,
                    chatId: cht.activeRoom.chatId,
                    isSending: true,
                    type: cht.activeRoom.type,
                    mediaCollection: []
                };
                var proceed = true;
                cht.isBusy = true;
                if (_filesToUpload.length > 0) {
                    await drbblyFileService.upload(_filesToUpload, 'api/Multimedia/Upload')
                        .then(result => {
                            var files = result.data;
                            message.mediaCollection = files.drbblySelect(media => {
                                media.mediaId = media.id;
                                return media;
                            });
                        })
                        .catch(error => {
                            proceed = false;
                            message.isFailed = true;
                        });
                }

                if (!proceed) return;

                cht.text = '';
                cht.activeRoom.messages.push(message); // add temporarily to show the status
                reset();
                scrollToBottom();

                if (cht.activeRoom.isTemporary) {
                    message.chatId = null;
                    drbblyChatsService.createChat(cht.activeRoom)
                        .then(result => {
                            // now we can remove it as the signalR subscriber
                            // will add the actual message it received from the server
                            cht.activeRoom.messages.drbblyRemove(message);
                        })
                        .catch(err => {
                            message.isSending = false;
                            message.isFailed = true;
                            // TODO: handle properly
                        })
                        .finally(() => cht.isBusy = false);
                }
                else {
                    drbblyChatsService.sendMessage(message)
                        .then(result => {
                            // now we can remove it as the signalR subscriber
                            // will add the actual message it received from the server
                            cht.activeRoom.messages.drbblyRemove(message);
                        })
                        .catch(err => {
                            message.isSending = false;
                            message.isFailed = true;
                            // TODO: handle properly
                        })
                        .finally(() => cht.isBusy = false);
                }
            }
        }

        cht.inView = (message, isInView) => {
            if (message.chatId && isInView && !message.isSender && message.status == cht.messageRecipientStatusEnum.NotSeen) {
                drbblyChatsService.markMessageAsSeen(message.chatId, message.messageId)
                    .then(unviewedCount => {
                        cht.activeRoom.unviewedCount = unviewedCount;
                        message.status = cht.messageRecipientStatusEnum.Seen;
                        updateTotalUnviewedCount();
                    })
                    .catch(err => {
                        // TODO: handle properly
                    });
            }
        }

        function scrollToBottom() {
            if (cht.isOpen && cht.activeRoom) {
                $timeout(() => {
                    var messagesElement = $element.find('.messages')[0];
                    var unseenChats = angular.element(messagesElement).find('.unseen');
                    if (unseenChats.length > 0) {
                        var topUnseen = unseenChats[0];
                        if (topUnseen) {
                            messagesElement.scrollTop = topUnseen.offsetTop - 450;
                            return;
                        }
                    }
                    messagesElement.scrollTop = messagesElement.scrollHeight;
                });
            }
        }

        function updateTotalUnviewedCount() {
            cht.totalUnviewedCount = 0;
            cht.rooms.forEach(room => {
                cht.totalUnviewedCount = cht.totalUnviewedCount + room.unviewedCount;
            });
        }
    }
})();
