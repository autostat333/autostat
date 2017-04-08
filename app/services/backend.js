module.exports = function($http)
	{



	this.getActualDate = function()	
		{
		return $http.get('/api/getactualdate').then(function(resp)
			{
			return resp.data;
			},function()
			{
			//	alert(angular.toJson(err);	
			//alert('Smth going wrong!')	
			})

		}


	this.getMarks = function(dt)
		{
		if (!dt)
			dt = '';
		return $http.get('./api/marks/'+dt).then(function(res)
			{
			return res.data;
			},function(err)
			{
			//alert('Smth going wrong!')
			})
		}


		//total & new orders over all cars depends on params
	this.getGeneralStatistic = function(d)
		{
		return $http.post('./api/generalstatistic',d).then(function(res)
			{
			return res.data;
			},function(err)
			{
			//		alert(angular.toJson(err);	
			//alert('Smth going wrong when obtain general statistic!')
			})

		}


		//get stat on cars from reports collection depends on date
	this.topCars = function(params)
		{
		return $http.post('./api/topcarsstatistic',params).then(function(res)
			{
			return res.data;
			},function(err)
			{
			//		alert(angular.toJson(err);	
			//alert('Smth going wrong when obtain general statistic!')
			})
		}


		//get aggregations by diferent params
		//basically, it is the same as get/report for particular date and for specifi fields
	this.getAggregations = function(params)
		{
		return $http.post('./api/aggregations',params).then(function(res)
			{
			return res.data;
			},function(err)
			{
			//	alert(angular.toJson(err);	
			//alert('Smth going wrong when obtain aggregation statistic!')
			})
		}


	this.getAdverts = function(d)
		{

		return $http.post('/api/adverts/get',d).then(function(res)
			{
			return res.data;
			},function()
			{
			//	alert(angular.toJson(err);	
			//alert('Smth going wrong when obtain aggregation statistic!')

			})

		}

		//request for last report and avg_table
	this.getAvgTable = function(d)
		{

		return $http.post('/api/reports/avgtable',d).then(function(res)
			{
			return res.data;
			},function()
			{
			//	alert(angular.toJson(err);	
			//alert('Smth going wrong when obtain aggregation statistic!')
			})

		}


	this.getAvgData = function(d)
		{

		return $http.post('/api/reports/avgchart',d).then(function(res)
			{
			return res.data;
			},function()
			{
			//	alert(angular.toJson(err);	
			//alert('Smth going wrong when obtain aggregation statistic!')
			})

		}


	this.getCities = function(d)
		{

		return $http.post('/api/reports/bycities',d).then(function(res)
			{
			return res.data;
			},function()
			{
			//	alert(angular.toJson(err);	
			//alert('Smth going wrong when obtain aggregation statistic!')
			})
		}

	}

module.exports.$inject = ['$http']