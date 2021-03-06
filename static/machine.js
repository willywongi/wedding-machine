// Constants
var SLOTS = [],
	SYMBOLS = ["bar", "cocomera", "campana", "ciliegie", "win", "limone", "mela", "sette"],
	// The cylinder will have n faces where n = SYMBOLS.length * FACE_MULTIPLIER.
	FACE_MULTIPLIER = 3,
	DEG360 = Math.PI * 2,
	ROTATION_DURATION = 6000,
	width = 640,
	height = 480,
	/*
	 Scene setup
	*/
	scene = new THREE.Scene(),
	//camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000 ),
	camera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, 1, 1000),
	light = new THREE.DirectionalLight(0xffffff),
	renderer = new THREE.WebGLRenderer();
light.position.set(0, 0, 1).normalize();
scene.add(light);
camera.position.z = 400;
 
renderer.setSize(width, height);
renderer.domElement.id = "slotmachine";
document.body.appendChild(renderer.domElement);

/* Material */
var material = new THREE.MeshPhongMaterial({
		map: THREE.ImageUtils.loadTexture('slot.png')
	}),	
	UVMap = [];

$.each(SYMBOLS, function(index, simbolo) {
	var m = SYMBOLS.length * FACE_MULTIPLIER,
		h1, h2, k, i;
	// split each symbol on $FACE_MULTIPLIER faces.
	for (i = 0; i < FACE_MULTIPLIER; i++) {
		k = (index * FACE_MULTIPLIER) + i;
		h1 = 1 / m * k;
		h2 = 1 / m * (k + 1);
		UVMap.push([new THREE.Vector2(0, h1), new THREE.Vector2(1, h1),
					 new THREE.Vector2(1, h2), new THREE.Vector2(0, h2)]);
	}
});

/* Single logic slot. */
var Slot = function(cylinder) {
	this.baseRotation = DEG360 / (SYMBOLS.length * 2);  // The slight rotation that allow the symbol to be centered.
	this.cylinder = cylinder;
	this.cylinder.rotation.x = this.baseRotation;
	this._moving = false;
}

Eventable.mixin(Slot);

Slot.symbols = {
	bar: 0,  // DEG360 / 8 (faces) * 0 (index)
	cocomera: 0.7853981633974483,  // DEG360 / 8 (faces) * 1 (index)
	campana: 1.5707963267948966,  // ...
	ciliegie: 2.356194490192345,
	win: 3.141592653589793,
	limone: 3.9269908169872414,
	mela: 4.71238898038469,
	sette: 5.497787143782138,
};

Slot.prototype._rotate = function(to, freeRotation, delay) {
	/* Rotate to a specific position, always in the same direction.
		if "freeRotation" is true rotation can occour in
		both ways;*/
	var cylinder = this.cylinder,
		self = this,
		rotation = {x: cylinder.rotation.x},
		target = {x: cylinder.rotation.x},
		delay = delay || 0,
		promise;
	
	if (freeRotation) {
		// TODO: don't rewind it back, just go to the nearest.
		target.x = to + this.baseRotation;
	} else {
		// It should do two complete rotation anyway.
		if (rotation.x < DEG360) {
			target.x = 2 * DEG360 + to + this.baseRotation;
		} else {
			target.x = (1 + Math.ceil(target.x / DEG360)) * DEG360 + to + this.baseRotation;
		}
	}
	promise = new RSVP.Promise(function(resolve, reject) {
		var tween = new TWEEN.Tween(rotation)
				.to(target, ROTATION_DURATION)
				.onUpdate(function() {
					cylinder.rotation.x = rotation.x;
				})
				.onComplete(function() {
					self._moving = false;
 					self.emit('rotationEnd', rotation.x);
 					resolve(rotation.x);
				})
				.easing(TWEEN.Easing.Elastic.Out)
				.delay(delay)
				.start();
	});
	this._moving = true;
	return promise;
}

Slot.prototype.reset = function() {
	var zero = Math.floor(this.cylinder.rotation.x / DEG360) * DEG360;
	return this._rotate(zero, true, 0);
}

