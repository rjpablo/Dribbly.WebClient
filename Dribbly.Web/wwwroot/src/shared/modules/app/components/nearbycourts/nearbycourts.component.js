(function () {
    'use strict';

    angular
        .module('appModule')
        .component('drbblyNearbycourts', {
            bindings: {
                referenceCoordinates: '<', // coordinate object with properties `latitude` and `longitude` to calculate distance. 
                excludedCourt: '<' // court to exclude from the list
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
            if (dcc.referenceCoordinates) {
                loadNearbyCourts(dcc.referenceCoordinates);
            }
            else {
                loadCourtsNearCurrentLocation();
            }
            setInitialCarouselSettings();
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

        function loadNearbyCourts(referencePoint) {
            dcc.courtsListOverlay.setToBusy();
            drbblyCourtsService.getAllCourts()
                .then(function (data) {
                    dcc.nearbyCourts = filterCourts(data);
                    drbblyCourtshelperService.populateDistance(dcc.nearbyCourts, referencePoint);
                    $timeout(function () {
                        dcc.carouselSettings.enabled = true;
                        dcc.courtsListOverlay.setToReady();
                    }, 300);
                });
        }

        function filterCourts(courts) {
            if (dcc.excludedCourt) {
                courts.drbblyRemove(court => court.id === dcc.excludedCourt.id);
            }
            return courts;
        }

        function loadCourtsNearCurrentLocation() {
            mapService.getCurrentPosition(function (pos) {
                loadNearbyCourts(pos.coords);
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
