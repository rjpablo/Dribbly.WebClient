﻿(function () {
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

    controllerFunc.$inject = ['drbblyCourtsService', 'drbblyToolbarService', 'drbblyCourtshelperService',
        'drbblyOverlayService', '$stateParams', 'drbblyFooterService', '$scope', '$state'];
    function controllerFunc(drbblyCourtsService, drbblyToolbarService, drbblyCourtshelperService,
        drbblyOverlayService, $stateParams, drbblyFooterService, $scope, $state) {
        var dcc = this;
        var _courtId;
        var _priceComponent;

        dcc.$onInit = function () {
            _courtId = $stateParams.id;
            dcc.courtsDetailsOverlay = drbblyOverlayService.buildOverlay();
            loadCourt();
            buildSubPages();
        };

        function loadCourt() {
            dcc.courtsDetailsOverlay.setToBusy();
            drbblyCourtsService.getCourt(_courtId)
                .then(function (data) {
                    dcc.court = data;
                    dcc.courtsDetailsOverlay.setToReady();
                    createPriceComponent();
                })
                .catch(dcc.courtsDetailsOverlay.setToError);
        }

        dcc.onCourtUpdate = function () {
            loadCourt();
        };

        function createPriceComponent() {

            if (_priceComponent) {
                _priceComponent.remove();
            }

            _priceComponent = drbblyFooterService.addFooterItem({
                scope: $scope,
                template: '<drbbly-courtprice court="dcc.court"></dribbly-courtprice>'
            });
        }

        dcc.$onDestroy = function () {
            _priceComponent.remove();
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

        function buildSubPages() {
            dcc.subPages = [
                {
                    textKey: 'app.Details',
                    targetStateName: 'main.court.details',
                    targetStateParams: { id: _courtId },
                    action: function () {
                        $state.go(this.targetStateName, this.targetStateParams);
                    }
                },
                {
                    textKey: 'app.Photos',
                    targetStateName: 'main.court.photos',
                    targetStateParams: { id: _courtId }
                }
            ];
        }
    }
})();