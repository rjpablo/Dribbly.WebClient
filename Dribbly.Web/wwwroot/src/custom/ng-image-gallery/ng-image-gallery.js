(function () {
    'use strict';

    // Key codes
    var keys = {
        enter: 13,
        esc: 27,
        left: 37,
        right: 39
    };

    angular
        .module('thatisuday.ng-image-gallery', ['ngAnimate'])
        .provider('ngImageGalleryOpts', function () {
            var defOpts = {
                thumbnails: true,
                thumbSize: 80,
                thumbLimit: false,
                inline: false,
                bubbles: true,
                bubbleSize: 10,
                imgBubbles: false,
                bgClose: false,
                piracy: false,
                imgAnim: 'fadeup',
                textValues: {
                    imageLoadErrorMsg: 'Error when loading the image!',
                    deleteButtonTitle: 'Delete this image...',
                    editButtonTitle: 'Edit this image...',
                    closeButtonTitle: 'Close',
                    externalLinkButtonTitle: 'Open image in new tab...'
                },
                showImageBackdrop: true,
                imageBackdropColor: 'rgba(0, 0, 0, 1)',
                inlineImageBackdropColor: 'rgba(0, 0, 0, 0)', // transparent
                sortable: false
            };

            return {
                setOpts: function (newOpts) {
                    angular.extend(defOpts, newOpts);
                },
                $get: function () {
                    return defOpts;
                }
            }
        })
        .filter('ngImageGalleryTrust', ['$sce', function ($sce) {
            return function (value, type) {
                // Defaults to treating trusted value as `html`
                return $sce.trustAs(type || 'html', value);
            }
        }])
        .directive('ngRightClick', ['$parse', function ($parse) {
            return {
                restrict: "A",
                scope: false,
                link: function (scope, element, attrs) {
                    element.bind('contextmenu', function (event) {
                        if (scope.piracy == false) {
                            event.preventDefault();
                            return scope.piracy;
                        }
                    });
                }
            };
        }])
        .directive("showImageAsync", [function () {
            return {
                restrict: "A",
                scope: false,
                link: function (scope, element, attributes) {
                    var image = new Image();
                    image.src = attributes.showImageAsync;
                    image.onload = function () {
                        scope.$apply(function () {
                            if (attributes.asyncKind == 'thumb') {
                                element.css({ backgroundImage: 'url("' + attributes.showImageAsync + '")' });
                                // remove loading animation element
                                var loaderEl = element.find('div.loader')[0];
                                loaderEl.remove();
                            }
                            else if (attributes.asyncKind == 'bubble') {
                                element.css({ backgroundImage: 'url("' + attributes.showImageAsync + '")' });
                            }
                        });
                    };
                    image.onerror = function () {
                        // remove loading animation element
                        var loaderEl = element.find('div.loader')[0];
                        loaderEl.remove();
                    }
                }
            };
        }])
        .directive("bubbleAutoFit", ['$window', '$timeout', function ($window, $timeout) {
            return {
                restrict: "A",
                scope: false,
                link: {
                    pre: function (scope, element, attributes) {
                        var autoFitBubbles = function () {
                            var scrollerWidth = element[0].getBoundingClientRect().width;
                            if (scrollerWidth == 0) return;

                            var bubbleSize = scope.bubbleSize;
                            var minMargin = 4 + 4; // left+right
                            var bubbleSpace = (bubbleSize + minMargin);
                            var rawQuotient = scrollerWidth / bubbleSpace;
                            var bubblesInView = Math.floor(rawQuotient);
                            var extraSpace = scrollerWidth - (bubblesInView * bubbleSpace);
                            var extraMargin = extraSpace / bubblesInView;
                            var bubbleMargin = minMargin + extraMargin;
                            var finalBubbleSpace = bubbleMargin + bubbleSize;

                            scope._bubblesInView = bubblesInView;
                            scope._finalBubbleSpace = finalBubbleSpace;
                            scope._bubbleMargin = '0 ' + (bubbleMargin / 2) + 'px';

                            scope._safeApply(angular.noop);
                        };

                        $timeout(autoFitBubbles);

                        angular.element($window).bind('resize', function () {
                            $timeout(autoFitBubbles);
                        });
                        scope.$watch('inline', function () {
                            $timeout(autoFitBubbles);
                        });
                        scope.$watch('bubbleSize', function () {
                            $timeout(autoFitBubbles);
                        });
                        scope.$watchCollection('images', function () {
                            $timeout(autoFitBubbles);
                        });
                    }
                }
            };
        }])
        .directive("bubbleAutoScroll", ['$window', '$timeout', function ($window, $timeout) {
            return {
                restrict: "A",
                scope: false,
                link: function (scope, element, attributes) {

                    var indexCalc = function () {
                        var relativeIndexToBubbleWrapper = scope._bubblesInView - (scope._bubblesInView - scope._activeImageIndex);

                        $timeout(function () {
                            if (relativeIndexToBubbleWrapper > scope._bubblesInView - 2) {
                                var outBubbles = ((scope._activeImageIndex + 1) - scope._bubblesInView) + 1;

                                if (scope._activeImageIndex != (scope.images.length - 1)) {
                                    scope._bubblesContainerMarginLeft = '-' + (scope._finalBubbleSpace * outBubbles) + 'px';
                                }
                                else {
                                    scope._bubblesContainerMarginLeft = '-' + (scope._finalBubbleSpace * (outBubbles - 1)) + 'px';
                                }
                            }
                            else {
                                scope._bubblesContainerMarginLeft = '0px';
                            }
                        });
                    }

                    angular.element($window).bind('resize', function () {
                        $timeout(indexCalc);
                    });
                    scope.$watch('_bubblesInView', function () {
                        $timeout(indexCalc);
                    });
                    scope.$watch('_activeImageIndex', function () {
                        $timeout(indexCalc);
                    });
                    scope.$watchCollection('images', function () {
                        $timeout(indexCalc);
                    });
                }
            };
        }])
        .directive('ngImageGallery', ['$rootScope', '$timeout', '$q', 'ngImageGalleryOpts',
            function ($rootScope, $timeout, $q, ngImageGalleryOpts) {
                return {
                    replace: true,
                    transclude: false,
                    restrict: 'AE',
                    scope: {
                        images: '<',		// []
                        methods: '=?',		// {}
                        conf: '=?',		// {}

                        thumbnails: '=?',		// true|false
                        thumbSize: '=?', 		// px
                        thumbLimit: '=?', 		// px
                        inline: '=?',		// true|false
                        bubbles: '=?',		// true|false
                        bubbleSize: '=?',		// px
                        imgBubbles: '=?',		// true|false
                        bgClose: '=?',		// true|false
                        piracy: '=?',		// true|false
                        imgAnim: '@?',		// {name}
                        textValues: '=?',		// {}
                        hideCaptions: '=?',
                        cover: '=?', // the image will cover the whole gallery
                        sortable: '=?', // true|false

                        onBeforeOpen: '=?',	// function
                        onOpen: '&?',		// function
                        onClose: '&?',		// function,
                        onDelete: '&?',
                        onEdit: '&?',
                        onSort: '&?',
                        imageAsBackdrop: '<' //whether or not to use the image as the backdrop for itself. Default: true
                    },
                    templateUrl: '/src/custom/ng-image-gallery/ng-image-gallery.html',
                    link: {
                        pre: function (scope, elem, attr) {
                            var lastDragStart; // the timestamp when a last drap event started
                            /*
                             *	Operational functions
                            **/

                            // Show gallery loader
                            scope._showLoader = function () {
                                scope.imgLoading = true;
                            }

                            // Hide gallery loader
                            scope._hideLoader = function () {
                                scope.imgLoading = false;
                            }

                            // Image load complete promise
                            scope._loadImg = function (imgObj) {

                                // Return rejected promise
                                // if not image object received
                                if (!imgObj) return $q.reject();

                                if (imgObj.type == 1) return $q.resolve(imgObj); //video

                                var deferred = $q.defer();

                                // Show loader
                                if (!imgObj.hasOwnProperty('cached')) scope._showLoader();

                                // Process image
                                var img = new Image();
                                img.src = imgObj.url;
                                img.onload = function () {
                                    // Hide loader
                                    if (!imgObj.hasOwnProperty('cached')) scope._hideLoader();

                                    // Cache image
                                    if (!imgObj.hasOwnProperty('cached')) imgObj.cached = true;

                                    deferred.resolve(imgObj);
                                }
                                img.onerror = function () {
                                    if (!imgObj.hasOwnProperty('cached')) scope._hideLoader();

                                    deferred.reject('Error when loading img');
                                }

                                return deferred.promise;
                            }

                            scope._setActiveImg = function (imgObj) {
                                // Get images move direction
                                if (
                                    scope.images.indexOf(scope._activeImg) - scope.images.indexOf(imgObj) == (scope.images.length - 1) ||
                                    (
                                        scope.images.indexOf(scope._activeImg) - scope.images.indexOf(imgObj) <= 0 &&
                                        scope.images.indexOf(scope._activeImg) - scope.images.indexOf(imgObj) != -(scope.images.length - 1)
                                    )

                                ) {
                                    scope._imgMoveDirection = 'forward';
                                }
                                else {
                                    scope._imgMoveDirection = 'backward';
                                }

                                // Load image
                                scope._loadImg(imgObj).then(function (imgObj) {
                                    scope._activeImg = imgObj;
                                    if (imgObj.type !== 1) { // not video
                                        scope._imageGalleryContentStyle = { 'background-image': 'url(' + imgObj.url + ')' }
                                    }
                                    scope.imgError = false;
                                }, function () {
                                    /**** Customization - START****/
                                    // Purpose: allow controls to show even when image fails to load
                                    // Original Code:
                                    // scope._activeImg = null;
                                    //
                                    // New Code:

                                    scope._activeImg = imgObj;

                                    /**** Customization - END****/
                                    scope._activeImageIndex = scope.images.indexOf(imgObj);
                                    scope.imgError = true;
                                });
                            }

                            scope._safeApply = function (fn) {
                                var phase = this.$root.$$phase;
                                if (phase == '$apply' || phase == '$digest') {
                                    if (fn && (typeof (fn) === 'function')) {
                                        fn();
                                    }
                                } else {
                                    this.$apply(fn);
                                }
                            };

                            scope._deleteImg = function (img, e) {
                                e.stopPropagation();
                                var _deleteImgCallback = function () {
                                    var index = scope.images.indexOf(img);
                                    if (index >= 0) {
                                        scope.images.splice(index, 1);
                                    }

                                    /**** CUSTOMIZATION - START ****/
                                    // Original code:
                                    // scope._activeImageIndex = 0;
                                    //
                                    // New Code:

                                    if (scope.images.length) {
                                        if (index < scope.images.length) {
                                            scope._activeImageIndex = index;
                                            scope._setActiveImg(
                                                scope.images[scope._activeImageIndex]
                                            );
                                        }
                                        else {
                                            scope._activeImageIndex = 0;
                                        }
                                    }
                                    else {
                                        //close if no more images left
                                        scope.methods.close();
                                    }

                                    /**** CUSTOMIZATION - END ****/

                                    /**/
                                }

                                scope.onDelete({ img: img, cb: _deleteImgCallback });
                            }

                            scope._editImg = function (img) {
                                if (!scope.inline) scope.methods.close();

                                scope.onEdit({ img: img });
                            }


                            /***************************************************/


                            /*
                             *	Gallery settings
                            **/

                            // Modify scope models
                            scope.images = (scope.images != undefined) ? scope.images : [];
                            scope.methods = (scope.methods != undefined) ? scope.methods : {};
                            scope.conf = (scope.conf != undefined) ? scope.conf : {};

                            // setting options
                            scope.$watchCollection('conf', function (conf) {
                                scope.thumbnails = (conf.thumbnails != undefined) ? conf.thumbnails : (scope.thumbnails != undefined) ? scope.thumbnails : ngImageGalleryOpts.thumbnails;
                                scope.thumbSize = (conf.thumbSize != undefined) ? conf.thumbSize : (scope.thumbSize != undefined) ? scope.thumbSize : ngImageGalleryOpts.thumbSize;
                                scope.thumbLimit = (conf.thumbLimit != undefined) ? conf.thumbLimit : (scope.thumbLimit != undefined) ? scope.thumbLimit : ngImageGalleryOpts.thumbLimit;
                                scope.inline = (conf.inline != undefined) ? conf.inline : (scope.inline != undefined) ? scope.inline : ngImageGalleryOpts.inline;
                                scope.bubbles = (conf.bubbles != undefined) ? conf.bubbles : (scope.bubbles != undefined) ? scope.bubbles : ngImageGalleryOpts.bubbles;
                                scope.bubbleSize = (conf.bubbleSize != undefined) ? conf.bubbleSize : (scope.bubbleSize != undefined) ? scope.bubbleSize : ngImageGalleryOpts.bubbleSize;
                                scope.imgBubbles = (conf.imgBubbles != undefined) ? conf.imgBubbles : (scope.imgBubbles != undefined) ? scope.imgBubbles : ngImageGalleryOpts.imgBubbles;
                                scope.bgClose = (conf.bgClose != undefined) ? conf.bgClose : (scope.bgClose != undefined) ? scope.bgClose : ngImageGalleryOpts.bgClose;
                                scope.piracy = (conf.piracy != undefined) ? conf.piracy : (scope.piracy != undefined) ? scope.piracy : ngImageGalleryOpts.piracy;
                                scope.imgAnim = (conf.imgAnim != undefined) ? conf.imgAnim : (scope.imgAnim != undefined) ? scope.imgAnim : ngImageGalleryOpts.imgAnim;
                                scope.textValues = (conf.textValues != undefined) ? conf.textValues : (scope.textValues != undefined) ? scope.textValues : ngImageGalleryOpts.textValues;
                                scope.showImageBackdrop = (conf.showImageBackdrop != undefined) ? conf.showImageBackdrop : (scope.showImageBackdrop != undefined) ? scope.showImageBackdrop : ngImageGalleryOpts.showImageBackdrop;
                                scope.imageBackdropColor = (conf.imageBackdropColor != undefined) ? conf.imageBackdropColor : (scope.imageBackdropColor != undefined) ? scope.imageBackdropColor : ngImageGalleryOpts.imageBackdropColor;
                                scope.inlineImageBackdropColor = (conf.inlineImageBackdropColor != undefined) ? conf.inlineImageBackdropColor : (scope.inlineImageBackdropColor != undefined) ? scope.inlineImageBackdropColor : ngImageGalleryOpts.inlineImageBackdropColor;
                                scope.sortable = (conf.sortable != undefined) ? conf.sortable : (scope.sortable != undefined) ? scope.sortable : ngImageGalleryOpts.sortable;
                            });

                            scope.onOpen = (scope.onOpen != undefined) ? scope.onOpen : angular.noop;
                            scope.onClose = (scope.onClose != undefined) ? scope.onClose : angular.noop;
                            scope.onDelete = (scope.onDelete != undefined) ? scope.onDelete : angular.noop;
                            scope.onEdit = (scope.onEdit != undefined) ? scope.onEdit : angular.noop;

                            // If images populate dynamically, reset gallery
                            var imagesFirstWatch = true;
                            scope.$watchCollection('images', function () {
                                if (imagesFirstWatch) {
                                    imagesFirstWatch = false;
                                }
                                else if (scope.images && scope.images.length) {
                                    scope._setActiveImg(scope.images[scope._activeImageIndex || 0]);
                                }
                            });

                            // Watch index of visible/active image
                            // If index changes, make sure to load/change image
                            var activeImageIndexFirstWatch = true;
                            scope.$watch('_activeImageIndex', function (newImgIndex) {
                                if (activeImageIndexFirstWatch) {
                                    activeImageIndexFirstWatch = false;
                                }
                                else if (scope.images.length) {
                                    scope._setActiveImg(
                                        scope.images[newImgIndex]
                                    );
                                }
                            });

                            // Open modal automatically if inline
                            scope.$watch('inline', function () {
                                $timeout(function () {
                                    if (scope.inline) scope.methods.open(scope._activeImageIndex, true);
                                });
                            });

                            // Open modal automatically if inline
                            scope.$watch('sortable', function () {
                                if (!scope.inline && scope.thumbnails) {
                                    $timeout(function () {
                                        var sortableInstance = $(".ng-image-gallery-thumbnails");
                                        if (scope.sortable) {
                                            sortableInstance.sortable('enable');
                                        }
                                        else {
                                            sortableInstance.sortable('disable');
                                        }
                                    }, 100);
                                }
                            });


                            /***************************************************/


                            /*
                             *	Methods
                            **/

                            // Open gallery modal
                            scope.methods.open = function (imgIndex, isAutoOpen) {
                                if (scope.onBeforeOpen && !scope.onBeforeOpen({ index: imgIndex, isAutoOpen: isAutoOpen })) {
                                    return;
                                }

                                // if a drag event started 500ms ago, do not open. The user probably didn't intend to open the gallery
                                if ((new Date() - lastDragStart) / 1000 < 0.5) return;

                                // Open modal from an index if one passed
                                scope._activeImageIndex = (imgIndex) ? imgIndex : 0;

                                scope.opened = true;

                                // set overflow hidden to body
                                if (!scope.inline) angular.element(document.body).addClass('body-overflow-hidden');

                                // call open event after transition
                                $timeout(function () {
                                    scope.onOpen();
                                }, 300);
                            }

                            // Close gallery modal
                            scope.methods.close = function () {
                                if (scope.isOriginallyInline) { // Just set back to inline if originally inline
                                    scope.inline = scope.isOriginallyInline;
                                    $timeout(function () {
                                        // set overflow hidden to body
                                        angular.element(document.body).removeClass('body-overflow-hidden');
                                        scope.onClose();
                                    }, 300);
                                    return;
                                }

                                scope.opened = false; // Model closed
                                // set overflow hidden to body
                                angular.element(document.body).removeClass('body-overflow-hidden');
                                // call close event after transition
                                $timeout(function () {
                                    scope.onClose();
                                    scope._activeImageIndex = 0; // Reset index
                                }, 300);
                            }

                            // Change image to next
                            scope.methods.next = function () {
                                if (scope._activeImageIndex == ((scope.images || []).length - 1)) {
                                    scope._activeImageIndex = 0;
                                }
                                else {
                                    scope._activeImageIndex = scope._activeImageIndex + 1;
                                }
                            }

                            // Change image to prev
                            scope.methods.prev = function () {
                                if (scope._activeImageIndex == 0) {
                                    scope._activeImageIndex = scope.images.length - 1;
                                }
                                else {
                                    scope._activeImageIndex--;
                                }
                            }

                            // Change image to prev
                            scope.methods.expand = function (imgIndex) {
                                if (scope.onBeforeOpen && !scope.onBeforeOpen({ index: imgIndex, isAutoOpen: false })) {
                                    return;
                                }
                                scope.isOriginallyInline = scope.inline;
                                scope.inline = false;
                                scope.methods.open(imgIndex);
                            }

                            scope.canExpand = function () {
                                return scope.inline;
                            }

                            scope.methods.getFiles = function () {
                                var values = [];
                                $('.thumb').each(function () {
                                    var image = scope.images.badFirst(i => i.id == $(this).attr("id"));
                                    values.push(image);
                                });
                                return values;
                            }

                            scope.isVideo = function (file) {
                                return file && file.type === 1;
                            }

                            // Close gallery on background click
                            scope.backgroundClose = function (e) {
                                if (!scope.bgClose || scope.inline) return;

                                var noCloseClasses = [
                                    'galleria-image',
                                    'destroy-icons-container',
                                    'delete-img', // Customization - added to prevent closing when delete button is clicked
                                    'ext-url',
                                    'close',
                                    'next',
                                    'prev',
                                    'galleria-bubble',
                                    'expand',
                                    'expand-icon'
                                ];

                                // check if clicked element has a class that
                                // belongs to `noCloseClasses`
                                for (var i = 0; i < e.target.classList.length; i++) {
                                    if (noCloseClasses.indexOf(e.target.classList[i]) != -1) {
                                        return;
                                    }
                                }

                                scope.methods.close();
                            }


                            /***************************************************/


                            /*
                             *	User interactions
                            **/

                            // Key events
                            angular.element(document).bind('keyup', function (event) {
                                // If inline modal, do not interact
                                if (scope.inline) return;

                                if (event.which == keys.right || event.which == keys.enter) {
                                    $timeout(function () {
                                        scope.methods.next();
                                    });
                                }
                                else if (event.which == keys.left) {
                                    $timeout(function () {
                                        scope.methods.prev();
                                    });
                                }
                                else if (event.which == keys.esc) {
                                    $timeout(function () {
                                        scope.methods.close();
                                    });
                                }
                            });

                            // Swipe events
                            if (window.Hammer) {
                                var hammerElem = new Hammer(elem[0]);
                                hammerElem.on('swiperight', function (ev) {
                                    $timeout(function () {
                                        scope.methods.prev();
                                    });
                                });
                                hammerElem.on('swipeleft', function (ev) {
                                    $timeout(function () {
                                        scope.methods.next();
                                    });
                                });
                                hammerElem.on('doubletap', function (ev) {
                                    if (scope.inline) return;

                                    $timeout(function () {
                                        scope.methods.close();
                                    });
                                });
                            };


                            /***********************************************************/


                            /*
                             *	Actions on angular events
                            **/

                            var removeClassFromDocumentBody = function () {
                                angular.element(document.body).removeClass('body-overflow-hidden');
                            };

                            $rootScope.$on('$stateChangeSuccess', removeClassFromDocumentBody);
                            $rootScope.$on('$routeChangeSuccess', removeClassFromDocumentBody);

                            $timeout(function () {
                                var thumbnailsContainer = $(".ng-image-gallery-thumbnails");
                                thumbnailsContainer.sortable({
                                    start: (event, ui) => {
                                        lastDragStart = new Date();
                                        console.log('drag start');
                                    },
                                    update: function (event, ui) {
                                        updateModel();
                                    } //end update         
                                });
                            }, 100);


                            function updateModel() {
                                if (scope.onSort) {
                                    scope.onSort(scope.methods.getFiles());
                                }
                            }
                        }
                    }
                }
            }]);
})();