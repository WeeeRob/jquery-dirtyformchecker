/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, devel:true, jquery:true, indent:4, maxerr:50 */
/*
jQuery DirtyFormChecker: An alert prompt for checking if a form is dirty when leaving the page
https://github.com/WeeeRob/jQuery-Plug-ins

This builds upon the work found here... 
http://misterdai.yougeezer.co.uk/2010/06/04/jquery-form-changed-warning/
http://jsbin.com/amecu3

Basically all I've done is refactored it as a plug-in and added a little bit
more functionality:
*	Allowed a global or call or form specific
*	Allow options to be global or form specific
*	Added saving form contents, i.e. if do an Ajax submit
*	Allowed stopping checking on a form
*	Provided a way to change options after they've been set
*	Allow overriding of formSerialization, e.g. if there's an HTML editor or other form element that needs a call to update
*/
/*
DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
Version 2, December 2004

Copyright (C) 2012 Robert Walter <weeerob@gmail.com>

Everyone is permitted to copy and distribute verbatim or modified
copies of this license document, and changing it is allowed as long
as the name is changed.

DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION

0. You just DO WHAT THE FUCK YOU WANT TO.
*/
/*
This program is free software. It comes without any warranty, to
the extent permitted by applicable law. You can redistribute it
and/or modify it under the terms of the Do What The Fuck You Want
To Public License, Version 2, as published by Sam Hocevar. See
http://sam.zoy.org/wtfpl/COPYING for more details.
*/

(function ($) {

	"use strict";

	if (!Array.prototype.indexOf) {
		Array.prototype.indexOf = function (value, start) {
			for (var i = start || 0; i < this.length; i++) {
				if (this[i] === value) {
					return i;
				}
			}
			return -1;
		};
	}

	var defaultOpt = {
		changeClass: 'changed',
		msgPageExit: 'One or more forms have changed! Unsaved changes will be lost.\nReally continue?',
		msgFormSubmit: 'Another form has been changed! Unsaved changes will be lost.\nReally continue?', 
		customFormSerialize : null, 
		debug : false, 
		ignoreElements : null
	};

	var dirtyFormCheckers = [];

	function pageUnloadChecker() {
		if (anyFormChanges()) {
			return dirtyFormCheckers[0].opt.msgPageExit;
		}
	}

	function submitFormChecker(e, dirtyFormChecker) {
		var changes = anyFormChanges(dirtyFormChecker);
		if ((changes) && (!confirm(dirtyFormChecker.opt.msgFormSubmit))) {
			e.preventDefault();
		} else {
			$(window).off('beforeunload', pageUnloadChecker);
		}
	}

	function anyFormChanges(dirtyFormChecker) {
		for (var i = 0; i < dirtyFormCheckers.length; i++) {
			if ((dirtyFormChecker) && (dirtyFormChecker === dirtyFormCheckers[i])) {
				continue;
			}
			if (dirtyFormCheckers[i].changed()) {
				return true;
			}
		}

		return false;
	}

	function stopAll(removeFully) {
		for (var i = 0; i < dirtyFormCheckers.length; i++) {
			dirtyFormCheckers[i].stop(removeFully);
		}
		if (removeFully) {
			dirtyFormCheckers = [];
		}
	}

	var DirtyFormChecker = function (el, opt) {
		this.$el = $(el);
		this.formData = null;
		this.enabled = true;
		this.$el.data('dirtyFormChecker', this);
		dirtyFormCheckers.push(this);
		this.init(opt);
		this.$el.on('submit', $.proxy(this.submit, this));
	};

	DirtyFormChecker.prototype.init = function (opt) {
		this.opt = opt;
		this.save();
	};

	DirtyFormChecker.prototype.serialize = function () {
		if (this.opt.customFormSerialize) {
			return this.opt.customFormSerialize(this.$el);
		} else if (this.opt.ignoreElements !== null) {
			return this.$el.find(':input').not(this.opt.ignoreElements).serialize();
		}
		
		return this.$el.serialize();
	};

	DirtyFormChecker.prototype.save = function () {
		this.formData = this.serialize();
	};

	DirtyFormChecker.prototype.stop = function (removeFully) {
		if (removeFully) {
			var idx = dirtyFormCheckers.indexOf(this);
			if (idx === -1) {
				throw 'Cannot find dirtyFormChecker instance';
			}
			else {
				dirtyFormCheckers.splice(idx, 1);
			}
			this.$el.removeData('dirtyFormChecker');
		} else {
			this.enabled = false;
		}
	};

	DirtyFormChecker.prototype.changed = function () {
		if (!this.enabled) {
			return false;
		}

		var newFormData = this.serialize();
		if (newFormData !== this.formData) {
			if (this.opt.debug) {
				console.log('Old = ' + this.formData.replace(/&/g, '\n'));
				console.log('New = ' + newFormData.replace(/&/g, '\n'));
			}

			this.$el.addClass(this.opt.changeClass);
			return true;
		}

		this.$el.removeClass(this.opt.changeClass);
		return false;
	};

	DirtyFormChecker.prototype.submit = function (e) {
		return submitFormChecker(e, this);
	};

	var initialized = false;

	$.fn.dirtyFormChecker = function (options) {

		if (!this.length) {
			return this;
		}

		var otherArgs = Array.prototype.slice.call(arguments, 1);
		if (typeof options === 'string') {
			if (options === 'stopAll') {
				stopAll(otherArgs[0]);
				return;
			}
			var dirtyFormChecker = $(this[0]).data('dirtyFormChecker');
			if (dirtyFormChecker === null) {
				return;
			}
			if (options === 'option') {
				if (otherArgs.length === 1) {
					return dirtyFormChecker.opt[otherArgs[0]];
				}
				else {
					dirtyFormChecker.opt[otherArgs[0]] = otherArgs[1];
					return;
				}
			}
			else if (options === 'stop') {
				dirtyFormChecker.stop(otherArgs);
				if ((otherArgs.length === 1) && (otherArgs[0])) {
					dirtyFormChecker = null;
				}
			}
			else {
				return dirtyFormChecker[options].apply(dirtyFormChecker, otherArgs);
			}
		}

		options = $.extend({}, defaultOpt, options || {});

		return this.each(function () {
			if (!initialized) {
				initialized = true;
				$(window).on('beforeunload', pageUnloadChecker);
			}
			var dirtyFormChecker = $(this).data('dirtyFormChecker');
			if (dirtyFormChecker) {
				dirtyFormChecker.init(options);
			}
			else {
				(new DirtyFormChecker(this, options));
			}
		});
	};

	$.dirtyFormChecker = function (options) {
		options = $.extend({}, defaultOpt, options || {});
		return $('form').dirtyFormChecker(options);
	};

})(jQuery);