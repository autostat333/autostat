module.exports = function RobotCntr_InsertModels($scope,async,app,MongoService,RequestsService)
	{

	
	$scope.insert_models = insert_models;  //main function - stack
	$scope.insert_models_Get_marks_from_db = insert_models_Get_marks_from_db; //get all docs from collection marks/ get models from ria
	$scope.insert_models_Loop_for_models = insert_models_Loop_for_models; //loop over all models and marks to find changes
	$scope.insert_models_Update_structure = insert_models_Update_structure;  //insert changes (update DB)



	function insert_models(callback)
		{
		async.series([
			$scope.insert_models_Get_marks_from_db,
			$scope.insert_models_Loop_for_models,
			$scope.insert_models_Update_structure
			],function(err,res)
				{
				if (err!=null){callback(err);return false}
				callback(null,res);
				})
		}

	//obtain all marks with models and than loop to filter acc to options
	function insert_models_Get_marks_from_db(callback)
		{
		$scope.marks = [];
		MongoService.getMarks(function(err,marks)
			{
			if (err!=null){callback(err);return false}
			$scope.marks = marks;

			//if options existed - filtring array acc to marks in array
			if ($scope.options!=undefined
				&&$scope.options['refreshModelsByMark']!=undefined
				&&$scope.options['refreshModelsByMark'].constructor==Array
				&&$scope.options['refreshModelsByMark'].length!=0)
				{
				$scope.marks = $scope.marks.filter(function(el){return $scope.options['refreshModelsByMark'].indexOf(el['value'])!=-1});
				}
			callback(null,'INSERT_MODELS:Finish getting from DB marks! ('+$scope.marks.length+')');
			})
		}


	//get models for each mark from RIA and push new model to $scope.marks. 
	//also, it returns $scope.marks_for_update array with _ids of marks, which will be updated in next func
	function insert_models_Loop_for_models(callback)
		{
		$scope.marks_for_update = [];
		//eachSeries - iterate keeping order and waiting previous callback finishing
		async.eachSeries($scope.marks,function(mark,callback)
			{
			//get data from ria api
			RequestsService.getModels(mark['value'],function(err,res)
				{

				if (err!=null){callback(err);return false}
				var models = res;
				//convert to string id (value)
				//models = models.map(function(el){el['value'] = el['value'].toString(); return el});
				mark['models'] = mark['models']===undefined?[]:mark['models'];
				var keys_models_db = mark['models'].map(function(el){return el['value']});
				for (var each in models)
					{
					var el = models[each];
					if (keys_models_db.indexOf(el['value'])==-1)
						{
						mark['models'].push(el);
						if ($scope.marks_for_update.indexOf(mark['_id'])==-1)
							$scope.marks_for_update.push(mark['_id']);
						}
					}
				callback(null);
				})
			},function(err,res)
				{
				if (err!=null){callback(err);return false}
				callback(null,'INSERT_MODELS:Finish loop models! (for update '+$scope.marks_for_update.length+')');
				})

		}



	//update structure in DB (send update request requests) from marks (where new models pushed yet)
	//and from marks_for_update array
	function insert_models_Update_structure(callback)
		{
		if ($scope.marks_for_update.length==0){callback(null,'INSERT_MODELS:No models new for update');return false;};
		//prepare new docuemtns
		var docs_for_update = $scope.marks.filter(function(el)
				{
				return $scope.marks_for_update.indexOf(el['_id'])!=-1;
				});

		async.each(docs_for_update,function(el,callback_)
			{
			MongoService.UpdateModels(el,function(err,res)
				{
				if (err!=null){callback_(err);return false};
				callback_(null);
				});
			},function(err,res)
				{
				if (err!=null){callback(err);return false}
				callback(null,'INSERT_MODELS:Inserting new models finished ('+$scope.marks_for_update.length+')');
				})
		}




	}