Slot.prototype.show = function(symbolName, delay) {
	return this._rotate(Slot.symbols[symbolName] || 0, false, delay);
}

Slot.getRandomFace = function() {
	return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

Slot.prototype._demoCallback = function(e, x) {
	this.faceIndex++;
	this._rotate(Slot.symbols[SYMBOLS[this.faceIndex % SYMBOLS.length]] || 0, true, 500);
}

Slot.prototype.startDemo = function(delay) {
	// The slot takes a spin to a random face, and then start spinning slowly through the faces.
	var face = Slot.getRandomFace();
	this._demoing = true;
	this.faceIndex = SYMBOLS.indexOf(face);
	this.on('rotationEnd', this._demoCallback.bind(this));
	this.show(face, delay);
}

Slot.prototype.stopDemo = function() {
	// this should end the loop
	this._demoing = false;
	var slot = this;
	this.removeListener('rotationEnd', this._demoCallback);
	return new RSVP.Promise(function(resolve, reject) {
		slot.once('rotationEnd', resolve);
		console.log('stopping demo mode');
	});
}

/* The Machine, a singleton collecting the logical slots. */
var Machine = {
	slots: [],
	addSlot: function(slot) {
		Machine.slots.push(slot);
	},
	roll: function(winning) {
		return new RSVP.Promise(function(resolve, reject) {
			if (winning) {
				var face = Slot.getRandomFace();
				RSVP.all(Machine.slots.map(function(slot, i) {
					return slot.show(face, i * 100);
				})).then(resolve).catch(reject);
			} else {
				RSVP.all(Machine.slots.map(function(slot, i) {
					var face = Slot.getRandomFace();
					return slot.show(face, i * 100);
				})).then(resolve).catch(reject);
			}
		});
	},
	reset: function() {
		$.each(Machine.slots, function(i, slot) { slot.reset(); });
	},
	startDemo: function() {
		Machine.emit('startDemo');
		$.each(Machine.slots, function(i, slot) { slot.startDemo(750 * i); });
	},
	stopDemo: function() {
		return new RSVP.Promise(function(resolve, reject) {
			RSVP.all(Machine.slots.map(function(slot, i) {
				return slot.stopDemo();
			})).then(function() { Machine.emit('stopDemo'); })
				.then(resolve)
				.catch(reject);
		});
	}
}

Eventable.mixin(Machine);

/* Meshes (the 3d element of the slots) */
for (var i = 0, j = 3; i<j; i++) {
	var geometry = new THREE.CylinderGeometry(150, 150, 150, SYMBOLS.length * FACE_MULTIPLIER, 1, true),
		cylinder = new THREE.Mesh(geometry, material);

	/*
	cfr.: http://solutiondesign.com/webgl-and-three-js-texture-mapping/
	The faceVertexUvs property of geometry is an array of arrays that contains 
	the coordinate mapping for each face of the geometry. Since we are mapping
	to a cube you may be wondering why there are 12 faces in the array. The reason
	is that each face of the cube is actually created from 2 triangles. So we 
	must map each triangle individually. In the scenario above where we simply 
	handed Three.js a single material, it automatically broke our texture down 
	into triangles and mapped it to each face for us.	
	*/
	geometry.faceVertexUvs[0] = [];
	$.each(UVMap, function(index, map) {
		geometry.faceVertexUvs[0][index * 2] = [map[0], map[1], map[3]];
		geometry.faceVertexUvs[0][index * 2 + 1] = [map[1], map[2], map[3]];
	});
	cylinder.rotation.z = Math.PI / 2;
	scene.add(cylinder);
	Machine.addSlot(new Slot(cylinder));
	// first cylinder: x = -155
	// second: x = 0
	// third: x = +155
	cylinder.position.x += 155 * (i - 1);
}

function render(timestamp) {
	requestAnimationFrame(render);
	renderer.render(scene, camera);
	TWEEN.update();
}
render();

