module.exports = function StatGeneralCntr($scope,backend,$q,$filter,$timeout)
	{
	
	$scope.init = init;
	$scope.getGeneralStatistic = getGeneralStatistic;
	$scope.create_orders_by_weeks = create_orders_by_weeks;
	$scope.calculate_avg = calculate_avg;
	$scope.complete_date = complete_date;
	$scope.get_week_name = get_week_name;
	$scope.get_end_of_week_total = get_end_of_week_total;
	$scope.get_end_of_week_percent = get_end_of_week_percent;
	$scope.next_slide = next_slide; //for sliding through the owl-carousel
	$scope.prev_slide = prev_slide; //for sliding through the owl-carousel
	$scope.initTopCarsDates = initTopCarsDates;
	$scope.getTopCarsLeftCol = getTopCarsLeftCol;
	$scope.getTopCarsRightCol = getTopCarsRightCol;
	$scope.row_focus = row_focus;
	$scope.row_defocus = row_defocus;  //for pie:focus one mark on pie
	$scope.show_hide = show_hide; //for pie:hide/show data by marks
	$scope.calc_percentage = calc_percentage; //calc percentage and total number top10+rest

	$scope.AVG_PERIOD = 30; //period for calculations avg price

	$scope.init();

	$scope.$watch('left_col_date["date"]',$scope.getTopCarsLeftCol);
	$scope.$watch('right_col_date["date"]',$scope.getTopCarsRightCol);
	$scope.$watch('params["value"]',watcher_params,true);

	require('./transformData.js')($scope,$filter);

	//watchers for sliding table
	$scope.$watch('total_orders_begin',watcher_total_orders_begin);
	$scope.$watch('new_orders_begin',watcher_new_orders_begin);

	$scope.first_load_finished = false;

	function init()
		{
		//determine date for left and right cols, month&year
		$scope.initTopCarsDates(); 
		$scope.params = $scope.params||{'value':'all','type':'total'};

		//create variable for address to pie
		//to make possible use its API (hover)
		if ($scope.pie_left)
			{
			$scope.pie_left.destroy();
			$scope.pie_left = '';
			}
		else
			$scope.pie_left = '';

		if ($scope.pie_right)
			{
			$scope.pie_right.destroy();
			$scope.pie_right = '';
			}
		else
			$scope.pie_right = '';

		$q.all([
				$scope.getGeneralStatistic(),
			//	$scope.getTopCarsLeftCol(),
			// 	$scope.getTopCarsRightCol()

			]).then(function()
				{
				$timeout(function()
					{
					$scope.myspinner['is'] = false
					$scope.first_load_finished = true;
					},0);
				$scope.total_orders_begin = 0; //for displaying first 5 rows
				$scope.new_orders_begin = 0; //for displaying first 5 rows
				watcher_total_orders_begin();
				watcher_new_orders_begin();
				})
		}
	function getGeneralStatistic()
		{
		var defer = $q.defer();
		//sending params, it is changing depends on flitring
		backend.getGeneralStatistic($scope.params).then(function(res)
			{

			$scope.DATA_total_orders = res.map($scope.transform_total_orders_item);

			//sort items begore any calculations and grouping
			$scope.DATA_total_orders.sort(function(a,b){return a['date']>b['date']?-1:(a['date']<b['date']?1:0)});
			$scope.complete_date(); //somplete data with empty days
			$scope.calculate_avg(); //calculation first before grouping by weeks to pass values
			$scope.DATA_orders_by_weeks = $scope.create_orders_by_weeks();
			defer.resolve();
			})


		return defer.promise;
		}

	//set dates for left and right cols for top cars
	//prepare dict for DATA_top_ars
	//changing of data occuring from owl_carousel
	function initTopCarsDates()
		{

			//check if date is existed - no need to init
			//only drop data sets, because it will be requested during watcher_params
			//this function must be firing when any params changing (filter by marks) or at inception
		if ($scope.left_col_date&&$scope.right_col_date)
			{
			$scope.DATA_top_cars = {};
			$scope.DATA_top_cars['left'] = [];
			$scope.DATA_top_cars['right'] = [];
			return false;
			}

		$scope.right_col_date = {};
		$scope.left_col_date = {};


		//var ld = $filter('date')((new Date()),'yyyy-MM-dd');
		var ld = new Date($scope.ACTUAL_DATE);
		ld = ld.setDate(ld.getDate()-1);
		ld = $filter('date')(ld,'yyyy-MM-dd');
		$scope.left_col_date['date'] = ld;
		$scope.left_col_date['month'] = parseInt(ld.split('-')[1])-1;
		$scope.left_col_date['day'] = parseInt(ld.split('-')[2]);
		$scope.left_col_date['year'] = parseInt(ld.split('-')[0]);


		var rd = $scope.ACTUAL_DATE;
		$scope.right_col_date['date'] = rd;
		$scope.right_col_date['month'] = parseInt(rd.split('-')[1])-1;
		$scope.right_col_date['day'] = parseInt(rd.split('-')[2]);
		$scope.right_col_date['year'] = parseInt(rd.split('-')[0]);


		//prepare dictionaries for DATA of TOP CARS
		//completing occuring from requests
		$scope.DATA_top_cars = {};
		$scope.DATA_top_cars['left'] = [];
		$scope.DATA_top_cars['right'] = [];

		$scope.months = [
			{'name':'January','value':0},
			{'name':'February','value':1},
			{'name':'March','value':2},
			{'name':'April','value':3},
			{'name':'May','value':4},
			{'name':'June','value':5},
			{'name':'July','value':6},
			{'name':'August','value':7},
			{'name':'September','value':8},
			{'name':'October','value':9},
			{'name':'November','value':10},
			{'name':'December','value':11},]

		$scope.years = [2017,2016];


		}


	function getTopCarsLeftCol(new_val,old_val)
		{
		$scope.left_top_car_spinner = true;
		var defer = $q.defer();
		backend.topCars($.extend(true,{'date':$scope.left_col_date['date']},$scope.params)).then(function(res)
			{
			$scope.DATA_top_cars['left'] = $scope.transform_top_cars(res);
			defer.resolve();
			$scope.calc_percentage('left');
			$scope.left_top_car_spinner = false;
			});

		return defer.promise;
		}

	function getTopCarsRightCol(new_val,old_val)
		{
		$scope.right_top_car_spinner = true;
		var defer = $q.defer();
		backend.topCars($.extend(true,{'date':$scope.right_col_date['date']},$scope.params)).then(function(res)
			{
			$scope.DATA_top_cars['right'] = $scope.transform_top_cars(res);
			defer.resolve();
			$scope.calc_percentage('right');
			$scope.right_top_car_spinner = false;
			})

		return defer.promise;
		}		


	//sorting DATA_total_orders and create new array with grouping it by weeks
	function create_orders_by_weeks()
		{
		var d = {}; //it is for easy gathering days by weeks,than it will be colnverted to array
		$scope.DATA_total_orders.map(function(el,idx)
			{
			d[el['WeekNumber']] = d[el['WeekNumber']]||[];
			d[el['WeekNumber']].push(el); 
			})
		var keys = Object.keys(d)
		d = keys.map(function(el){return d[el]});
		d.sort(function(a,b)
			{
			return a[0]['WeekNumber']>b[0]['WeekNumber']?-1:(a[0]['WeekNumber']<b[0]['WeekNumber']?1:0)
			})
		//sort within week days to lower
		for (var each in d)
			{
			var week = d[each];
			week.sort(function (a,b){return a['date']>b['date']?1:(a['date']<b['date']?-1:0)});
			}
		return d;
		}

	function calculate_avg()
		{
		var avg_ar_total = [];
		var avg_ar_new = [];
		var len = $scope.DATA_total_orders.length-1;
		avg_total = 0;
		avg_new = 0;

		var prev_value_total = 0;
		var prev_value_new = 0;
		//start from the end of array, because DATA_total_orders contains date by desc
		// (from current to previous)
		for (var i=len; i>=0;i=i-1)
			{
			var el = $scope.DATA_total_orders[i];
			avg_ar_total.push(el['totalOrders']);
			avg_ar_new.push(el['newOrders']);								

			if (avg_ar_total.length>30)
				{
				avg_ar_total = avg_ar_total.splice(-30,30);
				avg_ar_new = avg_ar_new.splice(-30,30);
				}

			calc_avg_in_arr();
			el['avgTotal'] = avg_total;
			el['avgNew'] = avg_new;

			//calc dif
			var dif = 0;
			if (prev_value_total!=0)
				el['difTotalOrders'] = parseInt((el['totalOrders']/prev_value_total-1)*1000)/10;
			else
				el['difTotalOrders'] = 100;
			if (prev_value_new!=0)
				el['difNewOrders'] = parseInt((el['newOrders']/prev_value_new-1)*100);
			else
				el['difNewOrders'] = 100;

			//el['difTotalOrders'] = Math.abs(el['difTotalOrders'])>90?'infinity':Math.abs(el['difTotalOrders']);
			//el['difNewOrders'] = Math.abs(el['difTotalOrders'])>90?'infinity':Math.abs(el['difTotalOrders']);
			prev_value_total = el['totalOrders'];
			prev_value_new = el['newOrders'];

			}		

			//SUM WITHIN ARR
		function calc_avg_in_arr()
			{
			var total_sum = 0;
			var new_sum = 0;
			avg_ar_total.forEach(function(el){total_sum = total_sum+el});
			avg_ar_new.forEach(function(el){new_sum = new_sum+el});
			avg_total = Math.round((total_sum/avg_ar_total.length)/100)/10
			avg_new = Math.round((new_sum/avg_ar_new.length)/100)/10;
			}
		}

		//complete WEEK (if some days is absent)
	function complete_date()
		{

		var len = $scope.DATA_total_orders.length;
		if (len==0){return false;}
		//determine previous data, if it is not the end of week - complete to the end
		var d = new Date($scope.DATA_total_orders[0]['date']);

		//if Monday - shift by one day ahead to complete current week 
		if (d.getUTCDay()==1)
			d.setDate(d.getDate()+1);

		while (d.getUTCDay()!=1)
			{
			d.setDate(d.getDate()+1)
			}

		var prev_dt = parseInt((new Date(d)).getTime()/86400000);
		//var prev_dt = parseInt((new Date($scope.DATA_total_orders[0]['date'])).getTime()/86400000);
		for (var each=0;each<len;each=each+1)
			{
			var el = $scope.DATA_total_orders[each];
			var cur_dt = parseInt((new Date(el['date'])).getTime()/86400000);
			if ((prev_dt-cur_dt)>1)
				{
				//insert empty date
				var new_dt = $scope.create_empty_day(cur_dt+1);
				$scope.DATA_total_orders.splice(each,0,new_dt);
				len = $scope.DATA_total_orders.length; //refresh length of array
				each = each-1;
				}
			else
				prev_dt = cur_dt;
			}

		}


	function get_week_name(week)
		{
		var st_week = week[0];
		var end_week = week[week.length-1];

		return st_week['dateShow'].split(' ')[0]+'-'+end_week['dateShow']+' '+end_week['Year'];
		}



	function get_end_of_week_total(week,property)
		{
		var threshold=property=='totalOrdersShow'?10:0;

		//if (property=='newOrdersShow')
		//	debugger;
		var len = week.length-1;
		var cur_val = week[len][property];
		loop1:
		for (var i=len;i>=0;i=i-1)
			{
			if (cur_val>threshold)
				return cur_val;
			else
				cur_val = week[i][property];
			}
		return cur_val;
		}


	function get_end_of_week_percent(week,idx,property)
		{
		//below logic for calculations interests
		if (idx==$scope.DATA_orders_by_weeks.length-1) //for beginnig of arr
			return '0';

		var prev_week = $scope.DATA_orders_by_weeks[idx+1];
		var prev_val = $scope.get_end_of_week_total(prev_week,property);
		if (prev_val==0)
			return '0';
		var cur_val = $scope.get_end_of_week_total(week,property);
		return ((cur_val/prev_val-1)*100).toFixed(1);
		}


	function watcher_total_orders_begin(new_val,old_val)
		{
		//below checkers for limits for showing
		if ($scope.DATA_orders_by_weeks===undefined)
			return false;
		$scope.total_orders_begin = $scope.total_orders_begin||0;
		$scope.total_orders_begin = $scope.total_orders_begin<0?0:$scope.total_orders_begin;
		$scope.total_orders_begin = $scope.total_orders_begin*5>$scope.DATA_orders_by_weeks.length?$scope.total_orders_begin-1:$scope.total_orders_begin;

		$scope.DATA_orders_by_weeks_limited = $filter('limitTo')($scope.DATA_orders_by_weeks,5,$scope.total_orders_begin*5);
		}

	function watcher_new_orders_begin(new_val,old_val)
		{
		//below checkers for limits for showing
		if ($scope.DATA_orders_by_weeks===undefined)
			return false;
		$scope.new_orders_begin = $scope.new_orders_begin||0;
		$scope.new_orders_begin = $scope.new_orders_begin<0?0:$scope.new_orders_begin;
		$scope.new_orders_begin = $scope.new_orders_begin*5>$scope.DATA_orders_by_weeks.length?$scope.new_orders_begin-1:$scope.new_orders_begin;

		$scope.DATA_orders_new_limited = $filter('limitTo')($scope.DATA_orders_by_weeks,5,$scope.new_orders_begin*5);
		}


	//watch for params filtring
	function watcher_params(new_val,old_val)
		{
		if (new_val==undefined){return false};
		//if changes from init function (all marks) during starting of controller
		//do not run init function because it is alreary started
		if (old_val=='all'&&new_val=='all'){return false};
		$scope.params['type'] = $scope.params['value']=='all'?'total':'mark';
		$scope.myspinner.is = true;
		$scope.init();
		$scope.getTopCarsLeftCol();
		$scope.getTopCarsRightCol();

		}


	//next SLIDE for DATELINE PICKER	
	function next_slide(col_name)
		{
		var carousel = $('.'+col_name+'.top_car_block .dateline_picker .owl-carousel');
		carousel.trigger('next.owl.carousel',[120]);
		}


	//prev SLIDE for DATELINE PICKER	
	function prev_slide(col_name)
		{
		var carousel = $('.'+col_name+'.top_car_block .dateline_picker .owl-carousel');
		carousel.trigger('prev.owl.carousel',[120]);
		}

		//focus on pie
	function row_focus(col_name,idx)
		{
		if (col_name=='left_col')
			$scope.pie_left.focus($scope.DATA_top_cars['left'][idx]['name']);
		if (col_name=='right_col')
			$scope.pie_right.focus($scope.DATA_top_cars['right'][idx]['name']);

		}

	function row_defocus(col_name,idx)
		{
		if (col_name=='left_col')
			$scope.pie_left.focus();
		if (col_name=='right_col')
			$scope.pie_right.focus();
		}


		//show or hide data on pie
	function show_hide(row,col_name)
		{
		if (col_name=='left_col')
			{
			if (row['show'])
				$scope.pie_left.show(row["name"]);
			else
				$scope.pie_left.hide(row["name"]);
			//refresh percentage
			calc_percentage('left');
			}
		if (col_name=='right_col')
			{
			if (row['show'])
				$scope.pie_right.show(row["name"]);
			else
				$scope.pie_right.hide(row["name"]);
			//refresh percentage
			calc_percentage('right');
			}

		}


	function calc_percentage(col_name)
		{
		//calculate new total
		var total = 0;
		var tmp = $scope.DATA_top_cars[col_name].map(function(el)
			{
			if (el['show'])			
				total = total+parseInt(el['totalOrders'])
			});
		//calc percentage
		for (var each in $scope.DATA_top_cars[col_name])
			{
			var el = $scope.DATA_top_cars[col_name][each];
			if (el['show']&&total!=0)
				el['percentage'] = ((el['totalOrders']/total)*100).toFixed(1);
			else
				el['percentage'] = '0';
			}
		if (col_name=='left')
			$scope.total_amount_left = Math.round(total/100)/10;
		if (col_name=='right')
			$scope.total_amount_right = Math.round(total/100)/10;


		}


	}

module.exports.$inject = ['$scope','backend','$q','$filter','$timeout'];