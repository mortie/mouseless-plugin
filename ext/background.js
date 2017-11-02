var enabled = false;

async function sendTabEnabled(id, noretry) {
	var obj = { action: enabled ? "enable" : "disable" };

	browser.tabs.sendMessage(id, obj).catch(err => {
		if (noretry) {
			console.error(
				"Send enabled/disabled message to tab "+id+":",
				err.message);
		} else {
			console.log(
				"Failed to send enabled/disabled message to tab "+
				id+", retrying once.");
			setTimeout(() => sendTabEnabled(id, true), 100);
		}
	});
}

async function toggle() {
	enabled = !enabled;

	var name = "assets/"+(enabled ? "icon" : "icon-off");
	var title = enabled ? "Turn off Mouseless" : "Turn on Mouseless";

	var a;
	browser.browserAction.setIcon(a = {
		path: name+"-48.png"
	});

	browser.browserAction.setTitle({ title });

	var tabs = await browser.tabs.query({});
	for (var i in tabs)
		sendTabEnabled(tabs[i].id);
}
toggle();

browser.browserAction.onClicked.addListener(toggle);

browser.tabs.onUpdated.addListener((id, evt) => {
	if (evt.status === "complete")
		sendTabEnabled(id);
});

async function getCurrTabOffset(off) {
	var win = await browser.windows.getCurrent();
	var tab = (await browser.tabs.query({ active: true, windowId: win.id }))[0];
	var tabCount = (await browser.tabs.query({ windowId: win.id })).length;

	var idx = tab.index + off;
	if (idx < 0)
		idx = tabCount - 1;
	else if (idx >= tabCount)
		idx = 0;

	return [ tab, win, idx ]
}

var bridge = {
	changeTabLeft: async function() {
		var [ _, win, index ] = await getCurrTabOffset(-1);
		var ntab = (await browser.tabs.query({ windowId: win.id, index }))[0];
		browser.tabs.update(ntab.id, { active: true });
	},
	changeTabRight: async function() {
		var [ _, win, index ] = await getCurrTabOffset(1);
		var ntab = (await browser.tabs.query({ windowId: win.id, index }))[0];
		browser.tabs.update(ntab.id, { active: true });
	},

	moveTabLeft: async function() {
		var [ tab, _, index ] = await getCurrTabOffset(-1);
		browser.tabs.move(tab.id, { index });
	},
	moveTabRight: async function() {
		var [ tab, _, index ] = await getCurrTabOffset(1);
		browser.tabs.move(tab.id, { index });
	},

	openTab: function(href) {
		browser.tabs.create({
			url: href
		});
	},
};

browser.runtime.onMessage.addListener(function(msg) {
	var fn = bridge[msg.action];
	if (!fn)
		throw new Error("No such action: "+msg.action);

	fn.apply(null, msg.args);
});
