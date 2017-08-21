var async = require('async');
var express = require('express');
var fs = require('fs');
var path = require('path');
//var $ = require('jQuery');
var app = express();
var mongo = require('mongodb').MongoClient;
var request = require('request');
var bodyParser = require('body-parser'); //for parsing body and retrieve post data


app.locals.CONFIG = JSON.parse(fs.readFileSync('./config','utf-8'));
app.locals.SCRIPT_DIR = __dirname;
app.locals.CONFIG['timeout'] = 500; //timeoute for requests when get advertsid by markid and modelid
app.locals.LOG = true;
app.locals.LOG_DIRTY = false;

//t
var db = '';

var options = {};
options.server = { socketOptions: { keepAlive: 1, connectTimeoutMS: 5000000 } };
//options.replset = { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }

//var MongoClient = mongo.connect('mongodb://127.0.0.1:27017/autostat',{server: {socketOptions: {connectTimeoutMS: 500000}}},function(err,db_)
var MongoClient = mongo.connect('mongodb://'+app.locals.CONFIG['DBHOST']+':27017/autostat',options,function(err,db_) 
        {
        db_.admin().authenticate(app.locals.CONFIG['ADMIN']['NAME'],app.locals.CONFIG['ADMIN']['PASSWORD'],function()
            {
            if (err!=null){console.log('Error connect to DB',err);return false}
            console.log('Connected to MongoDB successfully!');
            db = db_;                
            })
        //if (err!=null){console.log('Error connect to DB',err);return false}
        //console.log('Connected to MongoDB successfully!');
        //db = db_;
        });

//prototype Object with methods to make validation values for DB queries
require('./server/ObjectPrototype.js')();



//prototype log with function name and timestamp
var t = console.log;
console.log = function()
    {
    Error.captureStackTrace(this)
    var st = this.stack.split('\n');
    var ar = arguments; //make closure on arguments object for map iteration
    var l = Object.keys(ar).map(function(el){return ar[el]});
    l.unshift('INFO ('+st[2].replace(app.locals.SCRIPT_DIR,'')+'):');
    t.apply(this,l);
    }
//this is spcial method for logging deep (dirty) info
console.logD = function()
    {
    if (app.locals.LOG_DIRTY)
        {
        var ar = arguments; //make closure on arguments object
        var l = Object.keys(ar).map(function(el){return ar[el]});
        l.unshift('DIRTY: ');
        t.apply(this,l);
        }

    }
 

var TestCntr = function(req,resp,next){return require('./server/TestCntr.js')(async,fs,app);};
var MongoService = function(){return require('./server/MongoService.js')(async,fs,app,db);}
var RequestsService = function(){return require('./server/RequestsService.js')(async,app,request)};
var RobotCntr = function(){return require('./server/RobotCntr.js')(async,app,MongoService(),RequestsService(),ReportsCntr())};
var Api = function(){return require('./server/Api.js')(async,app,MongoService(),RobotCntr(),db)};
var ReportsCntr = function(){return require('./server/ReportsCntr.js')(async,app,MongoService(),db)};



//STATIC FILES
app.use('/views', express.static(__dirname+'/app/views'));
app.use('/dist', express.static(__dirname+'/app/dist'));
app.use('/fonts',express.static(__dirname+'/app/fonts'));
app.use('/images',express.static(__dirname+'/app/images'));
app.use('/non_bower',express.static(__dirname+'/app/non_bower_libs'));
app.use('/images',express.static(__dirname+'/app/images'));
app.use('/version',express.static(__dirname+'/VERSION'));
app.use('/dictionary',express.static(__dirname+'/app/dictionary'));
//app.use('/',express.static(__dirname+'/'));


app.use(bodyParser.json());

app.get('/',function(req,resp,next)
        {
        //for static content for google crawler
        if (req.query['_escaped_fragment_'])
            {
            try
                {
                fs.readFile('./prefetched/'+req.query['_escaped_fragment_'].replace(/\//g,'_'),
                    'utf-8',
                    function(err,res)
                        {
                        try
                            {
                            if (err) throw err;
                            resp.send(res);
                            }
                        catch(err){next(err);}
                        return false;
                        })
                }
                catch(err){next(err)}
            return false;
            }

        //for loading website
        fs.readFile('./index.html','utf-8',function(err,res)
            {
            if (err){resp.send('Cannot find index.html');return false;};
            resp.send(res);
            })
        });




//ROBOT SECTION
app.locals.ROBOT_IS_START = false; //flag to prevent starting robot twice
app.get('/robot',function(req,resp,next)
        {   
        if (app.locals.ROBOT_IS_START)
            {
            resp.send('Robot is working!');
            return false;
            }

        app.locals.ROBOT_IS_START = true;
        resp.send('Robot has been started yet!');
        RobotCntr().stack(function(err,res)
            {
            app.locals.ROBOT_IS_START = false; //finish robot working
            //if (err!=null){resp.send(err);return false};
            })

        })



app.get('/language',function(req,resp)
    {
    var lang = req.headers['accept-language'].toLowerCase();
    if (lang&&lang.indexOf('ru')==0)
        lang = 'window.language="RU"';
    else
        lang = 'window.language="EN"';
    resp.send(lang);
    })


//APIP SECTION
//returns ARRAY with OBJECTS ABOUT ALL MARKS FOR SELECT FIELDS
app.get('/api/marks/:dt?',function(req,resp,next)
        {
        //resp.send('OK');
        //:dt? - is optional param
        //depends on it - marks for specified date or last date will be gathered
        Api().getMarks(req.params['dt'],function(err,res){resp.send(res)});
        })



app.post('/api/generalstatistic',function(req,resp)
    {
    Api().getGeneralStatistic(req,function(err,res)
        {
        resp.send(res);
        })

    });

app.post('/api/topcarsstatistic',function(req,resp)
    {
    Api().topCarsStatistic(req,function(err,res)
        {
        resp.send(res);
        })

    })


app.get('/api/getactualdate',function(req,resp)
    {
    Api().getActualDate(function(err,dt)
        {
        resp.send(dt);
        })
    })


    
app.post('/api/aggregations/',function(req,resp)
    {
    Api().getAggregations(req.body,function(err,res)
        {
        resp.send(res);
        })

    })


app.post('/api/adverts/get/',function(req,resp)
    {
    Api().getAdverts(req.body,function(err,res)
        {
        resp.send(res);
        });
    })


app.post('/api/reports/avgTable',function(req,resp)
    {
    Api().getAvgTable(req.body,function(err,res)
        {
        resp.send(res);
        })

    })


app.post('/api/reports/avgchart',function(req,resp)
    {

    Api().getAvgChart(req.body,function(err,res)
        {
        resp.send(res);
        })

    })


app.post('/api/reports/bycities',function(req,resp)
    {

    Api().getReportByCities(req.body,function(err,res)
        {
        resp.send(res);
        })
    })


app.get('/test_dev',function(req,resp)
    {
        console.log('ONE TIME')
    RobotCntr().get_coordinates('Львов',answer);

    function answer(err,res)
        {
        resp.send(res);   
        }

    })




app.get('/test',function(req,resp)
    {
    resp.send(RobotCntr().get_coordinates());
    })



app.listen(app.locals.CONFIG.PORT,app.locals.CONFIG.HOST,function()
    {
    console.log('App is started','second variable');
    })

