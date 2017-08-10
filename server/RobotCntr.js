module.exports = function RobotCntr(async,app,MongoService,RequestsService,ReportsCntr)
	{


	var $scope = {};
	$scope.reports = reports;
	

	$scope.options = {
		'refreshModelsByMark':[],  //filtring marks for getting models from ria. If ['No'] - no requests for models and no any model updates

		'refreshAdvertsByMark':[],  //filtring marks before shooting for adverts for every model. If ['No'] - no records filtred. If [] - all marks remains for send req for advert_id
		'refreshAdvertsByModel':[],  //filtring marks and models array before shooting to ria

		'checkSvod':true, //checking whether to make compare between adverts_short and adverts'
		'checkDateDuplicates':true, //checking whether duplicates in dates array
		'remakeShortAdvertsByMarks':['No'],  //query to db for update. If 'No' - no any remaking. If [] - all collections with adverts will be remake.
		'remakeShortAdvertsByModels':['No'],

		'createReports':[], //!!!All depricated. Pass dates array to calculate reports 
		'startProject':['2016-10-23'] //it is using in reports to filter dates when "all" !!!! Now depricated together with all param. To calculate reports for several dates - pass them in array
	};
 
	require('./RobotCntr_InsertMarks.js')($scope,async,app,MongoService,RequestsService);
	require('./RobotCntr_InsertModels.js')($scope,async,app,MongoService,RequestsService);
	require('./RobotCntr_InsertAdverts.js')($scope,async,app,MongoService,RequestsService);



	//!!!TODO mwrap this tasks into async series
	$scope.stack = function(callback)
		{
		async.series([
				$scope.insert_marks,
				$scope.insert_models,
				$scope.insert_adverts,
				$scope.reports
				],function(err,res)
					{
					if (err!=null){console.log('Error in final callback of Robot:',err);callback(err);return false}
					console.log(res);
					callback(null,res);
					})
		}

	return $scope;


	//this function for running cycles for creating all reports
	//because reports gathered in one controller ReportCntr
	
	function reports(callback)
		{

		if ($scope.options['createReports'].length==0)
			{
			var cur_dt = $scope.get_cur_date();
			cur_dt = cur_dt.split(' ')[0];
			var dates = [cur_dt];
			}
		else
			dates = $scope.options['createReports'];

		//!!!ToDO move it to config
		//now for passing must be only one value in array ['2016-10-24']
		//dates = ['2017-04-11'];
		//dates = [];
		async.eachSeries(dates,function(it,callback)
			{
			ReportsCntr.stack([it],function(err,res)
				{
				if (err!=null){callback(err);return false}
				callback(null,res);
				})
			},function(err,res)
			{ 
			if (err!=null){callback(err);return false};
			callback(null,'REPORTS:Finished reports for '+dates.length+' dates!')
			})


		}



	}
