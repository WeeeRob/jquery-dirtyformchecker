/// <reference path="http://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.8.1-vsdoc.js"/>
/// <reference path="ASPxScriptIntelliSense.js"/>

/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:true, curly:true, browser:true, devel:true, jquery:true, indent:4, maxerr:50 */
/*
jQuery DirtyFormChecker: An alert prompt for checking if a form is dirty when leaving the page
https://github.com/WeeeRob/jquery-dirtyformchecker

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

	/// <summary>
	/// Self executing function to give variable scope
	/// </summary>
	/// <param name="$" type="object">
	/// jQuery
	/// </param>

	"use strict";

	if (!Array.prototype.indexOf) {
		Array.prototype.indexOf = function (value, start) {
			/// <summary>
			/// Finds the index of an item in the array
			/// </summary>
			/// <param name="value" type="object">
			/// Value to search for
			/// </param>
			/// <param name="start" type="number">
			/// Location to start
			/// </param>
			/// <returns type="number">Index of the found item or -1</returns>
			for (var i = start || 0; i < this.length; i++) {
				if (this[i] === value) {
					return i;
				}
			}
			return -1;
		};
	}

	if (!Array.prototype.diff) {
		Array.prototype.diff = function(a) {
			/// <summary>
			/// Returns the difference in the two arrays
			/// </summary>
			/// <param name="a" type="Array">
			/// Array to check against
			/// </param>
			/// <returns type="Array">Array with the differing elements in</returns>
			return this.filter(function(i) {
				return !(a.indexOf(i) > -1);
			});
		};
	}

	var defaultOpt = {
		changeClass: 'changed',
		msgPageExit: 'One or more forms have changed! Unsaved changes will be lost.\nReally continue?',
		msgFormSubmit: 'Another form has been changed! Unsaved changes will be lost.\nReally continue?', 
		customFormSerialize : null, 
		debug : false, 
		ignoreElements : null, 
		onDirty : null, 
		alerts : true
	};

	/*
	These are the selectors of the nasty DevExpress junk that it adds to the page which was the point of passing through
	the ignoreElements selector
	*/
	/* ignoreElements : '[name$="$DDD$C"], [name$="$DDD$L"], [name$="_DDD_C_FNPWS"], [name$="_DDD_LCustomCallback"], [name$="_DDD_LDeletedItems"], [name$="_DDD_LInsertedItems"], [name$="_DDDWS"], [name$="_Raw"], [name$="_VI"], [name="DXMVCEditorsValues"], [name="DXScript"], [name*="$viewNavigatorBlock$"], [name*="$stateBlock$"], [name$="$CallbackState"], [name$="$DXSyncInput"]' */

	var dirtyFormCheckers = [];

	function pageUnloadChecker() {
		/// <summary>
		/// Page unload checker handler
		/// </summary>
		/// <returns type="string">Message to display on leaving the page</returns>
		if (!dirtyFormCheckers[0].opt.alerts) {
			return;
		}

		if (anyFormChanges()) {
			return dirtyFormCheckers[0].opt.msgPageExit;
		}
	}

	function submitFormChecker(e, dirtyFormChecker) {
		/// <summary>
		/// Submit handler for all the forms
		/// </summary>
		/// <param name="e" type="object">
		/// Event object for the form submit
		/// </param>
		/// <param name="dirtyFormChecker" type="object">
		/// Dirty form checker instance this submit relates to
		/// </param>
		var changes = anyFormChanges(dirtyFormChecker);
		if ((changes) && ((!dirtyFormChecker.opt.alerts) || (!confirm(dirtyFormChecker.opt.msgFormSubmit)))) {
			e.preventDefault();
		} else {
			$(window).off('beforeunload', pageUnloadChecker);
		}
	}

	function anyFormChanges(dirtyFormChecker) {
		/// <summary>
		/// Checks if there have been any form changes across all the forms we're checking
		/// </summary>
		/// <param name="dirtyFormChecker" type="object">
		/// Optional dirtyFormChecker instance to ignore when checking
		/// </param>
		/// <returns type="boolean">True if there have been some changes, false otherwise</returns>
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
		/// <summary>
		/// Stops checking all elements
		/// </summary>
		/// <param name="removeFully" type="boolean">
		/// Whether this should be a permanent change
		/// </param>
		/// <returns type="object"></returns>
		for (var i = 0; i < dirtyFormCheckers.length; i++) {
			dirtyFormCheckers[i].stop(removeFully);
		}
		if (removeFully) {
			dirtyFormCheckers = [];
		}
	}

	var DirtyFormChecker = function (el, opt) {
		/// <summary>
		/// Constructor for the dirty form checker
		/// </summary>
		/// <param name="el" type="object">
		/// Element to apply the object to
		/// </param>
		/// <param name="opt" type="object">
		/// Options for this instance
		/// </param>
		this.$el = $(el);
		this.formData = null;
		this.enabled = true;
		this.$el.data('dirtyFormChecker', this);
		dirtyFormCheckers.push(this);
		this.init(opt);
		this.$el.on('submit', $.proxy(this.submit, this));

		if (opt.onDirty != null) {
			this.$el.on('change keyup', ':input', $.proxy(this.inputChange, this));
		}
	};

	DirtyFormChecker.prototype.init = function (opt) {
		/// <summary>
		/// Initializes the container object
		/// </summary>
		/// <param name="opt" type="object">
		/// Options for this instance
		/// </param>
		this.opt = opt;
		this.save();
	};

	DirtyFormChecker.prototype.serialize = function () {
		/// <summary>
		/// Returns a serialized version of the form. This can either use the custom serialization, 
		/// or default jQuery serialization excluding the ignore elements or everything. 
		/// </summary>
		/// <returns type="string">String representation of the form</returns>
		if (this.opt.customFormSerialize) {
			return this.opt.customFormSerialize(this.$el);
		} else if (this.opt.ignoreElements !== null) {
			return this.$el.find(':input').not(this.opt.ignoreElements).serialize();
		}
		
		return this.$el.serialize();
	};

	DirtyFormChecker.prototype.save = function () {
		/// <summary>
		/// Saves the form status to the page
		/// </summary>
		this.formData = this.serialize();
	};

	DirtyFormChecker.prototype.stop = function (removeFully) {
		/// <summary>
		/// Stops checking the form for changes
		/// </summary>
		/// <param name="removeFully" type="boolean">
		/// Whether this is a permanent stop
		/// </param>
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
		/// <summary>
		/// Method to work out if the form has been changed or not since last time we check. 
		/// </summary>
		/// <returns type="boolean">True if enabled and the form has changed, false otherwise</returns>
		if (!this.enabled) {
			return false;
		}

		var newFormData = this.serialize();
		if (newFormData !== this.formData) {
			if (this.opt.debug) {
				console.log(newFormData.split('&').diff(this.formData.split('&')));
			}

			this.$el.addClass(this.opt.changeClass);
			return true;
		}

		this.$el.removeClass(this.opt.changeClass);
		return false;
	};

	DirtyFormChecker.prototype.submit = function (e) {
		/// <summary>
		/// Event handler for when the form is submitted
		/// </summary>
		/// <param name="e" type="Event">
		/// Event object for the submit event
		/// </param>
		/// <returns type="boolean">True if the event should propgate (force of habbit, not actually used)</returns>
		return submitFormChecker(e, this);
	};

	DirtyFormChecker.prototype.inputChange = function (e) {
		/// <summary>
		/// Event handler for when a form input element changes
		/// </summary>
		/// <param name="e" type="Event">
		/// Event object for the change event
		/// </param>
		/// <returns type="boolean">True if the event should propgate (force of habbit, not actually used)</returns>
		if ((this.opt.onDirty !== null) && (this.changed())) {
			this.opt.onDirty(this.$el, e);
		}
	};

	var initialized = false;

	$.fn.dirtyFormChecker = function (options) {
		/// <summary>
		/// Runs dirtyFormChecker plug-in on the passed through items
		/// </summary>
		/// <param name="options" type="object">
		/// Options object
		/// </param>
		/// <returns type="object">jQuery object containing the items this was applied to</returns>

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
		/// <summary>
		/// Global method to apply plug-in to all form objects
		/// </summary>
		/// <param name="options" type="object">
		/// optional object containing options for the plug-in
		/// </param>
		/// <returns type="object">jQuery object containing all forms on the page</returns>

		options = $.extend({}, defaultOpt, options || {});
		return $('form').dirtyFormChecker(options);
	};

})(jQuery);