var ip = '192.168.0.102';
var port = '8080';
var PDport = '3558'

var express = require('express')
var app = express()
var x = 0;
var dt = new Date();
dt.setHours(dt.getHours() + 2);


// Gustavs Pd-fetch
const fetch = require("node-fetch");

// Set up the server
var server = app.listen(process.env.PORT || port, listen);

// This call back just tells us that the server has started
function listen() {
	var host = server.address().address;
	var port = server.address().port;
	console.log('Example app listening at http://' + host + ':' + port);
}

app.use(express.static(__dirname + '/public'));

console.log("Server up and running!");

var socket = require('socket.io');
var io = socket(server, {
	handlePreflightRequest: (req, res) => {
		const headers = {
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
			"Access-Control-Allow-Origin": req.headers.origin, //or the specific origin you want to give access to,
			"Access-Control-Allow-Credentials": true
		};
		res.writeHead(200, headers);
		res.end();
	}
});


// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection', newConnection);

// When this user emits, client side: socket.emit('otherevent',some data);
function sliderData(data) {
	//socket.broadcast.emit('mouse', data);
	console.log(data);
	console.log(dt);

	x = data.x;

	try {
		//fetch("http://192.168.1.219:3558", {
		fetch("http://" + ip + ":" + PDport, {
			method: "PUT",
			body: ";slider1 " + x + ";"
		})
		// .then(res =>
		// 	onResponse('PD-SLIDER', res)
		// ).catch(err => onError('PD-SLIDER', err))


	} catch (err) {
		console.error(err)
	}

}

function smhi(data) {
	console.log('Function smhi has been called, plus we have axios');
	pcat = data.pcat;

	try {
		fetch("http://" + ip + ":" + 3558, {
			method: "PUT",
			body: ";pcat " + pcat + ";"
		})
		//.then(res =>
		// 	onResponse('PD-PUT-PCAT', res)
		// ).catch(err => console.error(err))

	} catch (err) {
		console.error(err)
	}
}

function sunData(data) {
	hoursRise = data.hoursRise;
	minutesRise = data.minutesRise;
	hoursSet = data.hoursSet;
	minutesSet = data.minutesSet;

	try {
		fetch("http://" + ip + ":" + PDport, {
			method: "PUT",
			body: ";hoursRise " + hoursRise + "; minutesRise " + minutesRise + "; hoursSet " + hoursSet + "; minutesSet " + minutesSet + ";"
		})
		// .then(res =>
		// 	onResponse('PD-SUN-DATA', res)
		// ).catch(err => console.error(err))
	} catch (err) {
		console.error(err)
	}
}

function mute(data) {
	console.log('return checkbox data: ' + data);
	console.log(dt);

	try {
		fetch("http://" + ip + ":" + PDport, {
			method: "PUT",
			//body: ";toggle " + 'symbol ' + data + ";"
			body: ";toggle " + data + ";"
		})
		// .then(res =>
		// 	onResponse('PD-PUT-TOGGLE', res)
		// ).catch(err => console.error(err))

	} catch (err) {
		console.error(err)
	}
}


// We are given a websocket object in our function
function newConnection(socket) {
	console.log('We have a new client: ' + socket.id);
	try {
		socket.on('Slider', sliderData);
		socket.on('smhiToPd', smhi);
		socket.on('sunToPd', sunData);
		socket.on('checkboxToggle', mute);
	} catch (err) {
		console.error(err)
	}
}

const OSC = require('osc-js')

const config = {
	udpClient: {
		port: 9129
	}
}
const osc = new OSC({
	plugin: new OSC.BridgePlugin(config)
})

osc.open() // start a WebSocket server on port 8080