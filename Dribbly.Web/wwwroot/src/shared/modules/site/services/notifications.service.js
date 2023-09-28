(function () {
    'use strict';

    angular.module('siteModule')
        .service('drbblyNotificationsService', ['$timeout', 'drbblyhttpService', '$q', '$filter',
            'drbblyDatetimeService', 'authService', 'settingsService',
            function ($timeout, drbblyhttpService, $q, $filter,
                drbblyDatetimeService, authService, settingsService) {
                var api = 'api/notifications/';
                var _unviewedNotifications = [];
                var _newNotificationsListeners = [];
                var _unviewedCountChangedListeners = [];
                var _isRunning;
                var _unviewedCount;
                var _hub;
                var _listeners = {};
                var _connection;

                // #region Hub Configuration
                function initializeHub() {
                    _connection = $.hubConnection();
                    _hub = _connection.createHubProxy(settingsService.notificationsHubName);
                    _connection.url = settingsService.serviceBase + 'signalr';

                    _hub.on('receiveNotification', notif => {
                        _unviewedCount.count++;
                        notifyUnviewedCountListeners(_unviewedCount.count);
                        massageNotifications([notif]);
                        broadcast('notificationReceived', notif);
                    });

                    _connection.reconnecting(function () {
                        broadcast('reconnecting');
                    });

                    _connection.reconnected(function () {
                        broadcast('reconnected');
                        joinPersonalHub();
                    });

                    _connection.disconnected(function () {
                        broadcast('disconnected');
                        $timeout(function () {
                            _connection.start()
                                .done(function () {
                                    broadcast('reconnected');
                                    joinPersonalHub();
                                })
                                .fail(function (err) {
                                    console.log('Could not re-establish connection!');
                                });
                        }, 5000); // Restart connection after 5 seconds.
                    });

                    _connection.start()
                        .done(function () {
                            broadcast('connected');
                            joinPersonalHub();
                        })
                        .fail(function (err) {
                            broadcast('connectionFailed');
                        });
                }

                function joinPersonalHub() {
                    _hub.invoke('joinGroup', _connection.id, authService.authentication.accountId);
                }
                // #endregion Hub Configuration

                // updates the number in the tool bar that indicates the number of unread notifications
                function getUnviewedCount() {

                    if (!authService.authentication.isAuthenticated) {
                        _isRunning = false;
                    }

                    if (!_isRunning) {
                        return $q.resolve();
                    }

                    return drbblyhttpService.get(api + 'getUnviewedCount', {triggersLogin: false})
                        .then(function (data) {
                            updateUnviewedCount(data);
                        }, function () {
                            // TODO: Log error?
                        });
                }

                function setIsViewed(item, isViewed) {
                    return drbblyhttpService.post(api + 'setIsViewed/' + item.id + '/' + isViewed)
                        .then(function (data) {
                            updateUnviewedCount(data);
                        });
                }

                function onUnviewedCountChanged(listener) {
                    _unviewedCountChangedListeners.push(listener);

                    // return a function that can be used to remove this listener
                    return function () {
                        _unviewedCountChangedListeners.drbblyRemove(listener);
                    }
                }

                function updateUnviewedCount(data) {
                    _unviewedCount = data;
                    notifyUnviewedCountListeners(_unviewedCount.count);
                }

                function notifyUnviewedCountListeners(unviewedCount) {
                    broadcast('unviewedCountChanged', unviewedCount);
                }

                function getDetailedNotifications(beforeDate, loadCount = 2) {
                    return getNotificationDetails(loadCount, beforeDate);
                }

                function monitorNotifications() {
                    getUnviewed().finally(function () {
                        if (_isRunning) {
                            $timeout(monitorNotifications, 10000);
                        }
                    });
                }

                function getNotificationDetails(getCount, beforeDate) {
                    return drbblyhttpService.post(api + 'getNoficationDetails/' + getCount, beforeDate)
                        .then(notifs => {
                            return massageNotifications(notifs)
                        });
                }

                //updates the notification items in the notifications widget while it is open
                function monitorNewNotifications(afterDate, callback) {
                    var isRunning = true;
                    var notifications;
                    monitor();

                    function monitor() {
                        if (isRunning) {
                            drbblyhttpService.post(api + 'getNewNofications/', afterDate)
                                .then(function (result) {
                                    if (result && result.notifications.length > 0) {
                                        massageNotifications(result.notifications);
                                        notifications = $filter('orderBy')(result.notifications, 'dateAdded', true);
                                        afterDate = drbblyDatetimeService.toUtcDate(notifications[0].dateAdded);
                                        updateUnviewedCount(result.unviewedCount);
                                        callback(notifications);
                                    }
                                    $timeout(monitor, 10000);
                                })
                                .catch(function (error) {
                                    throw error;
                                });
                        }
                    }

                    return function () {
                        isRunning = false;
                    };
                }

                function massageNotifications(notifications) {
                    notifications.forEach(n => {
                        if (n.additionalInfo) {
                            n.additionalInfo = JSON.parse(n.additionalInfo);
                        }
                    })
                    return notifications;
                }

                function start() {
                    if (!_isRunning
                        && !settingsService.suppressNotifications // TODO: remove upon deployment
                    ) {
                        _unviewedNotifications = [];
                        _isRunning = true;
                        initializeHub();
                    }
                }

                function addNewNotificationsListener(listener) {
                    _newNotificationsListeners.push(listener);

                    // return a function that can be used to remove this listener
                    return function () {
                        _newNotificationsListeners.drbblyRemove(listener);
                    }
                }

                function getAllFetched() {
                    return _unviewedNotifications;
                }

                function stop() {
                    _isRunning = false;
                }

                function on(eventName, callback) {
                    if (!_listeners[eventName]) {
                        _listeners[eventName] = [];
                    }
                    var group = _listeners[eventName];
                    group.push(callback);
                    return function () {
                        group.drbblyRemove(callback);
                    }
                }

                function broadcast(eventName, data) {
                    var group = _listeners[eventName];
                    if (group) {
                        angular.forEach(group, listener => listener(data));
                    }
                }

                var _service = {
                    getAllFetched: getAllFetched,
                    getDetailedNotifications: getDetailedNotifications,
                    getNotificationDetails: getNotificationDetails,
                    getUnviewedCount: getUnviewedCount,
                    addNewNotificationsListener: addNewNotificationsListener,
                    massageNotifications: massageNotifications,
                    monitorNewNotifications: monitorNewNotifications,
                    on: on,
                    onUnviewedCountChanged: onUnviewedCountChanged,
                    setIsViewed: setIsViewed,
                    start: start,
                    stop: stop
                };
                return _service;
            }]);

})();