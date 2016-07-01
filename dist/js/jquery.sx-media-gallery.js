'use strict';

// jquery.event.move
//
// 1.3.6
//
// Stephen Band
//
// Triggers 'movestart', 'move' and 'moveend' events after
// mousemoves following a mousedown cross a distance threshold,
// similar to the native 'dragstart', 'drag' and 'dragend' events.
// Move events are throttled to animation frames. Move event objects
// have the properties:
//
// pageX:
// pageY:   Page coordinates of pointer.
// startX:
// startY:  Page coordinates of pointer at movestart.
// distX:
// distY:  Distance the pointer has moved since movestart.
// deltaX:
// deltaY:  Distance the finger has moved since last event.
// velocityX:
// velocityY:  Average velocity over last few events.

(function (thisModule) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['jquery'], thisModule);
	} else if (typeof module !== "undefined" && module !== null && module.exports) {
		module.exports = thisModule;
	} else {
		// Browser globals
		thisModule(jQuery);
	}
})(function (jQuery, undefined) {

	var // Number of pixels a pressed pointer travels before movestart
	// event is fired.
	threshold = 6,
	    add = jQuery.event.add,
	    remove = jQuery.event.remove,


	// Just sugar, so we can have arguments in the same order as
	// add and remove.
	trigger = function trigger(node, type, data) {
		jQuery.event.trigger(type, data, node);
	},


	// Shim for requestAnimationFrame, falling back to timer. See:
	// see http://paulirish.com/2011/requestanimationframe-for-smart-animating/
	requestFrame = function () {
		return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (fn, element) {
			return window.setTimeout(function () {
				fn();
			}, 25);
		};
	}(),
	    ignoreTags = {
		textarea: true,
		input: true,
		select: true,
		button: true
	},
	    mouseevents = {
		move: 'mousemove',
		cancel: 'mouseup dragstart',
		end: 'mouseup'
	},
	    touchevents = {
		move: 'touchmove',
		cancel: 'touchend',
		end: 'touchend'
	};

	// Constructors

	function Timer(fn) {
		var callback = fn,
		    active = false,
		    running = false;

		function trigger(time) {
			if (active) {
				callback();
				requestFrame(trigger);
				running = true;
				active = false;
			} else {
				running = false;
			}
		}

		this.kick = function (fn) {
			active = true;
			if (!running) {
				trigger();
			}
		};

		this.end = function (fn) {
			var cb = callback;

			if (!fn) {
				return;
			}

			// If the timer is not running, simply call the end callback.
			if (!running) {
				fn();
			}
			// If the timer is running, and has been kicked lately, then
			// queue up the current callback and the end callback, otherwise
			// just the end callback.
			else {
					callback = active ? function () {
						cb();fn();
					} : fn;

					active = true;
				}
		};
	}

	// Functions

	function returnTrue() {
		return true;
	}

	function returnFalse() {
		return false;
	}

	function preventDefault(e) {
		e.preventDefault();
	}

	function preventIgnoreTags(e) {
		// Don't prevent interaction with form elements.
		if (ignoreTags[e.target.tagName.toLowerCase()]) {
			return;
		}

		e.preventDefault();
	}

	function isLeftButton(e) {
		// Ignore mousedowns on any button other than the left (or primary)
		// mouse button, or when a modifier key is pressed.
		return e.which === 1 && !e.ctrlKey && !e.altKey;
	}

	function identifiedTouch(touchList, id) {
		var i, l;

		if (touchList.identifiedTouch) {
			return touchList.identifiedTouch(id);
		}

		// touchList.identifiedTouch() does not exist in
		// webkit yet… we must do the search ourselves...

		i = -1;
		l = touchList.length;

		while (++i < l) {
			if (touchList[i].identifier === id) {
				return touchList[i];
			}
		}
	}

	function changedTouch(e, event) {
		var touch = identifiedTouch(e.changedTouches, event.identifier);

		// This isn't the touch you're looking for.
		if (!touch) {
			return;
		}

		// Chrome Android (at least) includes touches that have not
		// changed in e.changedTouches. That's a bit annoying. Check
		// that this touch has changed.
		if (touch.pageX === event.pageX && touch.pageY === event.pageY) {
			return;
		}

		return touch;
	}

	// Handlers that decide when the first movestart is triggered

	function mousedown(e) {
		var data;

		if (!isLeftButton(e)) {
			return;
		}

		data = {
			target: e.target,
			startX: e.pageX,
			startY: e.pageY,
			timeStamp: e.timeStamp
		};

		add(document, mouseevents.move, mousemove, data);
		add(document, mouseevents.cancel, mouseend, data);
	}

	function mousemove(e) {
		var data = e.data;

		checkThreshold(e, data, e, removeMouse);
	}

	function mouseend(e) {
		removeMouse();
	}

	function removeMouse() {
		remove(document, mouseevents.move, mousemove);
		remove(document, mouseevents.cancel, mouseend);
	}

	function touchstart(e) {
		var touch, template;

		// Don't get in the way of interaction with form elements.
		if (ignoreTags[e.target.tagName.toLowerCase()]) {
			return;
		}

		touch = e.changedTouches[0];

		// iOS live updates the touch objects whereas Android gives us copies.
		// That means we can't trust the touchstart object to stay the same,
		// so we must copy the data. This object acts as a template for
		// movestart, move and moveend event objects.
		template = {
			target: touch.target,
			startX: touch.pageX,
			startY: touch.pageY,
			timeStamp: e.timeStamp,
			identifier: touch.identifier
		};

		// Use the touch identifier as a namespace, so that we can later
		// remove handlers pertaining only to this touch.
		add(document, touchevents.move + '.' + touch.identifier, touchmove, template);
		add(document, touchevents.cancel + '.' + touch.identifier, touchend, template);
	}

	function touchmove(e) {
		var data = e.data,
		    touch = changedTouch(e, data);

		if (!touch) {
			return;
		}

		checkThreshold(e, data, touch, removeTouch);
	}

	function touchend(e) {
		var template = e.data,
		    touch = identifiedTouch(e.changedTouches, template.identifier);

		if (!touch) {
			return;
		}

		removeTouch(template.identifier);
	}

	function removeTouch(identifier) {
		remove(document, '.' + identifier, touchmove);
		remove(document, '.' + identifier, touchend);
	}

	// Logic for deciding when to trigger a movestart.

	function checkThreshold(e, template, touch, fn) {
		var distX = touch.pageX - template.startX,
		    distY = touch.pageY - template.startY;

		// Do nothing if the threshold has not been crossed.
		if (distX * distX + distY * distY < threshold * threshold) {
			return;
		}

		triggerStart(e, template, touch, distX, distY, fn);
	}

	function handled() {
		// this._handled should return false once, and after return true.
		this._handled = returnTrue;
		return false;
	}

	function flagAsHandled(e) {
		e._handled();
	}

	function triggerStart(e, template, touch, distX, distY, fn) {
		var node = template.target,
		    touches,
		    time;

		touches = e.targetTouches;
		time = e.timeStamp - template.timeStamp;

		// Create a movestart object with some special properties that
		// are passed only to the movestart handlers.
		template.type = 'movestart';
		template.distX = distX;
		template.distY = distY;
		template.deltaX = distX;
		template.deltaY = distY;
		template.pageX = touch.pageX;
		template.pageY = touch.pageY;
		template.velocityX = distX / time;
		template.velocityY = distY / time;
		template.targetTouches = touches;
		template.finger = touches ? touches.length : 1;

		// The _handled method is fired to tell the default movestart
		// handler that one of the move events is bound.
		template._handled = handled;

		// Pass the touchmove event so it can be prevented if or when
		// movestart is handled.
		template._preventTouchmoveDefault = function () {
			e.preventDefault();
		};

		// Trigger the movestart event.
		trigger(template.target, template);

		// Unbind handlers that tracked the touch or mouse up till now.
		fn(template.identifier);
	}

	// Handlers that control what happens following a movestart

	function activeMousemove(e) {
		var timer = e.data.timer;

		e.data.touch = e;
		e.data.timeStamp = e.timeStamp;
		timer.kick();
	}

	function activeMouseend(e) {
		var event = e.data.event,
		    timer = e.data.timer;

		removeActiveMouse();

		endEvent(event, timer, function () {
			// Unbind the click suppressor, waiting until after mouseup
			// has been handled.
			setTimeout(function () {
				remove(event.target, 'click', returnFalse);
			}, 0);
		});
	}

	function removeActiveMouse(event) {
		remove(document, mouseevents.move, activeMousemove);
		remove(document, mouseevents.end, activeMouseend);
	}

	function activeTouchmove(e) {
		var event = e.data.event,
		    timer = e.data.timer,
		    touch = changedTouch(e, event);

		if (!touch) {
			return;
		}

		// Stop the interface from gesturing
		e.preventDefault();

		event.targetTouches = e.targetTouches;
		e.data.touch = touch;
		e.data.timeStamp = e.timeStamp;
		timer.kick();
	}

	function activeTouchend(e) {
		var event = e.data.event,
		    timer = e.data.timer,
		    touch = identifiedTouch(e.changedTouches, event.identifier);

		// This isn't the touch you're looking for.
		if (!touch) {
			return;
		}

		removeActiveTouch(event);
		endEvent(event, timer);
	}

	function removeActiveTouch(event) {
		remove(document, '.' + event.identifier, activeTouchmove);
		remove(document, '.' + event.identifier, activeTouchend);
	}

	// Logic for triggering move and moveend events

	function updateEvent(event, touch, timeStamp, timer) {
		var time = timeStamp - event.timeStamp;

		event.type = 'move';
		event.distX = touch.pageX - event.startX;
		event.distY = touch.pageY - event.startY;
		event.deltaX = touch.pageX - event.pageX;
		event.deltaY = touch.pageY - event.pageY;

		// Average the velocity of the last few events using a decay
		// curve to even out spurious jumps in values.
		event.velocityX = 0.3 * event.velocityX + 0.7 * event.deltaX / time;
		event.velocityY = 0.3 * event.velocityY + 0.7 * event.deltaY / time;
		event.pageX = touch.pageX;
		event.pageY = touch.pageY;
	}

	function endEvent(event, timer, fn) {
		timer.end(function () {
			event.type = 'moveend';

			trigger(event.target, event);

			return fn && fn();
		});
	}

	// jQuery special event definition

	function setup(data, namespaces, eventHandle) {
		// Stop the node from being dragged
		//add(this, 'dragstart.move drag.move', preventDefault);

		// Prevent text selection and touch interface scrolling
		//add(this, 'mousedown.move', preventIgnoreTags);

		// Tell movestart default handler that we've handled this
		add(this, 'movestart.move', flagAsHandled);

		// Don't bind to the DOM. For speed.
		return true;
	}

	function teardown(namespaces) {
		remove(this, 'dragstart drag', preventDefault);
		remove(this, 'mousedown touchstart', preventIgnoreTags);
		remove(this, 'movestart', flagAsHandled);

		// Don't bind to the DOM. For speed.
		return true;
	}

	function addMethod(handleObj) {
		// We're not interested in preventing defaults for handlers that
		// come from internal move or moveend bindings
		if (handleObj.namespace === "move" || handleObj.namespace === "moveend") {
			return;
		}

		// Stop the node from being dragged
		add(this, 'dragstart.' + handleObj.guid + ' drag.' + handleObj.guid, preventDefault, undefined, handleObj.selector);

		// Prevent text selection and touch interface scrolling
		add(this, 'mousedown.' + handleObj.guid, preventIgnoreTags, undefined, handleObj.selector);
	}

	function removeMethod(handleObj) {
		if (handleObj.namespace === "move" || handleObj.namespace === "moveend") {
			return;
		}

		remove(this, 'dragstart.' + handleObj.guid + ' drag.' + handleObj.guid);
		remove(this, 'mousedown.' + handleObj.guid);
	}

	jQuery.event.special.movestart = {
		setup: setup,
		teardown: teardown,
		add: addMethod,
		remove: removeMethod,

		_default: function _default(e) {
			var event, data;

			// If no move events were bound to any ancestors of this
			// target, high tail it out of here.
			if (!e._handled()) {
				return;
			}

			function update(time) {
				updateEvent(event, data.touch, data.timeStamp);
				trigger(e.target, event);
			}

			event = {
				target: e.target,
				startX: e.startX,
				startY: e.startY,
				pageX: e.pageX,
				pageY: e.pageY,
				distX: e.distX,
				distY: e.distY,
				deltaX: e.deltaX,
				deltaY: e.deltaY,
				velocityX: e.velocityX,
				velocityY: e.velocityY,
				timeStamp: e.timeStamp,
				identifier: e.identifier,
				targetTouches: e.targetTouches,
				finger: e.finger
			};

			data = {
				event: event,
				timer: new Timer(update),
				touch: undefined,
				timeStamp: undefined
			};

			if (e.identifier === undefined) {
				// We're dealing with a mouse
				// Stop clicks from propagating during a move
				add(e.target, 'click', returnFalse);
				add(document, mouseevents.move, activeMousemove, data);
				add(document, mouseevents.end, activeMouseend, data);
			} else {
				// We're dealing with a touch. Stop touchmove doing
				// anything defaulty.
				e._preventTouchmoveDefault();
				add(document, touchevents.move + '.' + e.identifier, activeTouchmove, data);
				add(document, touchevents.end + '.' + e.identifier, activeTouchend, data);
			}
		}
	};

	jQuery.event.special.move = {
		setup: function setup() {
			// Bind a noop to movestart. Why? It's the movestart
			// setup that decides whether other move events are fired.
			add(this, 'movestart.move', jQuery.noop);
		},

		teardown: function teardown() {
			remove(this, 'movestart.move', jQuery.noop);
		}
	};

	jQuery.event.special.moveend = {
		setup: function setup() {
			// Bind a noop to movestart. Why? It's the movestart
			// setup that decides whether other move events are fired.
			add(this, 'movestart.moveend', jQuery.noop);
		},

		teardown: function teardown() {
			remove(this, 'movestart.moveend', jQuery.noop);
		}
	};

	add(document, 'mousedown.move', mousedown);
	add(document, 'touchstart.move', touchstart);

	// Make jQuery copy touch event properties over to the jQuery event
	// object, if they are not already listed. But only do the ones we
	// really need. IE7/8 do not have Array#indexOf(), but nor do they
	// have touch events, so let's assume we can ignore them.
	if (typeof Array.prototype.indexOf === 'function') {
		(function (jQuery, undefined) {
			var props = ["changedTouches", "targetTouches"],
			    l = props.length;

			while (l--) {
				if (jQuery.event.props.indexOf(props[l]) === -1) {
					jQuery.event.props.push(props[l]);
				}
			}
		})(jQuery);
	};
});
'use strict';

