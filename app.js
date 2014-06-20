var	// http://expressjs.com/guide.html
	express = require('express'),
	// http://nodejs.org/api/child_process.html
	child_process = require('child_process'),
	app = express();

app.use('/font', express.static(__dirname + '/bower_components/fontawesome'));

app.get('/', function(req, res) {
	res.sendfile('static/index3.html');
});
app.get('/slot.png', function(req, res) {
	res.sendfile('static/slot-opaque.png');
});
app.get('/AG-Stencil.ttf', function(req, res) {
	res.sendfile('static/AG-Stencil.ttf');
});
app.get('/idle-music.ogg', function(req, res) {
	res.sendfile('static/idle-music3.ogg');
});
app.get('/jquery.js', function(req, res) {
	res.sendfile('bower_components/jquery/index.js');
});
app.get('/three.js', function(req, res) {
	res.sendfile('bower_components/threejs/index.js');
});
app.get('/tween.js', function(req, res) {
	res.sendfile('bower_components/tweenjs/index.js');
});
app.get('/rsvp.js', function(req, res) {
	res.sendfile('bower_components/rsvp/rsvp.min.js');
});
app.get('/eventable.js', function(req, res) {
	res.sendfile('static/eventable.js');
});
app.get('/machine.js', function(req, res) {
	res.sendfile('static/machine.js');
});

app.post('/toggle-tray', function(req, res) {
	// child_process.spawn(command, [args], [options])
	console.log('asked for toggle tray');
	var child = child_process.spawn('eject', ['-T']);
	res.json({response: true});
});

app.post('/open-tray', function(req, res) {
	console.log('asked for opening tray');
	var child = child_process.spawn('eject');
	res.json({response: true});
});

app.post('/open-tray', function(req, res) {
	console.log('asked for closing tray');
	var child = child_process.spawn('eject' ['-c'] /*TODO: il parametro era -c? */);
	res.json({response: true});
});

var server = app.listen(8080);
