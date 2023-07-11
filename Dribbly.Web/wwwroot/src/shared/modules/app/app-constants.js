(function () {
    'use strict';

    /**
     * A collection of constant values.
     * @namespace constants
     */
    var module = angular.module('appModule');
    module.config(['constants', function (constants) {

        /**
         * @constant
         * @default
         * @member
         */
        constants.settings = {
            googleMapApiKey: 'googleMapApiKey'
        };

        /**
         * This should kept in sync with the password validation options in ApplicationUserManager.cs in the API
         * @member
         * @constant
         * @default
         */
        constants.PASSWORD_VALIDATION_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).{6,14}$/;
        constants.MOBILENO_VALIDATION_REGEX = /^\d{3}[- ]?\d{3}[- ]?\d{4}$/;

        /**
         * 
         * @member
         * @constant
         * @default
         */
        constants.images = {
            defaultProfilePhotoUrl: 'src/images/default_images/default_profile_photo.jpg',
            defaultCourtLogoUrl: 'src/images/default_images/court_default_1.png',
            defaultTournamentLogoUrl: 'src/images/default_images/default_tournament_logo.jpg',
            defaultTeamLogoUrl: 'src/images/default_images/default_team_logo_1.png'
        };
        
        /**
         * @namespace
         * @memberof constants
         */
        constants.coordinates = {
            /**
             * 
             * @member
             * @constant
             * @default
             */
            PHILIPPINES: { lat: 12.8797, lng: 121.7740 },
            /**
             * 
             * @member
             * @constant
             * @default
             */
            MANILA: { lat: 14.5995, lng: 120.9842 }
        };

        /**
         * 
         * @member
         * @constant
         * @default
         */
        constants.countryCodes = {
            ph: '+63'
        };

        /**
         * @namespace
         * @memberof constants
         */
        constants.bootstrap = {
            /**
             * Minimum viewport widths
             * @constant
             * @member
             * @default
             */
            breakpoints: {
                sm: 576,
                md: 768,
                lg: 992,
                xl: 1200
            }
        };

        /**
         * @namespace
         * @memberof constants
         */
        var enums = {
            /**
             * @member
             * @constant
             * @default
             */
            accountStatus: {
                Active: 0,
                Inactive: 1,
                Deleted: 2
            },
            /**
             * @member
             * @constant
             * @default
             */
            entityType: {
                Account: 0,
                Court: 1,
                Game: 2,
                Team: 3,
                Post: 4
            },
            /**
             * @member
             * @constant
             * @default
             */
            entityStatus: {
                Active: 0,
                Inactive: 1,
                Deleted: 2
            },
            /**
             * @member
             * @constant
             * @default
             */
            gameStatus: {
                WaitingToStart: 0,
                Started: 1,
                Finished: 2,
                Cancelled: 3
            },
            /**
             * @member
             * @constant
             * @default
             */
            notificationType: {
                NewBookingForOwner: 0,
                NewBookingForBooker: 1,
                GameUpdatedForBooker: 2,
                GameUpdatedForOwner: 3,
                JoinTeamRequest: 20,
                JoinTeamRequestApproved: 21
            }
        };

        constants.enums = Object.assign(constants.enums || {}, enums);
    }]);

})();
