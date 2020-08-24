(function () {
    'use strict';

    angular
        .module('appModule')
        .component('drbblyNearbycourts', {
            bindings: {
            },
            controllerAs: 'dcc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyCourtsService', '$element', 'drbblyToolbarService', 'drbblyCourtshelperService',
        'drbblyOverlayService', '$timeout', '$state', 'modalService', 'constants', 'mapService'];
    function controllerFunc(drbblyCourtsService, $element, drbblyToolbarService, drbblyCourtshelperService,
        drbblyOverlayService, $timeout, $state, modalService, constants, mapService) {
        var dcc = this;

        dcc.$onInit = function () {
            dcc.courtsListOverlay = drbblyOverlayService.buildOverlay();
            setInitialCarouselSettings();
            loadNearbyCourts();
        };

        function setInitialCarouselSettings() {
            dcc.carouselSettings = {
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

        function loadNearbyCourts() {
            dcc.courtsListOverlay.setToBusy();
            mapService.getCurrentPosition(function (pos) {
                var currentPos = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                drbblyCourtsService.getAllCourts()
                    .then(function (data) {
                        dcc.nearbyCourts = data;
                        drbblyCourtshelperService.populateDistance(dcc.nearbyCourts, currentPos);
                        $timeout(function () {
                            dcc.carouselSettings.enabled = true;
                            dcc.courtsListOverlay.setToReady();
                        }, 300);
                    });
            }, function (res) {
                dcc.courtsListOverlay.setToError();
                console.log('Unable to get current location', res);
                //TODO: show error Unable to get current position
            });
        }

        dcc.featuredCourtClick = function (court) {
            dcc.carouselSettings.method.slickPause();
            modalService.show({
                view: '<drbbly-courtpreviewmodal></drbbly-courtpreviewmodal>',
                model: { court: court }
            })
                .finally(dcc.carouselSettings.method.slickPlay);
        };
    }
})();
