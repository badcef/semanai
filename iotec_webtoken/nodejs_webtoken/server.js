// get the packages we need

var express = require('express');
var cors = require('cors');

var app = express();

app.use(cors());

var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');

var jwt = require('jsonwebtoken');
var config = require('./config');


var User = require('./app/models/user');
var Device = require('./app/models/device');

// configuration

var port = process.env.PORT || 8087;
mongoose.connect(config.database);
app.set('superSecret', config.secret);

// use body parser so we can get info from POST
// and/or URL parameters
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

//
// routes
//

app.get('/', function (req, res) {
	res.send('Hello! the API is at http://localhost:' + port + '/api');
});

// add demo user

app.get('/setup', function (req, res) {
	// create a sample user
	var nick = new User({
		name : 'admin',
		password: 'polito',
		admin: true
	});

	// save the sample user

	nick.save(function(err) {
		if (err) throw err;

		console.log('User saved suscessfully');
		res.json({success: true});	
	});
});

// api routes

// get an instance of the router for api routes
var apiRoutes = express.Router();

// route to authenticate a user

apiRoutes.post('/authenticate', function (req, res) {
 
 	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
    //res.setHeader('Access-Control-Allow-Credentials', true); // If needed

	//find the user
	User.findOne({name: req.body.name}, function (err, user) 
	{
		if (err) throw err;
	
		if (!user) {
			res.json({success: false, message: 
				'Authentication failed, User not found'});
		}
		else if (user) {
			// check if password matches
			if (user.password != req.body.password) {
				res.json({success : false, message : 
					'Authentication failed, wrong password'});
			}
			else {
				// user and password is right
				var token = jwt.sign(user, app.get('superSecret'), {
					expiresIn: 20 * 60
				});

				// return the information including token as JSON

				res.json({
					success : true,
					message : 'Enjoy your token !',
					token : token
				});
				
			}
		}

		
	});
});

// route to middleware to verify a token

apiRoutes.use(function (req, res, next) {
	// check header or url parameters or post parameters for token
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
    //res.setHeader('Access-Control-Allow-Credentials', true); // If needed


	var token = req.body.token ||
	 			req.query.token ||
	 			req.headers['x-access-token'];
	// decode token
	if (token)	{
		// verifies secret and checks up
		jwt.verify(token, app.get('superSecret'), function (err, decoded) {
			if (err) {
				return res.json({success: false, message : 'Failed to authenticate token' });

			} else {
				// is everything is good, save to request for use in other routes
				req.decoded = decoded;
				next();
			}
		});
	}else {
		// if there is not token, return an error

		return res.status(403).send( {
			success: false,
			message: 'No token provided'
		});
	}
});


// route to show a random message

apiRoutes.get('/', function (req, res) {
	res.json({message: 'welcome to the coolest API on the heart'});
});

// route to return all users

apiRoutes.get('/users', function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
   	
	User.find({}, function(err, users) {
		res.json(users);
	});
});



// route to return all devices

apiRoutes.get('/devices', function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
   	
	Device.find({}, function(err, devices) {
		res.json(devices);
	});
});

apiRoutes.get('/devices/:device_id', function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
   	
	// body...
 	Device.findById(req.params.device_id, function(err, device)
 	{
 		if (err)
 			res.send(err);
 		res.json(device);

 	});
  
});

 // create a new device accessed at POST
  // http://localhost:8082/api/devices
apiRoutes.post('/devices', function (req, res) {
 	var device = new Device();
 	device.name = req.body.name;
 	// save the bear and check for errors
 	device.save(function (err) {
 		// body...
 		if (err)
 			res.send(err);
 		res.json({ message: 'Device created !'});
 	});

 	// body...
 });


 // create a new device accessed at POST
  // http://localhost:8082/api/devices
apiRoutes.put('/devices/:device_id', function (req, res) {
 	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
   	

 	var device = new Device();
 	
 	
 	Device.findById(req.params.device_id, function(err, device) {
 		if (err)
 			res.send(err);

 		// update the devices info
 		device.name = req.body.name;

 		// save the bear

 		device.save(function (err) {
 			if (err)
 				res.send(err);
 			res.json({message: 'Device updated !'});
 		});
 	});
 	// body...
 });

// delete the device with this id 
 // accessed at DELETE
 // http://localhost:8081/api/devices/:device_id
apiRoutes.delete('/devices/:device_id', function (req, res) {

   res.setHeader('Access-Control-Allow-Origin', '*');
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
   	
   Device.remove({
   	_id : req.params.device_id
   }, function (err, device) {
   	if (err)
   		res.send(err);
   	res.json({message: 'Device deleted !'});
   });

 });


 
 

//var cors = require('cors');

// use it before all route definitions
//app.use(cors({origin: 'http://localhost:8083'}));
// apply the routes to our application with the prefix /api
app.use('/api', apiRoutes);
app.disable('etag');


// start the server
app.listen(port);
console.log('Magic happens with web-token, on port : ' + port);
