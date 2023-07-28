(function () {
    'use strict';

    angular.module('siteModule')
        .service('modalService', ['$uibModal', '$rootScope', '$q', '$transitions',
            function ($uibModal, $rootScope, $q, transitions) {

                function _show(options) {
                    setDefaultOptions(options);
                    return $uibModal.open(options).result;
                }

                controllerFn.$inject = ['$uibModalInstance', '$transitions', '$location', '$urlRouter',
                    '$log', '$titleService'];
                function controllerFn($uibModalInstance, $transitions, $location, $urlRouter,
                    $log, $titleService) {
                    var mod = this;

                    mod.$onInit = function () {
                        mod.context.submit = submit;
                        mod.context.dismiss = dismiss;
                    };

                    function submit(result) {
                        unSub();
                        $uibModalInstance.close(result);
                    }

                    function dismiss(reason) {
                        unSub();
                        $uibModalInstance.dismiss(reason);
                        $titleService.setTitle();
                    }

                    var unSub = $transitions.onBefore({}, function (transition) {
                        if (mod.context.onInterrupt) {
                            var customOptions = transition.options().custom;
                            // setting the custom option `force` to true when navigating allows modal to close, skipping the validations
                            // e.g.
                            // $state.go('main.court.details',
                            //    { id: court.id },
                            //    { custom: { force: true } }
                            // );
                            if (customOptions && customOptions.force) {
                                mod.context.okToClose = true;
                                unSub();
                            }
                            else {
                                transition.abort();
                                $log.warn('transition aborted... modal is not cleared');
                                // We have to update document.title because it doesn't get updated
                                // when the transition is cancelled (but the browser shows the 'to'
                                // state's title). And the browser's title doesn't get updated
                                // until document.title gets assign a different value resulting to
                                // an incorrect title on the browser
                                $titleService.setTitle(transition.$to());
                                $location.url($urlRouter.location);
                            }
                            // Will cause mod.context.onInterrupt to run by publishing the 'modal.closing' event
                            // which is handled by the modal component
                            $uibModalInstance.dismiss('navigating');
                        }
                        else {
                            mod.context.okToClose = true;
                            unSub();
                            $uibModalInstance.dismiss('navigating');
                        }
                    });
                }

                function setDefaultOptions(modalOptions) {
                    modalOptions.ariaLabelledBy = 'modal-title';
                    modalOptions.ariaDescribedBy = 'modal-body';
                    modalOptions.template = modalOptions.view.replace('><', ' model="mod.model" options="mod.options" context="mod.context"><');
                    modalOptions.controller = controllerFn;
                    modalOptions.controllerAs = 'mod';
                    modalOptions.bindToController = true;
                    modalOptions.keyboard = true;
                    //Fix for: modal and  backdrop not showing
                    modalOptions.windowClass = 'show' + (modalOptions.isFull? ' drbbly-full-modal' : '');
                    modalOptions.backdropClass = 'show';

                    if (modalOptions.container) {
                        modalOptions.appendTo = modalOptions.container;
                        modalOptions.container.addClass('position-relative');
                        modalOptions.windowClass += ' has-container ';
                    }

                    modalOptions.handleDismiss = function (reason) {
                        if (modalOptions.onInterrupt) {
                            modalOptions.onInterrupt();
                        }
                        else {
                            throw new Error('context.onInterrupt is not defined');
                        }
                    };

                    var scope = $rootScope.$new();
                    scope.model = modalOptions.model || {};
                    scope.options = modalOptions.options || {};
                    scope.context = {
                        setOnInterrupt: function (handler) {
                            scope.context.onInterrupt = handler;
                        }
                    };
                    modalOptions.scope = scope;
                }

                function showUnsaveChangesWarning() {
                    return confirm('site.UnsavedChangesWarningMessage');
                }

                function alert(msg1Key, msg2Key, titleKey, msg1Raw, msg2Raw, titleRaw) {
                    if (angular.isObject(msg1Key)) {
                        msg1Key.options = {
                            buttonsPreset: 'OkOnly'
                        };
                        return _show({
                            view: '<drbbly-alertmodal></drbbly-alertmodal>',
                            model: msg1Key,
                            backdrop: 'static'
                        });
                    }
                    else {
                        return _show({
                            view: '<drbbly-alertmodal></drbbly-alertmodal>',
                            model: {
                                msg1Key: msg1Key,
                                msg2Key: msg2Key,
                                titleKey: titleKey,
                                msg1Raw: msg1Raw,
                                msg2Raw: msg2Raw,
                                titleRaw: titleRaw,
                                options: {
                                    buttonsPreset: 'OkOnly'
                                }
                            },
                            backdrop: 'static'
                        });
                    }
                }

                function input(data) {
                    data.view = '<drbbly-inputmodal></drbbly-inputmodal>';
                    data.backdrop = 'static';
                    return _show(data);
                }

                function showMenuModal(config) {
                    config.view = '<drbbly-menumodal></drbbly-menumodal>';
                    if (config.backdrop === undefined || config.backdrop === null) {
                        config.backdrop = 'static';
                    }
                    return _show(config)
                }

                function confirm(msg1Key, msg2Key, titleKey, buttonsPreset, msg1Raw, msg2Raw, titleRaw) {
                    if (angular.isObject(msg1Key)) {
                        msg1Key.options = {
                            buttonsPreset: buttonsPreset || 'YesNo'
                        };
                        return _show({
                            view: '<drbbly-alertmodal></drbbly-alertmodal>',
                            model: msg1Key,
                            backdrop: 'static'
                        });
                    }
                    else {
                        return _show({
                            view: '<drbbly-alertmodal></drbbly-alertmodal>',
                            model: {
                                msg1Key: msg1Key,
                                msg2Key: msg2Key,
                                titleKey: titleKey,
                                msg1Raw: msg1Raw,
                                msg2Raw: msg2Raw,
                                titleRaw: titleRaw,
                                options: {
                                    buttonsPreset: buttonsPreset || 'YesNo'
                                }
                            },
                            backdrop: 'static'
                        });
                    }
                }

                function showGenericErrorModal() {
                    return alert('app.Error_Common_GenericErrorHeader', 'app.Error_Common_GenericErrorDetails');
                }

                function showOptionsList(data) {
                    return _show({
                        view: '<drbbly-optionsmodal></drbbly-optionsmodal>',
                        model: {
                            items: data.items
                        },
                        size: 'dialog-centered p-1'
                    });
                }

                var service = {
                    show: _show,
                    alert: alert,
                    error: alert, // TODO: add separate configuration for error
                    input: input,
                    confirm: confirm,
                    showGenericErrorModal: showGenericErrorModal,
                    showMenuModal: showMenuModal,
                    showOptionsList: showOptionsList,
                    showUnsavedChangesWarning: showUnsaveChangesWarning
                };

                return service;
            }]);

})();