// jQuery.event.swipe
// 0.5
// Stephen Band

// Dependencies
// jQuery.event.move 1.2

// One of swipeleft, swiperight, swipeup or swipedown is triggered on
// moveend, when the move has covered a threshold ratio of the dimension
// of the target node, or has gone really fast. Threshold and velocity
// sensitivity changed with:
//
// jQuery.event.special.swipe.settings.threshold
// jQuery.event.special.swipe.settings.sensitivity

(function (thisModule) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['jquery', undefined, 'jquery.event.move'], thisModule);
	} else if (typeof module !== "undefined" && module !== null && module.exports) {
		module.exports = thisModule;
	} else {
		// Browser globals
		thisModule(jQuery);
	}
})(function (jQuery, undefined) {
	var add = jQuery.event.add,
	    remove = jQuery.event.remove,


	// Just sugar, so we can have arguments in the same order as
	// add and remove.
	trigger = function trigger(node, type, data) {
		jQuery.event.trigger(type, data, node);
	},
	    settings = {
		// Ratio of distance over target finger must travel to be
		// considered a swipe.
		threshold: 0.4,
		// Faster fingers can travel shorter distances to be considered
		// swipes. 'sensitivity' controls how much. Bigger is shorter.
		sensitivity: 6
	};

	function moveend(e) {
		var w, h, event;

		w = e.currentTarget.offsetWidth;
		h = e.currentTarget.offsetHeight;

		// Copy over some useful properties from the move event
		event = {
			distX: e.distX,
			distY: e.distY,
			velocityX: e.velocityX,
			velocityY: e.velocityY,
			finger: e.finger
		};

		// Find out which of the four directions was swiped
		if (e.distX > e.distY) {
			if (e.distX > -e.distY) {
				if (e.distX / w > settings.threshold || e.velocityX * e.distX / w * settings.sensitivity > 1) {
					event.type = 'swiperight';
					trigger(e.currentTarget, event);
				}
			} else {
				if (-e.distY / h > settings.threshold || e.velocityY * e.distY / w * settings.sensitivity > 1) {
					event.type = 'swipeup';
					trigger(e.currentTarget, event);
				}
			}
		} else {
			if (e.distX > -e.distY) {
				if (e.distY / h > settings.threshold || e.velocityY * e.distY / w * settings.sensitivity > 1) {
					event.type = 'swipedown';
					trigger(e.currentTarget, event);
				}
			} else {
				if (-e.distX / w > settings.threshold || e.velocityX * e.distX / w * settings.sensitivity > 1) {
					event.type = 'swipeleft';
					trigger(e.currentTarget, event);
				}
			}
		}
	}

	function getData(node) {
		var data = jQuery.data(node, 'event_swipe');

		if (!data) {
			data = { count: 0 };
			jQuery.data(node, 'event_swipe', data);
		}

		return data;
	}

	jQuery.event.special.swipe = jQuery.event.special.swipeleft = jQuery.event.special.swiperight = jQuery.event.special.swipeup = jQuery.event.special.swipedown = {
		setup: function setup(data, namespaces, eventHandle) {
			var data = getData(this);

			// If another swipe event is already setup, don't setup again.
			if (data.count++ > 0) {
				return;
			}

			add(this, 'moveend', moveend);

			return true;
		},

		teardown: function teardown() {
			var data = getData(this);

			// If another swipe event is still setup, don't teardown.
			if (--data.count > 0) {
				return;
			}

			remove(this, 'moveend', moveend);

			return true;
		},

		settings: settings
	};
});
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

