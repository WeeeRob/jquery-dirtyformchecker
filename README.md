# jquery-dirtyformchecker #

Version: 0.0.1a, Last updated: 22/08/2012

An alert prompt for checking if a form is dirty when leaving the page

This builds upon the work found here... 
http://misterdai.yougeezer.co.uk/2010/06/04/jquery-form-changed-warning/
http://jsbin.com/amecu3

Basically all I've done is refactored it as a plug-in and added a little bit
more functionality:
*	Allowed a global or call or form specific
* 	Allow options to be global or form specific
*	Added saving form contents, i.e. if do an Ajax submit
*	Allowed stopping checking on a form
*	Provided a way to change options after they've been set
*	Allow overriding of formSerialization, e.g. if there's an HTML editor or other form element that needs a call to update

## TODO ##

NOTE: Do we need to worry about when the submit method is called? 

TODO: Work out some different scenarios for the test cases and documentation ideas. multiple forms, one not enabled, HTML editor, ajax submit (update and stop), etc. 
*	Simple form with link
*	Two forms on a page
*	Form where one of the items is an HTML form
*	Two forms, one of them is search where it's not enabled
*	Ajax form where form is submitted via ajax, then we save the data (keep form on page so we can leave after or make further changes
*	Could we have a complex example with 3 forms on the page? Search / login / register where enabled for login and register but not search, custom messages so you know which form has been changed. 
*	Ajax where form is hidden after submit and we call stop on it

TODO: Have field names we can ignore if they change, maybe do by a filter selectors? $('input[name!=security]', this).serialize(); 

TODO: Test stop functionality

TODO: Test stopAll functionality

TODO: Test save functionality

TODO: Allow parameters in the message, e.g. a form name in msgFormSubmit

TODO: Set-up javascript unit testing environment (http://qunitjs.com/) see jQuery tests... https://github.com/jquery/jquery/tree/master/test/unit

TODO: Test on other browsers for that misterious possible beforeunload bug. 

TODO: Put it in GitHub

TODO: VS comments, references etc. 

TODO: Help page, examples, so in addition to the current example page have things like not working on a search / login form, 
Ajax example, stop example (think of a good reason where you'd use it?)

TODO: Find proper header for file, version, link, contact, that kind of jazz
https://github.com/Aversiste/RandomSig/blob/68b738d5ab9ee39bdcad79a6a2b6c4c01689196d/randomsig.user.js

TODO: Build process? JSHint, Google Closure compiler shebang?

## Documentation ##


## Examples ##


## Support and Testing ##
Information about what version or versions of jQuery this plugin has been
tested with, what browsers it has been tested in, and where the unit tests
reside (so you can test it yourself).

### jQuery Versions ###
1.8.x

### Browsers Tested ###
Chrome 21, IE9 (IE8 compatiblity, IE7 compatiblity)

### Unit Tests ###

## Known issues ##

## Release History ##

1.0   - (dd/mm/yyyy) Initial release


## License ##
DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
Version 2, December 2004

Copyright (C) 2012 Robert Walter <weeerob@gmail.com>

Everyone is permitted to copy and distribute verbatim or modified
copies of this license document, and changing it is allowed as long
as the name is changed.

DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION

0. You just DO WHAT THE FUCK YOU WANT TO.

## Support ##
This program is free software. It comes without any warranty, to
the extent permitted by applicable law. You can redistribute it
and/or modify it under the terms of the Do What The Fuck You Want
To Public License, Version 2, as published by Sam Hocevar. See
http://sam.zoy.org/wtfpl/COPYING for more details.