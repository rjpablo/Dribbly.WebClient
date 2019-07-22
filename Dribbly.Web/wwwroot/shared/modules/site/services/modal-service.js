(function () {
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
                options.template = options.view.replace('><', ' model="mod.model" context="mod.context"><');
                options.controller = controllerFn;
                options.controllerAs = 'mod';
                options.bindToController = true;
                //Fix for: modal and  backdrop not showing
                options.windowClass = 'show';
                options.backdropClass = 'show';

                var scope = $rootScope.$new();
                scope.model = options.model;
                options.scope = scope;
            }

            this.show = _show;

            return this;
        }]);

})();
