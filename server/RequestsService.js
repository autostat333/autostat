module.exports = function RequestsService(async,app,request)
	{


	var $scope = {};
	$scope.getMarks = getMarks;
	$scope.getModels = getModels;
	$scope.getAdvertsId = getAdvertsId;
	$scope.getAdvert = getAdvert;
	$scope.getCoordinates = getCoordinates;

	return $scope;


	function getMarks(callback)
		{
		var url = 'http://api.auto.ria.com/categories/1/marks';
		request(url,function(err,res,body)
			{
			if (err!=null||res.statusCode!=200)
				{
				console.log('Error send request to autoria.marks',url,err);
				callback(null,[]);
				return false;
				}
			try
				{
				res = JSON.parse(res.body);
				}
			catch(err)
				{
				console.log('Error parsing marks:',url);
				callback(null,[]);
				return false;
				}
			callback(null,res);
			})
		}

	function getModels(mark_id,callback)
		{
		//below vars for control timeout
		var req_running = true;
		var url = 'http://api.auto.ria.com/categories/1/marks/'+mark_id+'/models';
		var r_id = request(url,function(err,res,body)
			{
			req_running = false;
			clearTimeout(timer_id);
			if (err!=null||res.statusCode!=200)
				{
				callback(null,[]);
				console.log('Error obtain models from auto.ria ',url,err);
				return false;
				}
			try
				{
				var res = JSON.parse(res.body);
				}
			catch(err)
				{
				callback(null,[]);
				console.log('Error parsing',url);
				return false
				}
			callback(null,res);
			});

		var timer_id = setTimeout(function()
			{
			if (req_running)
				{
				req_running=false;
				r_id.abort();
				console.log('GET MODELS from AUTORIA: Aborted request: ',url);
				$scope.getModels(mark_id,callback);
				}
			},1000)

		}


	function getAdvertsId(mark_id,model_id,callback)
		{
		var empty_obj = {};
		empty_obj['classifieds'] = [];
		var url = 'http://api.auto.ria.com/average?marka_id='+mark_id+'&model_id='+model_id;
		var request_runnig = true;
		var r_id = request(url,function(err,res,body)
			{
			//cancel timeout
			clearTimeout(t_id);
			if (err!=null||res.statusCode!==200)
				{
				console.log('Error send request for advert',url,err);
				callback(null,empty_obj);
				return false;
				}
			try
				{
				var res = JSON.parse(body);
				if (res['status']!=undefined&&res['status']==404) throw "Not found auto";
				}
			catch(err)
				{
				callback(null,empty_obj);
				return false;
				}

			callback(null,res);
		
			})

		//set timeout to check whether request is under obtaining
		var st_time = (new Date()).getTime();
		var t_id = setTimeout(function()
				{
				if (request_runnig)
					{
					r_id.abort();
					callback('timeouted');
					request_runnig = false;
					}
				},app.locals.CONFIG.timeout);

		}


	function getAdvert(advert_id,callback)
		{
		var id_1 = (advert_id/10000).toFixed(0);
		var id_2 = (advert_id/100).toFixed(0);
		var id_3 = advert_id;

		var url = 'https://c-ua1.riastatic.com/demo/bu/searchPage/v2/view/auto/'+id_1+'/'+id_2+'/'+id_3+'?lang_id=2';
		request(url,function(err,res,body)
			{
			if (err!=null||res.statusCode!=200)
				{
				console.log('Error obtain advert!',url,err);
				callback(null,'Error');
				return false;
				}
			try
				{
				var res = JSON.parse(body)
				if (res['status']!=undefined&&res['status']==404) throw "Not found auto";
				}
			catch(err)
				{
				console.log('Error parsing results from advert!',body);
				var res = 'Error';
				callback(null,res);
				return false;
				}
			callback(null,res);
			})


		}




	function getCoordinates(name,callback)
		{
		if (!name){callback('Error');return false;};
		var url = 'https://maps.googleapis.com/maps/api/geocode/json?address='+name.toLowerCase()+'&region=UA';
		//timeout is nec because google cannot serve a lot of reqs
		console.log('SEND',url);
		request(url,function(err,res)
			{
			if (err)
				{
				console.log('Error obtain coordinates:',url);
				callback(err);
				return false;
				}
			
			try
				{
				var obj = JSON.parse(res.body)['results'][0]['geometry']['location'];
				callback(null,obj);
				}
			catch(err){console.log('ERROR:',url,err,res.body);callback(err);}
			});


		}




	}
