/*
 * Copyright (c) OSREC Technologies (https://osrec.co.uk)
 * ------------------------------------------------------
 * This library was funded by the Bx team at OSREC
 * Technologies and is available for free under GNU General Public License v3.0.
 *
 * A PRO Version of this library is available at https://osrec.co.uk/products/superslidejs
 *
 * Check out the Bx team's app @ https://usebx.com
 *
 * */

'use strict';

var OSREC = OSREC || {};

OSREC.superslide = function (p) {
	var me = this;

	me.p = p;

	// Set up defaults

	me.p.animation = me.p.animation || 'slideLeft';
	me.p.duration = me.p.duration || 0.5;
	me.p.allowDrag = typeof me.p.allowDrag === 'undefined' ? true : me.p.allowDrag;
	me.p.slideContent = typeof me.p.slideContent === 'undefined' ? true : me.p.slideContent;
	me.p.allowContentInteraction = typeof me.p.allowContentInteraction === 'undefined' ? false : me.p.allowContentInteraction;
	me.p.closeOnBlur = typeof me.p.closeOnBlur === 'undefined' ? false : me.p.closeOnBlur;
	me.p.width = me.p.width || '70vw';
	me.p.height = me.p.height || '100px';
	me.p.dragThreshold = me.p.dragThreshold || 70;
	me.p.openThreshold = me.p.openThreshold || 70;
	me.p.closeThreshold = me.p.closeThreshold || 20;

	me.p.beforeOpen = typeof me.p.beforeOpen == 'function' ? me.p.beforeOpen : function () {};
	me.p.onOpen = typeof me.p.onOpen == 'function' ? me.p.onOpen : function () {};
	me.p.beforeClose = typeof me.p.beforeClose == 'function' ? me.p.beforeClose : function () {};
	me.p.onClose = typeof me.p.onClose == 'function' ? me.p.onClose : function () {};
    me.p.onDrag = typeof me.p.onDrag == 'function' ? me.p.onDrag : function () {};

	me.body = document;
	me.p.isOpen = false;

	// Check browser specific transitionend event

	var getTransitionEndEvent = function () {
		var t;
		var el = document.createElement('dummy');
		var transitions = { 'transition': 'transitionend', 'OTransition': 'oTransitionEnd', 'MozTransition': 'transitionend', 'WebkitTransition': 'webkitTransitionEnd' };
		for (t in transitions) {
			if (el.style[t] !== undefined) {
				return transitions[t];
			}
		}
	};

	me.p.cssTransitionEndEvent = getTransitionEndEvent();

	// Internet Explorer Event Constructor Polyfil

	(function () {
		function CustomEvent(event, params) {
			params = params || { bubbles: false, cancelable: false, detail: undefined };
			var evt = document.createEvent('CustomEvent');
			evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
			return evt;
		};

		CustomEvent.prototype = window.Event.prototype;
		window.CustomEvent = CustomEvent;
	})();

	// Get viewport dimensions

	var clientWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
	var clientHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

	// Set up appropriate animation and position p

	me.p.sliderTransformClose = '';
	me.p.contentTransformClose = '';

	switch (me.p.animation) {
		case 'slideLeft':
			{
				me.p.slider.style.cssText = `position: fixed; overflow-y: auto; -webkit-overflow-scrolling: touch; width: ${me.p.width}; height: 100%; top: 0px; left: -${me.p.width};`;
				me.p.slider.style.transition = `${me.p.duration}s`;
				me.p.sliderTransform = `translate3d(${me.p.width},0,0)`;
				me.p.slider.parentNode.style.overflowX = 'hidden';

				me.p.contentTransform = `translate3d(${me.p.width},0,0)`;

				me.p.touchStartFunction = function (e) {
					var startX = e.changedTouches[0].clientX;

					if (!me.p.isOpen && startX > me.p.dragThreshold) return;

					me.p.content.style.transition = 'none';
					me.p.slider.style.transition = 'none';

					var sliderStartPosition = me.p.isOpen ? me.p.slider.offsetWidth : 0;
					var translation = 0;
					var delta = 0;
                    var completion = 0;

					var touchMoveFunction = function (e) {

						delta = e.changedTouches[0].clientX - startX;
						translation = sliderStartPosition + delta;

						if (translation > me.p.slider.offsetWidth) {
							translation = me.p.slider.offsetWidth;
						}
						if (translation < 0) {
							translation = 0;
						}

                        if (delta >= me.p.slider.offsetWidth) {
                            completion = 1;
                        } else if (delta <= 0) {
                            completion = 0;
                        } else {
                            completion = delta / me.p.slider.offsetWidth;
                        }

                        me.p.onDrag(completion);

						me.p.slider.style.transform = `translate3d(${translation}px, 0, 0)`;
						if (me.p.slideContent) {
							me.p.content.style.transform = me.p.slider.style.transform;
						}
						me.p.slider.style.opacity = 0.999;
					};

					var touchEndFunction = function (e) {
						me.body.removeEventListener("touchmove", touchMoveFunction);

						me.p.slider.style.transition = `${me.p.duration}s`;
						if (me.p.slideContent) {
							me.p.content.style.transition = `${me.p.duration}s`;
						}

						if (!me.p.isOpen && delta >= me.p.openThreshold) {
							me.open(true);
						} else if (me.p.isOpen && delta < -me.p.closeThreshold) {
							me.close(true);
						} else {
							me.p.isOpen ? me.open(true) : me.close(true);
						} // Return to existing state if not gone beyond threshold

						me.body.removeEventListener("touchend", touchEndFunction);
					};

					me.body.addEventListener("touchend", touchEndFunction);
					me.body.addEventListener("touchmove", touchMoveFunction);
				};

				break;
			}
		case 'slideRight':
			{
				me.p.slider.style.cssText = `position: fixed; overflow-y: auto; -webkit-overflow-scrolling: touch; width: ${me.p.width}; height: 100%; top: 0px; left: 100%;`;
				me.p.slider.style.transition = `${me.p.duration}s`;
				me.p.sliderTransform = `translate3d(-${me.p.width},0,0)`;
				me.p.slider.parentNode.style.overflowX = 'hidden';

				me.p.contentTransform = `translate3d(-${me.p.width},0,0)`;

				me.p.touchStartFunction = function (e) {

					var startX = e.changedTouches[0].clientX;

					if (!me.p.isOpen && startX < clientWidth - me.p.dragThreshold) return;

					me.p.content.style.transition = 'none';
					me.p.slider.style.transition = 'none';

					var sliderStartPosition = me.p.isOpen ? -me.p.slider.offsetWidth : 0;
					var translation = 0;
					var delta = 0;
                    var completion = 0;

					var touchMoveFunction = function (e) {

						delta = e.changedTouches[0].clientX - startX;
						translation = sliderStartPosition + delta;

						if (translation < -me.p.slider.offsetWidth) {
							translation = -me.p.slider.offsetWidth;
						}
						if (translation > 0) {
							translation = 0;
						}

                        if ((delta * -1) >= me.p.slider.offsetWidth) {
                            completion = 1;
                        } else if ((delta * -1) <= 0) {
                            completion = 0;
                        } else {
                            completion = (delta * -1) / me.p.slider.offsetWidth;
                        }

                        me.p.onDrag(completion);

						me.p.slider.style.transform = `translate3d(${translation}px, 0, 0)`;
						if (me.p.slideContent) {
							me.p.content.style.transform = me.p.slider.style.transform;
						}
						me.p.slider.style.opacity = 0.999;
					};

					var touchEndFunction = function (e) {
						me.body.removeEventListener("touchmove", touchMoveFunction);

						me.p.slider.style.transition = `${me.p.duration}s`;
						if (me.p.slideContent) {
							me.p.content.style.transition = `${me.p.duration}s`;
						}

						if (!me.p.isOpen && delta <= -me.p.openThreshold) {
							me.open(true);
						} else if (me.p.isOpen && delta > me.p.closeThreshold) {
							me.close(true);
						} else {
							me.p.isOpen ? me.open(true) : me.close(true);
						} // Return to existing state if not gone beyond threshold

						me.body.removeEventListener("touchend", touchEndFunction);
					};

					me.body.addEventListener("touchend", touchEndFunction);
					me.body.addEventListener("touchmove", touchMoveFunction);
				};

				break;
			}
		case 'slideTop':
			{
				me.p.slider.style.cssText = `position: fixed; overflow-x: auto; -webkit-overflow-scrolling: touch; width: 100%; height: ${me.p.height}; top: -${me.p.height}; left: 0;`;
				me.p.slider.style.transition = `${me.p.duration}s`;
				me.p.sliderTransform = `translate3d(0,${me.p.height},0)`;

				me.p.contentTransform = `translate3d(0,${me.p.height},0)`;

				// For the top menu, we cannot allow dragging as it messes with pull to refresh
				// So, we override to false
				me.p.allowDrag = false;
				me.p.touchStartFunction = function (e) {};

				break;
			}
		case 'slideBottom':
			{
				me.p.slider.style.cssText = `position: fixed; overflow-x: auto; -webkit-overflow-scrolling: touch; width: 100%; height: ${me.p.height}; top: 100vh; left: 0;`;
				me.p.slider.style.transition = `${me.p.duration}s`;
				me.p.sliderTransform = `translate3d(0,-${me.p.height},0)`;
				me.p.slider.parentNode.style.overflowX = 'hidden';

				me.p.contentTransform = `translate3d(0,-${me.p.height},0)`;

				me.p.allowDrag = false;

				break;
			}

	}

	me.p.closeOnBlurFunction = function (e) {
		e.preventDefault();
		me.close.call(me);
	};

	if (me.p.slideContent) {
		me.p.content.style.transition = `${me.p.duration}s`;
	}

	if (me.p.allowDrag) {
		me.body.addEventListener("touchstart", me.p.touchStartFunction);
	}

	if (me.p.allowContentInteraction) {
		me.p.contentTouchStartFunction = function (e) {};
	} else {
		me.p.contentTouchStartFunction = function (e) {
			e.preventDefault();
		};
	}

	me.p.slider.offsetHeight; // Triggers style propagation

	me.p.slider.style.transition = `${me.p.duration}s`;

	me.p.content.style['-webkit-tap-highlight-color'] = 'transparent';

	return me;
};

