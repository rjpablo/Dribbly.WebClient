(function () {
    'use strict';

    angular
        .module('mainModule')
        .component('drbblyAccountdetails', {
            bindings: {
                account: '<',
                onUpdate: '<'
            },
            controllerAs: 'dad',
            templateUrl: 'drbbly-default',
            controller: controllerFunc
        });

    controllerFunc.$inject = ['constants', 'drbblyFileService', '$stateParams',
        'drbblyOverlayService', 'drbblyAccountsService', 'drbblyFooterService', '$timeout'];
    function controllerFunc(constants, drbblyFileService, $stateParams,
        drbblyOverlayService, drbblyAccountsService, drbblyFooterService, $timeout) {
        var dad = this;
        var _priceComponent;

        dad.$onInit = function () {
            dad.username = $stateParams.username;
            dad.overlay = drbblyOverlayService.buildOverlay();
            //dad.isOwned = dad.account.ownerId === authService.authentication.userId;
            dad.account.profilePhoto = dad.account.profilePhoto || getDefaultProfilePhoto();
            loadAccount();
        };

        function getDefaultProfilePhoto() {
            return {
                url: '../../../../../' + constants.images.defaultProfilePhotoUrl
            };
        }

        function loadAccount() {
            dad.overlay.setToBusy();
            //drbblyAccountsService.getAccount(dad.accountId)
            //    .then(function (data) {
            //        dad.account = data;
            //        dad.isOwned = dad.account.ownerId === authService.authentication.userId;
            //        dad.onUpdate(dad.account);
            //        dad.overlay.setToReady();
            //    })
            //    .catch(dad.overlay.setToError);
            $timeout(dad.overlay.setToReady, 1000);
        }

        function createPriceComponent() {

            if (_priceComponent) {
                _priceComponent.remove();
            }

            _priceComponent = drbblyFooterService.addFooterItem({
                scope: $scope,
                template: '<drbbly-accountprice account="dad.account"></dribbly-accountprice>'
            });
        }

        dad.edit = function () {
            drbblyAccountshelperService.editAccount(dad.account)
                .then(function () {
                    dad.onUpdate();
                })
                .catch(function () { /*do nothing*/ });
        };

        dad.changePrimaryPicture = function (file) {
            if (!file) { return; }
            drbblyFileService.upload(file, 'api/accounts/updateAccountPhoto/' + dad.account.id)
                .then(function (result) {
                    //loadAccount();
                    dad.onUpdate();
                })
                .catch(function (error) {
                    console.log(error);
                });
        };
    }
})();
