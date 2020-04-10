(function () {
    'use strict';

    angular.module('siteModule')
        .service('modalService', ['$uibModal', '$rootScope', '$q', '$transitions',
            function ($uibModal, $rootScope, $q, transitions) {

                var _deferred;

                function _show(options) {
                    setDefaultOptions(options);
                    return $uibModal.open(options).result;
                }

                controllerFn.$inject = ['$uibModalInstance', '$transitions', '$location', '$urlRouter',
                    '$log', '$titleService', '$window'];
                function controllerFn($uibModalInstance, $transitions, $location, $urlRouter,
                    $log, $titleService, $window) {
                    var mod = this;

                    mod.$onInit = function () {
                        angular.element($window).on('beforeunload', onBeforeUnloadHandler);
                        mod.context.submit = submit;
                        mod.context.dismiss = dismiss;
                    };

                    function submit(result) {
                        unSub();
                        $uibModalInstance.close(result);
                    }

                    function dismiss(reason) {
                        unSub();
                        angular.element($window).off('beforeunload', onBeforeUnloadHandler);
                        $uibModalInstance.dismiss(reason);
                        $titleService.setTitle();
                    }

                    function onBeforeUnloadHandler() {
                        return 'Leave?';
                    }

                    var unSub = $transitions.onBefore({}, function (transition) {
                        if (mod.context.onInterrupt) {
                            var customOptions = transition.options().custom;
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
                                // and incorrect title on the browser
                                $titleService.setTitle(transition.$to());
                                $location.url($urlRouter.location);
                            }
                            $uibModalInstance.dismiss('navigating');
                        }
                        else {
                            throw new Error('context.onInterrupt is not defined');
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
                    modalOptions.windowClass = 'show';
                    modalOptions.backdropClass = 'show';

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
                            modalOptions.scope.context.onInterrupt = handler;
                        }
                    };
                    modalOptions.scope = scope;
                }

                function showUnsaveChangesWarning() {
                    return confirm('site.UnsavedChangesWarningMessage');
                }

                function alert(msg1Key, msg2Key, titleKey) {
                    return _show({
                        view: '<drbbly-alertmodal></drbbly-alertmodal>',
                        model: {
                            msg1Key: msg1Key,
                            msg2Key: msg2Key,
                            titleKey: titleKey,
                            options: {
                                buttonsPreset: 'OkOnly'
                            }
                        },
                        backdrop: 'static'
                    });
                }

                function confirm(msg1Key, msg2Key, titleKey, buttonsPreset) {
                    return _show({
                        view: '<drbbly-alertmodal></drbbly-alertmodal>',
                        model: {
                            msg1Key: msg1Key,
                            msg2Key: msg2Key,
                            titleKey: titleKey,
                            options: {
                                buttonsPreset: buttonsPreset || 'YesNo'
                            }
                        },
                        backdrop: 'static'
                    });
                }

                function showGenericErrorModal() {
                    return alert('app.Error_Common_GenericErrorHeader', 'app.Error_Common_GenericErrorDetails');
                }

                var service = {
                    show: _show,
                    alert: alert,
                    confirm: confirm,
                    showGenericErrorModal: showGenericErrorModal,
                    showUnsavedChangesWarning: showUnsaveChangesWarning
                };

                return service;
            }]);

})();
