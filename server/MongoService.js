module.exports = function MongoService(async,fs,app,db)
	{

	var $scope = {};



	$scope.getMarks = getMarks;  //geyr users from nogoDB, it is only for trains
	$scope.insertMarks = insertMarks;  //insert marks into db
	$scope.isExist = isExist;  //check if document exist by some criteries
	$scope.UpdateModels = UpdateModels; //updating models (add new) to mark object
	$scope.insertAdvert = insertAdvert; //insert new advert doc into DB
	$scope.getAdvert = getAdvert;
	$scope.insertShortAdvert = insertShortAdvert;
	$scope.remakeShortAdverts = remakeShortAdverts;
	$scope.updateDate = updateDate;
	$scope.iterateAdverts = iterateAdverts;
	$scope.checkDuplicates = checkDuplicates;
	$scope.checkDateDuplicate = checkDateDuplicate; //check whether duplicate within date array
	$scope.getAllDates = getAllDates; //get all dates for reports generation
	$scope.getActualDate = getActualDate; //get last available date from DB (uses for pie)
	$scope.insertCoordinate = insertCoordinate;
	$scope.getCoordinates = getCoordinates;
	$scope.getAvgTable = getAvgTable;
	$scope.getAvgChart = getAvgChart;
	$scope.getAdverts = getAdverts;
	$scope.getReportByCities = getReportByCities;

	$scope.docs = []; //result of requests to database

	return $scope; 



	//get all marks from DB
	function getMarks(callback)
		{
		var docs = [];
		var cursor = db.collection('marks').find();
		cursor.each(function(err,doc)
			{
			if (err!=null){callback(err);console.log('Cannot get doc');return false};
			if (doc!=null)
				docs.push(doc);
			else
				callback(null,docs);
			})
		}


	//inserting docs (array with docs - marks objects)
	//marks object is name of mark and value of mark
	function insertMarks(docs,callback)
		{
		db.collection('marks').insertMany(docs,function(err,res)
			{
			if (err!=null){console.log('Error insert marks',err);callback(err);return false};
			callback(null,res);
			});
		}


	//check if doc is existed
	function isExist(collection,param,callback)
		{
		db.collection(collection).findOne(param,function(err,res)
			{
			if (err!=null){console.log('Error find docs when check existence!',url,collection,param,err);callback(err);return false;}	
			callback(null,res!=null);
			})
		}


	function UpdateModels(el,callback)
		{
		db.collection('marks').updateOne({'_id':el['_id']},{$set:{'models':el['models']}},function(err,res)
			{
			if (err!=null){console.log('Error when update models in ',el['_id']);callback(err);return false;}
			callback(null);
			});
		}


	function insertAdvert(advert,callback)
		{
		db.collection('adverts').insertOne(advert,function(err,res)
				{
				if (err!=null){console.log('Error insert advert',err);callback(err);return false};
				callback(null,res);
				});
		}


	function insertCoordinate(coordinate)
		{
		db.collection('coordinates').insertOne(coordinate,function(err,res)
				{
				if (err!=null){console.log('Error insert advert',err);callback(err);return false};
				//callback(null,coordinate);
				});
		}




	function insertShortAdvert(short_advert,callback)
		{
		db.collection('adverts_short').insertOne(short_advert,function(err,res)
			{
			if (err!=null){console.log('Error insert short advert',err);callback(err);return false};
			callback(null,res);
			});
		}



	function getAdvert(adv_id,callback)
		{
		db.collection('adverts').findOne({'advertId':adv_id},function(err,doc)
			{
			callback(null,doc);
			});
		}


		//first of all necessary rename current adverts_short to adverts_short_old
		//remaking occuring as creating new adverts_short collection and inserting new docs
		//but pulling dates from current adverts_short_old collection
	function remakeShortAdverts(params,transform_callback,callback)
		{
		var count = 0;
		async.series([
			//check whether existed adverts_short collection
			function(callback)
				{
				var fin = false;
				db.listCollections().each(function(err,res)
					{
					if (fin){return false};
					if (err!=null){callback(err);fin=true;return false};
					//if (res!=null&&res['name']=='adverts_short')
					if (false)
						{
						callback('Collections "adverts_short" existed, but must be renamed',null);
						fin = true;
						return false;
						};
					if (res===null)
						{
						fin = true;
						callback(null,res);
						return false;	
						}
					})
				},
			function (callback)
				{
				var cursor = db.collection('adverts').find(params);
				cursor.count(function(err,cursor_size)
					{
					var part = parseInt(cursor_size/10);
					if (err!=null){callback(err);return false;}
					var num = 0;
					//run recreating short adverts
					cursor.each(function(err,doc)
						{
						if (err!=null){callback(err);console.log('Error obtain doc from adverts!');return false}
						if (doc===null){return false};
						transform_callback(doc,save_to_db);
						function save_to_db(err,new_doc)
							{
							db.collection('adverts_short_old').findOne({'advertId':doc['advertId']},function(err,adv_old)
								{
								if (err!=null){callback(err);return false}
								//new document
								if (adv_old!==null)
									{
									new_doc['dates'] = adv_old['dates'];
									//new_doc['newDate'] = adv_old['newDate'];	
									}
								db.collection('adverts_short').insert(new_doc,function(err,res)
										{
										if (err!=null){callback(err);return false}
										num = num+1;
										if (num%part==0){console.log(num)};
										if (num==cursor_size)
											{
											callback(null);
											return false;
											}
										})
								})

							}

						})
					})
				}
			],function(err,res)
				{
				if (err!=null){callback(err);return false;}
				callback(null);
				})

		}




	function updateDate(adverts_all,cur_date,callback)
		{
console.log('start update');
		var cursor = db.collection('adverts_short').find({'advertId':{'$in':adverts_all}});
		cursor.count(function(err,cursor_size)
			{
			console.log('cursor_size',cursor_size);
			if (err!=null){callback(err);return false};
			var kolvo = 0;
			var stop = false;
			cursor.each(function(err,res)
				{
				if (res!=null)
					{
					db.collection('adverts_short').update({'_id':res._id},{'$push':{'dates':cur_date}},function(err,res)
							{
							if (stop){return false;}
							if (err!=null){callback(err);console.log('Error when update date:',err);stop = true;return false;}
							kolvo = kolvo+1;
							if (kolvo==cursor_size)
								{
								stop = true;
								console.log(kolvo);
								callback(null,kolvo);
								}
 
							});						
					}

				})

			})	

/*
		db.collection('adverts_short').updateMany(
			{
			'advertId':{'$in':adverts_all},
			'dates':{'$ne':cur_date}
			},
			{
			'$push':{'dates':cur_date}
			},function(err,res)
			{
			if (err!=null){callback(err);console.log('Error obtain doc from adverts_short!',err);return false}
			callback(null,res['result']['nModified']);
			})
*/
		}

	function iterateAdverts(create_short_adv,callback)
		{
		var cursor = db.collection('adverts').find();
		cursor.count(function(err,cursor_size)
			{
			if (err!=null){callback(null,'Error');console.log('Error when get count of doc during iterate all adverts!');return false;}
			var count = 0;
			var inserted = 0;
			var part = parseInt(cursor_size/10);
			cursor.each(function(err,doc)
				{
				if (err!=null){callback(null,'Error');console.log('Error when get doc iterate all adverts!');return false;}
				if (doc==null){return false;}

				var adv_id = doc['advertId'];
				$scope.isExist('adverts_short',{'advertId':adv_id},function(err,res)
					{
					if (err!=null){callback(null,'Error');console.log('Error when check existence of short advert by advert_id!');return false;}

					if (!res)
						{
						create_short_adv(doc,function(err,new_doc){
						$scope.insertShortAdvert(new_doc,function(err,res)
							{
							inserted = inserted+1;
							})
						})
						}
					count = count+1;
					if (count%part==0){console.log(count)}; 
					if (count==cursor_size){callback(null,count,inserted);return false};							

					})
				})
			})
		}


	function getCoordinates(callback)
		{
		var cursor = db.collection('coordinates').find({});
		cursor.count(function(err,size)
			{
			if (size==0){callback(null,[]);return false;}
			if (err){callback(err);return false}
			var coords = [];
			cursor.each(function(err,doc)
				{
				if (size===false){return false;} //if doc null
				if (err){callback(err);return false};
				coords.push(doc);
				if (coords.length==size)
					{
					callback(null,coords);
					size = false;
					return false;						
					}
				})


			})
		}



	function checkDuplicates(callback)
		{

		var cursor = db.collection('adverts_short').find({'markId':98});
		var fin = false;
		var docs = {};
		var for_remove = [];
		cursor.count(function(err,count)
			{
			if (!count){callback(null,0);return false;}
			var step = parseInt(count/10);
			if (err){callback(null,err);console.log('Error when get size of cursor during check duplicates');fin=true;return false;}
			cursor.each(function(err,doc)
				{
				if (fin) return false;
				if (err){callback(null,err);fin=true;console.log('Error when iterating over adverts_short when check duplicates');return false;}
				docs[doc['advertId']] = docs[doc['advertId']]||0+1;
				if (count%step==0)console.log(count);
				if (!(--count))
					{
					fin = true;
					check_for_remove();
					}
				})
			})

		function check_for_remove()
			{
			for (var each in docs)
				{	
				if (docs[each]>1)
					for_remove.push(each)
				}
			remove_duplicates()
			}


		function remove_duplicates()
			{
			if (!for_remove.length)
				{
				callback(null,'0');
				return false;
				}

			async.each(for_remove,function(id)
				{
				db.collection('adverts_short').deleteOne({'advertId':id},function(err,res)
					{
					if (err!=null){console.log('Error: Cannot delete doc with advert id:'+id,err)};
					callback(null);
					})
				},function(err,res) //final callback
					{
					if (err!=null){console.log('Error in final callback when removing duplicates!',err);callback(null,'Errors has been!');return false;}
					callback(null,for_remove.length);
					})


			}
		}

	//check duplicates within dates array and return distinkt array
	function checkDateDuplicate(callback)
		{
		function check_dupl(doc)
			{
			try
				{
				var d = {};
				doc['dates'].filter(function(el){d[el]=1;return false});
				var ks = Object.keys(d);		
				}
			catch(err){console.log(doc);return false};
			
			return ks.length!=doc['dates'].length?ks:false;
			}																																														

		var cursor = db.collection('adverts_short').find({});
		cursor.count(function(err,cursor_size)
			{
			if (err!==null){callback(err);return false};
			var num = 0;
			var changed = 0;
			var part = parseInt(cursor_size/10);
			cursor.each(function(err,doc)
				{
				if (num%part==0){console.log(num)};
				if (err!=null){callback(err);flag=false;return false;}
				if (doc!==null)
					{
					var tmp = check_dupl(doc);
					if (tmp!=false)
						{
						db.collection('adverts_short').updateOne({'_id':doc['_id']},{'$set':{'dates':tmp}},function(err,res)
							{
							if (err!==null){console.log('Error update dates for '+doc['_id']);return false;}
							changed = changed+1;
							num = num+1;
							if (num===cursor_size)
								{
								callback(null,changed);
								return false;
								}
							})
						}
					else
						{
						num = num+1;
						if (num==cursor_size)
							{
							callback(null,changed);
							return false;
							}							
						}
					}
				else
					{
					num = num+1;
					if (num==cursor_size||cursor_size==0)
						{
						callback(null,changed);
						return false;
						}
					}
				})

			})


		}


	function getAllDates(callback)
		{
		db.collection('adverts_short').aggregate([
			{'$unwind':'$dates'},
			{'$group':{'_id':'$dates'}}
			],function(err,res)
				{
				if (err!=null){callback(err);return false}
				callback(null,res);
				})
  
		}


	function getActualDate(callback)
		{
		var start_day = new Date();
		start_day.setDate(start_day.getDate()-7);

		var y = start_day.getFullYear();
		var m = (m = start_day.getUTCMonth()+1).toString().length==1?'0'+m:m;
		var d = (d = start_day.getUTCDate()).toString().length==1?'0'+d:d;

		start_day = y+'-'+m+'-'+d;

		var doc = db.collection('reports').findOne({'date':{'$gt':start_day}},{'sort':[['date','desc']]},function(err,doc)
				{
				callback(null,[doc]);							
				});

			/*
		db.collection('reports').aggregate([
			{'$match':{'date':{'$gt':'2017-03-01'}}}, //prune array for grouping
			{'$group':{'_id':'$date'}},
			{'$sort':{'_id':-1}}
			],function(err,res)
			{
			if (err){callback(err);return false};
			callback(null,res);
			})
		*/
		}



	function getAvgTable(params,fields,callback)
		{
		cursor =  db.collection('reports').findOne(params,fields,function(err,res)
			{
			if (err){callback(err);return false};
			callback(null,res['ordersAvgTable']);

			});

		}


	function getAvgChart(params,fields,callback)
		{
		cursor =  db.collection('reports').find(params,fields);
		cursor.count(function(err,cursor_size)
			{

			if (err){callback(err);return false}

			//if NO DATA
			if (!cursor_size)
				{	
				callback(null,[]);
				return false;
				}

			//ITERATION
			var fin = false;
			var arr = [];
			cursor.each(function(err,res)
				{
				if (fin){return false;}
				if (err){callback(err);fin = true;return false;}
				arr.push(res);
				if (arr.length==cursor_size)
					{
					fin = true;
					callback(null,arr);
					}			
				})

			})

		}


	function getReportByCities(params,callback)
		{
		db.collection('reports').findOne(params,{'ordersByCity':1},function(err,res)
			{
			if (err){callback(err);return false};
			var t = res?res['ordersByCity']:[];
			callback(null,t);
			});

		}


	function getAdverts(params,fields,callback)
		{
		
		var cursor = db.collection('adverts_short').find(params,fields);
		cursor.count(function(err,size)
			{
			if (err){callback(err);return false;}
			var count = 0;
			var res = [];
			if (!size){callback(null,[]);return false;} //no data
			cursor.each(function(err,doc)
				{
				if (count===false){return false}
				if (err){callback(err);count=false;return false}

				res.push(doc);
				count = count+1;
				if (count==size)
					{
					callback(null,res);count = false;
					return false;
					}
				})

			})
			
		}


	}