OSREC.superslide.prototype.open = function (doPartialAnimation) {
	var me = this;

	if (!doPartialAnimation && me.p.isOpen) {
		return Promise.resolve();
	}

	var promise = new Promise(function (resolve, reject) {
		var onOpenTransitionEnd = function (e) {
			var target = e.target || e.srcElement || e.originalTarget;

			if (target == me.p.slider) {
				me.p.onOpen();
				me.p.isOpen = true;
				me.p.slider.removeEventListener(me.p.cssTransitionEndEvent, onOpenTransitionEnd);
				me.p.content.addEventListener("touchstart", me.p.contentTouchStartFunction);

				if (me.p.closeOnBlur) {
					me.body.removeEventListener("touchstart", me.p.touchStartFunction); // Disable slide functionality when closing on blur (prevents interference)
					me.p.content.addEventListener("touchstart", me.p.closeOnBlurFunction);
					me.p.content.addEventListener("click", me.p.closeOnBlurFunction);
				}

				resolve();
			}
		};

		me.p.beforeOpen();
		me.p.slider.addEventListener(me.p.cssTransitionEndEvent, onOpenTransitionEnd);
		me.p.slider.style.transform = me.p.sliderTransform;
		me.p.slider.style.opacity = 1;
		if (me.p.slideContent) {
			me.p.content.style.transform = me.p.contentTransform;
		}
	});

	return promise;
};

