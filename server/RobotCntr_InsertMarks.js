module.exports = function RobotCntr_InsertMarks($scope,async,app,MongoService,RequestsService)
	{


	//$scope.get_marks = get_marks;

	$scope.insert_marks = insert_marks;  //main function - stack
	$scope.insert_marks_Get_marks = insert_marks_Get_marks;  //get all docs from marks collection
	$scope.insert_marks_Check_existence = insert_marks_Check_existence; //check if mark existed
	$scope.insert_marks_Insert_to_db = insert_marks_Insert_to_db;  //insert all not existed marks to db



	function insert_marks(callback)
		{
		async.series([
			$scope.insert_marks_Get_marks,
			$scope.insert_marks_Check_existence,
			$scope.insert_marks_Insert_to_db
			],function(err,res)
				{
				if (err!=null){console.log('Error insert marks');callback(err);return false}
				callback(null,res);
				})

		}

		//get marks from autoria
	function insert_marks_Get_marks(callback)
		{
		RequestsService.getMarks(function(err,res)
			{
			if (err!=null){console.log('Error obtain marks');callback(err);return false}
			$scope.marks = res;
			callback(null);
			});
		}

		//check existence of mark within database
	function insert_marks_Check_existence(callback)
		{
		$scope.marks_for_insert = [];
		//$scope.marks = $scope.marks.map(function(el){el['value'] = el['value'].toString();return el;});
		async.each($scope.marks,function(el,callback)
			{
			var id = el['value'];
			MongoService.isExist('marks',{'value':id},function(err,res)
					{
					if (err!=null){callback(err);return false}
					if (res!=true)
						$scope.marks_for_insert.push(el);
					callback(null)
					});
			},function(err,res)
				{
				if (err!==null){callback(err);return false};
				callback(null,'INSEERT_MARKS:Finished check existence ( new '+$scope.marks_for_insert.length+')');
				})

		}


		//insert new added marks
	function insert_marks_Insert_to_db(callback)
		{
		if ($scope.marks_for_insert.length==0){callback(null,'No data for insert');return false};
		MongoService.insertMarks($scope.marks_for_insert,function(err,res)
			{
			if (err!=null){console.log('Cannot save mark doc to DB');callback(err);return false};
			callback(null,res);					
			})
		}



	}


