(function () {
    'use strict';

    angular.module('siteModule')
        .service('drbblyOverlayService', ['$http', 'settingsService', '$q',
            function ($http, settingsService, $q) {
                /**
                 * Builds a new overlay object.
                 * @param {String} defaultStatus the overlay's default status
                 * @param {String} messageOverride The message to be displayed on the overlay.
                 *                                 If not set, the default will be used.
                 * @returns {Overlay} a new overlay object.
                 */
                function buildOverlay(defaultStatus, messageOverride) {
                    var overlay = {
                        _status: isNullOrUndefined(defaultStatus) ? '' : defaultStatus,
                        setToBusy: function (msg) {
                            setOverlayToBusy(overlay, msg);
                        },
                        setToReady: function (msg) {
                            setOverlayToReady(overlay, msg);
                        },
                        setToError: function (msg) {
                            setOverlayToError(overlay, msg);
                        },
                        setToCustom: function () {
                            setOverlayToCustom(overlay);
                        },
                        setStatus: function (status, messageOverride) {
                            setStatus(overlay, status, messageOverride);
                        }
                    };

                    setStatus(overlay, overlay._status, messageOverride);

                    return overlay;
                }

                function isNullOrUndefined(text) {
                    return text === null || text === undefined;
                }

                function setStatus(overlay, status, msg) {
                    switch (status) {
                        case '':
                            setOverlayToReady(overlay, msg);
                            break;
                        case 'busy':
                            setOverlayToBusy(overlay, msg);
                            break;
                        case 'error':
                            setOverlayToError(overlay, msg);
                            break;
                        default:
                            throw new Error('Invalid overlay status: ' + status);
                    }
                }

                /**
                 * Sets the overlay to busy.
                 * @param {Overlay} overlay The overlay to set.
                 * @param {String} msg The message to be displayed on the overlay.
                 *                     If not set, the default will be used.
                 */
                function setOverlayToBusy(overlay, msg) {
                    overlay._status = 'busy';
                    adjustOverlay(overlay, { isBusy: true }, msg);
                }

                /**
                 * Sets the overlay to ready.
                 * @param {Overlay} overlay The overlay to set.
                 * @param {String} msg The message to be displayed on the overlay.
                 *                     If not set, the default will be used.
                 */
                function setOverlayToReady(overlay, msg) {
                    overlay._status = '';
                    adjustOverlay(overlay, { isReady: true }, msg);
                }

                /**
                 * Sets the overlay to error.
                 * @param {Overlay} overlay The overlay to set.
                 * @param {String} msg The message to be displayed on the overlay.
                 *                     If not set, the default will be used.
                 */
                function setOverlayToError(overlay, msg) {
                    overlay._status = 'error';
                    adjustOverlay(overlay, { isError: true }, msg);
                }

                /**
                 * Sets the overlay status booleans to the given parameters.
                 * @param {Overlay} overlay The overlay to adjust.
                 * @param {object} statusObject The object holding the statuses that should be set.
                 *                              Any that aren't in the object default to false.
                 * @param {String} messageOverride One-time message to be displayed on the overlay.
                 *                                 If not set, the default will be used.
                 */
                function adjustOverlay(overlay, statusObject, messageOverride) {
                    overlay.msgOverride = messageOverride;
                    var statuses = statusObject || {};
                    overlay.isBusy = Boolean(statuses.isBusy);
                    overlay.isReady = Boolean(statuses.isReady);
                    overlay.isError = Boolean(statuses.isError);
                    overlay.isCustom = Boolean(statuses.isCustom);
                }

                var service = {
                    buildOverlay: buildOverlay
                };

                return service;
            }]);
})();