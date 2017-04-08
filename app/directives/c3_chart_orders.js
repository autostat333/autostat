module.exports = function c3ChartOrders($timeout)
	{
	return {
		scope:{
			data:'=passValue',
			'show_chart':'=ngShow'
			},
		link:function(scope,elem,attrs)
			{
			scope.init = init;
			scope.transform_data = transform_data;
			scope.get_elem_width = get_elem_width;
			scope.on_resize = on_resize;
			scope.my_destroy = my_destroy;
			scope.calculate_min_value = calculate_min_value;
			//scope.init();

			scope.show_chart = false;

			scope.$watch('data',watcher_data);
			$(window).on('resize',scope.on_resize);
			scope.$on('$destroy',scope.my_destroy);

			function init()
				{

				scope.chart_width = scope.get_elem_width();

				var types = {};
				types[attrs['label']] = 'bar';
				types['Avg, K'] = 'line';

				//init chart  
				scope.chart = c3.generate({
					bindto:elem[0],
					size:{'width':scope.chart_width},
            		data:{
                		'columns':[
                			scope.total,
                			scope.avg
                    		//['Total Orders, K',178,159,150,178,159,150,178,159,150,178,159,150,178,159,150,178,159,150,178,159,150,178,159,150,178,159,150,178,159,150],
                    		//['Avg, K',78,259,540,78,259,540,78,259,540,78,259,540,78,259,540,78,259,540,78,259,540,78,259,540,78,259,540,78,259,540]
                			],
                		'types':types
            			},
    				bar:{width:{ratio:0.8}},
        			axis:{
                		'x':{
                    		'type':'category',
                    		'categories':scope.categories,//["1/11","2/11","3/11","4/11","5/11","6/11","7/11","8/11","9/11","10/11","11/11","12/11","13/11","14/11","15/11","16/11","17/11","18/11","19/11","20/11","21/11","22/11","23/11","24/11","25/11","26/11","27/11","28/11","29/11","30/11"],
                    		'tick':
                    			{
                        		'count':10,
                        		'fit':true,
                        		'centered':true,
                        		//  'culling':{'max':5},
                        		//  'outer':false, //one tick line on the edge
                    			},
                    		'label':'Days',
                    	//	'extent':[2,4.5]
                			},
		                'y':{
                    		'tick':
                				{
                        		'outer':false,
                        		//'count':5
                    			},	
                    		'label':'Amount,K',
                    		//'min':attrs['propertyBar']==='totalOrdersShow'?150:0,
                    		'min':scope.min_val,
                    		//'max':attrs['propertyBar']==='totalOrdersShow'?200:7
                			}
						},
					'zoom':
						{
						'enabled':true,
						'rescale':true,
						//'extent':[30,40]
						},
					subchart:
						{
						'show':true,
						},
					grid:{y:{show:true}}
				})
				}

				//MAKE from original data DATA FOR CHART
			function transform_data()
				{
				scope.total = [attrs['label']];
				scope.avg = ['Avg, K'];
				scope.categories = [];
				var len = scope.data.length-1;
				for (var i=len;i>=0;i=i-1)
					{
					var el = scope.data[i];
					//break pushing if data not completed (future date)

					if (el['notCompleted']) continue;
					scope.total.push(parseFloat(el[attrs['propertyBar']]));
					scope.avg.push(el[attrs['propertyLine']]);
					scope.categories.push(el['dateShow']);
					}
				}


			function calculate_min_value()
				{
				//determine start max value
				//slice - because the first value is label
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
				if (!scope.data)
					//scope.data = [];
					return false;
				scope.show_chart = false;
				scope.transform_data();
				scope.calculate_min_value();
				$timeout(function()
					{
					scope.init();
					$timeout(function(){scope.show_chart = true;},1000);
					scope.chart.zoom([scope.data.length-16,scope.data.length-1]);
					},0)
				}


			function get_elem_width()
				{
				return elem[0].getBoundingClientRect()['width'];
				}


			function on_resize()
				{
				if (scope.chart===undefined){return false;}
				scope.chart_width = scope.get_elem_width();
				scope.chart.resize({'width':scope.chart_width});
				}


			function my_destroy()
				{
				$(window).off('resize',scope.on_resize);
				}

			}

	}


}

module.exports.$inject = ['$timeout'];