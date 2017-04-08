module.exports = function StatAutoAvarageTable($scope,backend,$q,$filter,$timeout)
	{
	
	$scope.init = init;
	$scope.get_adverts = get_adverts;
	$scope.get_avg_table = get_avg_table;
	$scope.get_chart_data = get_chart_data;

	$scope.transform_avg_table = transform_avg_table;
	$scope.transform_chart_data = transform_chart_data;
	$scope.calc_avg = calc_avg;
	$scope.get_kolvo_years = get_kolvo_years; //for show below years button
	$scope.init_years = init_years;
	$scope.init_params = init_params;
	$scope.init_table = init_table;
	$scope.select_item = select_item;
	$scope.isEqualObj = isEqualObj;
	$scope.transform_adverts = transform_adverts;

	$scope.MAX_VISIBLE_YEARS = 11;


	$scope.$watch('AVG_TABLE',for_display,true);
	$scope.$watch('show_all_years',for_display,true);
	$scope.$watch('years',for_display,true);
	$scope.$watch('params',watcher_params,true);

	$scope.init();



	$scope.ar = [1,2,3,4,5,6,7,8,9,10,11];

	function init()
		{
			//template locatedwithin html as script and ng-template
			//because ui bootstrap does obtain variable from attribute and parse it
		$scope.some_template = 'smallDescriptionTemplate.html';
		$scope.AVG_TABLE = [];
		$scope.show_all_years = false;


		$scope.show_chart = 'hidden'; //do not show chart till loading will finished

		$scope.races = ['total','0-10','10-50','50-100','100-150','150-250','250+'];

		//params is gathering all current state values (date, year,mark.model etc)
		$scope.params = {};
		$scope.params['date'] = $scope.ACTUAL_DATE; //inherit actual date from stat.js
		$scope.params['markId'] = $scope.selected_tab['mark']['value']; //inherit from view mark&model params
		$scope.params['modelId'] = $scope.selected_tab['model']['value'];


		$scope.DATA_chart_avg_prices = [];
		//create empty data & columns
		$scope.init_table();

		$scope.myspinner['is'] = true;


		$scope.get_avg_table().then(function()
			{
			$scope.myspinner['is'] = false;
			});

		}


	function init_params()
		{
			//simple track to every time call watcher after init params
			//to grant firing requests for refresh chart and table after date change
		$scope.params['id'] = (new Date()).getTime();
		$scope.params['date'] = $scope.params['date']||$scope.ACTUAL_DATE; //inherit actual date from stat.js
		$scope.params['markId'] = $scope.selected_tab['mark']['value']; //inherit from view mark&model params
		$scope.params['modelId'] = $scope.selected_tab['model']['value'];
		$scope.params['selectedYear'] = $scope.AVG_TABLE[0][0];
		$scope.params['selectedRace'] = 'total';
		$scope.params['selectedObject'] = $scope.AVG_TABLE[0][1];

		}


	//firing from 
	function init_years()
		{
		$scope.years = {};
		for (var each=0;el = $scope.AVG_TABLE[each];each++)
			{
			$scope.years[el[0]] = {'personal_preferences':true,'show_all':true};
			}
		}


	function get_adverts()
		{

		$scope.table_spinner = $scope.table_spinner||{};
		$scope.table_spinner.is = true;
		backend.getAdverts($scope.params).then(function(res)
			{
			$scope.table_spinner.is = false;
			$scope.ADVERTS = $scope.transform_adverts(res)//.splice(0,1);
			})


		}


	function init_table()
		{

		$scope.ADVERTS = [];
		$scope.tcolumns = [
			{'Label':'Title','Name':'title'},
			{'Label':'Short Description','Name':'shortTitle'},
			{'Label':'Fuel type','Name':'fuelName'},
			//{'Label':'Created','Name':'createDate'},
			{'Label':'Days on Board','Name':'createdAgo'},
			{'Label':'Race','Name':'raceOrg'},
			{'Label':'City','Name':'city'},
			{'Label':'Price','Name':'price'},
			{'Label':'Link','Name':'link'}
		]

		$scope.tconfig = {'itemsPerPage':10};
		$scope.tcallbacks = {};

		}



	function get_avg_table()
		{
		var defer = $q.defer();
		var d = {};
		backend.getAvgTable($scope.params).then(function(res)
			{
			$scope.AVG_TABLE = $scope.transform_avg_table(res);
			$scope.init_years();
			$scope.init_params();
			defer.resolve();
			})

		return defer.promise;
		}


	function get_chart_data()
		{
		$scope.chart_spinner = $scope.chart_spinner||{};
		$scope.chart_spinner.is = true;
		backend.getAvgData($scope.params).then(function(res)
			{
			$scope.chart_spinner.is = false;
			$scope.DATA_chart_avg_prices = $scope.transform_chart_data(res);
			})

		}


		//calculate avarage prices and sorting
		//also complete for every sorting
		//sorting years also
	function transform_avg_table(d)
		{
		var res = [];

		function tmp_obj(name)
			{
			var tmp = {};
			tmp['name'] = name;
			tmp['new'] = {'orders':0,'avg':0};
			tmp['total'] = {'orders':0,'avg':0};
			return tmp;
			}

			//create row
		for (var each in d)
			{
			var tr = d[each];
			new_tr = [];//property for array to show this year
			new_tr.push(each);
			//complete all races in row
			for (idx in $scope.races)
				{
				var race = $scope.races[idx];
				if (!tr[race])
					new_tr.push(tmp_obj(race));
				else
					{
					calc_avg(tr[race]);
					new_tr.push(tr[race]);
					}
				}
			res.push(new_tr);

			}
		//sort by years
		res.sort(function(a,b)	
			{
			a = a[0];b = b[0];
			return a>b?-1:(a<b?1:0);
			})
		return res;

		}


	function transform_adverts(d)
		{
		var cur_dt = parseInt((new Date($scope.ACTUAL_DATE))/86400000);
		for (var i=0;el = d[i];i++)
			{
			el['createdAgo'] = cur_dt - parseInt((new Date(el['createDate']))/86400000);
			el['createdAge'] = el['createdAge']<0?0:el['createdAge'];
			
			//for RACE
			el['raceOrg'] = parseInt(el['raceOrg']);
			el['raceOrg'] = isNaN(el['raceOrg'])?0:el['raceOrg'];

			}
		return d;
		}


		//firing from transform
	function calc_avg(obj)
		{
		obj['new']['avg'] = !obj['new']['orders']?0:(Math.round((obj['new']['prices']/obj['new']['orders'])/10)/100);
		obj['total']['avg'] = !obj['total']['orders']?0:(Math.round((obj['total']['prices']/obj['total']['orders'])/10)/100);

		}



	function transform_chart_data(d)
		{
		var c_d = [];
		for (var each in d)
			{
			var avg = Math.round(d[each]['totalAvg']*100)/100;
			c_d.push({'dateShow':each,'totalAvg':avg});
			}

		c_d.sort(function(a,b)
			{
			a = a['dateShow'];
			b = b['dateShow'];
			return a<b?-1:(a>b?1:0);
			})
		return c_d;
		}




	function select_item(row, it,idx)
		{


		$('.chart_column .selection_title').animate({'opacity':0},function()
			{
			$scope.params['selectedObject'] = it;
			$scope.params['selectedYear'] = row[0];
			$scope.params['selectedRace'] = $scope.races[idx-1];				

			$timeout(function()
				{
				$('.chart_column .selection_title').animate({'opacity':1});
		//		$(this).fadeIn('fast')					
				$('.chart_column .new').animate({'opacity':1});
				$('.chart_column .total').animate({'opacity':1});
				})
			});
		
		$('.chart_column .new').animate({'opacity':0});
		$('.chart_column .total').animate({'opacity':0});

		//$('.chart_column .new').fadeOut('fast',function(){$(this).fadeIn('fast')});
		//$('.chart_column .total').fadeOut('fast',function(){$(this).fadeIn('fast')});

		}


	function for_display(new_val,old_val)
		{
		if (new_val==undefined||new_val==undefined)return false;

		var tmp = [];
		for (var i=0;el=$scope.AVG_TABLE[i];i++)
			{
			var per_pref = $scope.years[parseInt(el[0])]['personal_preferences'];
			if ((per_pref&&$scope.show_all_years)||(!$scope.show_all_years&&per_pref&&tmp.length<$scope.MAX_VISIBLE_YEARS))
				{
				tmp.push(el);
				$scope.years[parseInt(el[0])]['show_all'] = true;
				}			
			else
				{
				$scope.years[parseInt(el[0])]['show_all'] = false;
				}
			}
		tmp = [];
		}


	function isEqualObj(row,obj,idx)
		{
		if ($scope.params['selectedRace']==$scope.races[idx-1]&&
			$scope.params['selectedYear']==row[0])
			return true;
		else
			return false;				
		}


		//determine wherther to show or not button "show belopw years"
	function get_kolvo_years()
		{
		var count = 0;
		for (var each in $scope.years)
			{
			if ($scope.years[each]['personal_preferences'])
				count++;
			}
		return count>$scope.MAX_VISIBLE_YEARS;
		}


	function watcher_params(new_val,old_val)
		{
		if (!new_val||!new_val['selectedObject']) return false;

		//if only date is change - reqest for new data
		//then new params will be setted and watcher will be fired once more
		if (new_val['date']!=old_val['date'])
			$scope.get_avg_table();
		else
			{
			$scope.get_chart_data();
			$scope.get_adverts();				
			}


		}



	}

module.exports.$inject = ['$scope','backend','$q','$filter','$timeout'];