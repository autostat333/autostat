module.exports = function PieC3($timeout)
	{
	return {
		scope:{'data':'=data',
				'pie':'=pieInstance', //for lift pointer to this pie from controller
				'first_load_finished':'=firstLoadFinished'
			},//using when focus over and out
		link:function(scope,elem,attrs)
			{

			scope.init_pie = init_pie;
			scope.watcher_data = watcher_data;
			scope.create_data = create_data;
			scope.mouse_over = mouse_over;
			scope.mouse_out = mouse_out;
			scope.on_resize = on_resize;
			scope.get_elem_width = get_elem_width;


			//watcher make initialization of chart
			scope.$watch('data',scope.watcher_data);
			scope.$watch('first_load_finished',scope.on_resize);

			$(window).on('resize',scope.on_resize);

			scope.$on('$destroy',function()	
				{
				$(window).off('resize',scope.on_resize);				
				})



			function init_pie()
				{
				scope.data_ready['onmouseover'] = scope.mouse_over;
				scope.data_ready['onmouseout'] = scope.mouse_out;


				 scope.pie = c3.generate({
			            bindto:elem[0],
			            data:scope.data_ready,
			            size:{'width':scope.pie_width},
			            legend:{hide:true},
			            'axis':{
			            	'x':{show:false},
			            	'y':{show:false}

			            }
			        })
				}

		 	function watcher_data(new_val,old_val)
			 	{
		 		if (new_val===undefined)
		 			return false;

		 		//if after changing date no data - destroy pie
		 		if (scope.data.length==0&&scope.pie!='')
		 			{
		 			scope.pie.destroy();
		 			scope.pie = '';
		 			return false; 				
		 			}

 				scope.create_data();//produce data_ready

 				scope.pie_width = scope.get_elem_width();
                if (!scope.pie||scope.pie=='')
                	scope.init_pie(); //data_ready is calculated
                else
                	{
            		if (scope.data.length!=0)
            			{
        			//	scope.pie.unload();
	                	scope.pie.load(scope.data_ready);
	                	scope.pie.legend.hide();
                 		scope.pie.show();//show all data, which previously was hidden by click on label

	                	$timeout(function()
	                		{
	                		//scope.pie.show();
	                	//	scope.pie.resize(); 
	                		},0);
            			}
	                else
	                	scope.pie.unload();
                	}

			 	}


		 	function create_data()
		 		{
	 			var d = {};
	 			var columns = [];
	 			var types = {};
	 			var colors = {};
	 			var base_colors = [
				'rgb(122, 0, 0)',
				'rgb(176, 17, 17)',
				'rgb(218, 51, 51)',
				'rgb(224, 78, 78)',
				'#ffa500',
				'#ffc864',
				'#ffd37d',
				'rgb(255, 229, 181)',
				'#fff2d9',
	 			'#fff8eb',
				'rgb(236, 236, 236)'
	 			];
	 			for (var each in scope.data)
	 				{
 					var el = scope.data[each];
 					var row = [];
 					row.push(el['name']);
 					row.push(_to_show_format(el['totalOrders']));
 					columns.push(row);
 					types[el['name']] = 'donut';
 					colors[el['name']] = base_colors[each];
	 				}
 				d['columns'] = columns;
 				d['types'] = types;
 				d['colors'] = colors;
 				scope.data_ready = d;
		 		}

	 		//mouseover on pie -> select noe row from mark scroll block
	 		function mouse_over(d)
	 			{
 				for (var each in scope.data)
 					{
					if (scope.data[each]['name']==d['name'])
						scope.data[each]['focus_from_pie']=true;
					else
						scope.data[each]['focus_from_pie']=false;
 					}
				scope.$apply();
	 			}
			
			//mouseover on pie -> select noe row from mark scroll block
 			function mouse_out(d)
 				{
				for (var each in scope.data)
					{	
					scope.data[each]['focus_from_pie'] = 'pie_not_focused';
					}
				scope.$apply();
 				}


			function on_resize(new_val,old_val)
				{
				if (!scope.pie){return false;}
				//timeout is necessary because block maybe not displayed
				//this function firing when resizing or when first_load_finished true
				//but when first_load_finished true - block is not displlayed yet,
				//this function firing only during digest cycle, and only after digest will be completed
				//block will be displayed and real width in px will be accessible
				$timeout(function()
					{
					scope.pie_width = scope.get_elem_width();
					scope.pie.resize();
					},0)
				}


			function get_elem_width()
				{
				return elem[0].getBoundingClientRect()['width'];
				}


				//the same function duplicated in pie_chart directive
			function _to_show_format(num)
				{
				if (num==0)return '0';
				if (num>=100000)
					return (num/1000).toFixed(1);
				else if (num>=1000)
					return (num/1000).toFixed(2);
				else
					return (num/1000).toFixed(3);
				}


			}

	}


}

module.exports.$inject = ['$timeout'];