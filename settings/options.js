
var presets = {
	qwerty_us: {
		conf: {
			chars: ";alskdjfir",
			blacklist: "",
		},
		keys: {
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
			move_tab_right: "<Shift>:",
			history_back: "<Control>j",
			history_forward: "<Control>;",
		},
	},

	qwerty_no: {
		conf: {
			chars: "øalskdjfir",
			blacklist: "",
		},
		keys: {
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
			change_tab_right: "ø",
			move_tab_left: "<Shift>J",
			move_tab_right: "<Shift>ø",
			history_back: "<Control>j",
			history_forward: "<Control>ø",
		},
	},

	azerty: {
		conf: {
			chars: "mqlskdjfir",
			blacklist: "",
		},
		keys: {
			scroll_up: "k",
			scroll_down: "l",
			scroll_up_fast: "<Shift>°",
			scroll_down_fast: "<Shift>+",
			blobs_show: "h",
			blobs_hide: "Escape",
			blobs_click: "Enter",
			blobs_click_new_tab: "<Shift>Enter",
			blobs_click_clipboard: "<Control>Enter",
			blobs_backspace: "Backspace",
			elem_deselect: "Escape",
			change_tab_left: "j",
			change_tab_right: "m",
			move_tab_left: "<Shift>J",
			move_tab_right: "<Shift>M",
			history_back: "<Control>j",
			history_forward: "<Control>m",
		},
	},

	dvorak: {
		conf: {
			chars: "sanotehucp",
			blacklist: "",
		},
		keys: {
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
	},

	colemak: {
		conf: {
			chars: "oairesntup",
			blacklist: "",
		},
		keys: {
			scroll_up: "e",
			scroll_down: "i",
			scroll_up_fast: "<Shift>{",
			scroll_down_fast: "<Shift>}",
			blobs_show: "h",
			blobs_hide: "Escape",
			blobs_click: "Enter",
			blobs_click_new_tab: "<Shift>Enter",
			blobs_click_clipboard: "<Control>Enter",
			blobs_backspace: "Backspace",
			elem_deselect: "Escape",
			change_tab_left: "n",
			change_tab_right: "o",
			move_tab_left: "<Shift>N",
			move_tab_right: "<Shift>O",
			history_back: "<Control>n",
			history_forward: "<Control>o",
		},
	},
};

var defaultPreset = presets.qwerty_us;

function forEachOption(cb) {
	var opts = document.querySelectorAll("form .option");

	for (var i in opts) {
		if (!opts.hasOwnProperty(i)) continue;
		var str = opts[i].getAttribute("name");
		var [ section, name ] = str.split(".");
		var curr = opts[i].querySelector(".current");
		cb(opts[i], section, name, curr);
	}
}

// Select preset
document.querySelector("select").addEventListener("change", e => {
	if (!e.target.value)
		return;

	var preset = e.target.value;
	forEachOption((el, section, name, curr) => {
		curr.value = presets[preset][section][name];
	});
});

// Save options
document.querySelector("form").addEventListener("submit", e => {
	e.preventDefault();

	var opts = document.querySelectorAll("form .option");
	var vals = {};

	forEachOption((el, section, name, curr) => {
		vals[section] = vals[section] || {};
		vals[section][name] = curr.value;
	});
	browser.storage.local.set(vals);
});

// Load options
async function loadOpts() {
	var opts = document.querySelectorAll("form .option");

	var vals = await browser.storage.local.get([ "keys", "conf" ]);

	forEachOption((el, section, name, curr) => {
		var sec = vals[section] || {};
		var saved = sec[name];

		var def = defaultPreset[section][name];

		curr.value = saved == null ? def : saved;
	});
}
document.addEventListener("DOMContentLoaded", loadOpts);
