(function () {
    'use strict';

    angular
        .module('appModule')
        .component('drbblyGallery', {
            bindings: {
                // A function that returns a promise. The item only gets removed from the gallery when the promise is resolved
                onDelete: '<',
                onSelect: '<',
                canAdd: '<',
                media: '<',
                options: '<',
                addButtonLabel: '<'
            },
            controllerAs: 'glr',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['drbblyCommonService', 'modalService', '$timeout'];
    function controllerFunc(drbblyCommonService, modalService, $timeout) {
        var glr = this;

        glr.$onInit = function () {
            glr.media = glr.media || [];
            glr._options = glr.options || {};
        };

        glr.deletePhoto = function (photo, done) {
            if (glr.onDelete) {
                glr.onDelete(photo, done);
            }
            else {
                done();
            }
        };

        glr.addPhotos = function (files) {
            if (files && files.length && glr.onSelect) {
                glr.onSelect(files);
            }
        };

        glr.hasFiles = () => glr.media && glr.media.length > 0;

        glr.onBeforeOpen = function (index) {
            modalService.show({
                view: '<drbbly-gallerymodal></drbbly-gallerymodal>',
                model: {
                    photos: glr.media,
                    onDelete: glr.onDelete,
                    methods: glr.options.methods
                },
                isFull: true
            })
                .catch(() => { /*do nothing*/ });

            $timeout(function () {
                glr.options.methods.open(index);
            }, 100)

            return false;
        }
    }
})();
