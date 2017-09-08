
var presets = {
	qwerty_us: {
		scroll_up: "k",
		scroll_down: "l",
		scroll_up_fast: "<Shift>_",
		scroll_down_fast: "<Shift>+",
		blobs_show: "h",
		blobs_hide: "Escape",
		blobs_click: "Enter",
		blobs_click_new_tab: "<Shift>Enter",
		blobs_click_clipboard: "<Control>Enter",
		blobs_backspace: "Backspace",
		elem_deselect: "Escape",
		change_tab_left: "j",
		change_tab_right: ";",
		move_tab_left: "<Shift>J",
		move_tab_right: "<Shift>;",
		history_back: "<Control>j",
		history_forward: "<Control>;",
	},

	qwerty_no: {
		scroll_up: "k",
		scroll_down: "l",
		scroll_up_fast: "<Shift>?",
		scroll_down_fast: "<Shift>`",
		blobs_show: "h",
		blobs_hide: "Escape",
		blobs_click: "Enter",
		blobs_click_new_tab: "<Shift>Enter",
		blobs_click_clipboard: "<Control>Enter",
		blobs_backspace: "Backspace",
		elem_deselect: "Escape",
		change_tab_left: "j",
		change_tab_right: ";",
		move_tab_left: "<Shift>J",
		move_tab_right: "<Shift>ø",
		history_back: "<Control>j",
		history_forward: "<Control>ø",
	},

	dvorak: {
		scroll_up: "t",
		scroll_down: "n",
		scroll_up_fast: "<Shift>{",
		scroll_down_fast: "<Shift>}",
		blobs_show: "d",
		blobs_hide: "Escape",
		blobs_click: "Enter",
		blobs_click_new_tab: "<Shift>Enter",
		blobs_click_clipboard: "<Control>Enter",
		blobs_backspace: "Backspace",
		elem_deselect: "Escape",
		change_tab_left: "h",
		change_tab_right: "s",
		move_tab_left: "<Shift>H",
		move_tab_right: "<Shift>S",
		history_back: "<Control>h",
		history_forward: "<Control>s",
	},
};

var defaultPreset = "qwerty_us";

function forEachOption(cb) {
	var opts = document.querySelectorAll("form .option");

	for (var i in opts) {
		if (!opts.hasOwnProperty(i)) continue;
		var name = opts[i].getAttribute("name");
		var curr = opts[i].querySelector(".current");
		cb(opts[i], name, curr);
	}
}

// Select preset
document.querySelector("select").addEventListener("change", e => {
	if (!e.target.value)
		return;

	var preset = e.target.value;
	forEachOption((el, name, curr) => {
		curr.value = presets[preset][name];
	});
});

// Save options
document.querySelector("form").addEventListener("submit", e => {
	e.preventDefault();

	var opts = document.querySelectorAll("form .option");
	var vals = {};

	forEachOption((el, name, curr) => {
		vals[name] = curr.value;
	});
	browser.storage.local.set(vals);
});

// Load options
async function loadOpts() {
	var opts = document.querySelectorAll("form .option");

	var keys = [];

	forEachOption((el, name) => keys.push(name));

	var vals = await browser.storage.local.get(keys);

	forEachOption((el, name, curr) => {
		var saved = vals[name];

		var def = presets[defaultPreset][name];

		curr.value = saved == null ? def : saved;
	});
}
document.addEventListener("DOMContentLoaded", loadOpts);
