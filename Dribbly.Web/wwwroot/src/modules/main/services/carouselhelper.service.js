(function () {
    'use strict';

    angular.module('mainModule')
        .service('drbblyCarouselhelperService', ['constants',
            function (constants) {

                function buildSettings() {
                    return {
                        enabled: false,
                        autoplay: true,
                        autoplaySpeed: 3000,
                        slidesToShow: 2,
                        slidesToScroll: 1,
                        draggable: true,
                        mobileFirst: true,
                        arrows: false,
                        dots: true,
                        infinite: true,
                        waitForAnimate: false,
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

                var _service = {
                    buildSettings: buildSettings
                };

                return _service;
            }]);

})();