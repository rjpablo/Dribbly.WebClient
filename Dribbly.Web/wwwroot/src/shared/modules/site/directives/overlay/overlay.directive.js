(function () {
    'use strict';

    angular.module('siteModule')
        .directive('drbblyOverlay', ['i18nService', '$timeout',
            function (i18nService, $timeout) {

                var _errorMsg = i18nService.getString('site.OverlayErrorMsg');
                var _busyMessage = i18nService.getString('site.OverlayBusyMsg');

                function linkFunc(scope, element, attrs, ctrl) {
                    var ovl = ctrl;

                    scope.$watch('ovl.options', function (newValue, oldValue) {
                        if (ovl.overlay) {
                            update();
                        }
                    }, true);

                    scope.$watch('ovl.overlay._status', function (newValue, oldValue) {
                        //if switching it off (not just establishing it), then paint on the next cycle
                        //to allow other events to finish up before removing the overlay
                        var switchingOff = !newValue && oldValue;
                        update(switchingOff);
                    });

                    function turnOff() {
                        element.removeClass('overlay-target');
                        changeIsVisible(false);
                    }

                    //This is cheaper than a $watch, that's why!!
                    function changeIsVisible(newValue) {
                        var oldValue = ovl.isVisible || false; //"not set" is same as "false"
                        ovl.isVisible = newValue;

                        //Why should consumers not bind to xxx.overlay directly for hiding and showing other content?
                        //Because .overlay is what you WANT to happen.  It is the instruction.
                        //What actually happens and when it happens may be delayed.
                        if (ovl.options && ovl.options.onHideShow && oldValue !== newValue) {
                            ovl.options.onHideShow(newValue);
                        }
                    }

                    function update(switchingOff) {

                        element.addClass('overlay-target');
                        if (ovl.options && ovl.options.fill) {
                            element.addClass('fill');
                        }

                        if (!ovl.overlay._status) {
                            if (switchingOff) {
                                $timeout(function () {
                                    //This could paint very fast.
                                    //So, modify on the next "turn" so that other things 
                                    //(like rendering of kendo widgets) can happen first.
                                    turnOff();
                                });
                            }
                            else {
                                turnOff();
                            }
                            return;
                        }

                        //Why do we have two icons... why not just have one?
                        //Because IE + fa-spin has a weird bug:  If a icon is loaded off screen with fa-spin and then
                        //fa-spin is removed, IE won't remove the spinning.  It will keep spinning.  If you inspect it
                        //with F12 tools it will stop.  So it is just the UI not updating properly.
                        //We have tried various things with time outs, using jQuery instead of angular, etc.
                        //Nothing works.  So, we will keep two icons so that we don't have to remove fa-spin from the second.
                        var iconSizeClass = 'fa-4x';
                        if (ovl.options && ovl.options.iconSize === 'sm') {
                            iconSizeClass = 'fa-2x';
                        }
                        switch (ovl.overlay._status) {
                            case 'busy':
                                ovl.iconBusy = getItem('busyIcon', 'fa loader ' + iconSizeClass);
                                ovl.icon = 'ng-cloak';
                                ovl.msg = getMessage('busyMsg', _busyMessage);
                                break;
                            case 'error':
                                ovl.iconBusy = 'ng-cloak';
                                ovl.icon = getItem('errorIcon', 'fa fa-exclamation-triangle ' + iconSizeClass);
                                ovl.msg = getMessage('errorMsg', _errorMsg);
                                break;
                            default:
                                ovl.iconDefault = 'ng-cloak';
                                ovl.icon = getItem('defaultIcon', 'fa fa-question-circle ' + iconSizeClass);
                                ovl.msg = getMessage('defaultMsg', '...');
                                break;
                        }

                        changeIsVisible(true);
                    }

                    function getMessage(item, itemDefault) {
                        if (ovl.overlay.msgOverride === null || ovl.overlay.msgOverride === undefined) {
                            return getItem(item, itemDefault);
                        }
                        return ovl.overlay.msgOverride;
                    }

                    function getItem(item, itemDefault) {
                        if (ovl.options) {
                            if (ovl.options[item]) {
                                return ovl.options[item];
                            }
                        }
                        return itemDefault;
                    }

                }

                function controllerFunc() {
                    var ovl = this;
                }

                return {
                    controllerAs: 'ovl',
                    bindToController: true,
                    restrict: 'A',
                    transclude: true,
                    scope: {
                        overlay: '=drbblyOverlay',
                        options: '=options'
                    },
                    link: linkFunc,
                    templateUrl: '/src/shared/modules/site/directives/overlay/overlay.directive.html',
                    controller: controllerFunc
                };
            }]);
})();
