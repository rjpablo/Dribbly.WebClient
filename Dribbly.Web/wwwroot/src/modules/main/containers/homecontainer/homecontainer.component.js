(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyHomeContainer', {
            bindings: {
                app: '<'
            },
            controllerAs: 'dhc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['constants', 'drbblyToolbarService', 'drbblyCommonService', 'drbblyAccountsService',
        'drbblyOverlayService', '$timeout'];
    function controllerFunc(constants, drbblyToolbarService, drbblyCommonService, drbblyAccountsService,
        drbblyOverlayService, $timeout) {
        var dhc = this;

        dhc.$onInit = function () {
            dhc.topPlayersOverlay = drbblyOverlayService.buildOverlay();
            drbblyToolbarService.setItems([]);
            setInitialCarouselSettings();

            loadTopPlayers();
        };

        function loadTopPlayers() {
            dhc.topPlayersOverlay.setToBusy();
            drbblyAccountsService.getTopPlayers()
                .then(data => {
                    dhc.topPlayers = data;
                    $timeout(function () {
                        dhc.carouselSettings.enabled = true;
                        dhc.topPlayersOverlay.setToReady();
                    }, 300);
                })
                .catch(e => {
                    dhc.topPlayersOverlay.setToError();
                });
        }

        function setInitialCarouselSettings() {
            dhc.carouselSettings = {
                enabled: false,
                autoplay: true,
                autoplaySpeed: 3000,
                slidesToShow: 2,
                slidesToScroll: 1,
                draggable: true,
                mobileFirst: true,
                arrows: false,
                dots: true,
                method: {},
                responsive: [
                    {
                        breakpoint: constants.bootstrap.breakpoints.md,
                        settings: {
                            slidesToShow: 4,
                            arrows: true
                        }
                    },
                    {
                        breakpoint: constants.bootstrap.breakpoints.lg,
                        settings: {
                            slidesToShow: 5,
                            arrows: true
                        }
                    }
                ]
            };
        }
    }
})();
