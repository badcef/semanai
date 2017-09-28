// server.js

// base setup

var mongoose = require('mongoose')
mongoose.connect('mongodb://35.185.213.109:27017/iotec-adsoft')
var Device = require('./app/models/device');

// call the packages


var express = require('express')
var cors = require('cors')

var app = express();

app.use(cors())

var bodyParser = require('body-parser');

// config app to use bodyParser()

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

var port = process.env.PORT || 8086; 

// routes for our api

var router = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
	// do logging
	console.log('something is happen..');
  

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
  
  res.header('Access-Control-Allow-Headers', 'Content-Type');


	next();  // make sure we go to the next routes
});


// test route

router.get('/', function(req, res) {
 res.json({ message: 'yahoo!! welcome to our api !' });
});

// more routes for our API will happen here
router.route('/devices')
 
  // create a bear accessed at POST
  // http://localhost:8081/api/devices
 .post(function (req, res) {
 	var device = new Device();
 	device.name = req.body.name;
 	// save the bear and check for errors
 	device.save(function (err) {
 		// body...
 		if (err)
 			res.send(err);
 		res.json({ message: 'device created !'});
 	});

 	// body...
 })
  
 // get all the devices (accessed at 
 // http://localhost:8081/api/devices)
 .get(function (req, res) {

 	// body...
 	Device.find(function(err, devices) 
 	{
 		if (err)
 			res.send(err);
 		res.json(devices);
 	});
 });

// on routes that end in /devices/:device_id
router.route('/devices/:device_id')
 // get the device with that id 
 // accessed at GET 
 // http://localhost:8081/api/devices/:device_id

 .get(function(req, res) {
 	// body...
 	Device.findById(req.params.device_id, function(err, device)
 	{
 		if (err)
 			res.send(err);
 		res.json(device);

 	});
  })

 // update the bear with this id
 // accessed at PUT
 // http://localhost:8081/api/bears/:bear_id

 .put(function (req, res) {
 	// use our device model to find the device we want
 	Device.findById(req.params.device_id, function(err, device) {
 		if (err)
 			res.send(err);

 		// update the bears info
 		device.name = req.body.name;

 		// save the bear

 		device.save(function (err) {
 			if (err)
 				res.send(err);
 			res.json({message: 'Device updated !'});
 		});
 	});
  })

 // delete the device with this id 
 // accessed at DELETE
 // http://localhost:8081/api/devices/:device_id
 .delete(function (req, res) {
   Device.remove({
   	_id : req.params.device_id
   }, function (err, device) {
   	if (err)
   		res.send(err);
   	res.json({message: 'Device deleted !'});
   });

 });

 

// register our routes
app.use('/api', router);
//app.use(require('cors')());

// start the server

app.listen(port);
console.log('Magic happens on port: ' + port);
