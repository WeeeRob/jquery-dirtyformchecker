jquery-dirtyformchecker
=======================

jQuery DirtyFormChecker: An alert prompt for checking if a form is dirty when leaving the page
https://github.com/WeeeRob/jQuery-Plug-ins

This builds upon the work found here... 
http://misterdai.yougeezer.co.uk/2010/06/04/jquery-form-changed-warning/
http://jsbin.com/amecu3

Basically all I've done is refactored it as a plug-in and added a little bit
more functionality:
*	Allowed a global or call or form specific
*	Added saving form contents, i.e. if do an Ajax submit
*	Allowed stopping checking on a form

NOTE: Do we need to worry about when the submit method is called? 

TODO: Allow for callbacks to assist in serializing the data, e.g. when using things like HTML editors where it needs to update
and internal field but doesn't until it's own submit handler is called. 

TODO: Test stop functionality

TODO: Test save functionality

TODO: Allow parameters in the message, e.g. a form name in msgFormSubmit

TODO: Set-up javascript unit testing environment (http://qunitjs.com/) see jQuery tests... https://github.com/jquery/jquery/tree/master/test/unit

TODO: Tidy up test page to make it work betterer. 

TODO: Test on other browsers for that misterious possible beforeunload bug. 

TODO: Put it in GitHub

TODO: Allow stopping of all

TODO: Rethink jQuery interface, maybe go the jQuery UI route where you have a method or property that is checked to see what should
be done. e.g. 
See http://jqueryui.com/demos/datepicker/ so initial set then get and set after original init
$( ".selector" ).datepicker({ altField: "#actualDate" });
var altField = $( ".selector" ).datepicker( "option", "altField" );
$( ".selector" ).datepicker( "option", "altField", "#actualDate" );

TODO: VS comments, references etc. 

TODO: Help page, examples, so in addition to the current example page have things like not working on a search / login form, 
Ajax example, stop example (think of a good reason where you'd use it?)

TODO: Work out proper structure for the repository, releases, source, tests etc. 

TODO: Find proper header for file, version, link, contact, that kind of jazz
https://github.com/Aversiste/RandomSig/blob/68b738d5ab9ee39bdcad79a6a2b6c4c01689196d/randomsig.user.js

TODO: jshint it

TODO: Min / packed version