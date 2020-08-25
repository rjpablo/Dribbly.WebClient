(function () {
    'use strict';

    angular
        .module('appModule')
        .component('drbblyNearbycourts', {
            bindings: {
                title: '@',
                initialItemCount: '<',
                referenceCoordinates: '<', // coordinate object with properties `latitude` and `longitude` to calculate distance. 
                excludedCourt: '<' // court to exclude from the list
            },
            controllerAs: 'dcc',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyCourtsService', 'drbblyCourtshelperService', '$filter',
        'drbblyOverlayService', '$timeout', 'modalService', 'constants', 'mapService'];
    function controllerFunc(drbblyCourtsService, drbblyCourtshelperService, $filter,
        drbblyOverlayService, $timeout, modalService, constants, mapService) {
        var dcc = this;

        dcc.$onInit = function () {
            dcc.courtsListOverlay = drbblyOverlayService.buildOverlay();
            if (dcc.referenceCoordinates) {
                loadNearbyCourts(dcc.referenceCoordinates);
            }
            else {
                loadCourtsNearCurrentLocation();
            }
            setCourtListSettings();
            setInitialCarouselSettings();
        };

        function setCourtListSettings() {
            dcc.courtListSettings = {
                loadSize: 6,
                initialItemCount: dcc.initialItemCount || 6
            };
        }

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
                    dcc.nearbyCourts = $filter('orderBy')(dcc.nearbyCourts, 'distance');
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
                dcc.locationAccessDenied = false;
                loadNearbyCourts(pos.coords);
            }, function (res) {
                // using $timeout to trigger another digest cycle and update the view
                $timeout(() => dcc.locationAccessDenied = true);
                console.log('Unable to get current location', res);
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
