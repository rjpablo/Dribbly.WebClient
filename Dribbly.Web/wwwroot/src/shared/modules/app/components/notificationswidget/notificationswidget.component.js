(function () {
    'use strict';

    angular.module('appModule')
        .component('drbblyNotificationswidget', {
            bindings: {
            },
            controllerAs: 'dnw',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['drbblyNotificationsService', '$filter', 'drbblyDatetimeService', '$timeout'];
    function controllerFn(drbblyNotificationsService, $filter, drbblyDatetimeService, $timeout) {
        var dnw = this;
        var _newNotificationListenerRemover;
        var _oldestLoadedDate; // The dateAdded property of the oldest notification that has been loaded

        dnw.$onInit = function () {
            dnw.allNotifs = [];
            dnw.unViewedCount = drbblyNotificationsService.getUnviewedCount();
            drbblyNotificationsService.onUnviewedCountChanged(function (unviewedCount) {
                dnw.unViewedCount = unviewedCount;
            });
        };

        function onNewNotifications(notifications) {
            dnw.allNotifs = notifications.concat(dnw.allNotifs);
        }

        dnw.onToggle = function (isOpen) {
            if (isOpen) {
                dnw.loadMore()
                    .then(function () {
                        var afterDate = dnw.allNotifs.length > 0 ?
                            new Date(drbblyDatetimeService.toUtcString(dnw.allNotifs[0].dateAdded)) :
                            drbblyDatetimeService.getUtcNow();
                        _newNotificationListenerRemover = drbblyNotificationsService.monitorNewNotifications(afterDate, onNewNotifications);
                    });
            }
            else {
                removeNewNotificationListener();
                clearData();
            }
        };

        function clearData() {
            _oldestLoadedDate = null;
            dnw.allNotifs.length = 0;
            dnw.enableInfiniteScrolling = false;
        }

        function removeNewNotificationListener() {
            if (_newNotificationListenerRemover) {
                _newNotificationListenerRemover.call();
                _newNotificationListenerRemover = null;
            }
        }

        dnw.loadMore = function (isFromInfiniteScroll) {

            if (isFromInfiniteScroll && !dnw.enableInfiniteScrolling) return;

            dnw.isBusy = true;
            dnw.enableInfiniteScrolling = false;
            return drbblyNotificationsService.getDetailedNotifications(_oldestLoadedDate, 6)
                .then(function (data) {
                    dnw.isBusy = false;
                    if (data && data.length) {
                        data = $filter('orderBy')(data, 'dateAdded', true);
                        _oldestLoadedDate = drbblyDatetimeService.toUtcDate(data[data.length - 1].dateAdded);
                        dnw.allNotifs = dnw.allNotifs.concat(data);
                    }
                    dnw.enableInfiniteScrolling = true;
                }, function () {
                    dnw.isBusy = false;
                    dnw.enableInfiniteScrolling = true;
                    // TODO: Log error?
                });
        };

        dnw.inView = function (item, inView) {
            if (!item.isViewed && inView) {
                drbblyNotificationsService.setIsViewed(item, true)
                    .then(function () {
                        item.isViewed = true;
                    }, function () {
                        console.log('setIsViewed Failed');
                    });
            }
        };

        dnw.$onDestroy = function () {
            removeNewNotificationListener();
        };
    }
})();
