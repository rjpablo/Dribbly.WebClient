(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyCourtsContainer', {
            bindings: {
                app: '<'
            },
            controllerAs: 'dcc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyCourtsService', '$element', 'drbblyToolbarService', 'drbblyCourtshelperService',
        'drbblyOverlayService', '$timeout', '$state', 'modalService'];
    function controllerFunc(drbblyCourtsService, $element, drbblyToolbarService, drbblyCourtshelperService,
        drbblyOverlayService, $timeout, $state, modalService) {
        var dcc = this;

        dcc.$onInit = function () {
            $element.addClass('drbbly-courts-container');
            dcc.courtsListOverlay = drbblyOverlayService.buildOverlay();
            loadCourts();
            $timeout(setToolbarItems, 100); //using timetout to wait for toolbar to initialized
        };

        function loadCourts() {
            dcc.courtsListOverlay.setToBusy();
            drbblyCourtsService.getAllCourts()
                .then(function (data) {
                    dcc.courts = data;
                    dcc.courtsListOverlay.setToReady();
                })
                .catch(dcc.courtsListOverlay.setToError);
        }

        function setToolbarItems() {
            var buildItem = drbblyToolbarService.buildItem;
            drbblyToolbarService.setItems([
                {
                    iconClass: 'fa fa-plus',
                    action: dcc.addCourt
                }, buildItem('fa fa-search', toggleSearch)
            ]);
        }

        dcc.beginSearch = function () {
            modalService.show({
                view: '<drbbly-searchmodal></drbbly-searchmodal>',
                model: { },
                isFull: true
            })
                .then(function () { /*do nothing*/ })
                .catch(function () { /*do nothing*/ });
        };

        dcc.addCourt = function() {
            drbblyCourtshelperService.registerCourt()
                .then(function (court) {
                    if (court) {
                        $state.go('main.court.details', { id: court.id });
                    }
                })
                .catch(function () {
                    // Court registration cancelled. Do nothing
                });
        }

        function toggleSearch() {
            console.log('toggleSearch');
        }
    }
})();
