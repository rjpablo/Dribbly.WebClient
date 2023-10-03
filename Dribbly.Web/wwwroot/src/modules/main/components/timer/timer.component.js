(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyTimer', {
            bindings: {
                remainingTime: '<',
                onReady: '<',
                onUpdate: '<',
                onStop: '<',
                onEditted: '<',
                autoStart: '<',
                showControls: '<',
                label: '<',
                // a DateTime that will be set as when the timer started running
                startOverride: '<',
                isShotClock: '<',
                // whether or not to toggle the timer when it is clicked
                toggleOnClick: '<',
                fontSize: '<',
                // activate warning state when time left is equal or less than this value
                warningStateThresholdSeconds: '<'
            },
            controllerAs: 'dtc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['$interval', 'drbblyTimerhelperService', 'modalService', '$element'];
    function controllerFunc($interval, drbblyTimerhelperService, modalService, $element) {
        var dtc = this;
        var _gameId;
        var _periodDuration

        dtc.$onInit = function () {
            if (dtc.isShotClock) {
                $element.addClass('shot-clock');
            }
            dtc.timer = new BadTimer();
            dtc.timer.onUpdate(dtc.onUpdate);
            dtc.timer.onStop(dtc.onStop);
            dtc.timer.onStart(dtc.onStart);
            dtc.timer.onEditted(dtc.onEditted);
            dtc.timer._onEdit(edit);
            if (dtc.autoStart) {
                dtc.timer.run(dtc.startOverride || new Date(), dtc.remainingTime);
                displayTime(dtc.remainingTime);
            }
            dtc.onReady(dtc.timer)

        };

        function edit() {
            return modalService.show({
                view: '<drbbly-editclockmodal></drbbly-editclockmodal>',
                model: {
                    duration: dtc.timer.remainingTime,
                    isShotClock: dtc.isShotClock
                }
            })
                .then(function (result) {
                    function commit() {
                        dtc.timer.setRemainingTime(result.totalMs);
                    }
                    if (dtc.timer.onEdittedCallback) {
                        dtc.timer.onEdittedCallback(result, commit);
                    }
                    else {
                        commit();
                    }
                })
        }

        function displayTime(duration) {
            dtc.time = drbblyTimerhelperService.breakupDuration(duration, dtc.isShotClock).formattedTime;
        }

        dtc.clicked = function () {
            if (dtc.toggleOnClick) {
                dtc.timer.toggle();
            }
        }

        dtc.isWarning = function () {
            return dtc.warningStateThresholdSeconds &&
                (dtc.timer.remainingTime <= dtc.warningStateThresholdSeconds * 1000)
        };

        dtc.isPaused = function () {
            return !dtc.timer.isRunning() && !dtc.timer.isOver() && dtc.timer.hasStarted;
        }

        class BadTimer {
            duration = 0;
            running = false;
            constructor() { }
            /**
             * Use this to set the duration the timer will reset to
             */
            init(duration) {
                this.origDuration = duration;
                this.duration = duration;
                displayTime(this.duration);
            }
            setRemainingTime(duration, start, suppressEvents) {
                if (this.running) {
                    this.stop({ suppressEvents: suppressEvents });
                }
                this.duration = duration;
                displayTime(this.duration);
                if (start) {
                    this.start({ suppressEvents: suppressEvents });
                }
            }
            start(data) {
                if (this.duration === 0) return;
                data = data || {};
                if (!this.running) {
                    this._startedAt = new Date();
                    if (data.suppressEvents || !this.onStartCallback || this.onStartCallback(this.duration)) {
                        this.run(this._startedAt, this.duration);
                        if (!data.suppressEvents && this.onStartedCallback) {
                            this.onStartedCallback();
                        }
                    }
                }
            }
            run(start, startDuration, suppressEvents) {
                this._startedAt = start;
                var proceed = suppressEvents || !this.onRunCallback || this.onRunCallback(this.duration);
                if (proceed) {
                    if (this.timerInterval) {
                        $interval.cancel(this.timerInterval);
                    }
                    this.running = true;
                    var _this = this;
                    this.timerInterval = $interval(function () {
                        if (_this.isRunning) {
                            var now = new Date();
                            _this.duration = startDuration - (now - start);
                            if (_this.duration <= 0) {
                                _this.duration = 0;
                                if (_this.onEndCallback) {
                                    _this.onEndCallback();
                                }
                                _this.stop();
                            }
                            displayTime(_this.duration);
                            if (!suppressEvents && _this.onUpdateCallback) {
                                _this.onUpdateCallback(_this.duration);
                            }
                        }
                    }, 100);
                }
            }
            onUpdate(cb) {
                this.onUpdateCallback = cb;
            }
            onEnd(cb) {
                this.onEndCallback = cb;
            }
            onStop(cb) {
                this.onStopCallback = cb;
            }
            onStart(cb) {
                this.onStartCallback = cb;
            }
            onStarted(cb) {
                this.onStartedCallback = cb;
            }
            onEditted(cb) {
                this.onEdittedCallback = cb;
            }
            onReset(cb) {
                this.onResetCallback = cb;
            }
            _onEdit(cb) {
                this.onEditCallback = cb;
            }
            onRun(cb) {
                this.onRunCallback = cb;
            }
            /**
             * Reset the timer to the original duration
             */
            reset() {
                if (this.running) {
                    this.stop();
                }
                this.duration = this.origDuration;
                displayTime(this.duration);
                if (this.onResetCallback) {
                    this.onResetCallback();
                }
            }
            stop(data) {
                data = data || {};
                this.running = false;
                if (this.timerInterval) {
                    $interval.cancel(this.timerInterval);
                }
                if (!data.suppressEvents && this.onStopCallback) {
                    this.onStopCallback();
                }
            }
            isRunning() {
                return this.running;
            }
            isOver() {
                return this.duration === 0;
            }
            toggle() {
                if (this.running) {
                    this.stop();
                } else {
                    this.start();
                }
            }
            edit() {
                return this.onEditCallback();
            }
            get remainingTime() {
                return this.duration;
            }
            get hasStarted() {
                return this.duration !== this.origDuration;
            }
            get startedAt() {
                return this._startedAt
            }
        }
    }

})();
