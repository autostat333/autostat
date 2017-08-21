var mongo = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;

var db = '';


mongo.connect('mongodb://localhost:27017/autostat',function(err,db_)
	{
	db = db_;
	setTimeout(start3,0);
	})




var dates = [
	'2017-07-24',
	'2017-07-25',
	'2017-07-26',
	'2017-07-27',
	'2017-07-28',
	'2017-07-29',
	'2017-07-30',
	'2017-07-31',
	'2017-08-01',
	'2017-08-02',
	'2017-08-03',
	'2017-08-04',
	'2017-08-05',
	'2017-08-06',
	'2017-08-07',
	'2017-08-08',
	'2017-08-09',
	'2017-08-10',
	'2017-08-11',
	'2017-08-12',
	'2017-08-13',
	'2017-08-14',
	'2017-08-15',
	'2017-08-16',
	'2017-08-17',
	'2017-08-18'
	]

function start()
	{
	var cursor = db.collection('adverts_short').find({'$and':
		[
		{'dates':'2017-07-23'},
		{'dates':{'$ne':'2017-08-19'}},
		{'dates':{'$ne':'2017-07-24'}}
		]}).limit(2880);
	cursor.count(function(err,count)
		{
		if (err) console.log(err);
		console.log(count);
		var fin_count = 0;
		cursor.each(function(err,doc)
			{
			if (err) console.log(err);
			if (!doc) return false;
			db.collection('adverts_short').update({'_id':doc['_id']},{'$push':{'dates':{'$each':dates}}},function(err,res)
				{
				fin_count = fin_count+1;
				if (fin_count==count)
					{
					dates.pop();
					if (dates.length)
						setTimeout(start,0);
					console.log('Finished', dates);
					}
				})
			})

		})


	}




function start2()
	{
	var cursor = db.collection('adverts_short').find({'dates':'2017-07-24','newDate':{'$lt':'2017-07-24'}})
	cursor.count(function(err,count)
		{
		if (err) console.log(err);
		var fin_count = 0;

		var one_doc = false;

		cursor.each(function(err,doc)
			{
			if (one_doc) return false;

		//	one_doc = true;
			if (err) console.log(err);
			if (!doc) return false;


			var newDates = doc['dates'];
			newDates.sort();




			if ((f=newDates.indexOf('2017-07-24'))!=-1)
				newDates.splice(f);
			
		
			db.collection('adverts_short').update({'_id':doc['_id']},{'$set':{'dates':newDates}},function(err,res)
				{
	
				fin_count = fin_count+1;
				if (fin_count==count)
					{
					console.log('Finished',fin_count);
					}
				});
		
			})

		})


	}




function start3()
	{
	var newDate = dates.shift();
	if (!dates.length)
		{
		console.log('finished');
		return false;
		}

	var newDates = [];
	newDates.push(newDate);
	newDates = newDates.concat(dates);
	newDates.push('2017-08-19');

	db.collection('adverts_short').update(
		{'newDate':newDate},
//		{'$push':{'dates':{'$each':dates}}},
		{'$set':{'dates':newDates}},
		{'multi':true},
		function()
			{
			setTimeout(start3,0);
			console.log(dates);
			});

	}




