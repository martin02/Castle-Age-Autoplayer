//////////   Start Golem _main.js

// User changeable
var show_debug = true;

// Shouldn't touch
var VERSION = "31.1";
var script_started = Date.now();

// Automatically filled
var userID = 0;
var imagepath = '';
var isGreasemonkey = (navigator.userAgent.toLowerCase().indexOf('chrome') === -1);

// Decide which facebook app we're in...
if (window.location.hostname === 'apps.facebook.com' || window.location.hostname === 'apps.new.facebook.com') {
	var applications = {
		'reqs.php':['','Gifts'], // For gifts etc
		'castle_age':['46755028429', 'Castle Age']
	};

	for (var i in applications) {
		if (window.location.pathname.indexOf(i) === 1) {
			var APP = i;
			var APPID = applications[i][0];
			var APPNAME = applications[i][1];
			var PREFIX = 'golem'+APPID+'_';
			break;
		}
	}
	if (typeof APP !== 'undefined') {
		var log = function(txt){
			console.log('[' + (new Date).toLocaleTimeString() + '] ' + (WorkerStack && WorkerStack.length ? WorkerStack[WorkerStack.length-1].name + ': ' : '') + $.makeArray(arguments).join("\n"));
		}

		if (show_debug) {
			var debug = function(txt) {
				console.log('[' + (revision && revision !== '$WCREV$' ? 'r'+revision : 'v'+VERSION) + '] [' + (new Date).toLocaleTimeString() + '] ' + (WorkerStack && WorkerStack.length ? WorkerStack[WorkerStack.length-1].name + ': ' : '') + $.makeArray(arguments).join("\n"));
			};
		} else {
			var debug = function(){};
		}

		if (typeof unsafeWindow === 'undefined') {
			var unsafeWindow = window;
		}
    }
}

//////////   End Golem _main.js
