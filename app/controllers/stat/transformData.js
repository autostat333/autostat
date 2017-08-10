module.exports = function transformData($scope,$filter)
	{

	$scope.transform_total_orders_item = transform_total_orders_item;
	$scope.create_empty_day = create_empty_day;
	$scope.transform_marks = transform_marks;
	$scope.transform_top_cars = transform_top_cars;



	function transform_marks(data)
		{

		$scope.marks = data.filter(function(el){return el['type']=='mark'&&el['totalOrders']!=0});
		//models_ - is using for cache models. from this array - new arra for ng-repeat will be selected
		$scope.models = data.filter(function(el){return el['type']=='model'&&el['totalOrders']!=0});


		//sort marks for top
		$scope.marks = $scope.marks.sort(function(a,b)
			{
			a = parseInt(a['totalOrders']);
			b = parseInt(b['totalOrders']);
			return a>b?-1:a<b?1:0;
			});
		$scope.marks_top = $scope.marks.slice(0,10);
		$scope.marks = $scope.marks.sort(function(a,b){return a['name']>b['name']?1:a['name']<b['name']?-1:0});
		$scope.models = $scope.models.sort(function(a,b){return a['name']>b['name']?1:-1});
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


	//DATA_total_orsers and new orders
	//set day of week for tables and charts
	function transform_total_orders_item(el)
		{
		var weeks = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
		el['WeekDay'] = $filter('date')(el['date'],'EEE');
		el['WeekDayNumber'] = weeks.indexOf(el['WeekDay']);
		el['WeekNumber'] = $filter('date')(el['date'],'w');
		el['Year'] = $filter('date')(el['date'],'yyyy');

		//for Sunday - remove to previous week
		//el['WeekNumber'] = el['WeekDayNumber']===6?(el['WeekNumber']-1):el['WeekNumber'];
		//for dictionary key
		//because weeknumber is the same for different years
		el['WeekNumber'] = parseInt(parseInt((new Date(el['date'])).getTime()/86400000+3)/7);
	//	el['WeekNumber'] = el['WeekNumber'].toString();

//		el['WeekNumber'] = el['WeekNumber'].length==1?'0'+el['WeekNumber']:el['WeekNumber'];

		
		//el['newOrdersShow'] = Math.round(el['newOrders']/100)/10;
		//el['totalOrdersShow'] = Math.round(el['totalOrders']/1000);
		el['newOrdersShow'] = _to_show_format(el['newOrders']);
		el['totalOrdersShow'] = _to_show_format(el['totalOrders']);
		el['dateShow'] = $filter('date')(el['date'],'d')+' '+$filter('translate')($filter('date')(el['date'],'MMM'));

		return el;

		}

	function transform_top_cars(data)
		{
		var total = 0;
		var tmp = data.map(function(el){total = total+parseInt(el['totalOrders'])});

		tmp = data.map(function(el)
			{
			el['show'] = true; //this is for input field in scroll top cars block
			el['focus_from_pie'] = 'pie_not_focused'; //this can be false/true or '' depends on pie under focus and its value
			el['totalOrdersShow'] = _to_show_format(el['totalOrders']);
			el['percentage'] = ((el['totalOrders']/total)*100).toFixed(1);
			return el;
			})

		return tmp;
		}


		//create DAY for NO DATA Day
	function create_empty_day(ts)
		{

		//create date
		var dt = new Date(ts*86400000);
		var y = $filter('date')(dt,'yyyy');
		var m = $filter('date')(dt,'MM');
		var dy = $filter('date')(dt,'dd');

		var d = {};
		d['totalOrders'] = 0;
		d['totalOrdersShow'] = '-';
		d['newOrders'] = 0;
		d['newOrdersShow'] = '-';
		d['date'] = y+'-'+m+'-'+dy;
		//it means day is future date
		//for calculations avarage it will be used to filter not calculated this dates
		d['notCompleted'] = true; 
		return $scope.transform_total_orders_item(d);

		}




	}

module.exports.$inject = ['$scope','$filter'];