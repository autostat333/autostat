module.exports = function StatGeneralCntrParams($scope,$q,backend,$timeout,$filter,tour)
	{

	$scope.init = init;
	$scope.get_aggregations = get_aggregations; //get data
	$scope.transform_to_array = transform_to_array;  //convert data to array
	$scope.gather_categories = gather_categories;
	$scope.gather_categories_duration = gather_categories_duration; //gather some categories to clusters
	$scope.gather_categories_price = gather_categories_price;//gathering values by price
	$scope.gather_categories_race = gather_categories_race;
	$scope.gather_categories_by_year = gather_categories_by_year;
	$scope.prepare_for_chart = prepare_for_chart; //create new data depends on aggregation
	$scope.sort_by = sort_by; //function for resorting bars on the chart
	$scope.set_percentage = set_percentage; //set percentage property to each object
	$scope.is_empty_data = is_empty_data; //check whether DATA_AGR is empty to show msg
	$scope.init_tour = init_tour;

	$scope.init();

	$scope.$watch('params',watcher_params,true);
	$scope.$on('$destroy',function()
		{
		if ($scope.tour&&$scope.tour.destroy)
			$scope.tour.destroy();

		//destroy picker manually, because it is not removing from body
		$('body').find('.picker').first().remove();
		})

	function init()
		{

		//init params for mark
		$scope.params = {};
		$scope.params['value'] = 'all';
		$scope.params['type'] = 'total';
		$scope.params['date'] = $scope.ACTUAL_DATE; //from parent controller

		$scope.tour = '';//drop variable for this scope

		//for init kind of sorting
		$scope.sorting_kind = 'order';
		$scope.values_type = 'totalOrders';

		//init dropdown options and start value
		$scope.params['aggregationsBy'] = 'year';
		$scope.aggregation_options = {
			'year':{'name':'year','key':'ordersByYear'},
			'price':{'name':'price','key':'ordersByPrice'},
			'race':{'name':'race','key':'ordersByRace'},
			'duration':{'name':'duration','key':'ordersByDuration'}};

		$scope.DATA_AGR = {};
		$scope.DATA_AGR['label'] = 'year';
		$scope.DATA_AGR['data'] = [];

		//request for date will be started from watcher
		}


	function get_aggregations()
		{
		
		return backend.getAggregations($scope.params).then(function(res)
			{
			$timeout(function(){$scope.myspinner.is = false},100);
			$scope.DATA = $scope.transform_to_array(res); //convert to array simply
			$scope.gather_categories(); //gather some categories (duration and year)
			$scope.set_percentage(); //set percent rate for mode in percents, must be after gathering
			$scope.prepare_for_chart();//here is also sorting
			$scope.init_tour();
			})

		}

		//response returns not array, but dictionary
		//each value is dictionary also, where keys - future categories
	function transform_to_array(dict)
		{
		var d = {};
		for (var each in dict)
			{
			if (typeof dict[each]!='object')continue;
			d[each] = $.map(dict[each],function(el,key){return el});
			}

		return d;
		}


	function init_tour()
		{
		$scope.tour = tour.init('params',[
            {'element':'#tour_general_params_chart','content':$filter('translate')('Here is distribution advertisements by YEAR, PRICE, DURATION etc.'),'placement':'top'},
			{'element':'#tour_general_params_filter','content':$filter('translate')('You can filter statistic by particular Make'),'placement':'top'},
            {'element':'#tour_general_params_type','content':$filter('translate')('You can select different kind of GROUPING'),'placement':'top'},
            {'element':'#tour_general_params_sort','content':$filter('translate')('You can sort columns (bars) from LOWEST to HIGH by its value or by its label'),'placement':'top'},
            {'element':'#tour_general_params_tmblr','content':$filter('translate')('You can switch show from PERSANTAGE to ABSOLUTE DIGITS'),'placement':'top'}

			])
		}


	function gather_categories()
		{
		$scope.gather_categories_duration();	
		$scope.gather_categories_price();
		$scope.gather_categories_race();
		$scope.gather_categories_by_year();
		}

			//depricated, because duration is already gathered in large buckets

	function gather_categories_duration_old()
		{
		var duration_buckets = [
			{'name':'1 day','totalOrders':0,'value':1,'order':1},
			{'name':'2-5 days','totalOrders':0,'value':5,'order':2},
			{'name':'6-10 days','totalOrders':0,'value':10,'order':3},
			{'name':'11-15 days','totalOrders':0,'value':15,'order':4},
			{'name':'16-20 days','totalOrders':0,'value':20,'order':5},
			{'name':'21-25 days','totalOrders':0,'value':25,'order':6},
			{'name':'26-30 days','totalOrders':0,'value':30,'order':7},
			{'name':'31-60 days','totalOrders':0,'value':60,'order':8},
			{'name':'61-90 days','totalOrders':0,'value':90,'order':9},
			{'name':'90+ days','totalOrders':0,'value':0,'order':10},
			];


		for (var each in $scope.DATA['ordersByDuration'])
			{
			var el = $scope.DATA['ordersByDuration'][each];
			loop2:
			for (var i=0;i<duration_buckets.length;i=i+1)
				{
				el['name'] = typeof el['name']=='number'?el['name']:parseInt(el['name']);
				if (el['name']<=duration_buckets[i]['value']||duration_buckets[i]['value']==0)
					{
					duration_buckets[i]['totalOrders'] = duration_buckets[i]['totalOrders']+el['totalOrders'];
					break loop2;
					}
				}
			}
		
		$scope.DATA['ordersByDuration'] = duration_buckets;

		}


	function gather_categories_duration()
		{
		var duration_buckets = ['1-10','11-20','21-30','31-40','41-50','51-60','61-70','71-80','81-90','90+'];

		for (var each in $scope.DATA['ordersByDuration'])
			{
			var el = $scope.DATA['ordersByDuration'][each];
			el['order'] = duration_buckets.indexOf(el['name']);
			}

		}

		//this function gathering and ordering only objects from request
		//because not every mark may have each option
		//but for canonic view must be for all makes all categories
		//if no category will be - 0 total orders must be
	function gather_categories_price()
		{

		var labels = ['0-5','5-8','8-10','10-13','13-15','15-18','18-20','20-23','23-25','25-28','28-30','30-35','35-40','40-50','50-60','60+']
		var price_buckets = {};
		for (var i=0;i<labels.length;i=i+1)
			{
			price_buckets[(k = labels[i])] = {'name':k,'order':i+1,'totalOrders':0};
			}

		for (var each in $scope.DATA['ordersByPrice'])
			{
			var el = $scope.DATA['ordersByPrice'][each];
			price_buckets[el['name']]['totalOrders'] = el['totalOrders'];
			}
		$scope.DATA['ordersByPrice'] = $.map(price_buckets,function(el){return el});

		}

	function gather_categories_race()
		{

		var labels = ['0-10','10-30','30-50','50-70','70-100','100-120','120-150','150-200','200-250','250-300','300-400','400-500','500+'];
		var race_buckets = {};
		for (var i=0;i<labels.length;i=i+1)
			{
			race_buckets[(k = labels[i])] = {'name':k,'order':i+1,'totalOrders':0};
			}

		for (var each in $scope.DATA['ordersByRace'])
			{
			var el = $scope.DATA['ordersByRace'][each];
			race_buckets[el['name']]['totalOrders'] = el['totalOrders'];
			}
		$scope.DATA['ordersByRace'] = $.map(race_buckets,function(el){return el});

		}



	function gather_categories_by_year()
		{
		var year_buckets = [{'name':'<1984','value':1984,'order':1,'totalOrders':0}];
		year_buckets.push({'name':'1985-1990','value':1990,'order':2,'totalOrders':0});
		year_buckets.push({'name':'1991-1995','value':1995,'order':3,'totalOrders':0});
		year_buckets.push({'name':'1996-2000','value':2000,'order':4,'totalOrders':0});
		//creat buckets

		for (var i=2001;i<2018;i=i+1)
			{
			year_buckets.push({'name':i.toString(),'value':i,'order':i-1996,'totalOrders':0});
			}


		for (var each in $scope.DATA['ordersByYear'])
			{
			var el = $scope.DATA['ordersByYear'][each];
			loop2:
			for (var i=0;i<year_buckets.length;i=i+1)
				{
				el['name'] = typeof el['name']=='number'?el['name']:parseInt(el['name']);
				if (el['name']<=year_buckets[i]['value']||year_buckets[i]['value']==0)
					{
					year_buckets[i]['totalOrders'] = year_buckets[i]['totalOrders']+el['totalOrders'];
					break loop2;
					}
				}
			}
			
		$scope.DATA['ordersByYear'] = year_buckets;

		}

		//from this function firing request to backend depends on which params changed
	function watcher_params(new_val,old_val)
		{
		if (!new_val)
			return false;
		//if changed only kind of aggregations
		if (new_val['aggregationsBy']!=old_val['aggregationsBy'])
			{
			$scope.prepare_for_chart(); //set array from DATA to DATA_AGR depends on key
			return false;	
			}

			//skip another one request, because only when watcher runs after changing total
			//request will be send
		if (new_val['type']=='total'&&new_val['value']!='all')
			{
			//if changed date or type (by mark)
			$scope.params['type'] = $scope.params['value']=='all'?'total':'mark';
			return false;			
			}

			//it is for fixing case when returns from mark to all marks
		if (new_val['type']!='total'&&new_val['value']=='all')
			{
			//if changed date or type (by mark)
			$scope.params['type'] = 'total';
			return false;			
			}

		$scope.myspinner.is = true;
		$scope.get_aggregations();
		}

	function prepare_for_chart()
		{

		$scope.DATA_AGR = {};
		$scope.DATA_AGR['label'] = $scope.params['aggregationsBy'].toUpperCase();
		var key = $scope.aggregation_options[$scope.params['aggregationsBy']].key;
		$scope.DATA_AGR['data'] = $scope.DATA[key];

		$scope.sort_by();
		}




	function sort_by(kind)
		{
		$scope.sorting_kind = kind||$scope.sorting_kind;
		//determine direction because for order must be acs order
		var dir = [(d=$scope.sorting_kind=='order'?-1:1),-d];
		$scope.DATA_AGR['data'].sort(function(a,b)
			{
			a = a[$scope.sorting_kind];
			b = b[$scope.sorting_kind];
			return a<b?dir[0]:(a>b?dir[1]:0);
			})

		}

		//insert percentage into object
		//must be calculated before prepare_for_chart but after gathering
		//because gathering may create another number of objects
	function set_percentage()
		{
		for (var each in $scope.DATA)
			{
			var ar = $scope.DATA[each];
			var total = 0;
			//calc total
			ar.map(function(el){total = total+el['totalOrders']});
			ar.map(function(el)
				{
				if (!total){el['percentage'] =0;return false;};
				el['percentage'] = $filter('number')((el['totalOrders']/total)*100,1);
				})
			}
		}

		//check whet
	function is_empty_data()
		{
		if (!$scope.DATA_AGR) return false;
		return $scope.DATA_AGR['data'].filter(function(el){return el['totalOrders']!=0}).length==0;
		}


	}

module.exports.$inject = ['$scope','$q','backend','$timeout','$filter','tour'];