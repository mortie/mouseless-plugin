var enabled = false;

function toggle() {
	enabled = !enabled;

	var name = "assets/"+(enabled ? "icon" : "icon-off");
	var title = enabled ? "Turn off" : "Turn on";

	var a;
	browser.browserAction.setIcon(a = {
		path: name+"-48.png"
	});
	console.log(JSON.stringify(a));

	browser.browserAction.setTitle({ title });
}
toggle();

browser.browserAction.onClicked.addListener(toggle);

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
