module.exports = function ReportsCntr(async,app,MongoService, db)
	{
 


	var $scope = {};
	$scope.createReportGeneral = createReportGeneral;
	$scope.startCreatingReports = startCreatingReports;


	$scope.stack = function(dt,callback)
		{
		$scope.dt = dt[0];
		async.series([
			$scope.startCreatingReports

			],function(err,res)
			{
			if (err!=null){callback(err);return false;}
			callback(null,res);
			})

		}


	return $scope;



	function startCreatingReports(callback)
		{
		$scope.createReportGeneral($scope.dt,function(err,res)
				{ 
				if (err!=null){callback(err);return false}

				var ar = [];
				ar.push(res['total']);
				for (var each in res['marks']){ar.push(res['marks'][each])}
				for (var each in res['models']){ar.push(res['models'][each])}
				async.each(ar,function(it,callback)
					{
	
					db.collection('reports').update({'date':it['date'],'value':it['value'],'type':it['type'],},
						{'$set':it},{'upsert':true},function(err,res)
						{
						if (err!=null){callback(err);return false}
						callback(null);
						})
					},function(err,res)
						{
						if (err!=null){callback(err);return false;}
						console.log('REPORTS:General report is created for '+$scope.dt+'!');
						callback(null);
						})

				});
			

		}



	function createReportGeneral(dt,callback)
		{
		$scope.res = {};
		//	get all marks
		MongoService.getMarks(function(err,marks_doc)
			{
			if (err!=null){callback(err);return false;}
			var total = general_report_Create_block();
			total['date'] = dt;
			total['type'] = 'total';
			total['value'] = 'total';
			total['name'] = 'total';

			var marks = {};
			var models = {};

			for (var each in marks_doc)
				{
				var mark = marks_doc[each];

				marks[mark['value']] = general_report_Create_block();
				marks[mark['value']]['value'] = mark['value'];
				marks[mark['value']]['name'] = mark['name'];
				marks[mark['value']]['type'] = 'mark';
				marks[mark['value']]['date'] = dt;


				for (var each2 in mark['models'])
					{
					var model = mark['models'][each2];

					models[model['value']] = general_report_Create_block();
					models[model['value']]['value'] = model['value'];
					models[model['value']]['name'] = model['name'];
					models[model['value']]['type'] = 'model';
					models[model['value']]['date'] = dt;
					models[model['value']]['markId'] = mark['value'];

					}
				}

			var cursor = db.collection('adverts_short').find({'dates':dt});	
			var num = 0;
			var dtt = 0;
			var tot = 0;
			cursor.count(function(err,cursor_size)
				{
				if (err!=null)
					{callback(err);return false}
				//if no adverts - create report with "0" values
				if (cursor_size==0)
					{
					var report = {};
					report['marks'] = marks;
					report['models'] = models;
					report['total'] = total;
					callback(null,report);
					return false;
					}

				cursor.each(function(err,doc)
					{
					if (err!=null){callback(err);return false};
					if (doc!=null)
						{
						var tl = total;
						var mk = marks[doc['markId']];
						var md = models[doc['modelId']];

						if (doc['newDate']=='2016-11-08')
							dtt = dtt+1;
						else
							tot = tot+1

						general_report_Calculate_fields(tl,mk,md,doc,dt);


						num = num+1;
						if (num===cursor_size)
							{
							var report = {};
							report['marks'] = marks;
							report['models'] = models;
							report['total'] = total;
							callback(null,report);
							return false;	
							}
						}
					})


				})

			})




		}





		//below internal methods

	function general_report_Create_block()
		{
		var d = {};
		d['ordersByYear'] = {};
		d['ordersByPrice'] = {};
		d['ordersByRace'] = {};
		d['ordersByNewDate'] = {};
		d['ordersByCity'] = {};
		d['ordersBySold'] = {};
		d['ordersByDuration'] = {};
		d['ordersAvgTable'] = {};
		d['totalOrders'] = 0;
		d['totalPrice'] = 0;
		d['newOrders'] = 0;
		d['newPrice'] = 0;


		return d;

		}


	function create_templateAvgTableRow(name)
		{
		var all_rows = {};
		var new_row = {};
		new_row['new'] = {};
		new_row['total'] = {};
		new_row['new']['orders'] = 0;
		new_row['new']['prices'] = 0;
		new_row['total']['orders'] = 0;
		new_row['total']['prices'] = 0;


		if (!name)return new_row;

		//get large races
		var races = ['total','0-10','10-50','50-100','100-150','150-250','250+'];
		var i =0;
		while ((name=races[i++]))
			all_rows[name] = create_templateAvgTableRow();				

		return all_rows;

		}


	function general_report_Calculate_fields(tl,mk,md,doc,cur_date)
		{
 

		tl['totalOrders'] = tl['totalOrders']+1;
		tl['totalPrice'] = tl['totalPrice']+doc['price'];
		mk['totalOrders'] = mk['totalOrders']+1;
		mk['totalPrice'] = mk['totalPrice']+doc['price'];

		md['totalOrders'] = md['totalOrders']+1;
		md['totalPrice'] = md['totalPrice']+doc['price'];


			//CITY Aggregations
			try{
			var lat =  doc['cityCoordinates']['lat'];
			var lng = doc['cityCoordinates']['lng'];
			}
			catch(err)
				{
				lat = '';lng='';//because some advers may have empty city 19254798
				}

		md['ordersByCity'][doc['city']] = md['ordersByCity'][doc['city']]==undefined?{'name':doc['city'],'lat':lat,'lng':lng,'totalOrders':0,'totalPrice':0}:md['ordersByCity'][doc['city']];
		md['ordersByCity'][doc['city']]['totalOrders'] = md['ordersByCity'][doc['city']]['totalOrders']+1;
		md['ordersByCity'][doc['city']]['totalPrice'] = md['ordersByCity'][doc['city']]['totalPrice']+ doc['price'];

		mk['ordersByCity'][doc['city']] = mk['ordersByCity'][doc['city']]==undefined?{'name':doc['city'],'lat':lat,'lng':lng,'totalOrders':0,'totalPrice':0}:mk['ordersByCity'][doc['city']];
		mk['ordersByCity'][doc['city']]['totalOrders'] = mk['ordersByCity'][doc['city']]['totalOrders']+1;
		mk['ordersByCity'][doc['city']]['totalPrice'] = mk['ordersByCity'][doc['city']]['totalPrice']+ doc['price'];

		tl['ordersByCity'][doc['city']] = tl['ordersByCity'][doc['city']]==undefined?{'name':doc['city'],'lat':lat,'lng':lng,'totalOrders':0,'totalPrice':0}:tl['ordersByCity'][doc['city']];
		tl['ordersByCity'][doc['city']]['totalOrders'] = tl['ordersByCity'][doc['city']]['totalOrders']+1;
		tl['ordersByCity'][doc['city']]['totalPrice'] = tl['ordersByCity'][doc['city']]['totalPrice']+ doc['price'];

		
			//RACE Aggregations
		md['ordersByRace'][doc['race']] = md['ordersByRace'][doc['race']]==undefined?{'name':doc['race'],'totalOrders':0,'totalPrice':0}:md['ordersByRace'][doc['race']];
		md['ordersByRace'][doc['race']]['totalOrders'] = md['ordersByRace'][doc['race']]['totalOrders']+1;
		md['ordersByRace'][doc['race']]['totalPrice'] = md['ordersByRace'][doc['race']]['totalPrice']+doc['price'];

		mk['ordersByRace'][doc['race']] = mk['ordersByRace'][doc['race']]==undefined?{'name':doc['race'],'totalOrders':0,'totalPrice':0}:mk['ordersByRace'][doc['race']];
		mk['ordersByRace'][doc['race']]['totalOrders'] = mk['ordersByRace'][doc['race']]['totalOrders']+1;
		mk['ordersByRace'][doc['race']]['totalPrice'] = mk['ordersByRace'][doc['race']]['totalPrice']+doc['price'];

		tl['ordersByRace'][doc['race']] = tl['ordersByRace'][doc['race']]==undefined?{'name':doc['race'],'totalOrders':0,'totalPrice':0}:tl['ordersByRace'][doc['race']];
		tl['ordersByRace'][doc['race']]['totalOrders'] = tl['ordersByRace'][doc['race']]['totalOrders']+1;
		tl['ordersByRace'][doc['race']]['totalPrice'] = tl['ordersByRace'][doc['race']]['totalPrice']+doc['price'];


			//PRICE Aggregations
		md['ordersByPrice'][doc['priceBucket']] = md['ordersByPrice'][doc['priceBucket']]==undefined?{'name':doc['priceBucket'],'totalOrders':0,'totalPrice':0}:md['ordersByPrice'][doc['priceBucket']];
		md['ordersByPrice'][doc['priceBucket']]['totalOrders'] = md['ordersByPrice'][doc['priceBucket']]['totalOrders']+1;
		md['ordersByPrice'][doc['priceBucket']]['totalPrice'] = md['ordersByPrice'][doc['priceBucket']]['totalPrice']+doc['price'];

		mk['ordersByPrice'][doc['priceBucket']] = mk['ordersByPrice'][doc['priceBucket']]==undefined?{'name':doc['priceBucket'],'totalOrders':0,'totalPrice':0}:mk['ordersByPrice'][doc['priceBucket']];
		mk['ordersByPrice'][doc['priceBucket']]['totalOrders'] = mk['ordersByPrice'][doc['priceBucket']]['totalOrders']+1;
		mk['ordersByPrice'][doc['priceBucket']]['totalPrice'] = mk['ordersByPrice'][doc['priceBucket']]['totalPrice']+doc['price'];

		tl['ordersByPrice'][doc['priceBucket']] = tl['ordersByPrice'][doc['priceBucket']]==undefined?{'name':doc['priceBucket'],'totalOrders':0,'totalPrice':0}:tl['ordersByPrice'][doc['priceBucket']];
		tl['ordersByPrice'][doc['priceBucket']]['totalOrders'] = tl['ordersByPrice'][doc['priceBucket']]['totalOrders']+1;
		tl['ordersByPrice'][doc['priceBucket']]['totalPrice'] = tl['ordersByPrice'][doc['priceBucket']]['totalPrice']+doc['price'];

			//YEAR Aggregations
		md['ordersByYear'][doc['year']] = md['ordersByYear'][doc['year']]==undefined?{'name':doc['year'],'totalOrders':0,'totalPrice':0}:md['ordersByYear'][doc['year']];
		md['ordersByYear'][doc['year']]['totalOrders'] = md['ordersByYear'][doc['year']]['totalOrders']+1;
		md['ordersByYear'][doc['year']]['totalPrice'] = md['ordersByYear'][doc['year']]['totalPrice']+doc['price'];

		mk['ordersByYear'][doc['year']] = mk['ordersByYear'][doc['year']]==undefined?{'name':doc['year'],'totalOrders':0,'totalPrice':0}:mk['ordersByYear'][doc['year']];
		mk['ordersByYear'][doc['year']]['totalOrders'] = mk['ordersByYear'][doc['year']]['totalOrders']+1;
		mk['ordersByYear'][doc['year']]['totalPrice'] = mk['ordersByYear'][doc['year']]['totalPrice']+doc['price'];

		tl['ordersByYear'][doc['year']] = tl['ordersByYear'][doc['year']]==undefined?{'name':doc['year'],'totalOrders':0,'totalPrice':0}:tl['ordersByYear'][doc['year']];
		tl['ordersByYear'][doc['year']]['totalOrders'] = tl['ordersByYear'][doc['year']]['totalOrders']+1;
		tl['ordersByYear'][doc['year']]['totalPrice'] = tl['ordersByYear'][doc['year']]['totalPrice']+doc['price'];

			//IsSold Aggregations

		md['ordersBySold'][doc['isSold']] = md['ordersBySold'][doc['isSold']]==undefined?{'name':doc['isSold'],'totalOrders':0,'totalPrice':0}:md['ordersBySold'][doc['isSold']];
		md['ordersBySold'][doc['isSold']]['totalOrders'] = md['ordersBySold'][doc['isSold']]['totalOrders']+1;
		md['ordersBySold'][doc['isSold']]['totalPrice'] = md['ordersBySold'][doc['isSold']]['totalPrice']+doc['price'];

		mk['ordersBySold'][doc['isSold']] = mk['ordersBySold'][doc['isSold']]==undefined?{'name':doc['isSold'],'totalOrders':0,'totalPrice':0}:mk['ordersBySold'][doc['isSold']];
		mk['ordersBySold'][doc['isSold']]['totalOrders'] = mk['ordersBySold'][doc['isSold']]['totalOrders']+1;
		mk['ordersBySold'][doc['isSold']]['totalPrice'] = mk['ordersBySold'][doc['isSold']]['totalPrice']+doc['price'];

		tl['ordersBySold'][doc['isSold']] = tl['ordersBySold'][doc['isSold']]==undefined?{'name':doc['isSold'],'totalOrders':0,'totalPrice':0}:tl['ordersBySold'][doc['isSold']];
		tl['ordersBySold'][doc['isSold']]['totalOrders'] = tl['ordersBySold'][doc['isSold']]['totalOrders']+1;
		tl['ordersBySold'][doc['isSold']]['totalPrice'] = tl['ordersBySold'][doc['isSold']]['totalPrice']+doc['price'];



			//aggregation for AVERAGE TABLE
		md['ordersAvgTable'][doc['year']] = md['ordersAvgTable'][doc['year']]||create_templateAvgTableRow('total');
			//increment for total column

		md['ordersAvgTable'][doc['year']]['total']['total']['orders'] = md['ordersAvgTable'][doc['year']]['total']['total']['orders']+1;
		md['ordersAvgTable'][doc['year']]['total']['total']['prices'] = md['ordersAvgTable'][doc['year']]['total']['total']['prices']+doc['price'];
			//increment particular race
		md['ordersAvgTable'][doc['year']][doc['raceLarge']]['total']['orders'] = md['ordersAvgTable'][doc['year']][doc['raceLarge']]['total']['orders']+1;
		md['ordersAvgTable'][doc['year']][doc['raceLarge']]['total']['prices'] = md['ordersAvgTable'][doc['year']][doc['raceLarge']]['total']['prices']+doc['price'];

		
		if (doc['newDate']==cur_date)
			{
			md['ordersAvgTable'][doc['year']]['total']['new']['orders'] = md['ordersAvgTable'][doc['year']]['total']['new']['orders']+1;
			md['ordersAvgTable'][doc['year']]['total']['new']['prices'] = md['ordersAvgTable'][doc['year']]['total']['new']['prices']+doc['price'];

			md['ordersAvgTable'][doc['year']][doc['raceLarge']]['new']['orders'] = md['ordersAvgTable'][doc['year']][doc['raceLarge']]['new']['orders']+1;
			md['ordersAvgTable'][doc['year']][doc['raceLarge']]['new']['prices'] = md['ordersAvgTable'][doc['year']][doc['raceLarge']]['new']['prices']+doc['price'];
			}


			//NEW DATE
		if (doc['newDate']==cur_date)
			{
			md['newOrders'] = md['newOrders']+1;
			mk['newOrders'] = mk['newOrders']+1;
			tl['newOrders'] = tl['newOrders']+1;

			md['newPrice'] = md['newPrice']+doc['price'];
			mk['newPrice'] = mk['newPrice']+doc['price'];
			tl['newPrice'] = tl['newPrice']+doc['price'];


			}

			//DURATION
		var len_buckets = ['1-10','11-20','21-30','31-40','41-50','51-60','61-70','71-80','81-90','90+'];
		var len = doc['dates'].length;
		if (len>90)
			len = '90+';
		else
			len = len_buckets[parseInt((len-1)/10)];
	//	len = len>30?'30+':len.toString();


		md['ordersByDuration'][len] = md['ordersByDuration'][len]==undefined?{'name':len,'totalOrders':0,'totalPrice':0}:md['ordersByDuration'][len];
		md['ordersByDuration'][len]['totalOrders'] = md['ordersByDuration'][len]['totalOrders']+1;
		md['ordersByDuration'][len]['totalPrice'] = md['ordersByDuration'][len]['totalPrice']+doc['price'];

		mk['ordersByDuration'][len] = mk['ordersByDuration'][len]==undefined?{'name':len,'totalOrders':0,'totalPrice':0}:mk['ordersByDuration'][len];
		mk['ordersByDuration'][len]['totalOrders'] = mk['ordersByDuration'][len]['totalOrders']+1;
		mk['ordersByDuration'][len]['totalPrice'] = mk['ordersByDuration'][len]['totalPrice']+doc['price'];

		tl['ordersByDuration'][len] = tl['ordersByDuration'][len]==undefined?{'name':len,'totalOrders':0,'totalPrice':0}:tl['ordersByDuration'][len];
		tl['ordersByDuration'][len]['totalOrders'] = tl['ordersByDuration'][len]['totalOrders']+1;
		tl['ordersByDuration'][len]['totalPrice'] = tl['ordersByDuration'][len]['totalPrice']+doc['price'];


		}


	}
