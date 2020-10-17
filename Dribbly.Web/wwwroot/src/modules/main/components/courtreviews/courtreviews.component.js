(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyCourtreviews', {
            bindings: {
                app: '<',
                court: '<',
                onUpdate: '<'
            },
            controllerAs: 'dcr',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyCourtsService', '$stateParams', 'drbblyOverlayService', 'authService', 'modalService'];
    function controllerFunc(drbblyCourtsService, $stateParams, drbblyOverlayService, authService, modalService) {
        var dcr = this;

        dcr.$onInit = function () {
            dcr.courtsListOverlay = drbblyOverlayService.buildOverlay();
            dcr.courtId = $stateParams.id;
            loadReviews();
        };

        function loadReviews() {
            dcr.courtsListOverlay.setToBusy();
            drbblyCourtsService.getReviews(dcr.courtId)
                .then(function (reviews) {
                    dcr.reviews = reviews;
                    dcr.courtsListOverlay.setToReady();
                })
                .catch(dcr.courtsListOverlay.setToError);
        }

        dcr.addReview = function () {
            return authService.checkAuthenticationThen(function () {
                drbblyCourtsService.getCodeReviewModal(dcr.courtId)
                    .then(function (data) {
                        if (data && data.event) {
                            data.add = dcr.add;
                            return modalService.show({
                                view: '<drbbly-reviewdetailsmodal></drbbly-reviewdetailsmodal>',
                                model: data
                            })
                                .then(dcr.onUpdate);
                        }
                        else {
                            return modalService.alert({ msg1Key: 'app.NoReservationToReviewCourt' });
                        }
                    });
            });
        };

        dcr.add = function (review) {
            review.courtId = dcr.courtId;
            return drbblyCourtsService.submitReview(review)
                .then(function () {
                    loadReviews();
                });
        };
    }
})();
