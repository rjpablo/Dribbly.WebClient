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
        'drbblyOverlayService', '$timeout', '$state', 'modalService', 'constants'];
    function controllerFunc(drbblyCourtsService, $element, drbblyToolbarService, drbblyCourtshelperService,
        drbblyOverlayService, $timeout, $state, modalService, constants) {
        var dcc = this;

        dcc.$onInit = function () {
            $element.addClass('drbbly-courts-container');
            dcc.courtsListOverlay = drbblyOverlayService.buildOverlay();
            setInitialCarouselSettings();
            loadCourts();
            $timeout(setToolbarItems, 100); //using timetout to wait for toolbar to initialized
        };

        function loadCourts() {
            dcc.courtsListOverlay.setToBusy();
            drbblyCourtsService.getAllCourts()
                .then(function (data) {
                    dcc.courts = data;
                    $timeout(function () {
                        dcc.carouselSettings.enabled = true;
                        dcc.courtsListOverlay.setToReady();
                    }, 300);
                })
                .catch(dcc.courtsListOverlay.setToError);
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

        function setToolbarItems() {
            var buildItem = drbblyToolbarService.buildItem;
            drbblyToolbarService.setItems([]);
        }

        dcc.featuredCourtClick = function (court) {
            dcc.carouselSettings.method.slickPause();
            modalService.show({
                view: '<drbbly-courtpreviewmodal></drbbly-courtpreviewmodal>',
                model: { court: court }
            })
                .finally(dcc.carouselSettings.method.slickPlay);
        };

        dcc.beginSearch = function () {
            modalService.show({
                view: '<drbbly-searchmodal></drbbly-searchmodal>',
                model: {},
                isFull: true
            })
                .then(function () { /*do nothing*/ })
                .catch(function () { /*do nothing*/ });
        };

        dcc.addCourt = function () {
            drbblyCourtshelperService.registerCourt()
                .then(function (court) {
                    if (court) {
                        $state.go('main.court.details', { id: court.id });
                    }
                })
                .catch(function () {
                    // Court registration cancelled. Do nothing
                });
        };

        function toggleSearch() {
            console.log('toggleSearch');
        }
    }
})();
