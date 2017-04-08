module.exports = function StatGeneralCntr($scope,backend,$filter)
	{

	$scope.init = init;
	$scope.init_data_table = init_data_table;
	$scope.transform_locations = transform_locations;
	$scope.get_cities = get_cities;


	$scope.init();

	$scope.$watch('LOCATIONS',watcher_locations,true);
	$scope.$watch('params',watcher_params,true);



	function init()
		{
		$scope.params = {};
		$scope.params['date'] = new Date($scope.ACTUAL_DATE);
		$scope.params['date'] = $filter('date')($scope.params['date'],'yyyy-MM-dd');

		//set hidden for table
		//till first loading will be finished
		$scope.first_loading = false;

		$scope.LOCATIONS = [];
		$scope.LOCATIONS_MAP_STATE = {};
		$scope.LOCATIONS_TABLE_STATE = {};

		$scope.init_data_table();
		$scope.get_cities();


		}



	function init_data_table()
		{

		//for DataTable
	    $scope.tcolumns = [
	        {'Name':'place','Label':'Place'},
	        {'Name':'totalOrders','Label':'Total Orders'},
	        {'Name':'avgPrice','Label':'Avarage Price'}
    	];

	    $scope.tconfig = {};
	    $scope.tcallbacks = {};
		}




    function get_cities()
    	{
		$scope.myspinner.is = true;
		backend.getCities($scope.params).then(function(res)
			{
			$scope.first_loading = true;//show table
			$scope.LOCATIONS = $scope.transform_locations(res);
			$scope.myspinner.is = false;
			});
    	}



    function transform_locations(res)
    	{
		var new_arr = [];
		var t = 0;
		for (var each in res)
			{
			var new_obj = res[each];
			new_obj['id'] = t++;
			new_obj['place'] = each;
			new_obj['sumTarget'] = res[each]['totalOrders'];
			new_obj['avgPrice'] = res[each]['totalPrice']/res[each]['totalOrders'];
			if (!new_obj['lat']) continue;
			new_arr.push(new_obj);
			}

		return new_arr;

    	}

    function watcher_locations(new_val,old_val)
        {
    	$scope.LOCATIONS_MAP_STATE = {};
		$scope.LOCATIONS_TABLE_STATE = {};

	    $scope.LOCATIONS.map(function(el,idx)
	        {
	        $scope.LOCATIONS_MAP_STATE[el['id']] = {'show':true};
	        });


	    $scope.LOCATIONS.map(function(el,idx)
	        {
	        $scope.LOCATIONS_TABLE_STATE[el['id']] = {'show':true};
	        });

        }



    function watcher_params(new_val,old_val)
    	{
		if (new_val['date']==old_val['date'])return false;
		console.log(new_val,old_val);
		$scope.get_cities();
    	}




	}

module.exports.$inject = ['$scope','backend','$filter'];