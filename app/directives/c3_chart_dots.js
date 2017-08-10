module.exports = function c3ChartAverage($timeout,$filter,$rootScope,$filter)
	{
	return {
		scope:{
			'data':'=c3ChartDots',
			'LAST_WATCHED':'=lastWatched',
			'advert':'=advert'
			},
		link:function(scope,elem,attrs)
			{
			scope.init = init;
			scope.transform_data = transform_data;
			scope.calculate_min_value = calculate_min_value;
			scope.show_card = show_card;
			scope.on_reset = on_reset;

			scope.cache_circles = [];


			scope.$on('reset.dots',scope.on_reset);
			scope.$watch('data',watcher_data);


			function init()
				{

				scope.advert_elem = $('.card.horizontal');

				//init chart  
				scope.chart = c3.generate({
					bindto:elem[0],
            		data:{
            			'x':'x',
                		'columns':[
                			scope.categories,
                			scope.total],
                		'type':'scatter',
                		'onclick':scope.show_card,
                		'sort':false,
            			},
        			axis:{
                		'x':{
                    		'label':$filter('translate')('Year'),
                			},
		                'y':{
                    		'tick':
                				{
                        		'outer':false,
                    			},	
                    		'label':$filter('translate')('Race, K.rm'),
                    		//'min':scope.min_val
                    	//	'min':scope.min_val,
                    		//'max':attrs['propertyBar']==='totalOrdersShow'?200:7
                			}
						},
					//'zoom':{'enabled':true},
					sort:false,
					grid:{y:{show:true}}
					})
				}

				//MAKE from original data DATA FOR CHART
			function transform_data()
				{
				scope.total = [$filter('translate')(attrs['label'])];
				scope.categories = ['x'];
				//scope.categories = [];
				for (var i=0;el=scope.data[i];i++)
					{
					scope.total.push(el[attrs['property']]);
					scope.categories.push(el['year']);
					}
				}


			function calculate_min_value()
				{
				//determine start max value
				//slice - because the first value is label
				//apply - because passed values must be not list, but values separated by coma
				//to make it throught the list - apply must be and arguments
				var min = Math.max.apply(Math,scope.total.slice(1));
				for (var i=1;i<scope.total.length;i=i+1)
					{
					var el = scope.total[i];
					if (el!=0&&el<min) min = el;
					}
				scope.min_val = min;
				}


			function watcher_data(new_val,old_val)
				{
				if (!scope.data||angular.equals(new_val,old_val))
					return false;

				scope.transform_data();
				//scope.calculate_min_value();
				scope.init();
				}


			function show_card(d,elem)
				{



				var el = scope.data[d['index']];

				//check if advert existed in array yet
				var tmp = scope.LAST_WATCHED.filter(function(it)
					{
					return it['_id']==el['_id'];
					})
	
				if (tmp.length!=0) return false;
				//push to watched list to show in right column
				scope.LAST_WATCHED.unshift(el);

				//delete value of object and cache this value for reset
				el['cacheFromChart'] = {'index':d['index'],'value':d['value']};
				delete d['value'];


				//hide dot
				elem = $(elem);
				elem.hide();
				scope.cache_circles.push(elem);

				//show card
				scope.advert_elem.stop().animate({'opacity':'0'},200,function(){$(this).css({'visibility':'hidden'})})

				$timeout(function()
					{
					scope.advert = el;
					},0)


				setTimeout(function()
					{
					scope.advert_elem.stop().css({'visibility':'visible'}).animate({'opacity':'1'},200);
					},300);

				$rootScope.$broadcast('clickDot');

				}



			function on_reset()
				{
					//reset values and then flush
				var data_from_chart = scope.chart.data()[0]['values']
				for (var i=0;el=scope.LAST_WATCHED[i];i++)
					{
					data_from_chart[el['cacheFromChart']['index']]['value'] = el['cacheFromChart']['value'];
					}
				for (var each in scope.cache_circles)
					{
					scope.cache_circles[each].fadeIn();
					}

				scope.chart.flush();
				}


			}

	}


}

module.exports.$inject = ['$timeout','$filter','$rootScope','$filter'];