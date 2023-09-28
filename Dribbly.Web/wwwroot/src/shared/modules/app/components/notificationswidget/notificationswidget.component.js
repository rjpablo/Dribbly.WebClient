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

    controllerFn.$inject = ['drbblyNotificationsService', '$filter', 'drbblyDatetimeService', '$timeout',
        'drbblyEventsService', 'authService'];
    function controllerFn(drbblyNotificationsService, $filter, drbblyDatetimeService, $timeout,
        drbblyEventsService, authService) {
        var dnw = this;
        var _oldestLoadedDate; // The dateAdded property of the oldest notification that has been loaded

        dnw.$onInit = function () {
            dnw.allNotifs = [];
            dnw.unViewedCount = 0; // drbblyNotificationsService.getUnviewedCount();
            if (authService.authentication && authService.authentication.isAuthenticated) {
                drbblyNotificationsService.start();
                drbblyNotificationsService.getUnviewedCount();
            }
            initializeHub();
            drbblyEventsService.on('dribbly.login.successful', () => {
                drbblyNotificationsService.start();
                drbblyNotificationsService.getUnviewedCount();
            });
        };

        function initializeHub() {

            drbblyNotificationsService.on('notificationReceived', notif => {
                $timeout(() => {
                    //TODO: preview notification?
                    if (dnw.isOpen) {
                        dnw.allNotifs.unshift(notif);
                    }
                });
            });

            drbblyNotificationsService.on('unviewedCountChanged', function (unviewedCount) {
                $timeout(() => dnw.unViewedCount = unviewedCount);
            });

            drbblyNotificationsService.on('reconnecting', function () {
                $timeout(() => dnw.isReconnecting = true);
            });

            drbblyNotificationsService.on('reconnected', function () {
                $timeout(() => dnw.isReconnecting = false);
            });

            drbblyNotificationsService.on('disconnected', function () {
                $timeout(() => dnw.isReconnecting = true);
            });

            drbblyNotificationsService.on('connected', function () {
                $timeout(() => dnw.hubIsConnecting = false);
            });
        }

        dnw.onToggle = function (isOpen) {
            dnw.isOpen = isOpen;
            if (isOpen) {
                dnw.loadMore();
            }
            else {
                clearData();
            }
        };

        function clearData() {
            dnw.noMoreItems = false;
            _oldestLoadedDate = null;
            dnw.allNotifs.length = 0;
            dnw.enableInfiniteScrolling = false;
        }

        dnw.loadMore = function (isFromInfiniteScroll) {

            if (dnw.noMoreItems || (isFromInfiniteScroll && !dnw.enableInfiniteScrolling)) return;

            dnw.isBusy = true;
            dnw.enableInfiniteScrolling = false;
            return drbblyNotificationsService.getDetailedNotifications(_oldestLoadedDate, 10)
                .then(function (data) {
                    dnw.isBusy = false;
                    if (data && data.length) {
                        data = $filter('orderBy')(data, 'dateAdded', true);
                        _oldestLoadedDate = drbblyDatetimeService.toUtcDate(data[data.length - 1].dateAdded);
                        dnw.allNotifs = dnw.allNotifs.concat(data);
                    }
                    dnw.noMoreItems = !data || data.length < 10;
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
        };
    }
})();
