var mongo = require('mongodb').MongoClient;


mongo.connect('mongodb://localhost:27017/autostat',function(err,db_){
	if (err)
		{
		console.log(err);
		return false;
		}
		db = db_;
		start();
		})


var db = '';
var coordinates = {};


function start()
	{
	cursor = db.collection('coordinates').find({});

	var t = 0;
	cursor.count(function(err,sizeCoordinates)
		{
		if (err) throw err;
		cursor.each(function(err,doc)
			{
			if (err) throw err;
			if (doc)
				{
				coordinates[doc['city']] = doc;
				t++;
				}
			if (!doc)
				startUpdate();
			})
	 	})
	}



function startUpdate()
	{
	var cursor = db.collection('adverts_short').find();

	var count = 0;
	var forUpdate = 0;
	var updated = 0;
	cursor.count(function(err,size)
		{
		cursor.each(function(err,doc)
			{
			count++;
			if (count%10000==0) console.log(count,forUpdate,updated);
			if (doc!=null&&!doc['cityCoordinates'])
				{
				forUpdate++;
				if (coordinates[doc['city']])
					{
					updated++;
					db.collection('adverts_short').updateOne({'_id':doc['_id']},{'$set':{'cityCoordinates':coordinates[doc['city']]}},function(err,res)
						{
						if (err) console.log(err);
						});
				

					}


				}
			})		

		})

	console.log('Update');
	console.log(coordinates['Киев']);

	}
