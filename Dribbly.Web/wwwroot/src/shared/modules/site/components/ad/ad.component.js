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

    controllerFn.$inject = ['adsService', '$element', '$interval'];
    function controllerFn(adsService, $element, $interval) {
        var ads = this;
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
            

            ads.getAd();
        };

        ads.getAd = function () {
            ads.ad = adsService.getAd(_type);
            $interval(function () {
                ads.ad = adsService.getAd(_type);
            }, 30000);
        }
    }

    angular.module('siteModule')
        .service('adsService', function () {
            var _ads = {
                square: [
                    {
                        imageUrl: 'https://lzd-img-global.slatic.net/g/p/3829fd79956f8da289d58dd4b47c682b.jpg_720x720q80.jpg_.webp',
                        link: 'https://invol.co/cliqbgu',
                        description: 'Men\'s Backpack Travel Backpack Backpack For Hiking Traveling',
                        showBrandIcon: true,
                        brandLogoUrl: 'https://laz-img-cdn.alicdn.com/images/ims-web/TB19SB7aMFY.1VjSZFnXXcFHXXa.png',
                        disabled: true
                    },
                    // Shopee
                    {
                        // Elastic quick-drying sports tights fitness pants men's basketball running training compression tight
                        imageUrl: 'https://down-ph.img.susercontent.com/file/ph-11134207-7qukx-lh5v0h8fwuzq06',
                        link: 'https://invl.io/cljv7pj',
                        showBrandIcon: true,
                        brandLogoUrl: 'https://icon-library.com/images/shopee-icon/shopee-icon-0.jpg'
                    },
                    {
                        // high quality unisex JUMPMAN jersey basketball shorts class A jumpman elite Jordan CLA short
                        imageUrl: 'https://down-ph.img.susercontent.com/file/fda7dfa26b4465c3286207fbb1e6a547',
                        link: 'https://invl.io/cljv7no',
                        showBrandIcon: true,
                        brandLogoUrl: 'https://icon-library.com/images/shopee-icon/shopee-icon-0.jpg'
                    },
                    {
                        // NBA Hyper Elite Basketball Socks For Men Athletic Socks Sports Basketball Socks Nike Socks Mid Cut
                        imageUrl: 'https://down-ph.img.susercontent.com/file/ph-11134207-7qul7-lf9k0ndyno5q24',
                        link: 'https://invl.io/cljv7mj',
                        showBrandIcon: true,
                        brandLogoUrl: 'https://icon-library.com/images/shopee-icon/shopee-icon-0.jpg'
                    },
                    {
                        // Fashion Adult High Cut Light Gray Yellow Basketball Shoes Sneaker for Men #2111
                        imageUrl: 'https://down-ph.img.susercontent.com/file/sg-11134201-7qvfv-lhru4b2xtw6hf5',
                        link: 'https://invl.io/cljv7ii',
                        showBrandIcon: true,
                        brandLogoUrl: 'https://icon-library.com/images/shopee-icon/shopee-icon-0.jpg'
                    },
                    {
                        // Wilshi Fashion Basketball Ball ( Indoor and Outdoor )
                        imageUrl: 'https://down-ph.img.susercontent.com/file/b886fe9148adc9fa378dbfaf588ff61f',
                        link: 'https://invl.io/cljv7ho',
                        showBrandIcon: true,
                        brandLogoUrl: 'https://icon-library.com/images/shopee-icon/shopee-icon-0.jpg'
                    },
                    {
                        // High quality MLB NBA basketball American shorts fashion shorts jesery for mens
                        imageUrl: 'https://down-ph.img.susercontent.com/file/3c6377c59fe88ad6af1b57d3ae0215f2',
                        link: 'https://invl.io/cljv7aq',
                        showBrandIcon: true,
                        brandLogoUrl: 'https://icon-library.com/images/shopee-icon/shopee-icon-0.jpg'
                    },
                    {
                        // Fashion AJ01 casual basketball shoes low cut sneakers leather non-slip flat for Men and Women
                        imageUrl: 'https://down-ph.img.susercontent.com/file/ph-11134201-23030-ss6a9408ddov31',
                        link: 'https://invl.io/cljv79y',
                        showBrandIcon: true,
                        brandLogoUrl: 'https://icon-library.com/images/shopee-icon/shopee-icon-0.jpg'
                    },
                    {
                        // Basketball Shoes with Spike for Men Non-slip Rubber Shoes Fashion Low Cut Sneaker Shoes Good Quality
                        imageUrl: 'https://down-ph.img.susercontent.com/file/ph-11134207-7qula-lh7fubrx9i8w13',
                        link: 'https://invl.io/cljv797',
                        showBrandIcon: true,
                        brandLogoUrl: 'https://icon-library.com/images/shopee-icon/shopee-icon-0.jpg'
                    },
                    {
                        // 5 Pairs a pouch Ins Fashion Good Quality Mid Cut Basketball Socks For Men
                        imageUrl: 'https://down-ph.img.susercontent.com/file/ph-11134207-7qul2-libfvbkkscbg39',
                        link: 'https://invl.io/cljv77v',
                        description: '5 Pairs a pouch Ins Fashion Good Quality Mid Cut Basketball Socks For Men',
                        showBrandIcon: true,
                        brandLogoUrl: 'https://icon-library.com/images/shopee-icon/shopee-icon-0.jpg'
                    },
                    {
                        // Jorday basketball black red
                        imageUrl: 'https://down-ph.img.susercontent.com/file/ph-11134207-7qul6-lis2x1g16r5y2a',
                        link: 'https://invl.io/cljv6yc',
                        showBrandIcon: true,
                        brandLogoUrl: 'https://icon-library.com/images/shopee-icon/shopee-icon-0.jpg'
                    },
                    {
                        //Basketball bag
                        imageUrl: 'https://down-ph.img.susercontent.com/file/ce1b28c4fc9d8b12c216fc086a3c9553',
                        link: 'https://invl.io/cljv6yl',
                        showBrandIcon: true,
                        brandLogoUrl: 'https://icon-library.com/images/shopee-icon/shopee-icon-0.jpg'
                    },
                    {
                        //Basketball bag
                        imageUrl: 'https://down-ph.img.susercontent.com/file/472dc359cd478da7276344c5a9716319',
                        link: 'https://invl.io/cljv6ys',
                        showBrandIcon: true,
                        brandLogoUrl: 'https://icon-library.com/images/shopee-icon/shopee-icon-0.jpg'
                    },
                    {
                        //Jordan Travel bag
                        imageUrl: 'https://down-ph.img.susercontent.com/file/ph-11134201-23030-dk9lp86ajhov44',
                        link: 'https://invl.io/cljv6z0',
                        showBrandIcon: true,
                        brandLogoUrl: 'https://icon-library.com/images/shopee-icon/shopee-icon-0.jpg'
                    },
                    { // Sports backpack 4 colors
                        imageUrl: 'https://down-ph.img.susercontent.com/file/cn-11134207-7qukw-ljcjnuq9uzqudd',
                        link: 'https://invl.io/cljv6qc',
                        showBrandIcon: true,
                        brandLogoUrl: 'https://icon-library.com/images/shopee-icon/shopee-icon-0.jpg'
                    },
                    { // Wolt Basketball backpack
                        imageUrl: 'https://down-ph.img.susercontent.com/file/sg-11134201-22110-5z9v03dnywjvbf',
                        link: 'https://invl.io/cljv6pq',
                        showBrandIcon: true,
                        brandLogoUrl: 'https://icon-library.com/images/shopee-icon/shopee-icon-0.jpg'
                    },
                    { // Wilson 3x3 basketball
                        imageUrl: 'https://down-ph.img.susercontent.com/file/e6159a82020644c9166b8edf9f64e4ab',
                        link: 'https://invl.io/cljv6oz',
                        showBrandIcon: true,
                        brandLogoUrl: 'https://icon-library.com/images/shopee-icon/shopee-icon-0.jpg'
                    },
                    {
                        imageUrl: 'https://down-ph.img.susercontent.com/file/sg-11134201-22110-k9d36b5e2fjv27',
                        link: 'https://invl.io/cljv6mj',
                        showBrandIcon: true,
                        brandLogoUrl: 'https://icon-library.com/images/shopee-icon/shopee-icon-0.jpg'
                    },
                    {
                        imageUrl: 'https://down-ph.img.susercontent.com/file/85de2655ef89d3f5a182ae6ebc2a2ab6',
                        link: 'https://invl.io/cljv64k',
                        showBrandIcon: true,
                        brandLogoUrl: 'https://icon-library.com/images/shopee-icon/shopee-icon-0.jpg'
                    },
                    {
                        // Commission Extra - Molten
                        imageUrl: 'https://ph-live-01.slatic.net/p/42857df0b39ebccacaba864bd9c0fa0e.png',
                        link: 'https://invl.io/cljv62r',
                        showBrandIcon: true,
                        brandLogoUrl: 'https://icon-library.com/images/shopee-icon/shopee-icon-0.jpg'
                    },
                    // Adidas
                    {
                        imageUrl: 'https://img.involve.asia/rpss/campaigns_banners/37724-MXOHw5jKepExeInPrfNUKPkUUIuJhohE.jpeg',
                        link: 'https://invol.co/cljv5xr'
                    },
                    {
                        imageUrl: 'https://img.involve.asia/rpss/campaigns_banners/37724-tIRnrjA0pNWJSVvp7XYS6CgMqFsV8b7K.jpeg',
                        link: 'https://invol.co/cljv5xr'
                    },
                ],
                horizontal: [
                    // Shopee
                    {
                        imageUrl: 'https://cf.shopee.ph/file/ph-50009109-985090d55fb6d3e2d318ff543bb9fa94_xxhdpi',
                        link: 'https://invl.io/cliqbiw',
                        description: '6.6 Mid-Year Sale',
                        showBrandIcon: true,
                        brandLogoUrl: 'https://icon-library.com/images/shopee-icon/shopee-icon-0.jpg',
                        end: new Date(2023, 6, 15)
                    },
                    {
                        //Shopee CPS
                        imageUrl: 'https://cf.shopee.ph/file/ph-50009109-9142c3c209f1414f8778ae4548c14a54_xxhdpi',
                        link: 'https://invl.io/cljv5fq',
                        showBrandIcon: true,
                        brandLogoUrl: 'https://icon-library.com/images/shopee-icon/shopee-icon-0.jpg'
                    },
                    {
                        //Shopee CPS
                        imageUrl: 'https://cf.shopee.ph/file/ph-50009109-4e2137d78e3bcbe45bfd26caf76effc9_xxhdpi',
                        link: 'https://invl.io/cljv5fq',
                        description: 'Free Shipping Araw-Araw',
                        showBrandIcon: true,
                        brandLogoUrl: 'https://icon-library.com/images/shopee-icon/shopee-icon-0.jpg'
                    },
                    // Adidas
                    {
                        imageUrl: 'https://img.involve.asia/rpss/campaigns_banners/37724-THmROatAvDCBUFg1KCnYFAk4iwprv7ai.gif',
                        link: 'https://invol.co/cljv5xr'
                    }
                ]
            };

            function getAd(type) {
                var now = new Date();
                var activeAds = _ads[type].drbblyWhere(a => !a.disabled && (!a.start || now > a.start) && (!a.end || now < a.end));
                return activeAds[Math.floor(Math.random() * activeAds.length)];
            }

            return {
                getAd
            };
        });
})();
