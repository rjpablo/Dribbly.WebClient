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
                autoStart: '<',
                hideControls: '<',
                label:'<',
                startOverride: '<' // a DateTime that will be set as when the timer started running
            },
            controllerAs: 'dtc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['$interval'];
    function controllerFunc($interval) {
        var dtc = this;
        var _gameId;
        var _periodDuration

        dtc.$onInit = function () {
            dtc.timer = new BadTimer();
            dtc.timer.onUpdate(dtc.onUpdate);
            dtc.timer.onStop(dtc.onStop);
            dtc.timer.onStart(dtc.onStart);
            if (dtc.autoStart) {
                dtc.timer.run(dtc.startOverride || new Date(), dtc.remainingTime);
                displayTime(dtc.remainingTime);

            }
            dtc.onReady(dtc.timer)

        };

        function displayTime(duration) {
            var min = Math.floor(duration / 60000).toString();
            var sec = Math.floor((duration % 60000) / 1000).toString();
            var ms = Math.floor((duration % 1000) / 100).toString();
            dtc.time = '';
            if (min > 0) {
                dtc.time += `${min.padStart(2, '0')}:`;
            }
            dtc.time += `${sec.padStart(2, '0')}`;
            if (min === '0') {
                dtc.time += `.${ms}`;
            }
        }

        dtc.toggleClock = function () {
            dtc.timer.toggle();
        }

        class BadTimer {
            duration = 0;
            running = false;
            constructor() { }
            setRemainingTime(duration) {
                this.origDuration = duration;
                this.duration = duration;
                if (this.onUpdateCallback) {
                    this.onUpdateCallback(this.duration);
                }
                displayTime(this.duration);
            }
            start() {
                this.run(new Date(), this.duration)
                if (this.onStartCallback) {
                    this.onStartCallback();
                }
            }
            run(start, startDuration) {
                this.running = true;
                var _this = this;
                this.timerInterval = $interval(function () {
                    if (_this.isRunning) {
                        var now = new Date();
                        _this.duration = startDuration - (now - start);
                        if (_this.duration <= 0) {
                            _this.duration = 0;
                            _this.stop();
                        }
                        displayTime(_this.duration);
                        if (_this.onUpdateCallback) {
                            _this.onUpdateCallback(_this.duration);
                        }
                    }
                }, 100);
            }
            onUpdate(cb) {
                this.onUpdateCallback = cb;
            }
            onStop(cb) {
                this.onStopCallback = cb;
            }
            onStart(cb) {
                this.onStartCallback = cb;
            }
            reset(duration) {
                if (duration !== null && duration !== undefined) {
                    this.origDuration = duration;
                }
                this.duration = this.origDuration;
            }
            stop() {
                this.running = false;
                $interval.cancel(this.timerInterval);
                if (this.onStopCallback) {
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
            get remainingTime() {
                return this.duration;
            }
        }
    }

})();
