module.exports = function c3ChartParams($timeout)
	{
	return {
		scope:{data:'=passValue',
			'values_type':'=valuesType'
			},
		link:function(scope,elem,attrs)
			{
			scope.init = init;
			scope.transform_data = transform_data;
			scope.get_elem_width = get_elem_width;
			scope.on_resize = on_resize;
			scope.my_destroy = my_destroy;
			scope.filter_categories = filter_categories;




			scope.$watch("[data,values_type]",watcher_data,true);
			$(window).on('resize',scope.on_resize);
			scope.$on('$destroy',scope.my_destroy);

			function init()
				{

				scope.chart_width = scope.get_elem_width();

				var types = {};
				types[scope.data['label']] = 'bar';

				//init chart  
				scope.chart = c3.generate({
					bindto:elem[0],
					size:{'width':scope.chart_width},
            		data:{
                		'columns':[
                			scope.values,
                			],
                		'types':types,
                		'labels':true,
                		'empty':{'label':{'text':'No Data'}}
            			},
    				bar:{width:{ratio:0.8}},
        			axis:{
                		'x':{
                    		'type':'category',
                    		'categories':scope.categories,//["1/11","2/11","3/11","4/11","5/11","6/11","7/11","8/11","9/11","10/11","11/11","12/11","13/11","14/11","15/11","16/11","17/11","18/11","19/11","20/11","21/11","22/11","23/11","24/11","25/11","26/11","27/11","28/11","29/11","30/11"],
                    		'tick':
                    			{
                        		'fit':true,
                        		'centered':true,
                    			},
                    		'label':scope.data['label'],
                    	//	'extent':[2,4.5]
                			},
		                'y':{
                    		'tick':
                				{
                        		'outer':false,
                        		//'count':5
                    			},	
                    		'label':'Orders,K',
                    		//'min':attrs['propertyBar']==='totalOrdersShow'?150:0,
                    		//'max':attrs['propertyBar']==='totalOrdersShow'?200:7
                			}
						},
					grid:{y:{show:true}}
				})
				}

				//MAKE from original data DATA FOR CHART
			function transform_data()
				{

				scope.values = [scope.data['label']];
				scope.categories = [];
				scope.categories_cache = []; //for caching categories, when small screen filter them (to show only small numbers of them)
				for (var each in scope.data['data'])
					{
					var el = scope.data['data'][each];
					scope.values.push(el[scope.values_type]);
					scope.categories.push(el['name']);
					scope.categories_cache.push(el['name']);
					}
				scope.filter_categories();
				}



			function watcher_data(new_val,old_val)
				{
				if (!scope.data)
					//scope.data = [];
					return false;

				
				scope.transform_data();
				$timeout(function()
					{
					scope.init();
					},0)
				}


			function get_elem_width()
				{
				return elem[0].getBoundingClientRect()['width'];
				}


			function filter_categories()
				{
				if (window.innerWidth<800)
					var freq = 2
				else
					var freq = 'all';


				for (var each in scope.categories_cache)
					{	
					if (freq!='all'&&each%freq)
						scope.categories[each] = '';
					else
						scope.categories[each] = scope.categories_cache[each];

					}
				}


			function on_resize()
				{
				if (scope.chart===undefined){return false;}
				scope.chart_width = scope.get_elem_width();	
				scope.filter_categories();
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