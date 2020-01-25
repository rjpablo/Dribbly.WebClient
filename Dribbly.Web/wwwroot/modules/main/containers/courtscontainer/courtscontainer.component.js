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

    controllerFunc.$inject = ['courtsService', '$element', 'drbblyToolbarService', 'drbblyCourtshelperService',
        'drbblyOverlayService', '$timeout'];
    function controllerFunc(drbblyCourtsService, $element, drbblyToolbarService, drbblyCourtshelperService,
        drbblyOverlayService, $timeout) {
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
                    action: addCourt
                }, buildItem('fa fa-search', toggleSearch)
            ]);
        }

        function addCourt() {
            drbblyCourtshelperService.registerCourt()
                .then(function () {
                    loadCourts();
                })
                .catch(function (reason) {
                    console.log('Court registration cancelled');
                });
        }

        function toggleSearch() {
            console.log('toggleSearch');
        }
    }
})();
