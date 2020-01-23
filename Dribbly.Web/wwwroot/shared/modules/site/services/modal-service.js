﻿(function () {
    'use strict';

    controllerFn.$inject = ['$uibModalInstance'];
    function controllerFn($uibModalInstance) {
        var mod = this;

        mod.context = {
            submit: submit,
            dismiss: dismiss
        };

        function submit(result) {
            $uibModalInstance.close(result);
        }

        function dismiss(reason) {
            $uibModalInstance.dismiss(reason);
        }
    }

    angular.module('siteModule')
        .service('modalService', ['$uibModal', '$rootScope', function ($uibModal, $rootScope) {

            function _show(options) {
                setDefaultOptions(options);
                return $uibModal.open(options).result;
            }

            function _test() {
                return $uibModal.open({
                    animation: true,
                    template: 'test Only',
                    size: 'sm'
                }).result;
            }

            function setDefaultOptions(options) {
                options.ariaLabelledBy = 'modal-title';
                options.ariaDescribedBy = 'modal-body';
                options.template = options.view.replace('><', ' model="mod.model" options="mod.options" context="mod.context"><');
                options.controller = controllerFn;
                options.controllerAs = 'mod';
                options.bindToController = true;
                //Fix for: modal and  backdrop not showing
                options.windowClass = 'show';
                options.backdropClass = 'show';

                var scope = $rootScope.$new();
                scope.model = options.model || {};
                scope.options = options.options;
                options.scope = scope;
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

            this.show = _show;
            this.alert = alert;
            this.confirm = confirm;

            return this;
        }]);

})();
