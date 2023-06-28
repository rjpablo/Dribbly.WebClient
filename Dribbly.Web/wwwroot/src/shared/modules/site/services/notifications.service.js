(function () {
    'use strict';

    angular.module('siteModule')
        .service('drbblyNotificationsService', ['$timeout', 'drbblyhttpService', '$q', '$filter',
            'drbblyDatetimeService', 'authService',
            function ($timeout, drbblyhttpService, $q, $filter,
                drbblyDatetimeService, authService) {
                var api = 'api/notifications/';
                var _unviewedNotifications = [];
                var _newNotificationsListeners = [];
                var _unviewedCountChangedListeners = [];
                var _isRunning;
                var _unviewedCount;
                var _newNotificationsStart;

                // updates the number in the tool bar that indicates the number of unread notifications
                function getUnviewed() {

                    if (!authService.authentication.isAuthenticated) {
                        _isRunning = false;
                    }

                    if (!_isRunning) {
                        return $q.resolve();
                    }

                    return drbblyhttpService.get(api + 'getUnviewedCount')
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
                    if (!_unviewedCount || (_unviewedCount.count !== data.count && _unviewedCount.asOf < data.asOf)) {
                        _unviewedCount = data;
                        notifyUnviewedCountListeners(_unviewedCount.count);
                    }
                }

                function notifyUnviewedCountListeners(unviewedCount) {
                    angular.forEach(_unviewedCountChangedListeners, function (listener) {
                        listener(unviewedCount);
                    });
                }

                function getUnviewedCount() {
                    return (_unviewedCount || {}).count;
                }

                function getDetailedNotifications(beforeDate, loadCount = 2) {
                    return getNotificationDetails(loadCount, beforeDate);
                }

                function notifyListeners(newItems) {
                    angular.forEach(_newNotificationsListeners, function (listener) {
                        listener(newItems);
                    });
                }

                function monitorNotifications() {
                    getUnviewed().finally(function () {
                        if (_isRunning) {
                            $timeout(monitorNotifications, 10000);
                        }
                    });
                }

                function getNotificationDetails(getCount, beforeDate) {
                    return drbblyhttpService.post(api + 'getNoficationDetails/' + getCount, beforeDate);
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

                function start() {
                    if (!_isRunning
                        && false // temporarily stop updates
                    ) {
                        _unviewedNotifications = [];
                        _isRunning = true;
                        monitorNotifications();
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

                var _service = {
                    getAllFetched: getAllFetched,
                    getDetailedNotifications: getDetailedNotifications,
                    getNotificationDetails: getNotificationDetails,
                    getUnviewedCount: getUnviewedCount,
                    addNewNotificationsListener: addNewNotificationsListener,
                    monitorNewNotifications: monitorNewNotifications,
                    onUnviewedCountChanged: onUnviewedCountChanged,
                    setIsViewed: setIsViewed,
                    start: start,
                    stop: stop
                };
                return _service;
            }]);

})();