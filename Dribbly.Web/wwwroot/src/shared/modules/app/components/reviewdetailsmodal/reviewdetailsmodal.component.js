(function () {
    'use strict';

    angular.module('appModule')
        .component('drbblyReviewdetailsmodal', {
            bindings: {
                model: '<',
                context: '<'
            },
            controllerAs: 'rdm',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['drbblyCourtsService', '$scope', 'modalService', 'drbblyEventsService', 'constants', '$timeout',
        '$q'];
    function controllerFn(drbblyCourtsService, $scope, modalService, drbblyEventsService, constants, $timeout,
        $q) {
        var rdm = this;

        rdm.$onInit = function () {
            rdm.tempReview = angular.copy(rdm.model.review || {});
            rdm.contactIsVerified = Boolean(rdm.tempReview.contactId);

            //if (rdm.isEdit) {
            //    rdm.tempReview.isManaged = Boolean(rdm.tempReview.contactId);
            //    rdm.fullMobileNumber = rdm.tempReview.contact && rdm.tempReview.contact.number;
            //    if (rdm.tempReview.latitude || rdm.tempReview.longitude) {
            //        rdm.initialPosition = {
            //            latLng: {
            //                lat: rdm.tempReview.latitude,
            //                lng: rdm.tempReview.longitude
            //            }
            //        };
            //    }
            //}

            rdm.context.setOnInterrupt(rdm.onInterrupt);
            drbblyEventsService.on('modal.closing', function (event, reason, result) {
                if (!rdm.context.okToClose) {
                    event.preventDefault();
                    rdm.onInterrupt();
                }
            }, $scope);
        };

        rdm.onInterrupt = function (reason) {
            if (rdm.frmReviewDetails.$dirty) {
                modalService.showUnsavedChangesWarning()
                    .then(function (response) {
                        if (response) {
                            rdm.context.okToClose = true;
                            rdm.context.dismiss(reason);
                        }
                    })
                    .catch(function (response) {
                        console.log(response);
                    });
            }
            else {
                rdm.context.okToClose = true;
                rdm.context.dismiss(reason);
            }
        };

        rdm.submit = function () {
            rdm.frmReviewDetails.$setSubmitted();
            if (rdm.frmReviewDetails.$valid) {
                rdm.isBusy = true;
                if (rdm.isEdit) {
                    editReview(rdm.tempReview);
                }
                else {
                    addReview(rdm.tempReview);
                }
            }
        };

        function editReview(review) {
            rdm.model.add(review)
                .then(function () {
                    close(review);
                })
                .catch(function () {
                    //TODO: handle error
                })
                .finally(function () {
                    rdm.isBusy = false;
                });
        }

        function addReview(review) {
            review.eventId = rdm.model.event.id;
            rdm.model.add(review)
                .then(function () {
                    close();
                })
                .catch(function () {
                    //TODO: handle error
                })
                .finally(function () {
                    rdm.isBusy = false;
                });
        }

        rdm.onRatingSet = function (value) {
            rdm.tempReview.rating = value;
        };

        function close(review) {
            rdm.context.okToClose = true;
            rdm.context.submit(review);
        }

        rdm.cancel = function () {
            rdm.onInterrupt('cancelled');
        };
    }
})();
