	// https://github.com/ecto/duino
var Duino = require('duino'),
	// http://expressjs.com/guide.html
	express = require('express'),
	// http://nodejs.org/api/child_process.html
	child_process = require('child_process'),
	/* Lo schema per fare andare il motorino:
		http://www.dummies.com/how-to/content/how-to-spin-a-dc-motor-with-the-arduino.html
	*/
	board = new Duino.Board({'device': 'ttyACM'}),
	app = express(),
	MOTOR_PIN = 9;
	
var motor = {
	// 
	status: false,
	on: function() {
		board.digitalWrite(MOTOR_PIN, board.HIGH);
	},
	off: function() {
		board.digitalWrite(MOTOR_PIN, board.LOW);
	},
	toggle: function() {
		motor[(motor.status) ? 'off': 'on']();
		motor.status = !motor.status;
	},
	pulse: function() {
		motor.on();
		setTimeout(function() { motor.off(); }, 500);
	}
}


app.get('/', function(req, res) {
	res.sendfile('static/index.html');
});
app.get('/3d', function(req, res) {
	res.sendfile('static/index3.html');
});
app.get('/jquery.js', function(req, res) {
	res.sendfile('static/jquery-2.1.1.min.js');
});
app.get('/slot.png', function(req, res) {
	res.sendfile('static/slot.png');
});
app.get('/three.js', function(req, res) {
	res.sendfile('static/three.min.js');
});


app.post('/toggle-motor', function(req, res) {
	motor.toggle();
	res.json({response: true});
});

app.post('/pulse-motor', function(req, res) {
	motor.pulse();
	res.json({response: true});
});

app.post('/toggle-tray', function(req, res) {
	// child_process.spawn(command, [args], [options])
	console.log('asked for toggle tray');
	var child = child_process.spawn('eject', ['-T']);
});

var server = app.listen(8080);