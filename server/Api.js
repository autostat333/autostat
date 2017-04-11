module.exports = function Api(async,app,MongoService,RobotCntr,db)
	{


	var $scope = {};

	$scope.getMarks = getMarks;
	$scope.getGeneralStatistic = getGeneralStatistic;
	$scope.topCarsStatistic = topCarsStatistic;
	$scope._calc_sum = _calc_sum;
	$scope.getActualDate = getActualDate;
	$scope.getAggregations = getAggregations;
	$scope.getAdverts = getAdverts;
	$scope.getAvgTable = getAvgTable;
	$scope.getAvgChart = getAvgChart;
	$scope.getReportByCities = getReportByCities;




	return $scope;





	//api/marks
	//it is data to load at the SELECT FIELD
	function getMarks(dt,callback)
		{
		$scope.res = [];
		if (!dt)
			dt = RobotCntr.get_cur_date('previous');
		var cursor = db.collection('reports').find({'date':dt},{'totalOrders':1,'name':1,'type':1,'value':1,'markId':1},{'sort':'name'});
		cursor.count(function(err,res)
			{
			if (err!=null){callback(err);return false}
			var cursor_size = res;
			var num = 0;
			cursor.each(function(err,res)
				{
				if (err!=null){callback(err);return false}
				if (cursor_size===0)
					{
					callback(null,$scope.res);
					return false;
					}
				$scope.res.push(res);
				num = num+1;
				if (num==cursor_size)
					{
					callback(null,$scope.res);
					return false;
					}

				})
			})

		}

	//api/generalstatistic
	//it is data for TABLES and CHART (total&new orders)
	//based on post {type:all,value:'total'}
	// for marks {type:mark,value:98} - returns all acura orders
	function getGeneralStatistic(req,callback)
		{
		$scope.res = [];


		var params = {};
		//add start date from database
		params['date'] = {'$gt':'2016-10-23'};


		//get TOTAL STAT for chart and table
		if (req.body['type']==='total')
			{
			params['value'] = 'total';
			params['type'] = 'total';				
			}

		//fet STAT for MARK
		if (req.body['type']==='mark')
			{
			params['value'] = parseInt(req.body['value']);
			params['type'] = 'mark';
			}


		var cursor = db.collection('reports').find(params,{'date':1,'totalOrders':1,'newOrders':1});
		var num = 0;
		cursor.count(function(err,cursor_size) //get size
			{
			//iterate over documents
			if (err!=null){callback(err);console.log('Error when count cursor for general Statistic',err);return false};
			cursor.each(function(err,doc)
				{
				if (err!=null){callback(err);console.log('Error when get doc for general Statistic',err);return false};
				if (doc===null){return false} //the end of cursor

				$scope.res.push(doc)

				//FINISH CURSOR
				num = num+1;
				if (num===cursor_size)
					{
					callback(null,$scope.res); //return to server.js response - arr with adverts
					return false;
					}
				})


			})
		}


		//returns only top 10 marks from reports bu specific car and date
	function topCarsStatistic(req,callback)
		{
		$scope.res = [];

		if (req.body['type']==='total')
			var params = {'date':req.body['date'],'type':'mark'};

		//fet STAT for MARK
		if (req.body['type']==='mark')
			var params = {'date':req.body['date'],'markId':parseInt(req.body['value']),'type':'model'};

		var cursor = db.collection('reports').find(params,{'totalOrders':1,'name':1,'value':1});
		var num = 0;
		cursor.count(function(err,cursor_size) //get size
			{

			//if no data
			if (cursor_size==0)
				{
				callback(null,[]);
				return false;					
				}


			//iterate over documents
			if (err!=null){callback(err);console.log('Error when count cursor for general Statistic',err);return false};
			cursor.each(function(err,doc)
				{
				if (err!=null){callback(err);console.log('Error when get doc for general Statistic',err);return false};
				if (doc===null){return false} //the end of cursor

				$scope.res.push(doc)

				//FINISH CURSOR
				num = num+1;
				if (num===cursor_size)
					{
					//calculate sum of all total_orders
					var ttl = $scope._calc_sum($scope.res);
					$scope.res.sort(function(a,b)
						{
						a = parseInt(a['totalOrders']);
						b = parseInt(b['totalOrders']);
						return a<b?1:(a>b?-1:0);
						})
					$scope.res = $scope.res.slice(0,10);
					ttl = ttl - $scope._calc_sum($scope.res); //determine final clear rest amount
					$scope.res.push({'name':'Rest','totalOrders':ttl});
					callback(null,$scope.res); //return to server.js response - arr with adverts
					return false;
					}
				})


			})
		}


		//get last actual date for the rest queries from backend
	function getActualDate(callback)
		{
		MongoService.getActualDate(function(err,res)
			{
			if (err!=null){callback(err);return false;}
			callback(null,res);
			})

		}



	function getAggregations(params,callback)
		{
		//some checkers for provide safe queries
		var tp = params['type'].check_for('reports/type');
		var dt = params['date'].check_for('date'); 
		var id_ = params['value']=='all'?params['value']:params['value'].check_for('numbers');

		if (!tp||!dt||(!id_&&params['value']!='all'))
			{
			callback('Params of request are wrong');
			return false;				
			}

		var params_fin = tp!='total'?{'date':dt,'value':id_,'type':tp}:{'date':dt,'value':'total','type':tp};

		//convert to int, because mongoDB is sensitivy to int&string
		if (params_fin['value']!='total')
			params_fin['value'] = parseInt(params_fin['value']);

		//get only nec fields
		var fields = {};
		fields['ordersByPrice'] = 1;
		fields['ordersByYear'] = 1;
		fields['ordersByDuration'] = 1;
		fields['ordersByRace'] = 1;
		fields['ordersByNewDate'] = 1;
		fields['totalOrders'] = 1;

		cursor = db.collection('reports').find(params_fin,fields);
		cursor.each(function(err,res)
			{
			if (err){callback(err);return false;}
			callback(null,res);
			return false;
			})


		}



		//from route api/adverts/get
	function getAdverts(params,callback)
		{

		var params_ = {};
		params_['dates'] = params['date'].check_for('date');
		params_['modelId'] = params['modelId'].check_for('numbers');

		//when get adverts for auto map - not necessary selected year
		if (params['selectedYear'])
			params_['year'] = params['selectedYear'].check_for('numbers');


		params_['raceLarge'] = params['selectedRace']?params['selectedRace'].check_for('raceLarge'):'total';

		params_['modelId'] = parseInt(params_['modelId']);

		if (params_['year'])
			params_['year'] = parseInt(params_['year']);

		if (!params_['dates']||params_['year']==false||!params_['raceLarge'])
			{
			callback('Wrong Parametrs for data base!');
			return false;
			}
		params_['raceLarge']=='total'?(delete params_['raceLarge']):'';
		var fields = {};
		

		//fields for display
		fields['shortTitle'] = 1;
		fields['createDate'] = 1;
		fields['price'] = 1;
		fields['raceLarge'] = 1;
		fields['city'] = 1;
		fields['raceOrg'] = 1;
		fields['fuelName'] = 1;
		fields['title'] = 1;
		fields['year'] = 1;
		fields['link'] = 1;
		fields['cityCoordinates'] = 1;

		MongoService.getAdverts(params_,fields,function(err,res)
			{
			if (err){callback(err);return false};
			callback(null,res);

			})

		}




	function getAvgTable(params,callback)
		{
		var params_ = {};
		params_['date'] = params['date'].check_for('date');
		params_['value'] = params['modelId'].check_for('numbers');
		params_['type'] = 'model';

		params_['value'] = parseInt(params_['value']);
	
		var fields = {'ordersAvgTable':1};

		if (!params_['value']||!params_['date'])
			{
			callback(null,'Wrong Parameters for requests');
			return false;
			}

		MongoService.getAvgTable(params_,fields,function(err,res)
			{
			if (err){callback(err);return false;}
			callback(null,res);
			})


		}


		//get avarage data for chart (avg prices for cars)
	function getAvgChart(params,callback)
		{
	
		var params_ = {};
		params_['type'] = 'model';
		params_['value'] = params['modelId'].check_for('numbers');
		

		if (!params_['value'])
			{
			callback(null,'Wrong Parameters for requests');
			return false;
			}

		params_['value'] = parseInt(params_['value']);

		var fields = {'ordersAvgTable':1,'date':1};

		MongoService.getAvgChart(params_,fields,function(err,res)
			{
			if (err){callback(err);return false;}

			//reduce response to specific data from params
			var new_res = {};
			var obj,y;
			for (var e=0;el=res[e];e++)
				{
				if ((y=el['ordersAvgTable'][params['selectedYear']])&&(
					obj = y[params['selectedRace']]))
					{
					var avg_total = !obj['total']['prices']?0:(obj['total']['prices']/obj['total']['orders']);
					var avg_new = !obj['new']['prices']?0:(obj['new']['prices']/obj['new']['orders']);
					}
				else
					{
					var avg_total = 0;
					var avg_new = 0;
					}
				new_res[el['date']] = {'totalAvg':avg_total,'newAvg':avg_new};
				}

			callback(null,new_res);
			})
		}




	function getReportByCities(params,callback)
		{

		var dt = params['date'].check_for('date');
		if (!dt)
			{
			callback('dare.not.coorect]');
			return false;
			}
		var params_ = {'date':dt,'type':'total'};

		MongoService.getReportByCities(params_,function(err,res)
			{
			if (err){callback(err);return false};
			callback(null,res);
			})
		}





	function _calc_sum(ar)
		{
		var total_sum = 0;
		var tmp = $scope.res.map(function(el)
			{
			total_sum = total_sum+parseInt(el['totalOrders']);
			return el;
			});
		return total_sum;
		}


	}