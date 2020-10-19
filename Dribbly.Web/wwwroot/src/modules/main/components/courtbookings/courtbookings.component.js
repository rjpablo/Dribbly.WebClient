(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyCourtbookings', {
            bindings: {
                app: '<'
            },
            controllerAs: 'cgc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyCourtsService', '$stateParams', '$timeout', 'drbblyCourtshelperService',
        'authService', 'drbblyOverlayService'];
    function controllerFunc(drbblyCourtsService, $stateParams, $timeout, drbblyCourtshelperService,
        authService, drbblyOverlayService) {
        var cgc = this;

        cgc.$onInit = function () {
            cgc.courtsListOverlay = drbblyOverlayService.buildOverlay();
            cgc.courtId = $stateParams.id;
            drbblyCourtsService.getCourtBookings(cgc.courtId)
                .then(function (events) {
                    cgc.bookings = massageEvents(events || []);
                    cgc.schedulerOptions = getSchedulerOptions(angular.copy(cgc.bookings));
                    cgc.courtsListOverlay.setToReady();
                })
                .catch(cgc.courtsListOverlay.setToError);
        };

        cgc.courtFilter = function (item) {
            return item.title.toLowerCase().indexOf((cgc.titleFilter || '').toLowerCase()) > -1;
        };

        function massageEvents(events) {
            return events.map(function (event) {
                event.text = event.title;
                event.dateAdded += 'Z';
                event.start += 'Z';
                event.end += 'Z';
                //event.editable = authService.authentication && authService.authentication.userId === event.addedBy;
                return event;
            });
        }

        function getSchedulerOptions(events) {
            return {
                events: events || [],
                config: {
                    startDate: new Date(),
                    viewType: "Week"
                },
                onEventClick: onEventClick,
                onTimeRangeSelected: onTimeRangeSelected
            };
        }

        // Scheduler Events Hanlders - START
        function onEventClick(args) {
            drbblyCourtshelperService.openBookingDetilsModal(args.e.data)
                .then(function (result) {
                    //redirect to booking details
                })
                .catch(function (error) {

                });
        }

        function onTimeRangeSelected(booking) {
            booking.start = new Date(booking.start.value);
            booking.end = new Date(booking.end.value);
            booking.courtId = cgc.courtId;
            drbblyCourtshelperService.openBookingDetilsModal(booking, { isEdit: false })
                .then(function (result) {
                    $timeout(function () {
                        cgc.scheduler.events.add(new DayPilot.Event({
                            start: new DayPilot.Date(result.start),
                            end: new DayPilot.Date(result.end),
                            id: result.id,
                            text: result.title
                        }));
                    });
                })
                .catch(function (error) {

                })
                .finally(cgc.scheduler.clearSelection);
        }
        // Scheduler Event Handlers - END
    }
})();
