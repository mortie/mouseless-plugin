var bridge = {
	onConf: function(cb) {
		self.port.on("conf", function(c) {
			cb(c);
		});
	},
	onKeys: function(cb) {
		self.port.on("keys", function(k) {
			cb(k);
		});
	},

	changeTabLeft: function() {
		self.port.emit("change_tab_left");
	},
	changeTabRight: function() {
		self.port.emit("change_tab_right");
	},

	moveTabLeft: function() {
		self.port.emit("move_tab_left");
	},
	moveTabRight: function() {
		self.port.emit("move_tab_right");
	},

	openTab: function(href) {
		self.port.emit("tab_open", href);
	},

	setClipboard: function(txt) {
		self.port.emit("clipboard_set", txt);
	}
}
