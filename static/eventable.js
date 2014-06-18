(function(doc, win) {
	var owns = function(obj, key) {
			return {}.hasOwnProperty.call(obj, key);
		},
		setDefault = function(obj, key, value) {
			/* If key is not set in obj, set to value and return value;
				otherwise just return value */
			if (! owns(obj, key)) {
				obj[key] = value;
			}
			return obj[key];
		},
		/* Rudimentary event system */
		Eventable = function() { this._events = {}; };
	
	Eventable.prototype.on = function(evtName, callback, scope) {
		/* React (callback, scope) to a certain event (evtName).
			Subscribers can alter the flow of the event tampering with the facade:
			eventable.on('hello', function(e) {
				e.stopped = 1; // blocks all subsequent subscribers.
				e.prevented = 1; // blocks the defaultFn.
			});
		*/
		var subs = setDefault(setDefault(this._events, evtName, {}), 'subscribers', []);
		if (scope) {
			subs.push(callback.bind(scope));
		} else {
			subs.push(callback);
		}
	};
	Eventable.prototype.removeListener = function(evtName, subscriber) {
		/* Remove the subscriber */
		var subs = setDefault(setDefault(this._events, evtName, {}), 'subscribers', []);
		subs.splice(subs.indexOf(subscriber), 1);
		return this;
	};
	Eventable.prototype.once = function(evtName, callback, scope) {
		/* Just like `on`, but react to the event just once.
		*/
		this.on(evtName, function onceCallback() {
			callback.apply(scope || this, arguments);
			this.detach(evtName, onceCallback);
		}, this);
	};
	Eventable.prototype.emit = function(evtName /*[args, ...]*/ ) {
		/* Fire a certain event. Subscribers will be called with 
			the event facade as first argument and any subsequent argument passed here. */
		var args = Array.prototype.slice.call(arguments, 1);
		if (owns(this._events, evtName)) {
			var evt = this._events[evtName],	
				subs = evt.subscribers || [],
				facade = {args: args};
			args.unshift(facade)
			for (var i = 0, j = subs.length; i<j; i++) {
				subs[i].apply(evt.scope, args);
				if (facade.stopped) {
					break;
				}
			}
			if (! facade.prevented && evt.defaultFn) {
				/* if no subscriber has prevented the event, run the defaultFn (if any)*/
				evt.defaultFn(evt.scope, facade);
			}
		}
	};
	Eventable.prototype.publish = function(evtName, options) {
		/* Prepare to a certain event:
			options = {
				defaultFn: the function that will be called if the event cycle goes through the end,
				scope: forced scope for the subscribers and the defaultFn 
			} */
		var evt = {};
		if (owns(options, 'defaultFn')) {
			evt.defaultFn = options.defaultFn;
		}
		if (owns(options, 'scope') && evt.defaultFn) {
			evt.defaultFn.bind(options.scope);
		}
		this._events[evtName] = evt
	};
	Eventable.mixin = function(destObject) {
		/* Make your objects Eventable */
		var props = ['on', 'once', 'removeListener', 'emit', 'publish'],
			i = 0, j = 4;
		for (; i < j; i++) {
			if (typeof destObject === 'function') {
				destObject.prototype[props[i]] = Eventable.prototype[props[i]];
			} else {
				destObject[props[i]] = Eventable.prototype[props[i]];
			}
		}
	};
	
	// export functions
	win.Eventable = Eventable;
}(document, window));
