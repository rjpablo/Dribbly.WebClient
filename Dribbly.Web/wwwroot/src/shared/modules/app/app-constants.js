(function () {
    'use strict';

    var module = angular.module('appModule');
    module.config(['constants', function (constants) {
        constants.settings = {
            googleMapApiKey: 'googleMapApiKey'
        };
        // This should kept in sync with the password validation options in ApplicationUserManager.cs in the API
        constants.PASSWORD_VALIDATION_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).{6,14}$/;
        constants.MOBILENO_VALIDATION_REGEX = /^\d{3}[- ]?\d{3}[- ]?\d{4}$/;
        constants.images = {
            defaultProfilePhotoUrl: 'src/images/default_images/default_profile_photo.jpg'
        };
        constants.coordinates = {
            PHILIPPINES: { lat: 12.8797, lng: 121.7740 },
            MANILA: { lat: 14.5995, lng: 120.9842 }
        };
        constants.countryCodes = {
            ph: '+63'
        };
        constants.bootstrap = {
            // minimum viewport widths
            breakpoints: {
                sm: 576,
                md: 768,
                lg: 992,
                xl: 1200
            }
        };
        constants.enums = {
            accountStatus: {
                Active: 0,
                Inactive: 1,
                Deleted: 2
            },
            entityType: {
                Account: 0,
                Court: 1,
                Game: 2,
                Team: 3,
                Post: 4
            },
            entityStatus: {
                Active: 0,
                Inactive: 1,
                Deleted: 2
            },
            gameStatus: {
                WaitingToStart: 0,
                Started: 1,
                Finished: 2,
                Cancelled: 3
            },
            notificationType: {
                NewBookingForOwner: 0,
                NewBookingForBooker: 1,
                JoinTeamRequest: 2,
                JoinTeamRequestApproved: 3
            }
        };
    }]);

})();
