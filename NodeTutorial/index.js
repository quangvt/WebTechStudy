//1
var http = require('http'),
    express = require('express'),
    path = require('path'),
    MongoClient = require('mongodb').MongoClient,
    assert = require('assert'),
    Server = require('mongodb').Server,
    CollectionDriver = require('./collectionDriver').CollectionDriver,
    bodyParser = require('body-parser');

var app = express();
app.set('port', process.env.PORT || 3000);
// tell Express to use the middleware express.static which serves up static files in response to incoming request
// apply Jade
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
// for save
//app.use(express.bodyParser());
// parse various different custom JSON types as JSON
app.use(bodyParser.json({ type: 'application/json' }))

// mongo db
var mongoHost = 'localHost'; //A
var mongoPort = 27017; 
var collectionDriver;

//var mongoClient = new MongoClient(new Server(mongoHost, mongoPort)); //B
var urlMongodb = 'mongodb://localhost:27017/myDatabase';
MongoClient.connect(urlMongodb, function(err, db) { //C
    assert.equal(null, err);
    console.log("Server is connected.");
    
//  if (!mongoClient) {
//      console.error("Error! Exiting... Must start MongoDB first");
//      process.exit(1); //D
//  }
    
  //var db = mongoClient.db("test");  //E
  //collectionDriver = new CollectionDriver(db); //F
    collectionDriver = new CollectionDriver(db);
    //db.close();
    
});



app.use(express.static(path.join(__dirname, 'public')));

/*
app.get('/', function (req, res) {
  res.send('<html><body><h1>Hello Ba</h1></body></html>');
});

app.get('/:a?/:b?/:c?', function (req, res) {
  res.send(req.params.a + ' ' + req.params.b + ' ' + req.params.c);
});
*/

app.get('/:collection', function(req, res) { //A
   var params = req.params; //B
   collectionDriver.findAll(req.params.collection, function(error, objs) { //C
    	  if (error) { res.send(400, error); } //D
	      else { 
	          if (req.accepts('html')) { //E
    	          res.render('data',{objects: objs, collection: req.params.collection}); //F
              } else {
	          res.set('Content-Type','application/json'); //G
                  res.send(200, objs); //H
              }
         }
   	});
});
 
app.get('/:collection/:entity', function(req, res) { //I
   var params = req.params;
   var entity = params.entity;
   var collection = params.collection;
   if (entity) {
       collectionDriver.get(collection, entity, function(error, objs) { //J
          if (error) { res.send(400, error); }
          else { res.send(200, objs); } //K
       });
   } else {
      res.send(400, {error: 'bad url', url: req.url});
   }
});

app.post('/:collection', function(req, res) { //A
    var object = req.body;
    var collection = req.params.collection;
    collectionDriver.save(collection, object, function(err,docs) {
          if (err) { res.send(400, err); } 
          else { res.send(201, docs); } //B
     });
});

app.put('/:collection/:entity', function(req, res) { //A
    var params = req.params;
    var entity = params.entity;
    var collection = params.collection;
    if (entity) {
       collectionDriver.update(collection, req.body, entity, function(error, objs) { //B
          if (error) { res.send(400, error); }
          else { res.send(200, objs); } //C
       });
   } else {
       var error = { "message" : "Cannot PUT a whole collection" };
       res.send(400, error);
   }
});

app.delete('/:collection/:entity', function(req, res) { //A
    var params = req.params;
    var entity = params.entity;
    var collection = params.collection;
    if (entity) {
       collectionDriver.delete(collection, entity, function(error, objs) { //B
          if (error) { res.send(400, error); }
          else { res.send(200, objs); } //C 200 b/c includes the original doc
       });
   } else {
       var error = { "message" : "Cannot DELETE a whole collection" };
       res.send(400, error);
   }
});

// catch all
// app.use(callback): match all requests => catch-all
// res.render(view, params) rended from templating engine
//   jade template engine (a simple language)
app.use(function (req, res) {
  res.render('404', {url:req.url});
});

//2
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

