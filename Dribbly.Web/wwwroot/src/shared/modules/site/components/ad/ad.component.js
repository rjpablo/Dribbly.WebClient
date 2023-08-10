(function () {
    'use strict';

    angular.module('siteModule')
        .component('drbblyAd', {
            bindings: {
                type: '<'
            },
            controllerAs: 'ads',
            templateUrl: 'drbbly-default',
            controller: controllerFn
        });

    controllerFn.$inject = ['settingsService', '$element'];
    function controllerFn(settingsService, $element) {
        var ads = this;
        var _ads;
        var _type;

        ads.$onInit = function () {
            if (ads.type === 'vertical') {
                _type = 'vertical';
            } else if (ads.type === 'horizontal') {
                _type = 'horizontal';
            }
            else {
                _type = 'square';
            }

            $element.addClass(_type);

            _ads = {
                square: [
                    {
                        imageUrl: 'https://lzd-img-global.slatic.net/g/p/3829fd79956f8da289d58dd4b47c682b.jpg_720x720q80.jpg_.webp',
                        link: 'https://invol.co/cliqbgu',
                        description: 'Men\'s Backpack Travel Backpack Backpack For Hiking Traveling',
                        showBrandIcon: true,
                        brandLogoUrl: 'https://laz-img-cdn.alicdn.com/images/ims-web/TB19SB7aMFY.1VjSZFnXXcFHXXa.png'
                    },
                    {
                        imageUrl: 'https://lzd-img-global.slatic.net/g/p/a7d211580e7dbe420bf016fde0d9e043.jpg_720x720q80.jpg_.webp',
                        link: 'https://invol.co/cliqbeg',
                        description: '4/6/8Person Camping Tent Sunscreen Waterproof Tent Double Layer Outdoor Foldable Automatic Family Tent',
                        showBrandIcon: true,
                        brandLogoUrl: 'https://laz-img-cdn.alicdn.com/images/ims-web/TB19SB7aMFY.1VjSZFnXXcFHXXa.png'
                    },
                    {
                        imageUrl: 'https://lzd-img-global.slatic.net/g/p/3834579bd98313d3d13fd5f477de3efa.jpg_720x720q80.jpg_.webp',
                        link: 'https://invol.co/cliqbfu',
                        description: '30 Seconds Easy Setup Portable Waterproof Camping tent with 50% UV Coating 2 to 4 Person, 4 to 6 person RANDOM COLOR Camping, Hiking, Traveling Automatic Pop Up Family Tent - Perfect for Outdoor Activities',
                        showBrandIcon: true,
                        brandLogoUrl: 'https://laz-img-cdn.alicdn.com/images/ims-web/TB19SB7aMFY.1VjSZFnXXcFHXXa.png'
                    },
                    {
                        imageUrl: 'https://lzd-img-global.slatic.net/g/p/68ed7432a1c81bedde5658a95e82f829.jpg_720x720q80.jpg_.webp',
                        link: 'https://invol.co/cliqblx',
                        description: 'Original diving full face mask goggles swimming with camera scuba snorkeling equipment for adult gear snorkel set snorkling tempered glass gaggles under water kids diver snorkle adults suit snorkels and goglles snorkles low volume googles anti fog',
                        showBrandIcon: true,
                        brandLogoUrl: 'https://laz-img-cdn.alicdn.com/images/ims-web/TB19SB7aMFY.1VjSZFnXXcFHXXa.png'
                    }
                ],
                horizontal: [
                    {
                        imageUrl: 'https://lzd-img-global.slatic.net/g/icms/images/ims-web/77a02dd6-45f6-4812-ae9a-6faac51f5e27.jpg_2200x2200q90.jpg_.webp',
                        link: 'https://invol.co/cliqb7i',
                        description: '6.6 Sulit Sweldo Deals',
                        showBrandIcon: true,
                        brandLogoUrl: 'https://laz-img-cdn.alicdn.com/images/ims-web/TB19SB7aMFY.1VjSZFnXXcFHXXa.png'
                    },
                    {
                        imageUrl: 'https://lzd-img-global.slatic.net/g/gcp/lazada/8d2a245d-69b6-4cd4-8a95-2a9f43210872_PH-1920-240.png',
                        link: 'https://invol.co/cliqb7i',
                        description: '6.6 Sulit Sweldo Deals',
                        showBrandIcon: false,
                        brandLogoUrl: 'https://laz-img-cdn.alicdn.com/images/ims-web/TB19SB7aMFY.1VjSZFnXXcFHXXa.png'
                    },
                    {
                        imageUrl: 'https://cf.shopee.ph/file/ph-50009109-c86d00c9dca98d69f15fca588bb28723_xxhdpi',
                        link: 'https://invl.io/cliqbiw',
                        description: '6.6 Mid-Year Sale',
                        showBrandIcon: true,
                        brandLogoUrl: 'https://icon-library.com/images/shopee-icon/shopee-icon-0.jpg'
                    },
                    {
                        imageUrl: 'https://cf.shopee.ph/file/ph-50009109-985090d55fb6d3e2d318ff543bb9fa94_xxhdpi',
                        link: 'https://invl.io/cliqbiw',
                        description: '6.6 Mid-Year Sale',
                        showBrandIcon: true,
                        brandLogoUrl: 'https://icon-library.com/images/shopee-icon/shopee-icon-0.jpg'
                    }
                ]
            };

            ads.getAd();
        };

        ads.getAd = function () {
            ads.ad = _ads[_type][Math.floor(Math.random() * _ads[_type].length)];
        }
    }
})();
