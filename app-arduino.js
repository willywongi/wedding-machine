	// https://github.com/ecto/duino
var Duino,
	/* Lo schema per fare andare il motorino:
		http://www.dummies.com/how-to/content/how-to-spin-a-dc-motor-with-the-arduino.html
	*/
	board,
	// http://expressjs.com/guide.html
	MOTOR_PIN = 9;

try {
	duino = require('duino');
	board = new Duino.Board({'device': 'ttyACM'})
} catch(e) {
	console.log('Cannot connect to the Arduino board');
	board = {
		digitalWrite: function() {
			console.log('No-op: no Arduino board found during init');
		}
	}
}

var motor = {
	// 
	board: board,
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

exports.motor = motor;
