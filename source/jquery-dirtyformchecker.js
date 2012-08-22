/*
jQuery DirtyFormChecker: An alert prompt for checking if a form is dirty when leaving the page
https://github.com/WeeeRob/jQuery-Plug-ins

This builds upon the work found here... 
http://misterdai.yougeezer.co.uk/2010/06/04/jquery-form-changed-warning/
http://jsbin.com/amecu3

Basically all I've done is refactored it as a plug-in and added a little bit
more functionality:
	* Allowed a global or call or form specific
	* Added saving form contents, i.e. if do an Ajax submit
	* Allowed stopping checking on a form

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
				if (this[i] == value) {
					return i;
				}
			}
			return -1;
		}
	}

	var defaultOpt = {
		changeClass: 'changed',
		msgPageExit: 'One or more forms have changed! Unsaved changes will be lost.\nReally continue?',
		msgFormSubmit: 'Another form has been changed! Unsaved changes will be lost.\nReally continue?'
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
			if ((dirtyFormChecker) && (dirtyFormChecker == dirtyFormCheckers[i])) {
				continue;
			}
			if (dirtyFormCheckers[i].changed()) {
				return true;
			}
		}

		return false;
	}

	var DirtyFormChecker = function (el, opt) {
		this.$el = $(el);
		this.formData = null;
		this.$el.data('dirtyFormChecker', this);
		dirtyFormCheckers.push(this);
		this.init(opt);
		this.$el.on('submit', $.proxy(this.submit, this));
	}

	DirtyFormChecker.prototype.init = function (opt) {
		this.opt = opt;
		this.save();
	}

	DirtyFormChecker.prototype.save = function () {
		this.formData = this.$el.serialize();
	}

	DirtyFormChecker.prototype.stop = function () {
		var idx = dirtyFormCheckers.indexOf(this);
		if (idx == -1)
		{
			throw 'Cannot find dirtyFormChecker instance';
		}
		else
		{
			dirtyFormCheckers.splice(idx, 1);
		}
		this.$el.removeData('dirtyFormChecker');
		// Will this work? 
		delete this;
	}

	DirtyFormChecker.prototype.changed = function () {
		if (this.$el.serialize() !== this.formData) {
			this.$el.addClass(this.opt.changeClass);
			return true;
		}

		this.$el.removeClass(this.opt.changeClass);
		return false;
	}

	DirtyFormChecker.prototype.submit = function (e) {
		return submitFormChecker(e, this);
	}

	var initialized = false;

	$.fn.dirtyFormCheckerInit = function (opt) {

		opt = $.extend({}, defaultOpt, opt || {});

		return this.each(function () {
			if (!initialized) {
				initialized = true;
				$(window).on('beforeunload', pageUnloadChecker);
			}
			var dirtyFormChecker = $(this).data('dirtyFormChecker');

			if (dirtyFormChecker) {
				dirtyFormChecker.init(opt);
			}
			else {
				(new DirtyFormChecker(this, opt));
			}
		});
	}

	$.fn.dirtyFormCheckerSave = function () {
		return this.each(function () {
			// Save value on the elements
			var dirtyFormChecker = $(this).data('dirtyFormChecker');

			if (dirtyFormChecker) {
				// Save data
				dirtyFormChecker.save();
			}
			else {
				throw 'dirtyFormChecker not initialized';
			}
		});
	}

	$.fn.dirtyFormCheckerStop = function () {
		return this.each(function () {
			// Save value on the elements
			var dirtyFormChecker = $(this).data('dirtyFormChecker');

			if (dirtyFormChecker) {
				// Save data
				dirtyFormChecker.stop();
			}
			else {
				//throw 'dirtyFormChecker not initialized';
			}
		});
	}

	$.dirtyFormChecker = function (opt) {
		opt = $.extend({}, defaultOpt, opt || {});
		return $('form').dirtyFormCheckerInit(opt);
	}

})(jQuery);