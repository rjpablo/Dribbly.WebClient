(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyBookingviewercontainer', {
            bindings: {
                app: '<'
            },
            controllerAs: 'gcc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyBookingsService', 'drbblyToolbarService',
        'drbblyOverlayService', '$stateParams', 'drbblyFooterService', '$scope', '$state'];
    function controllerFunc(drbblyBookingsService, drbblyToolbarService,
        drbblyOverlayService, $stateParams, drbblyFooterService, $scope, $state) {
        var gcc = this;
        var _bookingId;
        var _priceComponent;

        gcc.$onInit = function () {
            _bookingId = $stateParams.id;
            gcc.bookingDetailsOverlay = drbblyOverlayService.buildOverlay();
            loadBooking();
            buildSubPages();
        };

        function loadBooking() {
            gcc.bookingDetailsOverlay.setToBusy();
            drbblyBookingsService.getBooking(_bookingId)
                .then(function (data) {
                    gcc.booking = data;
                    gcc.bookingDetailsOverlay.setToReady();
                    createPriceComponent();
                })
                .catch(gcc.bookingDetailsOverlay.setToError);
        }

        gcc.onBookingUpdate = function () {
            loadBooking();
        };

        function createPriceComponent() {

            if (_priceComponent) {
                _priceComponent.remove();
            }

            _priceComponent = drbblyFooterService.addFooterItem({
                scope: $scope,
                template: '<drbbly-bookingprice booking="gcc.booking"></dribbly-bookingprice>'
            });
        }

        gcc.$onDestroy = function () {
            _priceComponent.remove();
            gcc.app.toolbar.clearNavItems();
        };

        function buildSubPages() {
            gcc.app.toolbar.setNavItems([
                {
                    textKey: 'app.Details',
                    targetStateName: 'main.booking.details',
                    targetStateParams: { id: _bookingId },
                    action: function () {
                        $state.go(this.targetStateName, this.targetStateParams);
                    }
                }
            ]);
        }
    }
})();
