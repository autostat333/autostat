module.exports = function($stateProvider, $urlRouterProvider,$httpProvider,$locationProvider)
	{

    $locationProvider.hashPrefix('!');


    $urlRouterProvider
    	.otherwise('/main/stat/tabs')
    	.when('/main','/main/stat/tabs')
        .when('/main/stat','/main/stat/tabs')
        .when('/main/stat/','/main/stat/tabs');


    $stateProvider
    .state('main',
        {
        templateUrl:'../views/main/main.html',
        controller:require('./controllers/main/main.js'),
        url:'/main'
        })
    .state('main.stat',
        {
        url:'/stat',
        templateUrl:'../views/stat/stat.html',
        controller:require('./controllers/stat/stat.js')
        })
        .state('main.stat.general',
            {
            url:'/tabs',
            abstract:true,
            views:{
                'general':{templateUrl:'../views/stat/statGeneral.html'},
                'general_auto':{templateUrl:'../views/stat/statAuto.html'}
                }
            })
            .state('main.stat.general.subtabs',{
                url:'',

                views:{
                'general_orders':{templateUrl:'../views/stat/statGeneralOrders.html'},
                'general_map':{templateUrl:'../views/stat/statGeneralMap.html'},
                'general_params':{templateUrl:'../views/stat/statGeneralParams.html'},
                'auto_avarage_table':{templateUrl:'../views/stat/statAutoAvarageTable.html'},
                'auto_map':{templateUrl:'../views/stat/statAutoMap.html'},
                'auto_dots':{templateUrl:'../views/stat/statAutoDots.html'}
                }

            })

    .state('main.contact',
        {
        url:'/contact',
        templateUrl:'../views/contact/contact.html',
        controller:require('./controllers/contact/contactCntr.js')
        })
    .state('main.about',
        {
        url:'/about',
        templateUrl:'../views/about/about.html',
        controller:require('./controllers/about/aboutCntr.js')
        })
    .state('main.robot',
        {
        url:'/robot',
        templateUrl:'../views/robot/robot.html',
        controller:require('./controllers/robot/robotCntr.js')
        })


    //interceptor to catch requests for templates
    //modify them acc to language from localStorage
    $httpProvider.interceptors.push(['$injector','$rootScope',function($injector,$rootScope)
        {
        return {
            'request':function(config)
                {
                var url = config.url;
                if (url.match(/.+\/views\/.+.html$/))
                    {
                    if (!$rootScope.language)//also in main.js i set language to rootScope
                        $rootScope.language = window.localStorage.getItem('language')||window.language||'EN';
                    config.url = url.replace(/^(.+)\.html$/,'$1')+'_'+$rootScope.language+'.html';
                    }
                return config;
                }

        }
        }])


    }

module.exports.$inject = ['$stateProvider', '$urlRouterProvider','$httpProvider','$locationProvider'];
