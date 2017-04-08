module.exports = function c3ChartAverage($timeout,$filter)
	{
	return {
		scope:{
			'data':'=c3ChartAverage',
			},
		link:function(scope,elem,attrs)
			{
			scope.init = init;
			scope.transform_data = transform_data;
			scope.calculate_min_value = calculate_min_value;


			scope.$watch('data',watcher_data);
			function init()
				{

				var types = {};
				types[attrs['label']] = 'line';

				//init chart  
				scope.chart = c3.generate({
					bindto:elem[0],
            		data:{
                		'columns':[
                			scope.total],
                			//scope.avg
                    		//['Total Orders, K',178,159,150,178,159,150,178,159,150,178,159,150,178,159,150,178,159,150,178,159,150,178,159,150,178,159,150,178,159,150],
                    		//[attr['label'],78,259,540,78,259,540,78,259,540,78,259,540,78,259,540,78,259,540,78,259,540,78,259,540,78,259,540,78,259,540]
                			//],
                		'types':types,
                /*		'labels':{
                		'format': function (v, id, i, j) 
                				{
            					 //console.log(v,id,i,j);
        					 	var step = parseInt(scope.total.length/5);
        						return i%step==0?$filter('currency')(v):''; 
            					},

                			}
                			*/
            			},
        			axis:{
                		'x':{
                    		'type':'category',
                    		'categories':scope.categories,
                    		'tick':
                    			{
                        		'count':5,
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
                    		'label':'Price,$',
                    		'min':scope.min_val
                    	//	'min':scope.min_val,
                    		//'max':attrs['propertyBar']==='totalOrdersShow'?200:7
                			}
						},
					'zoom':
						{
						'enabled':true,
						'rescale':true,
						//'extent':[30,40]
						},
					grid:{y:{show:true}}
				})
				}

				//MAKE from original data DATA FOR CHART
			function transform_data()
				{
				scope.total = [attrs['label']];
				scope.categories = [];
				for (var i=0;el=scope.data[i];i++)
					{
					scope.total.push(el[attrs['property']]);
					scope.categories.push(el['dateShow']);
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
				if (!scope.data)
					//scope.data = [];
					return false;
				scope.transform_data();
				scope.calculate_min_value();
				scope.init();
				}


			}

	}


}

module.exports.$inject = ['$timeout','$filter'];