;(function ($, window, document, undefined) {
    'use strict';

    // Create the defaults once

    var pluginName = 'sxMediaGallery';
    var pluginPrefix = 'sxmg';

    var FileType = {
        File: 'file',
        Image: 'image',
        Video: 'video',
        Audio: 'audio',
        PDF: 'pdf',
        Excel: 'excel',
        Word: 'word',
        PowerPoint: 'powerpoint',
        Text: 'text',
        ZIP: 'zip'
    };

    var IconCollection = {
        Close: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABYElEQVRYR7WX7RHCIAyG46Y6gTqJOoGu6AR6L3fhUkrIB5Rfnm3zPAUS0hPtx5mI3kT0JKJ753rmrwcRIS7ifWSAUxON4fw3br5kiOIZvAzi8kC8KiEFWvgKiRa+k2ABDT4jocE3EhCw4BkJC14lIPALrLFnT3jhBRuZAc9MhODY4N490E5SbybCcGSDJwu0FZISKTgvgQR4N6RcDvyWeW5tKbUO8INRCQsor2/gvRk4UmIHHwnwtGJtV4wu3BJYJaHCPQKzEkO4VyArgaMXR/pwtMexdnM0zxHHU7ZLKbZGBi7rxLCfsARm4C6JkcAKuCmhCayEDyV6AkfAVYlWIArnDRapmJvskAIZOHe30QOsSrDADDx7gBUJCKBaXa1iIK6Pymt0Jl7RptSs7YEuG+/0jTSlHnh0OdxNaQTulSgxPU1pBm5J1JjWx+kMXJNwNaXIjFv7KR3IlPZWZEc35h/4CGLAjclibQAAAABJRU5ErkJggg==',
        Menu: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAARUlEQVRYR+3U0QkAIAgFQN1/6IL6aQIVOhd4cujLaJ5szg8LEHgFVvFBnmwLEBglUPwEN25UEekBAgT0gBsgQEAP/CmwAdmEEiEL49BKAAAAAElFTkSuQmCC',
        Download: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABqklEQVRYR+2X7U3DMBCG327ACDABMAEwATABMAGMABNAJ4BOQDcAJqBswAbQCUBPdFeFJK4/4qp/OKlKFdn3Pr4725eJtmyTLevrH6BWBC4knUk6lrQj6VvSq6SpPYOZTgXA+amkXUmfku7seSDpURLPkAFyblC9MSkACFx2ZrLCW/ux4pgtJJ0MQcQAEAaghs0tEn98xQAI31ENdfNxKIlorCwG8GVFVYuBorwJAZDLa8s3xbYJe7Od0osAVfxsVb4JYfdJ8T7Y9uR/cxKy8pfIVqoNhTi7YgEAObmvrZDgD4g9AN4LV98t4J8E0e6QKU5KJnr62g5L/DQpKJlYC6ApQg6G/YLw1UjBEielx20NgJk7KYnCWIAlxe9OOAs499el4knSVWKqYlFFnDHz7ip4ybkQAkmBWCeOMLciVzl9RXJPiDBdD7YOoi0+G+gjegGM3YbtCTGIbPGcCDhICKJIvATAU9BOB1esd01JYQ/1A4kFvqoDh/B52eKlEWBed9t+WKPR3PE5llOEXb8OwXu+B7LFx0TAYbwlLxKvAZAT7cGxY1IwWhwHv/0QUz8k+/1lAAAAAElFTkSuQmCC',
        Profile: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABIklEQVRYR+2XYQ3CMBSEbwrAAeAAJyABB+AAcAAOkIAUJIADHEBudMvWjLzjNR1Zsv4hjJf3vh3XS1vgs04AVgDm4XuujzuAC4BjNaAIw7e5Jn7pS4ADfyPAE8CkZwAqsagAXj0Pb6pfKhAD8FmO1TlnUABTAHsA6yBPy82CZMkKcKvGu+UMYCcMZ0kyQNduqd0sQGQBePwQXskADA56oLnqQOlDgSqymyYs00xcbgWWkfvjedeQ7TcDxA1Ao82M5ooZ3QBqVFsJOlwA0WNmmVsBs7NY4AZQPRBzxJ4YLoCosFnmVsDsLBa4AUYPiAqbZe6/wOwsFowAsgKiosllZVL+62pWnyUJ0HXWS349o0HrcspaQmyEk08qGN+cF5r6LPkGr15XIUxe5/QAAAAASUVORK5CYII=',
        ArrowLeft: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAu0lEQVRYR82XYQ6AIAhG8abdrI7abHMzBoIyP+x38B4sCQslPyXIv4joieSICFT4TUSRHMvBDV6Lhwv0cLgAh0MFJDhMQINDBEbw7QIWfKuABx6ZQV+sdoYhcE0ABpcEoHAuAIf3AinwowSqTEoX+DGES0hzACpx5CBq4xXSCWud8khYOYb/C0+wJeHJoUp4g1MXEuub8BYhdmE2OHUp1ToxW8SvE6vBqRcT3onVIoYrmXfXS72ceiWH772wrR4VW0r/CgAAAABJRU5ErkJggg==',
        ArrowRight: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAq0lEQVRYR8XXAQqAIAyF4XnTulmdtFiQIGZuc2/zAP4fgg4LJa/i0D+IaLPu4wG4iIgRuwXhBeC2CeEJMCG8AWoEAqBCoABiBBIgQqABUwQD+B6j1/CKRgGGJxEJ+EREAzpEBqBBZAEqIhNw8hjPAjxxPoYMQI1nAJp4NKCLRwI+4y9gdQ7MZskwHgH4jaMB0zgSIIqjAOI4AqCKewPUcU+AKe4FSP+cLj1kN48NOiE+oolLAAAAAElFTkSuQmCC'
    };

    var extendDefaults = function extendDefaults(source, properties) {
        var property;
        for (property in properties) {
            if (properties.hasOwnProperty(property)) {
                source[property] = properties[property];
            }
        }
        return source;
    };

    var SXMediaMaterial = function () {
        function SXMediaMaterial(obj) {
            _classCallCheck(this, SXMediaMaterial);

            this.id = '';
            this.url = '';
            this.thumbnail = '';
            this.type = '';
            this.title = '';
            this.comment = '';
            this.date = null;

            if (obj && (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) == 'object') extendDefaults(this, obj);

            if (this.date) this.date = new Date(this.date);

            if (this.type == null || this.type == undefined || this.type == '') this.type = SXMediaMaterial.defineFileType(this.url);

            if (this.type == FileType.Image && (!this.thumbnail || this.thumbnail == '')) this.thumbnail = this.url;
        }

        _createClass(SXMediaMaterial, [{
            key: 'toString',
            value: function toString() {
                return this.url;
            }
        }, {
            key: 'hasInfoToDisplay',
            get: function get() {
                return this.dateString || this.title || this.comment;
            }
        }, {
            key: 'dateString',
            get: function get() {
                if (this.date == null || this.date == undefined || !(this.date instanceof Date)) return '';

                var year = this.date.getFullYear();
                var month = this.date.getMonth() + 1;
                if (month < 10) month = "0" + month.toString();
                var day = this.date.getDate();

                return day + '.' + month + '.' + year;
            }
        }], [{
            key: 'defineFileType',
            value: function defineFileType(filename) {
                if (!filename || typeof filename != 'string' || filename == '') return FileType.File;

                var extenstion = filename.substring(filename.lastIndexOf('.') + 1);
                switch (extenstion) {
                    case "jpeg":
                    case "jpg":
                    case "bmp":
                    case "png":
                    case "gif":
                    case "tiff":
                        return FileType.Image;

                    case "avi":
                    case "mpeg":
                    case "mp4":
                    case "wmv":
                    case "mov":
                        return FileType.Video;

                    case "mp3":
                    case "wav":
                    case "wma":
                        return FileType.Audio;

                    case "pdf":
                        return FileType.PDF;

                    case "doc":
                    case "docx":
                    case "dotx":
                        return FileType.Word;

                    case "xls":
                    case "xlsx":
                        return FileType.Excel;

                    case "ppt":
                    case "pptx":
                        return FileType.PowerPoint;

                    case "txt":
                        return FileType.Text;

                    case "zip":
                    case "7z":
                    case "rar":
                        return FileType.ZIP;

                    default:
                        return FileType.File;
                }
            }
        }]);

        return SXMediaMaterial;
    }();

    var SXMediaGalleryViewer = function () {
        function SXMediaGalleryViewer(options) {
            _classCallCheck(this, SXMediaGalleryViewer);

            this._defaults = { width: 1, height: 1, infoVisible: true };
            this._options = extendDefaults(this._defaults, options);
            this._prefix = pluginPrefix + "-viewer";

            this._element = $('<div class=\'' + this._prefix + ' unselectable\'></div>');

            this._info = new SXMediaGalleryViewerInfo({ visible: this._options.infoVisible });
            this.element.append(this.info.element);
        }

        _createClass(SXMediaGalleryViewer, [{
            key: 'displayMaterial',


            // display GalleryViewer content
            value: function displayMaterial(material) {
                var prefix = this._prefix;

                if (this.element == null) throw new Error('GalleryView DOM element is destroyed!');

                if (material != undefined) this.material = material;

                this.clear();

                if (this.material == null) return;

                //define different material types content
                if (this.material.type.toLowerCase() == FileType.Image.toLowerCase()) {
                    this._content = $('<img src=' + this.material.url + ' class=\'' + prefix + '-content ' + prefix + '-content-image\'>');
                    this._content.css('visibility', 'hidden');

                    this._content.load(function (event) {
                        this._contentOriginalWidth = event.target.width;
                        this._contentOriginalHeight = event.target.height;
                        this.resize();
                        this._content.css('visibility', 'visible');
                    }.bind(this));
                } else {
                    this._contentOriginalWidth = 640;
                    this._contentOriginalHeight = 480;

                    if (this.material.type.toLowerCase() == FileType.Video.toLowerCase()) {
                        this._content = $('<video class=\'' + prefix + '-content ' + prefix + '-content-video\' controls="controls"><source src="' + this.material.url + '"></video>');
                    } else if (this.material.type.toLowerCase() == FileType.PDF.toLowerCase()) {
                        this._content = $('<div class=\'' + prefix + '-content\'></div>');
                    } else {
                        this._content = $('<div class=\'' + prefix + '-content\'><h2>No data to display</h2></div>');
                        //this._content = $(`<div class='${prefix}-content'><a class="media" href="${this.material.url}"></a></div>`);
                    }
                }

                if (this.content) {
                    this.element.append(this.content);
                    this.resize();
                    //this.content.find('.media').media();
                    if (this.material.type.toLowerCase() == FileType.PDF.toLowerCase()) PDFObject.embed(this.material.url, this._content);
                }

                if (this.info != null) this.info.displayMaterial(material);
            }

            // clear GalleryViewer content

        }, {
            key: 'clear',
            value: function clear() {
                if (this.content != null) this.content.remove();

                this._content = null;
                this._contentOriginalWidth = 0;
                this._contentOriginalHeight = 0;

                if (this.info != null) this.info.displayMaterial(null);
            }

            // resize Image by current view sizes

        }, {
            key: 'resize',
            value: function resize(width, height, margins) {
                if (width == undefined) width = this._options.width;
                if (height == undefined) height = this._options.height;
                if (margins == undefined) margins = this._options.margins;

                this._options.width = width;
                this._options.height = height;
                this._options.margins = margins;

                if (this.element == null || this.material == null) return;

                if (this.content == null || this._contentOriginalWidth <= 0 || this._contentOriginalHeight <= 0) return;

                var marginTop = this._options.margins ? this._options.margins.top || 0 : 0;
                var marginBottom = this._options.margins ? this._options.margins.bottom || 0 : 0;
                if (this.info != null && this.info.isVisible) marginBottom += this.info.element.innerHeight();

                // we'd like to have no interception with info block
                if (this.material.type.toLowerCase() == FileType.Image.toLowerCase()) {
                    marginTop = 0;
                    marginBottom = 0;
                }

                var coefficient = Math.min(width / this._contentOriginalWidth, (height - marginTop - marginBottom) / this._contentOriginalHeight);

                var css = {
                    width: this._contentOriginalWidth * coefficient,
                    height: this._contentOriginalHeight * coefficient,
                    'margin-top': marginTop + 'px',
                    'margin-bottom': marginBottom + 'px'
                };

                //this._content.find('embed').css({height: 'auto'});
                this._content.css(css);
            }

            // download current Material

        }, {
            key: 'download',
            value: function download() {
                if (this.material == null || this.element == null) return;

                var elementDOM = this.element[0];
                var url = this.material.url;
                var filename = this.material.filename || url.substring(url.lastIndexOf("/") + 1).split("?")[0];

                var xhr = new XMLHttpRequest();
                xhr.responseType = 'blob';
                xhr.onload = function () {
                    var a = document.createElement('a');
                    a.href = window.URL.createObjectURL(xhr.response); // xhr.response is a blob
                    a.download = filename; // Set the file name.
                    a.style.display = 'none';
                    elementDOM.appendChild(a);
                    a.click();
                    elementDOM.removeChild(a);
                };
                xhr.open('GET', url, true);
                xhr.send();
            }

            // create GalleryViewer by Material and Options

        }, {
            key: 'element',
            get: function get() {
                return this._element == undefined ? null : this._element;
            }
        }, {
            key: 'info',
            get: function get() {
                return this._info == undefined ? null : this._info;
            }
        }, {
            key: 'content',
            get: function get() {
                return this._content == undefined ? null : this._content;
            }

            // get current material

        }, {
            key: 'material',
            get: function get() {
                return this._material == undefined ? null : this._material;
            }

            // set current material
            ,
            set: function set(obj) {
                this.clear();

                if (obj == null || obj == undefined) this._material = null;else if (obj instanceof SXMediaMaterial) this._material = obj;else if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) == 'object') this._material = new SXMediaMaterial(obj);else throw new Error("Invalid Material object specified!");
            }
        }], [{
            key: 'create',
            value: function create(width, height, margins, options, material) {
                var result = new SXMediaGalleryViewer({
                    width: width,
                    height: height,
                    margins: margins
                });

                if (material != undefined) result.displayMaterial(material);

                return result;
            }
        }]);

        return SXMediaGalleryViewer;
    }();

    var SXMediaGalleryViewerInfo = function () {
        function SXMediaGalleryViewerInfo(options) {
            _classCallCheck(this, SXMediaGalleryViewerInfo);

            this._defaults = { visible: true };
            this._options = extendDefaults(this._defaults, options);
            this._prefix = pluginPrefix + "-viewer-info";

            this._element = $('<div class=\'' + this._prefix + '\'></div>');

            this._date = $('<span class=\'' + this._prefix + '-date\'></span>');
            this._title = $('<span class=\'' + this._prefix + '-title\'></span>');

            this._header = $('<h1 class=\'' + this._prefix + '-header\'></h1>');
            this._header.append(this._date);
            this._header.append(this._title);
            this._element.append(this._header);

            this._comment = $('<div class=\'' + this._prefix + '-comment\'></div>');
            this._element.append(this._comment);

            this.display(this._options.visible);
        }

        _createClass(SXMediaGalleryViewerInfo, [{
            key: 'display',
            value: function display(visible) {
                if (this.element == null) throw new Error('Viewer Info DOM element was destroyed!');

                if (visible == undefined || visible) {
                    this._isVisible = true;
                    this.element.show();
                } else {
                    this._isVisible = false;
                    this.element.hide();
                }

                this.element.trigger(pluginPrefix + '-InfoDisplayChanged', { visible: this.isVisible });
            }
        }, {
            key: 'show',
            value: function show() {
                this.display(true);
            }
        }, {
            key: 'hide',
            value: function hide() {
                this.display(false);
            }
        }, {
            key: 'toggle',
            value: function toggle() {
                this.display(!this.isVisible);
            }

            // display GalleryViewer content

        }, {
            key: 'displayMaterial',
            value: function displayMaterial(material) {
                this._date.text(material ? material.dateString + ' ' : '');
                this._title.text(material ? material.title || '' : '');
                this._comment.text(material ? material.comment || '' : '');
            }
        }, {
            key: 'element',
            get: function get() {
                return this._element == undefined ? null : this._element;
            }
        }, {
            key: 'isVisible',
            get: function get() {
                return this._isVisible;
            }
        }]);

        return SXMediaGalleryViewerInfo;
    }();

    var SXMediaGalleryButton = function () {
        function SXMediaGalleryButton(options) {
            _classCallCheck(this, SXMediaGalleryButton);

            this._defaults = { type: 'button', name: 'name', src: '', handler: null };
            this._options = extendDefaults(this._defaults, options);
            this._prefix = pluginPrefix + "-" + this.type;

            this._element = $('<a class=\'' + this._prefix + ' ' + this._prefix + '-' + this.name + ' unselectable\'><img ' + (this._options.src ? 'src=\'' + this._options.src + '\'' : '') + '></a>');

            if (this.handler != null) this.element.click(this.handler);
        }

        _createClass(SXMediaGalleryButton, [{
            key: 'changeState',
            value: function changeState(isActive) {
                if (this.element == null) return;

                if (isActive) this.element.addClass('active');else this.element.removeClass('active');
            }
        }, {
            key: 'element',
            get: function get() {
                return this._element == undefined ? null : this._element;
            }
        }, {
            key: 'type',
            get: function get() {
                return this._options.type;
            }
        }, {
            key: 'name',
            get: function get() {
                return this._options.name;
            }
        }, {
            key: 'handler',
            get: function get() {
                return this._options.handler == undefined ? null : this._options.handler;
            }
        }], [{
            key: 'create',
            value: function create(type, name, src, handler) {
                return new SXMediaGalleryButton({ type: type, name: name, src: src, handler: handler });
            }
        }]);

        return SXMediaGalleryButton;
    }();

    var SXMediaGalleryMenu = function () {
        function SXMediaGalleryMenu(options) {
            _classCallCheck(this, SXMediaGalleryMenu);

            this._defaults = {};
            this._options = extendDefaults(this._defaults, options);
            this._prefix = pluginPrefix + "-menu";

            this._element = $('<div class=\'' + this._prefix + '\'></div>');

            this._buttons = [];
        }

        _createClass(SXMediaGalleryMenu, [{
            key: 'addButton',
            value: function addButton(button) {
                if (button == undefined || button == null || !(button instanceof SXMediaGalleryButton)) throw new Error('Wrong Button specified!');

                if (this.element == null) throw new Error('Menu DOM element was destroyed!');

                if (button.element == null) throw new Error("Button DOM element was destroyed!");

                this.buttons.push(button);

                this.element.append(button.element);
            }
        }, {
            key: 'findButton',
            value: function findButton(name) {
                if (this.buttons != null) for (var i = 0; i < this.buttons.length; i++) {
                    if (this.buttons[i].name.toLowerCase() == name.toLowerCase()) return this.buttons[i];
                }return null;
            }
        }, {
            key: 'changeButtonState',
            value: function changeButtonState(name, isActive) {
                var button = this.findButton(name);
                if (button != null) button.changeState(isActive);
            }
        }, {
            key: 'element',
            get: function get() {
                return this._element == undefined ? null : this._element;
            }
        }, {
            key: 'buttons',
            get: function get() {
                if (this._buttons == undefined || this._buttons == null || !(this._buttons instanceof Array)) this._buttons = [];
                return this._buttons;
            }
        }]);

        return SXMediaGalleryMenu;
    }();

    var SXMediaGalleryDesk = function () {
        function SXMediaGalleryDesk(options) {
            _classCallCheck(this, SXMediaGalleryDesk);

            this._defaults = {};
            this._options = extendDefaults(this._defaults, options);
            this._prefix = pluginPrefix + "-desk";

            this._element = $('<div class=\'' + this._prefix + '\'></div>').css('display', 'none');

            this._isVisible = false;
            this._materials = [];
        }

        _createClass(SXMediaGalleryDesk, [{
            key: 'display',
            value: function display(visible) {
                if (visible == undefined || visible) {
                    this._isVisible = true;
                    this.element.show();
                } else {
                    this._isVisible = false;
                    this.element.hide();
                }

                this.element.trigger(pluginPrefix + '-DeskDisplayChanged', { visible: this.isVisible });
            }
        }, {
            key: 'show',
            value: function show() {
                this.display(true);
            }
        }, {
            key: 'hide',
            value: function hide() {
                this.display(false);
            }
        }, {
            key: 'toggle',
            value: function toggle() {
                this.display(!this.isVisible);
            }
        }, {
            key: 'addMaterial',
            value: function addMaterial(material, clickHandler) {
                if (!material || !(material instanceof SXMediaMaterial)) throw new Error('Wrong Material specified!');

                if (this.element == null) throw new Error('Desk DOM element was destroyed!');

                this.materials.push(material);

                var item = $('<div class=\'' + this._prefix + '-item\'></div>');

                if (material.thumbnail) item.append($('<img class=\'' + this._prefix + '-item-avatar\' src=\'' + material.thumbnail + '\'>'));

                if (clickHandler) item.click(clickHandler);

                this.element.append(item);
            }
        }, {
            key: 'element',
            get: function get() {
                return this._element == undefined ? null : this._element;
            }
        }, {
            key: 'isVisible',
            get: function get() {
                return this._isVisible == undefined || this._isVisible == null ? false : this._isVisible;
            }
        }, {
            key: 'materials',
            get: function get() {
                if (!this._materials || !(this._materials instanceof Array)) this._materials = [];
                return this._materials;
            }
        }]);

        return SXMediaGalleryDesk;
    }();

    var SXMediaGalleryPanel = function () {
        function SXMediaGalleryPanel(options) {
            _classCallCheck(this, SXMediaGalleryPanel);

            jQuery.event.special.swipe.settings.threshold = 0.2;
            //jQuery.event.special.swipe.settings.sensitivity = 1;

            this._defaults = { infoVisible: true, allowDuplicates: false };
            this._options = extendDefaults(this._defaults, options);
            this._prefix = pluginPrefix + "-panel";

            this._isVisible = false;
            this._materials = [];

            // create Panel element and handle events
            this._element = $('<div class=\'' + this._prefix + '\'></div>').css('display', 'none');
            //this.element.load(this.resize.bind(this));
            this.element.click(function (event) {
                event.stopPropagation();
            });
            this.element.on('swiperight', this.movePrevious.bind(this));
            this.element.on('swipeleft', this.moveNext.bind(this));

            // on Info display changed
            this.element.on(pluginPrefix + '-InfoDisplayChanged', function (event, data) {
                this.menu.changeButtonState('info', data.visible);
            }.bind(this));

            // on Desk display changed
            this.element.on(pluginPrefix + '-DeskDisplayChanged', function (event, data) {
                this.menu.changeButtonState('desk', data.visible);
            }.bind(this));

            // add arrows to move left & right
            this.element.append(SXMediaGalleryButton.create('panel-arrow', 'left', IconCollection.ArrowLeft, this.movePrevious.bind(this)).element);
            this.element.append(SXMediaGalleryButton.create('panel-arrow', 'right', IconCollection.ArrowRight, this.moveNext.bind(this)).element);

            // create Viewer
            this._viewer = SXMediaGalleryViewer.create(this.element.width(), this.element.height(), this.margins, this._options);
            this.element.append(this.viewer.element);

            // create Desk
            this._desk = new SXMediaGalleryDesk();
            this.element.append(this.desk.element);

            // crete Menu and fill with buttons
            this._menu = new SXMediaGalleryMenu();
            this.menu.addButton(SXMediaGalleryButton.create('menu-button', 'desk', IconCollection.Menu, this.desk.toggle.bind(this.desk)));
            this.menu.addButton(SXMediaGalleryButton.create('menu-button', 'info', IconCollection.Profile, this.viewer.info.toggle.bind(this.viewer.info)));
            this.menu.addButton(SXMediaGalleryButton.create('menu-button', 'download', IconCollection.Download, this.viewer.download.bind(this.viewer)));
            this.menu.addButton(SXMediaGalleryButton.create('menu-button', 'close', IconCollection.Close, this.close.bind(this)));
            this.element.append(this.menu.element);

            // highlight the info-button if needed
            this.menu.changeButtonState('info', this.viewer.info.isVisible);
        }

        _createClass(SXMediaGalleryPanel, [{
            key: 'display',
            value: function display(visible) {
                if (visible == undefined || visible) {
                    this._isVisible = true;
                    this.element.show();
                    this.resize();
                } else {
                    this._isVisible = false;
                    this.element.hide();
                }
            }
        }, {
            key: 'hide',
            value: function hide() {
                this.display(false);
            }
        }, {
            key: 'show',
            value: function show(material) {
                if (material != undefined) this.displayMaterial(material);

                this.display(true);
            }

            //close panel of Gallery or close Desk

        }, {
            key: 'close',
            value: function close() {
                if (this.desk != null && this.desk.isVisible) {
                    this.desk.hide();
                } else {
                    if (this.viewer != null) this.viewer.clear();
                    this.hide();
                }
            }

            //add object(objects) to Materials Collection

        }, {
            key: 'addMaterial',
            value: function addMaterial(obj) {
                if (obj == null || obj == undefined) return;

                if (obj instanceof SXMediaMaterial) {
                    if (this.allowDuplicates || this.findMaterial(obj.id) == null) {
                        this.materials.push(obj);
                        this.desk.addMaterial(obj, function () {
                            this.displayMaterial(obj);
                            this.desk.hide();
                        }.bind(this));
                    }
                } else if (obj instanceof Array) {
                    for (var i = 0; i < obj.length; i++) {
                        this.addMaterial(obj[i]);
                    }
                } else if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) == 'object') {
                    this.addMaterial(new SXMediaMaterial(obj));
                }
            }

            //find Material in Collection by id

        }, {
            key: 'findMaterial',
            value: function findMaterial(id) {
                if (id == null || id == undefined) return null;

                for (var i = 0; i < this.count; i++) {
                    //if (typeof id == 'string' && this.materials[i].id.toLowerCase() == id.toLowerCase())
                    //    return this.materials[i];
                    if (this.materials[i].id == id) return this.materials[i];
                }

                return null;
            }
        }, {
            key: 'moveTo',
            value: function moveTo(index) {
                var count = this.count;
                if (count <= 0) return;

                if (index >= count) index = count - 1;
                if (index < 0) index = 0;

                this.displayMaterial(this.materials[index]);
            }
        }, {
            key: 'moveNext',
            value: function moveNext() {
                this.moveTo(this.index + 1);
            }
        }, {
            key: 'movePrevious',
            value: function movePrevious() {
                this.moveTo(this.index - 1);
            }

            //resize the Gallery

        }, {
            key: 'resize',
            value: function resize() {
                if (this.element != null && this.viewer != null) {
                    this.viewer.resize(this.element.width(), this.element.height(), this.margins);
                }
            }

            //display specific Material in panel

        }, {
            key: 'displayMaterial',
            value: function displayMaterial(obj) {
                var material = null;

                if (obj == null || obj == undefined) material = null;else if (obj instanceof SXMediaMaterial) material = obj;else if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) == 'object') material = new SXMediaMaterial(obj);else //if (typeof obj == 'string')
                    material = this.findMaterial(obj);
                //else
                //    throw new Error('Invalid Material specified!');

                if (this.viewer != null) {
                    this.viewer.displayMaterial(material);
                }
            }
        }, {
            key: 'element',
            get: function get() {
                return this._element == undefined ? null : this._element;
            }
        }, {
            key: 'isVisible',
            get: function get() {
                return this._isVisible == undefined || this._isVisible == null ? false : this._isVisible;
            }
        }, {
            key: 'allowDuplicates',
            get: function get() {
                return !!this._options.allowDuplicates;
            }
        }, {
            key: 'menu',
            get: function get() {
                return this._menu == undefined ? null : this._menu;
            }
        }, {
            key: 'viewer',
            get: function get() {
                return this._viewer == undefined ? null : this._viewer;
            }
        }, {
            key: 'desk',
            get: function get() {
                return this._desk == undefined ? null : this._desk;
            }
        }, {
            key: 'materials',
            get: function get() {
                if (this._materials == undefined || this._materials == null || !(this._materials instanceof Array)) this._materials = [];

                return this._materials;
            }

            //get Count of Materials in Collection

        }, {
            key: 'count',
            get: function get() {
                return this.materials.length;
            }

            //get current Material object

        }, {
            key: 'material',
            get: function get() {
                return this.viewer == null ? null : this.viewer.material;
            }

            //get index of current Material in Materials Collection

        }, {
            key: 'index',
            get: function get() {
                if (this.materials == null || this.material == null) return -1;
                return this.materials.indexOf(this.material);
            }
        }, {
            key: 'margins',
            get: function get() {
                // top margin with menu
                var top = this.menu && this.menu.element ? this.menu.element.innerHeight() : 0;

                return {
                    top: top,
                    right: 0,
                    bottom: 0,
                    left: 0
                };
            }
        }]);

        return SXMediaGalleryPanel;
    }();

    var SXMediaGallery = function () {
        function SXMediaGallery(element, options) {
            _classCallCheck(this, SXMediaGallery);

            this._defaults = { infoVisible: true, allowDuplicates: false };
            this._options = $.extend({}, this._defaults, options);
            this._prefix = pluginPrefix;

            this._element = $(element);

            this._panel = new SXMediaGalleryPanel(this._options);

            // добавляем новую панель к документу
            $("body").append(this.panel.element);

            // обновляем размеры панели и просмотрщика,
            // так как объекты были добавлены в DOM
            $(window).load(this.panel.resize.bind(this.panel));

            // при нажатии на документ вне панели - нужно закрыть панель
            $(document).click(this.panel.close.bind(this.panel));

            // on Window resize we should resize our Gallery
            $(window).resize(this.panel.resize.bind(this.panel));

            // при нажатии на элемент нужно отобразить панель с этим элементом
            $(element).on('click', '.' + this._prefix + '-item', function (event) {
                this.panel.show($(event.target).data('id'));
                event.stopPropagation();
            }.bind(this));

            //добавляем все HTML элементы в коллекцию материалов
            this.reload(this._options.items);
        }

        _createClass(SXMediaGallery, [{
            key: 'reload',
            value: function reload(materials) {
                if (this.panel == null) return;

                if (materials == undefined) {
                    //добавляем все HTML элементы в коллекцию материалов
                    this.element.find('.' + this._prefix + '-item').each(function (index, element) {
                        var id = $(element).data('id');
                        var type = $(element).data('type');
                        var url = $(element).data('url');
                        var thumbnail = $(element).data('thumbnail');
                        var date = $(element).data('date');
                        var title = $(element).data('title');
                        var comment = $(element).data('comment');
                        this.panel.addMaterial(new SXMediaMaterial({
                            id: id,
                            type: type,
                            url: url,
                            thumbnail: thumbnail,
                            date: date,
                            title: title,
                            comment: comment
                        }));
                    }.bind(this));
                } else {
                    this.panel.addMaterial(materials);
                }
            }
        }, {
            key: 'element',
            get: function get() {
                return this._element == undefined ? null : this._element;
            }
        }, {
            key: 'panel',
            get: function get() {
                return this._panel == undefined ? null : this._panel;
            }
        }]);

        return SXMediaGallery;
    }();

    // A really lightweight plugin wrapper around the constructor, preventing against multiple instantiations


    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, new SXMediaGallery(this, options));
            }
        });
    };
})(jQuery, window, document);