OSREC.superslide.prototype.close = function (doPartialAnimation) {
	var me = this;

	if (!doPartialAnimation && !me.p.isOpen) {
		return Promise.resolve();
	}

	var promise = new Promise(function (resolve, reject) {
		var onCloseTransitionEnd = function (e) {
			var target = e.target || e.srcElement || e.originalTarget;

			if (target == me.p.slider) {
				me.p.onClose();
				me.p.isOpen = false;
				me.p.slider.removeEventListener(me.p.cssTransitionEndEvent, onCloseTransitionEnd);
				me.p.content.removeEventListener("touchstart", me.p.contentTouchStartFunction);

				if (me.p.closeOnBlur) {
					me.body.addEventListener("touchstart", me.p.touchStartFunction); // Re-enable slide functionality
					me.p.content.removeEventListener("touchstart", me.p.closeOnBlurFunction);
					me.p.content.removeEventListener("click", me.p.closeOnBlurFunction);
				}

				resolve();
			}
		};

		me.p.beforeClose();
		me.p.slider.addEventListener(me.p.cssTransitionEndEvent, onCloseTransitionEnd);
		me.p.slider.style.transform = me.p.sliderTransformClose;
		me.p.slider.style.opacity = 1;
		if (me.p.slideContent) {
			me.p.content.style.transform = me.p.contentTransformClose;
		}
	});

	return promise;
};

OSREC.superslide.prototype.toggle = function () {
	if (this.p.isOpen) {
		console.log('close');
		return this.close();
	} else {
		console.log('open');
		return this.open();
	}
};

OSREC.superslide.prototype.isOpen = function () {
	return this.p.isOpen;
};

OSREC.superslide.prototype.ready = function () {
	return this.p.readyPromise;
};

OSREC.superslide.prototype.destroy = function () {
	var me = this;

	this.close().then(function () {
		me.body.removeEventListener("touchstart", me.p.touchStartFunction);
		me.body = null;
		me.p.content.removeEventListener("touchstart", me.p.closeOnBlurFunction);
		me.p.content.removeEventListener("click", me.p.closeOnBlurFunction);
		me.p.content = null;
		me.p.slider = null;
		me.p = null;
	});
};

///////////////////////////////////////////////////////////////////

var hasDefine = typeof define === 'function';
var hasExports = typeof module !== 'undefined' && module.exports;
var root = typeof window === 'undefined' ? global : window;

if (hasDefine) {
	// AMD Module
	define([], function () {
		return OSREC.superslide;
	});
} else if (hasExports) {
	// Node.js Module
	module.exports = OSREC.superslide;
} else {
	// Assign to the global object
	// This makes sure that the object really is assigned to the global scope
	root.OSREC = OSREC;
}
