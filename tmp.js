
var MongoClient = require('mongodb');
var request = reuiqre('request');

/*
MongoClient.connect('mongodb://localhost:27017/autostat',function(err,db)
	{
	var cursor = db.collection('marks').find();
	var t = 0;
	cursor.each(function(err,doc)
		{
		if (doc===null){db.close();console.log(t);return false}
		if (doc['models']===undefined){console.log(doc)}
		try
			{
			t = t+doc['models'].length;
			//console.log(doc['models']);
			}
		catch(err){console.log(doc)};
		})
	});
*/


adverts_all = [15869886,16176744,14566614,10047240,16630505];
cur_date = '2016-10-19';


function updateDate(adverts_all,cur_date,callback)
	{
	console.log(adverts_all,cur_date);
	var url = 'mongodb://localhost:27017/autostat';
	MongoClient.connect(url,function(err,db)
		{
		db.collection('adverts_short').updateMany(
			{
			'advertId':{'$in':adverts_all},
			'dates':{'$ne':cur_date}
			},
			{
			'$push':{'dates':cur_date}
			},function(err,res)
			{
			callback(null,res['result']['nModified']);
			db.close();
			console.log('update date close');
			})

		})

	}

//updateDate(adverts_all,cur_date,function(){console.log('FIN')});

function iterateAdverts(callback)
	{
	MongoClient.connect('mongodb://localhost:27017/autostat',function(err,db)
		{
		var cursor = db.collection('adverts').find({},{'advertId':1});
		cursor.count(function(err,cursor_size)
			{
			var count = 0;
			var inserted = 0;
			var part = parseInt(cursor_size/10);
		/*
			cursor.toArray(function(err,res)
				{
				count = count+1;
				console.log(res[0]['advertId']);
				})
		*/	
			cursor.each(function(err,doc)
				{
				if (doc===null)
					{
				//	callback(count);
				//	db.close();
					return false;
					}
				var adv_id = doc['advertId'];
				db.collection('adverts_short').findOne({'advertId':adv_id},function(err,res)
					{
					count = count+1;
					if (count%part==0){console.log(count)};
					if (count==cursor_size)
						{
						callback(count);
						db.close();
						}					

					})
				})
			
			})
		})
	}


//var st_time = (new Date()).getTime();
/*iterateAdverts(function(count)
	{
	var end_time = (new Date()).getTime();
	var delta = end_time - st_time;
	console.log(delta,count,delta/count)

	})
*/


function test_empty_collection(callback)
	{
	var MongoClient = require('mongodb');
	var db;
	MongoClient.connect('mongodb://localhost:27017/autostat',function(err,db_)
		{
		var w = 0;
		//var cursor = db_.listCollections();
		var cursor = db_.collection('adverts_short').find();
		cursor.each(function(err,res)
			{
			console.log(res);
			w = w+1;			
			if (w==1)
				{
				return false;
				}
	
			if (res!=null&&res['name']=='adverts_short')
				{
				//callback('find');	
				return false;
				}
			
			if (res==null)
				{
				//callback('finish');	
				return false;
				}
			})
		})
	
	}

//test_empty_collection(function(res){console.log('CALLBACK',res)});

function test_async()
	{
	var MongoClient = require('mongodb');
	var db;

	var req = require('request');
	MongoClient.connect('mongodb://localhost:27017/autostat',function(err,db_)
		{
		var r = 0;
		db_.collection('adverts_short').find({'markId':98,'modelId':3552}).each(function(err,res)
			{
			var k = r+1
	//		setTimeout(function(){console.log('RES:'+k)},parseInt(Math.random()*10)*100);	
			
			db_.collection('adverts_short').findOne({'advertId':18294906},function()
				{
				var w = 0
				if (k==5)
					{
					req('http://slowwly.robertomurray.co.uk/delay/1000/url/https://www.google.co.uk',function()
					{
					console.log('RES:'+k);
					})
					}
				console.log('RES:'+k);
				})
			r = r+1;
//			console.log(res);
			if (res===null)
				{
				console.log('Finished');
				return false;
				}
			});
		})

	
	}


//test_async();

function find_one()
	{
	var MongoClient = require('mongodb');
	var db = MongoClient.connect('mongodb://localhost:27017/autostat',function(err,db)
		{
		db.collection('adverts_short').findOne({})

		})

	}





check_svod();
function check_svod()
	{
	MongoClient.connect('mongodb://localhost:27017/autostat',function(err,db)
		{
		cursor = db.collection('adverts_short').find();
		var stop = false;
		cursor.each(function(err,doc)
			{
			if (doc!=null)
				{
				var cur = db.collection('adverts').find({'advertId':doc['advertId']});
				cur.each(function(err,res)
					{
					if (stop){return false;}
					if (res==null)
						{
						console.log(doc['advertId']);
						stop = true;
						console.log('false');
						return false;
						}

					})
				}
			})
		})
	}



