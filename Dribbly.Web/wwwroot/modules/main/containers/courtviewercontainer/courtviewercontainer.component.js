(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyCourtviewercontainer', {
            bindings: {
                app: '<'
            },
            controllerAs: 'dcc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyCourtsService', '$element', 'drbblyToolbarService', 'drbblyCourtshelperService',
        'drbblyOverlayService', '$timeout', '$stateParams'];
    function controllerFunc(drbblyCourtsService, $element, drbblyToolbarService, drbblyCourtshelperService,
        drbblyOverlayService, $timeout, $stateParams) {
        var dcc = this;
        var _courtId;

        dcc.$onInit = function () {
            _courtId = $stateParams.id;
            dcc.courtsDetailsOverlay = drbblyOverlayService.buildOverlay();
            loadCourt();
        };

        function loadCourt() {
            dcc.courtsDetailsOverlay.setToBusy();
            drbblyCourtsService.getCourt(_courtId)
                .then(function (data) {
                    dcc.court = data;
                    dcc.courtsDetailsOverlay.setToReady();
                })
                .catch(dcc.courtsDetailsOverlay.setToError);
        }

        dcc.onCourtUpdate = function (court) {
            dcc.courtsDetailsOverlay.setToBusy();
            drbblyCourtsService.updateCourt(court)
                .then(function () {
                    dcc.court = court;
                })
                .finally(dcc.courtsDetailsOverlay.setToReady);
        };

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
