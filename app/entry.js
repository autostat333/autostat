
//this function set only once handler to prevent scrolling when loading occuring
//if user will raise a lot of mousewheel events - any other scripts will not run
//user must stop scrolling to open way for the rest scripts
//when scrolling - a lot of paintings occuring, even using gpu
//now not used
var last_refresh = performance.now();
var new_t = 0;
var SCROLL_INTERVAL = 2000;
$('body').on('mousewheel',function(e)
	{
	if (window.stop_scroll)
		if (((new_t=performance.now())-last_refresh)<SCROLL_INTERVAL)
			e.preventDefault();
		else
			last_refresh = new_t;
	})



$('.spinner_container').animate({'opacity':0},1000,'linear',function(el)
    {
    $(this).remove();
    });



angular.module('app',['ui.router','ui.bootstrap','dataTable'])
	.config(require('./routes.js'))


	.directive('fileTree',require('./directives/tree.js'))
	.directive('choosenDirective',require('./directives/choosen_directive.js'))
	.directive('selectDirective',require('./directives/select_directive.js'))
	.directive('c3ChartOrders',require('./directives/c3_chart_orders.js'))
	.directive('c3ChartParams',require('./directives/c3_chart_params.js'))
	.directive('c3ChartAverage',require('./directives/c3_chart_average.js'))  //init pie for left&right cols of top cars
	.directive('c3ChartDots',require('./directives/c3_chart_dots.js')) //appliying for tooltips in tabhles
	.directive('owlCarousel',require('./directives/owl_carousel.js'))
	.directive('dropdown',require('./directives/dropdown.js'))  //only init dropdown from material
	.directive('datepicker',require('./directives/datepicker.js')) //for datepicker
	.directive('pieC3',require('./directives/pie_c3.js'))  //init pie for left&right cols of top cars
	.directive('stopPropagation',require('./directives/stop_propagation.js'))  //set fake event for prevent propagating
	.directive('map',require('./directives/map.js')) //directive for google-map
	.directive('showTooltip',require('./directives/show_tooltip.js')) //appliying for tooltips in tabhles


		//GENERAL TAB
		//this is separate controllers, which are firing from html directly by ng-controller
		//because using ng-if condition for tabs
	.controller('StatGeneralCntr',require('./controllers/stat/statGeneral.js'))
	.controller('StatGeneralCntrOrders',require('./controllers/stat/statGeneralOrders.js'))
	.controller('StatGeneralCntrMap',require('./controllers/stat/statGeneralMap.js'))
	.controller('StatGeneralCntrParams',require('./controllers/stat/statGeneralParams.js'))
	.controller('MainController',require('./controllers/main/main.js')) //controller for footer (provide menu click functionality)

	.controller('StatAutoCntr',require('./controllers/stat/statAuto.js'))
	.controller('StatAutoAvarageTable',require('./controllers/stat/statAutoAvarageTable.js'))
	.controller('StatAutoMap',require('./controllers/stat/statAutoMap.js'))
	.controller('StatAutoDots',require('./controllers/stat/statAutoDots.js'))


	.service('backend',require('./services/backend.js'))
	.service('tour',require('./services/tour.js'))

	.filter('translate',require('./filters/translate.js')) //for translation messages etc (from JS)






