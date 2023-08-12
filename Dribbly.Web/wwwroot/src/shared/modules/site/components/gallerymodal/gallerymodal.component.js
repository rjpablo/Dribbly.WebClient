(function () {
    'use strict';

    angular.module('siteModule')
        .component('drbblyGallerymodal', {
            bindings: {
                /**
                 * {
                 *  buttons: [{
                 *      text: 'the text to be displayed',
                 *      class: 'class name that will be added to the button. The button will have 'btn' class by default',
                 *      iconClass: 'the fa-* class name for the button icon. If not defined, no icon will be displayed',
                 *      action: function //the callback function that will be executed when the button is clicked,
                 *      data: [any] //the data that will be passed to the callback function,
                 *      isHidden: [function] //a boolean function that returns whether or not to hide the button
                 *  }],
                 *  title: [string], //the title of the modal
                 * }
                 * */
                model: '<',
                context: '<',
                options: '<'
            },
            controllerAs: 'mmc',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['$scope', 'modalService', 'drbblyEventsService', 'constants', 'drbblyOverlayService'];
    function controllerFn($scope, modalService, drbblyEventsService, constants, drbblyOverlayService) {
        var mmc = this;

        mmc.$onInit = function () {
            mmc.overlay = drbblyOverlayService.buildOverlay();
            mmc.foulPlayerOptions = [mmc.model.performedBy];
            mmc.foulTypeOptions = constants.Fouls;
            mmc.saveModel = angular.copy(mmc.model, {});
            mmc.context.setOnInterrupt(mmc.onInterrupt);
            drbblyEventsService.on('modal.closing', function (event, reason, result) {
                if (!mmc.context.okToClose) {
                    event.preventDefault();
                    mmc.onInterrupt();
                }
            }, $scope);
        };

        mmc.onItemClicked = function (btn) {
            btn.action(btn.data);
            close(btn);
        };

        mmc.onInterrupt = function (reason) {
            mmc.context.okToClose = true;
            mmc.context.dismiss(reason);
        };

        function close(result) {
            mmc.context.okToClose = true;
            mmc.context.submit(result);
        }

        mmc.cancel = function () {
            mmc.onInterrupt('cancelled');
        };
    }
})();
