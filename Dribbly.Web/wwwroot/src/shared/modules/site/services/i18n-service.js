(function () {
    'use strict';

    angular.module('siteModule')
        .service('i18nService', ['$timeout', 'constants', function ($timeout, constants) {
            var _entries = {
                site: {
                    AccountDetails: 'Account Details',
                    AccountSettings: 'Account Settings',
                    Cancel: 'Cancel',
                    Change: 'Change',
                    Close: 'Close',
                    ConfirmPassword: 'Confirm Password',
                    ConfirmNewPassword: 'Confirm New Password',
                    Continue: 'Continue',
                    Courts: 'Courts',
                    CourtDetails: 'Court Details',
                    CourtSchedule: 'Court Schedule',
                    CourtGames: 'Court Games',
                    Done: 'Done',
                    Edit: 'Edit',
                    Email: 'Email',
                    Error_Auth_SessionExpired: 'Your session has expired. Please log in again to continue.',
                    Error_Common_InvalidEmail: 'Please enter a valid email address',
                    Error_Common_InvalidLink: 'The link you used is either invalid or expired. Please try requesting for another link.',
                    Error_Common_InvalidPassword: 'Password must be 6-14 characters long and must contain at least one lower case letter, at least one upper case letter, at least one digit and no spaces.',
                    Error_Common_Minlength: 'Should be at least ({length}) characters long',
                    Error_Common_MustMatchPassword: 'Must match the password',
                    Error_Common_UnexpectedError: 'An unexpected error occurred. Please try again.',
                    Error_Map_CityNameNotFound: 'Could not retrieve city name.' +
                        ' Please try a different location.',
                    Error_Map_CountryNameNotFound: 'Could not retrieve country name.' +
                        ' Please try a different location.',
                    Error_Map_FailedToRetrieveLocation: 'Failed to retrieve location details. Please try a different location.',
                    Error_Map_PhOnly: 'We\'re very sorry but we currently only support locations' +
                        ' within the Philippines. We\'re currently working to expand our' +
                        ' coverage. We\'ll let you know once were done. Thank you for understanding.',
                    From: 'From',
                    Games: 'Games',
                    Home: 'Home',
                    LoggedInAs: 'logged in as <strong class="text-capitalize">{userName}</strong>',
                    LogOut: 'Log Out',
                    LogOutConfirmationMsg1: 'Action is not yet over...',
                    LogOutConfirmationMsg2: 'Are you sure you want to log out?',
                    Name: 'Name',
                    NewPassword: 'New Password',
                    No: 'No',
                    Ok: 'Ok',
                    Or: 'Or',
                    OverlayErrorMsg: 'Oh no! The shot missed :(',
                    OverlayBusyMsg: 'Hold on tight... A shot on the way!',
                    Password: 'Password',
                    Players: 'Players',
                    Replace: 'Replace',
                    Required: 'Required',
                    Schedule: 'Schedule',
                    Search: 'Search',
                    SiteName: constants.site.name,
                    SlashHour: '/hr',
                    Submit: 'Submit',
                    Teams: 'Teams',
                    To: 'To',
                    Update: 'Update',
                    Username: 'Username',
                    UnsavedChangesWarningMessage: 'You may lose you unsaved Changes. Are you sure?',
                    Videos: 'Videos',
                    WelcomeToDribblyExclamation: 'Welcome to dribbly!',
                    Yes: 'Yes'
                },
                app: {
                    AdditionalInfo: 'Additional Info',
                    Address: 'Address',
                    Age: 'Age',
                    AgeValue: '{age} y/o',
                    BookNow: 'Book Now',
                    Browse: 'Browse',
                    Change: 'Change',
                    City: 'City',
                    ClearFilters: 'Clear Filters',
                    CourtNameContains: 'Court Name Contains',
                    CourtPhotos: 'Court Photos',
                    CourtSearchPrompt: 'Enter a court name to search',
                    CourtVideos: 'Court Videos',
                    DateAdded: 'Date Added',
                    DateJoined: 'Date Joined',
                    DeletePhotoConfirmationMsg: 'Delete photo?',
                    Description: 'Description',
                    Details: 'Details',
                    Duration: 'Duration',
                    End: 'End',
                    Error_Common_GenericErrorHeader: 'Oh no! The shot missed :(',
                    Error_Common_GenericErrorDetails: 'That one didn\'t go well. Go take another shot!',
                    FeaturedCourts: 'Featured Courts',
                    Femail: 'Female',
                    File: 'File',
                    FilterGamesByTitle: 'Filter games by title',
                    Filters: 'Filters',
                    FindACourt: 'Find a Court',
                    FoundCountPhotos: 'Found {count} photos',
                    FoundCountVideos: 'Found {count} videos',
                    FormattedDuration: '{hours} hrs and {minutes} mins',
                    GameDetails: 'Game Details',
                    Go: 'Go',
                    Height: 'Height',
                    Id: 'ID',
                    JoinedOnDate: 'Joined on {date}',
                    KeepPrivate: 'Keep Private',
                    LocationPickFromTheMap: 'Location: (Please select from the map)',
                    Male: 'Male',
                    Message: 'Message',
                    Mvps: 'MVPs',
                    NoAdditionalInfo: '<small class="text-muted">No additional info provided</small>',
                    NoGamesOnThisCourtYet: 'No games booked at this court yet.',
                    Photos: 'Photos',
                    PlusFollow: '+ Follow',
                    PrimaryPhoto: 'PrimaryPhoto',
                    Private: 'Private',
                    ProcessingEllipsis: 'Processing...',
                    Profile: 'Profile',
                    Public: 'Public',
                    RatePerHour: 'Rate Per Hour',
                    ReplacePrimaryPhoto: 'Replace Primary Photo',
                    Security: 'Security',
                    Schedule: 'Schedule',
                    SearchTheMap: 'Search the map',
                    Settings: 'Settings',
                    Sex: 'Sex',
                    ShowMyBirthDate: 'Show My Birth Date',
                    SortBy: 'Sort by',
                    Start: 'Start',
                    Title: 'Title',
                    Today: 'Today',
                    Unspecified: 'Unspecified',
                    UploadAPhoto: 'Upload a photo',
                    UploadAVideo: 'Upload a video',
                    UploadingWithProgress: 'Uploading({progress}%)...',
                    UploadVideo: 'Upload Video',
                    UseMap: 'Search using the map',
                    View: 'View',
                    ViewFullDetails: 'View Full Details',
                    ViewOnMap: 'View On Map',
                    ViewPrimaryPhoto: 'View Primary Photo',
                    WinRate: 'Win Rate'
                },
                main: {
                    CourtRegistrationTitle: 'Register Court Details',
                    CourtLocationPrompt: 'Enter the court\'s location or select it from the map below',
                    CourtNamePrompt: 'Name of the court'
                },
                auth: {
                    AlreadyHaveAnAccount: 'Already have an account?',
                    ChangeEmailAddress: 'Change email address',
                    CurrentPassword: 'Current Password',
                    DontHaveAnAccount: 'Don\'t have an account?',
                    ForgotPassword: 'Forgot Password',
                    GoBackToLogin: 'Go back to Login',
                    LogIn: 'Log In',
                    LogInWithFacebook: 'Log in with Facebook',
                    LogInWithGoogle: 'Log in with Google',
                    PasswordChangedSuccessfully: 'Your password has been changed successfully.',
                    PasswordResetSuccessfulHeader: 'Password reset successful!',
                    PasswordResetSuccessfulDetails: 'You have successfully reset your password. You may now <a href="#/login">Log In</a>', //TODO: append # dynamically
                    ResendLink: 'Resend link',
                    ResendingLink: 'Resending link',
                    ResetLinkSentHeader: 'Reset link sent!',
                    ResetLinkSentDetails: 'A reset link has been sent to <strong>{email}</strong>. Please follow the instructions in the email to reset your password.',
                    ResetPassword: 'Reset Password',
                    SignUp: 'Sign Up'
                }
            };

            var thrownErrors = [];

            function applySubstitutions(text, subs) {
                var result = text;

                if (subs) {
                    angular.forEach(subs, function (value, key) {
                        var subValue;
                        if (value === null || value === undefined) {
                            throwErrorIfNeeded('Value for ' + key + ' is not provided.');
                            subValue = '';
                        }
                        else {
                            subValue = value;
                        }

                        result = result.replace(new RegExp('{' + key + '}', 'g'), subValue);
                    });
                }
                result = result.replace(/\n/g, '<br>');

                return result;
            }

            function throwErrorIfNeeded(msg) {
                //1. We don't want to interrupt the return of the value... 
                //   If the service is being called by filters or directives.
                //   That could break bindings, etc.
                //2. We do want to tap into or error handling infrastructure.
                //3. So we need to log, async.
                //4. But we must do so within angular (vs. window.setTimeout()),
                //   so that angular error handling can capture it.
                //5. A single filter or directive binding call can happen many times,
                //   during multiple angular digest cycles.  We don't want it to 
                //   be logged a zillion times.  Once per page is enough.
                //   So, we limit it here.
                //6. $timeout will cause another digest cycle (which re-evaluates the
                //   the filter, which can cause an endless loop if we were not to do #5.
                //   invokeApply = false below should prevent this?  TODO: research.
                //   But in the end it doesn't matter... we don't want to log multiples anyway.

                if (!thrownErrors.includes(msg)) {
                    thrownErrors.push(msg);
                    $timeout(function () {
                        throw new Error(msg);
                    }, 1000, false);
                }
            }

            function _getValue(token) {

                var pieces = token.split('.');
                if (pieces.length >= 2) {
                    var library = _entries[pieces[0]];
                    if (library) {
                        var value = library[pieces[1]];
                        //if enum...
                        if (value && pieces.length === 3) {
                            value = value[pieces[2]];
                        }

                        if (value) {
                            return value;
                        }
                    }
                }

                return undefined;
            }

            function getLocalizedString(token, subs, options) {

                if (token) {
                    if (angular.isString(token)) {

                        var value = _getValue(token);
                        if (value) {
                            return applySubstitutions(value, subs);
                        }

                        if (options && options.suppressErrors) {
                            return token.split('.').atsLast(); //library.key --> key
                        }

                        var msg = '%%KEY_' + token + '_NOT_FOUND%%';
                        //don't break function (log to the side)

                        throwErrorIfNeeded(msg);

                        return msg;
                    }
                    else if (angular.isArray(token)) {
                        return getLocalizedString(token[0], token[1], options);
                    }
                    else if (angular.isObject(token)) {
                        return getLocalizedString(token.token, token.subs, options);
                    }
                    else if (angular.isFunction(token)) {
                        //handle selectors (i.e. dynamic tokens)
                        return getLocalizedString(token(subs), subs, options);
                    }
                }

                if (options && options.suppressErrors) {
                    return getLocalizedString('site.Unknown'); //This will be displayed to users
                }

                /* eslint-disable no-redeclare */
                var msg = '%%KEY_NOT_FOUND%%';
                //don't break function (log to the side)

                throwErrorIfNeeded(msg);

                return msg;
            }

            this.getValue = _getValue;
            this.getString = getLocalizedString;

            return this;
        }]);
})();