(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyCourtsContainer', {
            bindings: {
                app: '<'
            },
            controllerAs: 'dcc',
            templateUrl: '/modules/main/containers/courts-container/courts-container.component.html',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['courtsService', '$element', 'drbblyToolbarService'];
    function controllerFunc(courtsService, $element, drbblyToolbarService) {
        var dcc = this;

        dcc.$onInit = function () {
            $element.addClass('drbbly-courts-container');
            setToolbarItems();

            courtsService.getAllCourts()
                .then(function (data) {
                    dcc.courts = data;
                })
                .catch(function (error) {
                    console.log('failed to retrieve courts:' + error.exceptionMessage);
                });
        };

        function setToolbarItems() {
            var buildItem = drbblyToolbarService.buildItem;
            drbblyToolbarService.setItems([
                {
                    iconClass: 'fa fa-plus',
                    action: addCourt
                }, buildItem('fa fa-search', toggleSearch)
            ]);
        }

        function addCourt() {
            console.log('addCourt');
        }

        function toggleSearch() {
            console.log('toggleSearch');
        }
    }
})();
