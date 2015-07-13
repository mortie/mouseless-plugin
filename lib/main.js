var tabs = require("sdk/tabs");
var self = require("sdk/self");

tabs.on("ready", function(tab) {
	var worker = tab.attach({
		contentScriptFile: self.data.url("onload.js")
	});

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
});
