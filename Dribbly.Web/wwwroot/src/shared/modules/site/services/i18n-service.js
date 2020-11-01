(function () {
    'use strict';

    // If an entry can be used in other apps other than Dribbly (basketball), such as Store, it should go under site.

    angular.module('siteModule')
        .service('i18nService', ['$timeout', 'constants', function ($timeout, constants) {
            var _entries = {
                site: {
                    AboutUs: 'About Us',
                    AccountDetails: 'Account Details',
                    AccountSettings: 'Account Settings',
                    Bookings: 'Bookings',
                    Cancel: 'Cancel',
                    Change: 'Change',
                    Close: 'Close',
                    ConfirmPassword: 'Confirm Password',
                    ConfirmNewPassword: 'Confirm New Password',
                    Contact: 'Contact',
                    ContactVerificationNotice: 'A code will be sent to {contactNumber}. You will have to enter this code to complete the verification.',
                    Continue: 'Continue',
                    Courts: 'Courts',
                    CourtDetails: 'Court Details',
                    CourtBookings: 'Court Bookings',
                    CourtGames: 'Court Games',
                    CourtSchedule: 'Court Schedule',
                    DeactivateAccount: 'Deactivate Account',
                    DeactivateAccountPrompt: 'After deactivation, you will be logged out and your account will not be viewable by anyone until the next time that you log in. Do you want to proceed?',
                    Delete: 'Delete',
                    DeleteAccount: 'Delete Account',
                    DeleteAccountPrompt: 'Deleting your account cannot be undone. Are you sure you want to do it?',
                    Done: 'Done',
                    Edit: 'Edit',
                    Email: 'Email',
                    Error_Auth_SessionExpired: 'Your session has expired. Please log in again to continue.',
                    Error_Common_InvalidEmail: 'Please enter a valid email address',
                    Error_Common_InvalidMobileNo_TenDigit: 'Invalid Format. Please enter 10-digit mobile number',
                    Error_Common_InvalidLink: 'The link you used is either invalid or expired. Please try requesting for another link.',
                    Error_Common_InvalidPassword: 'Password must be 6-14 characters long and must contain at least one lower case letter, at least one upper case letter, at least one digit and no spaces.',
                    Error_Common_Minlength: 'Should be at least ({length}) characters long',
                    Error_Common_MustMatchPassword: 'Must match the password',
                    Error_Common_PleaseFixErrors: 'Please fix errors',
                    Error_Common_UnexpectedError: 'An unexpected error occurred. Please try again.',
                    Error_Map_CityNameNotFound: 'Could not retrieve city name.' +
                        ' Please try a different location.',
                    Error_Map_CountryNameNotFound: 'Could not retrieve country name.' +
                        ' Please try a different location.',
                    Error_Map_FailedToRetrieveLocation: 'Failed to retrieve location details. Please try a different location.',
                    Error_Map_PhOnly: 'We\'re very sorry but we currently only support locations' +
                        ' within the Philippines. We\'re currently working to expand our' +
                        ' coverage. We\'ll let you know once were done. Thank you for understanding.',
                    Error_PhoneVerification_CouldNotSend: 'We couldn\'t send the verification code. Please make sure that the number is correct and then try again.',
                    Error_PhoneVerification_IncorrectCode: 'The code that you entered was incorrect. Please try again.',
                    Error_PhoneVerification_NumberNeedsVerification: 'Contact no. needs to be verified',
                    Follow: 'Follow',
                    FollowerCountDisplay: '{count} Follower(s)',
                    FollowUs: 'Follow Us',
                    From: 'From',
                    Games: 'Games',
                    Home: 'Home',
                    Km: 'km',
                    LetsChat: 'Let\'s Chat',
                    LoggedInAs: 'logged in as <strong class="text-capitalize">{userName}</strong>',
                    LogOut: 'Log Out',
                    LogOutConfirmationMsg1: 'Action is not yet over...',
                    LogOutConfirmationMsg2: 'Are you sure you want to log out?',
                    MobileNo: 'Mobile No.',
                    MobileNoPlaceholder: '10-digit no. (e.g. \'912 345 6789\')',
                    Name: 'Name',
                    NewPassword: 'New Password',
                    No: 'No',
                    NotSet: 'Not Set',
                    Ok: 'Ok',
                    Optional: 'Optional',
                    Or: 'Or',
                    OverlayErrorMsg: 'Oh no! The shot missed :(',
                    OverlayBusyMsg: 'Hold on tight... A shot on the way!',
                    Password: 'Password',
                    Players: 'Players',
                    ReactivateAccount: 'Re-activate Account',
                    Rating: 'Rating',
                    Remove: 'Remove',
                    Replace: 'Replace',
                    Required: 'Required',
                    Review: 'Review',
                    Reviews: 'Reviews',
                    Schedule: 'Schedule',
                    Search: 'Search',
                    SendCode: 'Send Code',
                    SiteName: constants.site.name,
                    SlashHour: '/hr',
                    Submit: 'Submit',
                    Teams: 'Teams',
                    To: 'To',
                    Unfollow: 'Unfollow',
                    Update: 'Update',
                    Username: 'Username',
                    UnsavedChangesWarningMessage: 'You may lose you unsaved Changes. Are you sure?',
                    VerificationCodePrompt: 'Please enter the code that was sent to {contactNumber} and then click \'Submit\'',
                    VerificationSuccessful: 'Verification Successful!',
                    Verified: 'Verified',
                    Verify: 'Verify',
                    Videos: 'Videos',
                    WelcomeToDribblyExclamation: 'Welcome to dribbly!',
                    Yes: 'Yes'
                },
                app: {
                    AccountVideos: 'Account Videos',
                    AddACourt: 'Add a court',
                    AddedBy: 'Added by ',
                    AddedOn: 'Added on ',
                    AdditionalInfo: 'Additional Info',
                    Address: 'Address',
                    Age: 'Age',
                    AgeValue: '{age} y/o',
                    BookedBy: 'Booked by',
                    BookingDetails: 'Booking Details',
                    BookNow: 'Book Now',
                    Browse: 'Browse',
                    CancelGame: 'Cancel Game',
                    Change: 'Change',
                    City: 'City',
                    CourtDetailsMobileNoLabel: 'Mobile no. that users can contact to inquire about this court',
                    CourtsNearCourtName: 'Courts Near {courtName}',
                    ClearFilters: 'Clear Filters',
                    ContentNotCurrentlyAvailable: 'This content is currently not available',
                    CourtBookings: 'Court Bookings',
                    CourtNameContains: 'Court Name Contains',
                    CourtNoContact: 'No contact number provided for this court',
                    CourtPhotos: 'Court Photos',
                    CourtSearchPrompt: 'Enter a court name to search',
                    CourtVideos: 'Court Videos',
                    CourtReviews: 'Court Reviews',
                    DateAdded: 'Date Added',
                    DateJoined: 'Date Joined',
                    DeletedAccount: '(Deleted Account)',
                    DeletePhotoConfirmationMsg: 'Delete photo?',
                    DeleteVideoConfirmationMsg: 'Delete video?',
                    Description: 'Description',
                    Details: 'Details',
                    Duration: 'Duration',
                    End: 'End',
                    Error_Common_GenericErrorHeader: 'Oh no! The shot missed :(',
                    Error_Common_GenericErrorDetails: 'That one didn\'t go well. Go take another shot!',
                    Error_CantRateOwnCourt: 'You can\'t rate you own court.',
                    FeaturedCourts: 'Featured Courts',
                    Female: 'Female',
                    File: 'File',
                    FilterBookingsByTitle: 'Filter bookings by title',
                    FilterGamesByTitle: 'Filter games by title',
                    Filters: 'Filters',
                    FindACourt: 'Find a Court',
                    FoundCountPhotos: 'Found {count} photos',
                    FoundCountVideos: 'Found {count} videos',
                    FormattedDuration: '{hours} hrs and {minutes} mins',
                    FreeToPlay: 'Free To Play',
                    GameDetails: 'Game Details',
                    Gender: 'Gender',
                    Go: 'Go',
                    Height: 'Height',
                    Id: 'ID',
                    InactiveAccount: '(Inactive Account)',
                    Join: 'Join',
                    JoinedOnDate: 'Joined on {date}',
                    KeepPrivate: 'Keep Private',
                    LoadingMoreItemsEllipsis: 'Loading more items...',
                    LoadingSuggestionsEllipsis: 'Loading suggestions...',
                    LoadMore: 'Load More',
                    LocationPickFromTheMap: 'Location: (Please select from the map)',
                    Male: 'Male',
                    ManageThisCourt: 'Manage this court',
                    Message: 'Message',
                    Mvps: 'MVPs',
                    NearbyCourts: 'Nearby Courts',
                    NewGame: 'New Game',
                    NewGameDetails: 'New Game Details',
                    NoAdditionalInfo: '<small class="text-muted">No additional info provided</small>',
                    NoReservationToReviewCourt: 'Sorry. You either have not made a reservation on this court or you have submitted a review for your most recent reservation. You will be able to review this court after your next reservation.',
                    Notification_ABookingHasBeenMadeForYouAtCourtName: 'A booking has been made for you at <strong>{courtName}</strong>',
                    Notification_UserMadeABookingAtCourtName: '<strong>{userName}</strong> has made a booking for <strong>{courtName}</strong>',
                    NoBookingsOnThisCourtYet: 'No bookings booked at this court yet.',
                    NoGamesOnThisCourtYet: 'No games booked at this court yet.',
                    NoSuggestionsFound: 'No suggestions found',
                    Photos: 'Photos',
                    PleaseAllowAccessToLocationToLoadNearbyCourts: 'Please allow access to location to load nearby courts.',
                    PleaseContactTheFollowingNumberForInquiries: 'Please contact the following number for inquiries:<br/><br/><h3 class="text-center">{number}</h3>',
                    PlusFollow: '+ Follow',
                    PrimaryPhoto: 'PrimaryPhoto',
                    Private: 'Private',
                    ProcessingEllipsis: 'Processing...',
                    Profile: 'Profile',
                    Public: 'Public',
                    RatePerHour: 'Rate Per Hour',
                    ReplacePrimaryPhoto: 'Replace Primary Photo',
                    ReviewCountDisplay: '{count} reviews',
                    Security: 'Security',
                    Schedule: 'Schedule',
                    SearchTheMap: 'Search the map',
                    Settings: 'Settings',
                    ShowingCurrentOfTotal: 'Showing {current} of {total}',
                    ShowMyBirthDate: 'Show My Birth Date',
                    SortBy: 'Sort by',
                    Start: 'Start',
                    StartGame: 'Start Game',
                    StartTypingToLoadSuggestions: 'Start typing to load suggestions',
                    ThisAccountIsPrivate: 'This account is private.',
                    ThisCourtHasNotRecievedAnyReviewsYet: 'This court has not received any reviews yet.',
                    Title: 'Title',
                    Today: 'Today',
                    Unspecified: 'Unspecified',
                    Untitled: 'Untitled',
                    UpdateDetails: 'Update Details',
                    UpdateGameDetails: 'Update Game Details',
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
                    PleaseLogInToProceed: 'Please log in to proceed.',
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