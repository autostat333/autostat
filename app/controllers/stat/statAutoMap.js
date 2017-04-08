module.exports = function StatAutoMap($scope,backend,$filter)
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
		$scope.params['modelId'] = $scope.active_tab['model']['value'];

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
			{'Label':'Title','Name':'title'},
			{'Label':'Short Description','Name':'shortTitle'},
			{'Label':'Fuel type','Name':'fuelName'},
			//{'Label':'Created','Name':'createDate'},
			{'Label':'Days on Board','Name':'createdAgo'},
			{'Label':'Year','Name':'year'},
			{'Label':'Race','Name':'raceOrg'},
			{'Label':'City','Name':'city'},
			{'Label':'Price','Name':'price'},
			{'Label':'Link','Name':'link'}
		]

		$scope.tconfig = {'itemsPerPage':10};
		$scope.tcallbacks = {};
		}




    function get_cities()
    	{
		$scope.myspinner.is = true;
		backend.getAdverts($scope.params).then(function(res)
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
		var cur_dt = parseInt((new Date($scope.ACTUAL_DATE))/86400000);

		for (var each in res)
			{
			var el = res[each];
			el['id'] = t++;
			el['place'] = el['city'];
			el['sumTarget'] = 1;//res[each]['totalOrders'];
			el['lat'] = el['cityCoordinates']['lat'];
			el['lng'] = el['cityCoordinates']['lng'];

			el['createdAgo'] = cur_dt - parseInt((new Date(el['createDate']))/86400000);
			el['createdAge'] = el['createdAge']<0?0:el['createdAge'];
			
			//for RACE
			el['raceOrg'] = parseInt(el['raceOrg']);
			el['raceOrg'] = isNaN(el['raceOrg'])?0:el['raceOrg'];

			//new_obj['avgPrice'] = res[each]['totalPrice']/res[each]['totalOrders'];
			if (!el['lat']) continue;
			new_arr.push(el);
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
		$scope.get_cities();
    	}




	}

module.exports.$inject = ['$scope','backend','$filter'];