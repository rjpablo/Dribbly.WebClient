(function () {
    'use strict';

    angular
        .module('appModule')
        .component('drbblyReviewlist', {
            bindings: {
                reviews: '<'
            },
            controllerAs: 'drl',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = [];
    function controllerFunc() {
        var drl = this;
        var _loadSize = 15;

        drl.$onInit = function () {
            
        };

        drl.$onChanges = function (change) {
            if (change.reviews) {
                drl.currentSize = Math.min((change.reviews.currentValue || []).length, _loadSize);
                setDisplayedReviews();
            }
        };

        drl.loadMore = function () {
            drl.currentSize = Math.min(drl.reviews.length, drl.currentSize + _loadSize);
            setDisplayedReviews();
        };

        function setDisplayedReviews() {
            drl.displayedReviews = (drl.reviews || []).slice(0, drl.currentSize);
        }
    }
})();
