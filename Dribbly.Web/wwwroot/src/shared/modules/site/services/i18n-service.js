(function () {
    'use strict';

    // If an entry can be used in other apps other than Dribbly (basketball), such as Store, it should go under site.

    angular.module('siteModule')
        .service('i18nService', ['$timeout', 'constants', function ($timeout, constants) {
            var _entries = {};
            var _modules = ['site', 'app', 'main', 'auth'];
            var _entriesTmp = {
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
                    CourtHome: 'Court Home',
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
                    Location: 'Location',
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
                    OverlayBusyMsg: 'Hold on tight... A shot is on the way!',
                    Password: 'Password',
                    Players: 'Players',
                    Posts: 'Posts',
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
                    BirthDate: 'Birth Date',
                    BookedBy: 'Booked by',
                    BookingDetails: 'Booking Details',
                    BookNow: 'Book Now',
                    Browse: 'Browse',
                    CancelGame: 'Cancel Game',
                    CancelGamePrompt: 'Cancel game?',
                    Cancelled: 'Cancelled',
                    CancelRequestToJoin: 'Cancel Request To Join',
                    Change: 'Change',
                    City: 'City',
                    Court: 'Court',
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
                    CreateANewPost: 'Create a New Post',
                    CurrentMembers: 'Current Members',
                    DateAdded: 'Date Added',
                    DateJoined: 'Date Joined',
                    DeletedAccount: '(Deleted Account)',
                    DeleteCourt: 'Delete Court',
                    DeleteCourtPrompt: 'Are you sure you want to delete this court?',
                    DeletePhotoConfirmationMsg: 'Delete photo?',
                    DeletePostConfirmationMsg: 'Delete Post?',
                    DeleteVideoConfirmationMsg: 'Delete video?',
                    Description: 'Description',
                    Details: 'Details',
                    DoesntMatter: 'Doesn\'t Matter',
                    Duration: 'Duration',
                    EditPost: 'Edit Post',
                    End: 'End',
                    EndGame: 'End Game',
                    Error_CantRateOwnCourt: 'You can\'t rate you own court.',
                    Error_CancelGame_AlreadyCanceled: 'Cannot cancel an already canceled game. Please try reloading the page.',
                    Error_CancelGame_AlreadyFinished: 'Cannot cancel an already finished game. Please try reloading the page.',
                    Error_Common_GenericErrorHeader: 'Oh no! The shot missed :(',
                    Error_Common_GenericErrorDetails: 'That one didn\'t go well. Go take another shot!',
                    Error_Common_InvalidOperationTryReload: 'Invalid Operation. Please try reloading the page.',
                    Error_CouldNotRetrieveAccountSettingsAccountNotFound: 'Could not retrieve account settings because the acccount was not found.',
                    Error_CouldNotRetrieveVideosCourtNotFound: 'Failed load the videos because the court was not found.',
                    Error_CouldNotUploadVideoCourtNotFound: 'Failed to upload video because the court was not found.',
                    Error_CourtNotFound: 'The system could not find the court. It may have been deleted.',
                    Error_DeleteCourtForbidden: 'You do not have permission to delete this court.',
                    Error_DeleteCourtVideoCourtNotFound: 'The system could not find the video you are trying to delete.',
                    Error_DeleteCourtVideoVideoNotFound: 'The system could not the court associated to the video you are trying to delete.',
                    Error_DeleteCourtVideoUnauthorized: 'You do not have permission to delete videos of this court.',
                    Error_DeletePhotoNotFound: 'The system could not find the photo you are trying to delete.',
                    Error_EditPostNotAllowed: 'You do not have permission to edit this post.',
                    Error_LeaveTeamNotCurrentMember: 'You can\'t leave this team because you are not currently a member of it.',
                    Error_JoinTeamAlreadyAMember: 'You are already currently a member of this team.',
                    Error_JoinTeamCancelNoPending: 'You don\'t currently have a pending request to join this team.',
                    Error_JoinTeamInactive: 'You cannot join this team because it is currently in an inactive status.',
                    Error_JoinTeamDeleted: 'You cannot join this team because it has been deleted from the system.',
                    Error_JoinTeamDuplicate: 'You already have a pending request to join this team.',
                    Error_NotAllowedToDeletePost: 'You do not have permission to delete this post.',
                    Error_NotAllowedToDeletePhoto: 'You do not have permission to delete this photo.',
                    Eror_ProcessJoinTeamRequestAlreadyProcessed: 'This request has already been processed. Please refresh the page to see updated info.',
                    Error_UploadCourtVideoNotAuthorized: 'You do not have permission to upload videos to this court',
                    FeaturedCourts: 'Featured Courts',
                    Feet_Abbrev: 'ft.',
                    Female: 'Female',
                    File: 'File',
                    FilterBookingsByTitle: 'Filter bookings by title',
                    FilterGamesByTitle: 'Filter games by title',
                    Filters: 'Filters',
                    FindACourt: 'Find a Court',
                    Finished: 'Finished',
                    FoundCountPhotos: 'Found {count} photos',
                    FoundCountVideos: 'Found {count} videos',
                    FormattedDuration: '{hours} hrs and {minutes} mins',
                    FreeToPlay: 'Free To Play',
                    FullDetails: 'Full Details',
                    Game: 'Game',
                    'GameStatusEnum.WaitingToStart_0': 'Waiting To Start',
                    'GameStatusEnum.Started_1': 'Started',
                    'GameStatusEnum.Finished_2': 'Finished',
                    'GameStatusEnum.Cancelled_3': 'Cancelled',
                    GameDetails: 'Game Details',
                    Gender: 'Gender',
                    Go: 'Go',
                    Height: 'Height',
                    HomeCourt: 'Home Court',
                    Id: 'ID',
                    InactiveAccount: '(Inactive Account)',
                    Inches_Abbrev: 'in.',
                    Join: 'Join',
                    JoinTeamRequestModalTitle: 'Request to Join Team',
                    JoinedOnDate: 'Joined on {date}',
                    KeepPrivate: 'Keep Private',
                    LeaveTeam: 'Leave Team',
                    LeaveTeamConfirmationPrompt: 'Are you sure you want to leave {teamName}?',
                    LoadingMoreItemsEllipsis: 'Loading more items...',
                    LoadingSuggestionsEllipsis: 'Loading suggestions...',
                    LoadMore: 'Load More',
                    LocationPickFromTheMap: 'Location: (Please select from the map)',
                    Male: 'Male',
                    ManageThisCourt: 'Manage this court',
                    Members: 'Members',
                    MemberRequests: 'Member Requests',
                    Message: 'Message',
                    Mvps: 'MVPs',
                    New: 'New',
                    NewPost: 'New Post',
                    NearbyCourts: 'Nearby Courts',
                    NewGame: 'New Game',
                    NewGameDetails: 'New Game Details',
                    NewTeamDetails: 'New Team Details',
                    NoAdditionalInfo: '<small class="text-muted">No additional info provided</small>',
                    NoReservationToReviewCourt: 'Sorry. You either have not made a reservation on this court or you have submitted a review for your most recent reservation. You will be able to review this court after your next reservation.',
                    Notification_ABookingHasBeenMadeForYouAtCourtName: 'A game has been booked for you at <strong>{courtName}</strong>',
                    Notification_UserMadeABookingAtCourtName: '<strong>{userName}</strong> has booked a game for <strong>{courtName}</strong>',
                    Notification_UserUpdatedGame: '<strong>{userName}</strong> updated the game <strong>{gameTitle}</strong>',
                    Notification_JoinTeamRequest: '<strong>{requestorName}</strong> is requesting to join <strong>{teamName}</strong>',
                    Notification_JoinTeamRequestApproved: 'Your request to join <strong>{teamName}</strong> has been approved.',
                    NothingToShowAtTheMoment: 'Nothing to show at the moment',
                    NoBookingsOnThisCourtYet: 'No bookings booked at this court yet.',
                    NoDescriptionProvided: 'No description provided',
                    NoGamesOnThisCourtYet: 'No games booked at this court yet.',
                    NoMoreItemsToLoad: 'No more items to load',
                    NoSuggestionsFound: 'No suggestions found',
                    OpenTeam: 'Open Team',
                    Photos: 'Photos',
                    'PlayerPositionEnum.PointGuard_1': 'Point Guard',
                    'PlayerPositionEnum.ShootingGuard_2': 'Shooting Guard',
                    'PlayerPositionEnum.SmallForward_3': 'Small Forward',
                    'PlayerPositionEnum.PowerForward_4': 'Power Forward',
                    'PlayerPositionEnum.Center_5': 'Center',
                    'PlayerPositionEnum.Coach_6': 'Coach',
                    'PlayerPositionAbbrevEnum.PointGuard_1': 'PG',
                    'PlayerPositionAbbrevEnum.ShootingGuard_2': 'SG',
                    'PlayerPositionAbbrevEnum.SmallForward_3': 'SF',
                    'PlayerPositionAbbrevEnum.PowerForward_4': 'PF',
                    'PlayerPositionAbbrevEnum.Center_5': 'C',
                    'PlayerPositionAbbrevEnum.Coach_6': 'CO',
                    PleaseAllowAccessToLocationToLoadNearbyCourts: 'Please allow access to location to load nearby courts.',
                    PleaseContactTheFollowingNumberForInquiries: 'Please contact the following number for inquiries:<br/><br/><h3 class="text-center">{number}</h3>',
                    PlusFollow: '+ Follow',
                    Position: 'Position',
                    PrimaryPhoto: 'PrimaryPhoto',
                    Private: 'Private',
                    ProcessingEllipsis: 'Processing...',
                    Profile: 'Profile',
                    Public: 'Public',
                    RatePerHour: 'Rate Per Hour',
                    ReOpen: 'Re-Open',
                    ReplaceLogo: 'Replace Logo',
                    ReplacePrimaryPhoto: 'Replace Primary Photo',
                    RequestToJoinSent: 'Request to join sent',
                    ReviewCountDisplay: '{count} reviews',
                    Security: 'Security',
                    Schedule: 'Schedule',
                    SearchTheMap: 'Search the map',
                    SetGameResult: 'Set Game Result',
                    SetResult: 'Set Result',
                    Settings: 'Settings',
                    SettingTheWinnerWillEndTheGame: 'Setting the winner will end the game. Do you wish to proceed?',
                    ShowingCurrentOfTotal: 'Showing {current} of {total}',
                    ShowMyBirthDate: 'Show My Birth Date',
                    SortBy: 'Sort by',
                    Start: 'Start',
                    StartGame: 'Start Game',
                    StartTypingToLoadSuggestions: 'Start typing to load suggestions',
                    SubmitRequest: 'Submit Request',
                    Team: 'Team',
                    'TeamsEnum.Team1_0': 'Team 1',
                    'TeamsEnum.Team2_1': 'Team 2',
                    Team1Score: 'Team 1 Score',
                    Team2Score: 'Team 2 Score',
                    TeamId: 'Team ID',
                    TeamName: 'Team Name',
                    TeamNamePrompt: 'What is your team called?',
                    TheRequestedCourtIsNotAvailable: 'The requested court is not available.',
                    ThisPostHasAlreadyBeenDeleted: 'This post has already been deleted.',
                    ThisAccountIsPrivate: 'This account is private.',
                    ThisCourtHasNotRecievedAnyReviewsYet: 'This court has not received any reviews yet.',
                    Title: 'Title',
                    Today: 'Today',
                    Unspecified: 'Unspecified',
                    Untitled: 'Untitled',
                    UpdateAccountDetails: 'Update Account Details',
                    UpdateDetails: 'Update Details',
                    UpdateGameDetails: 'Update Game Details',
                    UploadAPhoto: 'Upload a photo',
                    UploadAVideo: 'Upload a video',
                    UploadingWithProgress: 'Uploading({progress}%)...',
                    UploadVideo: 'Upload Video',
                    UseMap: 'Search using the map',
                    View: 'View',
                    ViewFullDetails: 'View Full Details',
                    ViewLogo: 'View Logo',
                    ViewOnMap: 'View On Map',
                    ViewPrimaryPhoto: 'View Primary Photo',
                    VisibleOnlyToYou: 'Visible only to you',
                    Vs: 'VS',
                    WinRate: 'Win Rate',
                    Winner: 'Winner'
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

            //massage entries
            _modules.forEach(function (module) {
                var moduleEntriesTmp = _entriesTmp[module];
                var moduleEntries = {};
                Object.keys(moduleEntriesTmp).forEach(function (key) {
                    var pieces = key.split('.');
                    var value = moduleEntriesTmp[key]
                    if (pieces.length === 1 || pieces.length === 2) {
                        if (pieces.length === 1) {
                            moduleEntries[key] = value;
                        }
                        else { // if enum
                            var enumName = pieces[0];
                            var theEnum = moduleEntries[enumName] || {};
                            var numericKey = key.match(/(?<=_)\d+$/)[0];
                            var textKey = pieces[1].substr(0, pieces[1].length - (numericKey.length + 1));
                            theEnum[numericKey] = value;
                            theEnum[textKey] = value;
                            moduleEntries[enumName] = theEnum;
                            enumName = enumName.toLowerFirst(); // constants use camel case for enum names
                            constants.enums[enumName] = constants.enums[enumName] || {};
                            constants.enums[enumName][textKey] = Number(numericKey);
                        }
                    }
                    else {
                        throw new Error('Invalid i18n key: ' + key);
                    }
                });
                _entries[module] = moduleEntries;
            });

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

            function convertEnumToChoices(enumeration, config) {
                var choicesConfig = config || {};
                var choices = [];
                var enumObj = _getValue(enumeration);

                angular.forEach(enumObj, function (value, key) {
                    if (choicesConfig.useEnumAsValue) {
                        if (!Dribbly.isNumber(key)) {
                            choices.push({
                                value: key,
                                text: choicesConfig.useEnumAsText ? key : value
                            });
                        }
                    }
                    else {
                        if (Dribbly.isNumber(key)) {
                            choices.push({
                                value: Number(key),
                                text: choicesConfig.useEnumAsText ? key : value
                            });
                        }
                    }
                });

                return choices;
            }

            this.convertEnumToChoices = convertEnumToChoices;
            this.getValue = _getValue;
            this.getString = getLocalizedString;

            return this;
        }]);
})();