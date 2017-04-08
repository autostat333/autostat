module.exports = function RobotCntr_Insert_Adverts($scope,async,app,MongoService,RequestsService)
	{

	$scope.insert_adverts = insert_adverts;  //main function. contains list off calls
	$scope.insert_adverts_Get_marks = insert_adverts_Get_marks; //get marks from DB to scope.narks. Here also filtring by options
	$scope.insert_adverts_Loop_req_adverts = insert_adverts_Loop_req_adverts;  //loop over marks and ask from ria for adverts id. Save to scope.adverts_all
	$scope.insert_adverts_Check_existense = insert_adverts_Check_existense; //loop over all adverts and check existence in DB advert_id/ If no - create scope.adverts_for_insert
	$scope.insert_adverts_Insert_new_adverts = insert_adverts_Insert_new_adverts;  //loop over new adverts. get doc and insert to DB.
	$scope.insert_adverts_Insert_new_short_adverts = insert_adverts_Insert_new_short_adverts;  //create short advert from full advert from DB and insert to db.adverts_short
	$scope.insert_adverts_Remake_short_adverts = insert_adverts_Remake_short_adverts;
	$scope.insert_adverts_Update_date = insert_adverts_Update_date;
	$scope.insert_adverts_Svod_short_adverts = insert_adverts_Svod_short_adverts;
	$scope.insert_adverts_Remove_duplicates = insert_adverts_Remove_duplicates;
	$scope.insert_adverts_Repeat_get_adverts = insert_adverts_Repeat_get_adverts;
	$scope.get_cur_date = get_cur_date;
	$scope.insert_adverts_Check_date_duplicates = insert_adverts_Check_date_duplicates;
	$scope.getAllCoordinates = getAllCoordinates;


	$scope.create_short_advert = create_short_advert;  //transforming full advert to its short form for adverts_short
	$scope.get_price_bucket = get_price_bucket;
	$scope.get_race_bucket = get_race_bucket;
	$scope.get_race_large_bucket = get_race_large_bucket; //for moe larger buckets
	$scope.get_cur_date = get_cur_date;
	$scope.set_coordinates = set_coordinates;


		//main function - stack
	function insert_adverts(callback)
		{
		async.series([
			$scope.getAllCoordinates,
			$scope.insert_adverts_Get_marks,
			$scope.insert_adverts_Loop_req_adverts,
			$scope.insert_adverts_Repeat_get_adverts,
			$scope.insert_adverts_Check_existense,
			$scope.insert_adverts_Insert_new_adverts,
			$scope.insert_adverts_Insert_new_short_adverts,
			$scope.insert_adverts_Svod_short_adverts,
			$scope.insert_adverts_Remove_duplicates,
			$scope.insert_adverts_Update_date,
			$scope.insert_adverts_Check_date_duplicates,
			$scope.insert_adverts_Remake_short_adverts
			],
			function(err,res)
				{
				if (err!=null){callback(err);return false}
				callback(null,res);
				})
		}


	//get marks structure with models from DB
	//here also filtring of marks and models acc to options
	function  insert_adverts_Get_marks(callback)
		{
		console.logD('get marks by id');
		$scope.marks = [];
		//if ($scope.options['refreshAdvertsByMark'])
		MongoService.getMarks(function(err,doc)
			{
			if (err!=null){callback(err);return false;}
			$scope.marks = doc;
			//if options existed - filtring marks
			if ($scope.options!=undefined
				&&$scope.options['refreshAdvertsByMark']!=undefined
				&&$scope.options['refreshAdvertsByMark'].constructor==Array
				&&$scope.options['refreshAdvertsByMark'].length!=0)
					{
					var fil_id = $scope.options['refreshAdvertsByMark'];			
					$scope.marks = $scope.marks.filter(function(el){return fil_id.indexOf(el['value'])!=-1});
					}
			//if options existed - filtring models within mark
			if ($scope.options!=undefined
				&&$scope.options['refreshAdvertsByModel']!=undefined
				&&$scope.options['refreshAdvertsByModel'].constructor==Array
				&&$scope.options['refreshAdvertsByModel'].length!=0)
					{
					var fil_id = $scope.options['refreshAdvertsByModel'];
					for (var each in $scope.marks)
						{
						$scope.marks[each]['models'] = $scope.marks[each]['models'].filter(function(el){return el['value'] == fil_id});
						}			
					}
			callback(null,'INSERT ADVERTS:Finished getting marks! ('+$scope.marks.length+')');
			})
		}

	//go over marks and models and shoot for adverts id array for every model
	//two cycles over marks and models
	//return $scope.adverts_all array with adverts
	function insert_adverts_Loop_req_adverts(callback)
		{

		//it using for looping, and it is only first time looping throught the marks original
		$scope.marks_ = $scope.adverts_repeat!=undefined?$scope.adverts_repeat:$scope.marks;
		$scope.adverts_all = $scope.adverts_all===undefined?[]:$scope.adverts_all;

		//drop adverts_for_repeat, for next cycle
		$scope.adverts_repeat = [];

		//check if no mark
		if ($scope.marks_.length===0){callback(null,'INSERT_ADVERTS: No marks in scope.marks!');return false;}

		async.eachSeries($scope.marks_,function(mark,callback)
			{
			//check if no models in mark or it is not existed
			if (mark['models']===undefined||mark['models'].length===0)
				{
				callback(null);
				return false;
				}

			async.eachSeries(mark['models'],function(model,callback)
				{					
				RequestsService.getAdvertsId(mark['value'],model['value'],function(err,doc){
					//if ocnventional error
					if (err!=null&&err!='timeouted'){callback(err);return false}
					//if error because of timeout
					if (err=='timeouted')
						$scope.adverts_repeat.push({'value':mark['value'],'name':mark['name'],'models':[{'value':model['value']}]});
					else
						$scope.adverts_all = $scope.adverts_all.concat(doc['classifieds']);
					callback(null);
					})
				},function(err,res)
					{
					if (err!=null){callback(err);return false;}
					console.log('Finished loop adverts for '+mark['name']+', '+mark['value']+'! ('+$scope.adverts_all.length+').');
					callback(null);
					}
				)
			},function(err,res)
				{
				if (err!=null){callback(err);return false}
				callback(null,'INSERT_ADVERTS:Finished loop over models and collect adverts_id check existence !('+$scope.adverts_all.length+'), for repeating ('+$scope.adverts_repeat.length+')');
				})
		}



	//thins is repeating adverts for those where timouted fired (my own time counter, locals.CONFIG.timeoute)
	//this adverts will be repeated only once;
	function insert_adverts_Repeat_get_adverts(callback)
		{
		if ($scope.adverts_repeat.length==0)
			{
			callback(null,'INSERT_ADVERTS:No adverts for repeat');
			return false;
			}
		console.log('REPEAT',$scope.adverts_repeat.length);
		$scope.insert_adverts_Loop_req_adverts(callback);


		}




	//loop over adverts_all and check existence of every
	//if no - push to $scope.adverts_for_insert
	//if advert not existed in mongo - make final list for update models
	function insert_adverts_Check_existense(callback)
		{
		$scope.adverts_for_insert = [];
		//$scope.adverts_for_insert = $scope.adverts_all;
		//callback(null);
		
		if ($scope.adverts_all.length==0)
			{
			callback(null,'INSERT_ADVERTS:No adverts for checking existence!');
			return false;
			}

		var total_count = $scope.adverts_all.length;
		var part_10 = parseInt(total_count/10);
		var count =0;


		async.eachSeries($scope.adverts_all,function(adv_id,callback)
			{
			MongoService.isExist('adverts',{'advertId':adv_id},function(err,res)
				{
				if (err!=null){callback(err);return false};
				if (!res)
					{
					$scope.adverts_for_insert.push(adv_id)
					};
				count = count+1;
				if (count%part_10==0){console.log(count)};
				callback(null);
				})
			},function(err,res)
			{
			if (err!=null){callback(err);return false;}
			callback(null,'INSERT_ADVERTS:Finished check existence! ( new adverts '+$scope.adverts_for_insert.length+')');
			})
		
		}

	//get new doc and insert to DB (loop over $scope.adverts_for_insert)
	function insert_adverts_Insert_new_adverts(callback)
		{
		if ($scope.adverts_for_insert.length==0)
			{
			callback(null,'INSERT_ADVERTS:No new adverts for insert!');
			return false;
			}
		var ts_start = (new Date()).getTime();
		var total_count = $scope.adverts_for_insert.length;
		var count_ = 0;
		var part_10 = parseInt(total_count/10);
		async.eachSeries($scope.adverts_for_insert,function(adv_id,callback)
			{
			RequestsService.getAdvert(adv_id,function(err,doc)
				{
				if (doc=='Error'){callback(null);return false};
				doc['advertId'] = adv_id;
				MongoService.insertAdvert(doc,function(err,res)
					{
					if (err!=null){callback(err);return false};
					count_ = count_+1;
					if (count_%part_10===0){console.log(count_)}
					callback(null);
					})
				})
			},function(err,res)
				{
				var ts_end = (new Date()).getTime();
				var duration = (ts_end - ts_start)/1000;
				if (err!=null){callback(err);return false;}
				callback(null,'INSERT_ADVERTS:Finished inserting new adverts! (time:'+duration+')');
				})

		}


	//loop over adverts_for_insert and get doc from mongo, 
	//create short doc from it and insert to adverts_short collection
	function insert_adverts_Insert_new_short_adverts(callback)
		{
		if ($scope.adverts_for_insert.length==0)
			{
			callback(null,'INSERT_ADVERTS:No new adverts for insert short adverts');
			return false;
			}
		async.each($scope.adverts_for_insert,function(adv_id,callback)
			{
			MongoService.getAdvert(adv_id,function(err,doc)
				{
				//for requests which have not been previously downloaded - no docs in DB
				//that is why null when get them
				//TODO - make repated attempt to download them
				if (doc==null){callback(null);return false;}
					//TODO possible null because no docs
				$scope.create_short_advert(doc,insert_to_db);

				function insert_to_db(err,short_doc)
					{
					MongoService.insertShortAdvert(short_doc,function(err,res)
						{
						if (err!=null){callback(err);return false;}
						callback(null);
						})
					}
				})
			},function(err,res)
				{
				if (err!=null){callback(err);return false;}
				callback(null,'INSERT_ADVERTS:Finished inserting short adverts! ('+$scope.adverts_for_insert.length+')')
				})
		}


	//it is making compare between adverts and adverts_short
	//if doc exist in adverts but not in adverts_short - it will be inserted
	//cimpletly, it is iterating over adverts collection
	function insert_adverts_Svod_short_adverts(callback)
		{
		if ($scope.options.checkSvod)
			{
			MongoService.iterateAdverts($scope.create_short_advert,function(err,count, inserted)
				{
				if (err!=null){callback(err);return false}
				callback(null,'INSERT_ADVERTS:Finish to SVOD adverts and adverts_short! (total loop '+count+' , inserted '+inserted+')');
				})
			}
		else
			{
			callback(null,'INSERT_ADVERTS:Svod is not configured to check in options!')
			return false;
			}

		}
		

	function insert_adverts_Remove_duplicates(callback)
		{
		MongoService.checkDuplicates(function(err,res)
			{
			if (err!=null){callback(err);return false};
			callback(null,'INSERT_ADVERTS:Finished checking and removing duplicates, removed '+res+' !')
			})
		}


	//this method pushing new date to dates array in every advert
	function insert_adverts_Update_date(callback)
		{
		if ($scope.adverts_all.length==0)
			{
			callback(null,'INSERT_ADVERTS:No adverts for update date (adverts_all=0)');
			return false;
			}

		var cur_date = $scope.get_cur_date();

		MongoService.updateDate($scope.adverts_all,cur_date,function(err,res)
			{
			if (err!=null){callback(err);return false};
			callback(null,'INSERT_ADVERTS:Finished Updating date ('+res+')');
			})
		}



	function insert_adverts_Check_date_duplicates(callback)
		{
		if (!$scope.options.checkDateDuplicates){callback(null,'INSERT_ADVERTS:No options to check date duplicates');return false;}

		MongoService.checkDateDuplicate(function(err,res)
			{
			if (err!==null){console.log(err);callback('Error when checking duplicates within data array');return false;}
			callback(null,'INSERT_ADVERTS:Finish checking duplicates within data array, '+res+' duplicates!');
			})
		}


	//remaking is calling only by options
	//it is iterating over all adverts -> create new short advert -> update this short advert
	//it is long-time function, and must be rewriten
	//it must creates new collection, insert new docs. but kill old collection. 
	//necc obtain dates array from adverts_short of old version
	function insert_adverts_Remake_short_adverts(callback)
		{
		$scope.adverts_for_remake = [];

		var param = {};
		param['$or'] = [];

		if ($scope.options!=undefined
			&&$scope.options['remakeShortAdvertsByMarks']!=undefined
			&&$scope.options['remakeShortAdvertsByMarks'].constructor==Array
			&&$scope.options['remakeShortAdvertsByMarks'].length!=0
			&&$scope.options['remakeShortAdvertsByMarks'][0]!='No'
			)
			{
			var p = {};
			p['markId'] = {};
			p['markId']['$in'] = $scope.options['remakeShortAdvertsByMarks'];
			param['$or'].push(p);
			}

		if ($scope.options!=undefined
			&&$scope.options['remakeShortAdvertsByModels']!=undefined
			&&$scope.options['remakeShortAdvertsByModels'].constructor==Array
			&&$scope.options['remakeShortAdvertsByModels'].length!=0
			&&$scope.options['remakeShortAdvertsByModels'][0]!='No'
			)
			{
			var p = {};
			p['modelId'] = {}
			p['modelId']['$in'] = $scope.options['remakeShortAdvertsByModels'];
			param['$or'].push(p);
			}			


			//check it were conditions for models and marks
		if (param['$or'].length==0)
			{
			param = 'No';
			}


		//run cycle if both options are empty
		if ($scope.options['remakeShortAdvertsByMarks'].length==0&&$scope.options['remakeShortAdvertsByModels'].length==0)
			{
			param = {};
			}

		if (param!='No')
			{
			MongoService.remakeShortAdverts(param,$scope.create_short_advert,function(err,res)
				{
				if (err!=null){callback(null,err);return false};
				callback(null,'INSERT_ADVERTS:Finished remaking adverts! ('+res+')')
				})

			}
		else
			{
			callback(null,'INSERT_ADVERTS:No options for remaking short adverts!');
			}


		}




		//this is function before all execution
		//to put in scopr coordinates and not call huge number of requests to mongodb
	function getAllCoordinates(callback)
		{
		$scope.coordinates = {};
		$scope.req_count = 1; //kolvo sended requests to control setTimeout
		//and number of requests to google maps
		MongoService.getCoordinates(function(err,coords)
			{
			if (err){callback(null,'Error: When obtain all cordinates from mongoDB');return false};

			for (var each in coords)
				{
				$scope.coordinates[coords[each]['city']] = coords[each];
				}
			callback(null);
			});	

		}



		//if error - callback returns "Request error", empty object
	function set_coordinates(doc_obj,callback)
		{
		var name = doc_obj['city'];

		if (!$scope.coordinates[name])
			{
			$scope.req_count = $scope.req_count+1;
			setTimeout(function()
				{	
				//check once more it is no name
				if ($scope.coordinates[name])
					{
						console.log('Existed',name);
					return_();
					return false;
					}
					//timeout is nec to prevent a lot of req to google maps
				RequestsService.getCoordinates(name,save_to_db);
				},300*$scope.req_count);			
			}
		else
			return_();



		function return_()
			{
			doc_obj['cityCoordinates'] = $scope.coordinates[name];
			callback(null,doc_obj);	
			}

		function save_to_db(err,doc)
			{
			if (err)
				{
				callback(null,doc_obj);
				return false
				};

			doc['city'] = name;
			$scope.coordinates[name] = doc;
			return_();
			//here insert to db is not nec for waiting
			MongoService.insertCoordinate(doc);
			}			

		}


	//Some not STACK functions (auxiliary)
	function create_short_advert(doc,callback)
		{
		var short_doc = {};

		short_doc['createDate'] = doc['addDate']+' +0300';  //add UA timezone
		short_doc['updateDate'] = doc['updateDate']+' +0300';	
		short_doc['expireDate'] = doc['expireDate']+' +0300';	

		short_doc['price'] = doc['USD'];
		short_doc['priceBucket'] = $scope.get_price_bucket(doc['USD']);
		short_doc['race'] = doc['autoData']['raceInt'];
		short_doc['race'] = $scope.get_race_bucket(doc['autoData']['raceInt']);
		short_doc['raceLarge'] = $scope.get_race_large_bucket(doc['autoData']['raceInt']);
		short_doc['isSold'] = doc['autoData']['isSold'];
		short_doc['city'] = doc['locationCityName'];

		short_doc['version'] = doc['autoData']['version'];
		short_doc['raceOrg'] = doc['autoData']['race'];
		short_doc['fuelName'] = doc['autoData']['fuelName'];
		short_doc['gearboxName'] = doc['autoData']['gearboxName'];		
		short_doc['title'] = doc['title'];		

		short_doc['year'] = doc['autoData']['year'];

		short_doc['advertId'] = doc['advertId'];
		short_doc['markId'] = doc['markId'];
		short_doc['modelId'] = doc['modelId'];
		short_doc['markName'] = doc['markName'];
		short_doc['modelName'] = doc['modelName'];

		short_doc['link'] = 'http://auto.ria.com'+ doc['linkToView'];
		short_doc['shortTitle'] = doc['autoData']['description'];
		//short_doc['newDate'] = $scope.get_cur_date();
		short_doc['newDate'] = short_doc['createDate'].split(' ')[0];
		short_doc['dates'] = [];
		short_doc['dates'].push(short_doc['newDate']);

		$scope.set_coordinates(short_doc,callback);
		//return short_doc;

		}

	function get_price_bucket(price)
		{
		price = parseFloat(price);
		var ranges = [5000,8000,10000,13000,15000,18000,20000,23000,25000,28000,30000,35000,40000,50000,60000]
		//var labels = ['0-5K','5K-8K','8K-10K','10K-13K','13K-15K','15K-18K','18K-20K','20K-23K','23K-25K','25K-28K','28K-30K','30K-35K','35K-40K','40K-50K','50K-60K','60K+']
		var labels = ['0-5','5-8','8-10','10-13','13-15','15-18','18-20','20-23','23-25','25-28','28-30','30-35','35-40','40-50','50-60','60+']
		for (var each in ranges)
			{
			if (price<=ranges[each])
				{
				return labels[each];
				}
			}
		return labels[labels.length -1];
		}

	function get_race_bucket(race)
		{
		race = parseInt(race);
		var ranges = [10,30,50,70,100,120,150,200,250,300,400,500]
		//var labels = ['0-5K','5K-8K','8K-10K','10K-13K','13K-15K','15K-18K','18K-20K','20K-23K','23K-25K','25K-28K','28K-30K','30K-35K','35K-40K','40K-50K','50K-60K','60K+']
		var labels = ['0-10','10-30','30-50','50-70','70-100','100-120','120-150','150-200','200-250','250-300','300-400','400-500','500+']
		for (var each in ranges)
			{
			if (race<=ranges[each])
				{
				return labels[each];
				}
			}
		return labels[labels.length -1];
		}


	function get_race_large_bucket(race)
		{	
		race = parseInt(race);
		var ranges = [10,50,100,150,250]
		//var labels = ['0-5K','5K-8K','8K-10K','10K-13K','13K-15K','15K-18K','18K-20K','20K-23K','23K-25K','25K-28K','28K-30K','30K-35K','35K-40K','40K-50K','50K-60K','60K+']
		var labels = ['0-10','10-50','50-100','100-150','150-250','250+'];
		for (var each in ranges)
			{
			if (race<=ranges[each])
				{
				return labels[each];
				}
			}
		return labels[labels.length -1];

		}



	function get_cur_date(param)
		{
		var dt = new Date();

		//get previous date for get marks api method
		if (param==='previous')
			dt = new Date(dt.setDate(dt.getDate()-1));

		var HH = dt.getUTCHours().toString();
		var MM = dt.getUTCMinutes().toString();
		var SS = dt.getUTCSeconds().toString();
		var Day = dt.getUTCDate().toString();
		var Month = (dt.getUTCMonth()+1).toString();
		var Year = dt.getUTCFullYear();

		HH = HH.length==1?'0'+HH:HH;
		SS = SS.length==1?'0'+SS:SS;
		MM = MM.length==1?'0'+MM:MM;
		Month = Month.length==1?'0'+Month:Month;
		Day = Day.length==1?'0'+Day:Day;


		var dt_str = Year+'-'+Month+'-'+Day+' '+HH+':'+MM+':'+SS+' +0300';
		var new_dt = new Date(dt_str);

		Day = new_dt.getDate().toString();
		Month = (new_dt.getMonth()+1).toString();
		Year = new_dt.getFullYear();


		Month = Month.length==1?'0'+Month:Month;
		Day = Day.length==1?'0'+Day:Day;

		var end_dt = Year+'-'+Month+'-'+Day;
		return end_dt;

		}


	}










