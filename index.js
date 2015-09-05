var tabs = require("sdk/tabs");
var self = require("sdk/self");
var simple_prefs = require("sdk/simple-prefs");
var clipboard = require("sdk/clipboard");

var conf = {};
var keys = {};

function contains(arr, val) {
	if (typeof arr !== "object")
		return false;
	return (arr.indexOf(val) !== -1);
}

function prepareConf(prefs) {
	var keys = {};
	var conf = {};

	for (var i in prefs) {
		var pref = prefs[i];

		if (i === "chars") {
			conf[i] = pref;
			continue;
		}

		var modifiers = pref.match(/<[^>]+>/g) || [];
		var key = pref.replace(/<.+>/g, "");

		if (/^[A-Z]$/.test(key))
			modifiers.push("<Shift>");

		keys[i] = {
			code: key,
			shiftKey: contains(modifiers, "<Shift>"),
			ctrlKey: contains(modifiers, "<Control>")
		}
	}

	return {keys: keys, conf: conf};
}

var res = prepareConf(simple_prefs.prefs);
conf = res.conf;
keys = res.keys;

simple_prefs.on("", function() {
	var res = prepareConf(simple_prefs.prefs);
	conf = res.conf;
	keys = res.keys;
});

tabs.on("ready", function(tab) {
	var worker = tab.attach({
		contentScriptFile: self.data.url("onload.js")
	});

	worker.port.emit("conf", conf);
	worker.port.emit("keys", keys);

	function selectRelativeTab(n) {
		var tabList = [];
		var currentTabIndex;
		for (let t of tabs) {
			tabList[t.index] = t;
			if (t.index == tab.index) {
				currentTabIndex = t.index;
			}
		}

		var newTabIndex = currentTabIndex + n;
		if (newTabIndex >= tabList.length) {
			newTabIndex = 0;
		} else if (newTabIndex < 0) {
			newTabIndex = tabList.length - 1;
		}

		tabList[newTabIndex].activate();
	}

	function moveRelativeTab(n) {
		tab.index += n;
	}

	worker.port.on("tab_open", function(url) {
		tabs.open(url);
	});

	worker.port.on("change_tab_left", function() {
		selectRelativeTab(-1);
	});

	worker.port.on("change_tab_right", function() {
		selectRelativeTab(1);
	});

	worker.port.on("move_tab_left", function() {
		moveRelativeTab(-1);
	});

	worker.port.on("move_tab_right", function() {
		moveRelativeTab(1);
	});

	worker.port.on("clipboard_set", function(text) {
		clipboard.set(text);
	});
});
