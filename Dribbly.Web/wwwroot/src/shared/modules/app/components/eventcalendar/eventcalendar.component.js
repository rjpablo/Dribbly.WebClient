﻿

(function () {
    'use strict';

    angular.module('appModule')
        .component('drbblyEventcalendar', {
            bindings: {
                courtId: '<',
                events: '<', // a collection of Event objects to display on the calendar
                calendarOptionsOverride: '<' // an options objects that is used to override the default options
            },
            controllerAs: 'cal',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['drbblyCourtshelperService', '$rootScope', '$compile', '$scope', '$timeout'];
    function controllerFn(drbblyCourtshelperService, $rootScope, $compile, $scope, $timeout) {
        var cal = this;
        var _currentStartDate;
        var _currentEndDate;
        var _isHandlingOnSelect; // whether or not 'Select' event is already being handled. Prevents handling of dateClick event

        cal.$onInit = function () {
            cal.overrideEvent = true;
            cal.currentView = 'timeGridWeek';
            // For AngularJS FullCalendar
            cal.eveeventsForAngularnts = [getEvents()];
            cal.calendarOptions = Object.assign(getCalendarDefaultOptions(), cal.calendarOptionsOverride || {});
            cal.calendarOptions.events = null;
            cal.calendarOptions.themeSystem = 'bootstrap';
            cal.calendarOptions.defaultView = 'agendaWeek';
            //cal.calendarOptions.header.right = 'month basicWeek basicDay agendaWeek agendaDay';


            // For JQuery FullCalendar
            var calendarEl = document.getElementById('calendar');
            var options = Object.assign(getCalendarDefaultOptions(), cal.calendarOptionsOverride || {});
            cal.calendar = new FullCalendar.Calendar(calendarEl, options);
            cal.calendar.render();

            cal.goToDatePickerOptions = {
                startingDay: 0
            };

            $scope.$watch('cal.goToDate', function (newVal) {
                if (newVal && cal.isGoToCalendarOpen) {
                    cal.calendar.gotoDate(newVal);
                }
            });

        };

        function getCalendarDefaultOptions() {
            return {
                events: getEvents(),
                plugins: ['dayGrid', 'timeGrid', 'interaction'],
                header: false,
                //header: {
                //    right: 'dayGridMonth,timeGridWeek'
                //},
                defaultView: 'timeGridWeek',
                defaultDate: new Date(),
                allDaySlot: false, //function called when a user selects a slot or range of slots
                navLinks: false, // can click day/week names to navigate views
                eventLimit: true, // allow "more" link when too many events
                aspectRatio: 1,
                selectable: true, //user can select a slot or range of slots
                editable: false,
                // Event Callbacks
                eventClick: onEventClick,
                dateClick: onDateClick,
                select: onSelect,
                eventRender: function (eventObj, $el) {
                    var scope = $rootScope.$new();
                    scope.event = eventObj.event;
                    scope.event.isMirror = eventObj.isMirror;
                    scope.event.isStart = eventObj.isStart;
                    scope.event.isEnd = eventObj.isEnd;
                    var eventElement = $compile('<drbbly-timegridevent event="event"></drbbly-timegridevent>')(scope);
                    return eventElement[0];
                },
                datesRender: function (info) {
                    $timeout(function () {
                        _currentStartDate = info.view.currentStart;
                        _currentEndDate = info.view.currentEnd;
                        cal.goToDate = _currentStartDate;
                        cal.title = info.view.title;
                        cal.isTodayRendered = getIsDateRendered(new Date());
                        $scope.$apply();
                    });
                }
            };
        }

        function getIsDateRendered(dateObj) {
            var date = new Date(dateObj.toDateString());
            return !(date < _currentStartDate || date >= _currentEndDate);
        }

        // Calendar navigation buttons - Start

        cal.next = function () {
            cal.calendar.next();
        };

        cal.previous = function () {
            cal.calendar.prev();
        };

        cal.today = function () {
            cal.calendar.today();
        };

        // Calendar navigation buttons - End

        cal.changeView = function (view) {
            cal.currentView = view;
            cal.calendar.changeView(view);
        };

        function getEvents() {
            return cal.events || [];
        }

        function addEvent(event) {
            cal.calendar.addEvent(event);
            if (!getIsDateRendered(new Date(event.start))) {
                cal.calendar.gotoDate(event.start);
            }
        }

        // Calendar event handlers - Start

        function onEventClick(args) {
            var game = {
                id: args.event.id,
                start: args.event.start,
                end: args.event.end,
                title: args.event.title
            };
            game = Object.assign(game, args.extendedProps);

            drbblyCourtshelperService.openBookGameModal(game)
                .then(function (result) {
                    console.log(result);
                })
                .catch(function (error) {

                });
        }

        function onDateClick(args) {
            if (!_isHandlingOnSelect) {
                drbblyCourtshelperService.openBookGameModal({ start: args.date }, { isEdit: true })
                    .then(function (result) {
                        addEvent(result);
                    })
                    .catch(function (error) {
                        // do nothing for now
                    });
            }
        }

        function onSelect(args) {
            var game = {
                courtId: cal.courtId,
                start: args.start,
                end: args.end
            };

            _isHandlingOnSelect = true;

            drbblyCourtshelperService.openBookGameModal(game)
                .then(function (result) {
                    addEvent(result);
                    _isHandlingOnSelect = false;
                })
                .catch(function (error) {
                    _isHandlingOnSelect = false;
                });
        }

        // Calendar event handlers - End

        /********************
         *  REFERENCES:
         *  
         *  Event Object:       https://fullcalendar.io/docs/event-object 
         *  Calendar Options:   https://fullcalendar.io/docs/timegrid-view
         *  
        ********************/
    }
})();
