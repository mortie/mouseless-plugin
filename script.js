var conf = {
	scroll_speed: 0.3,
	scroll_speed_fast: 1.1,
	scroll_friction: 0.8,
	chars: "SANOTEHUCP",
	input_whitelist: ["checkbox", "radio", "hidden", "submit", "reset", "button", "file", "image"],
	location_change_check_timeout: 2000
}

var keys = {};

bridge.onConf(function(c) {
	for (var i in c) {
		conf[i] = c[i];
	}
});

bridge.onKeys(function(k) {
	keys = k;
});

function isMatch(k, evt) {
	if ((k.code === evt.key)
	&& (!!k.ctrlKey == evt.ctrlKey)
	&& (!!k.shiftKey == evt.shiftKey)
	&& (!!k.altKey == evt.altKey)
	&& (!!k.metaKey == evt.metaKey)) {
		return true;
	}

	return false;
}

//There's a lot we don't want to do if we're not on an actual webpage, but on
//the "speed dial"-ish pages.
var onWebPage = (document.body !== undefined);

function createKey(n) {
	var str = "";
	var base = conf.chars.length;

	if (n == 0)
		return conf.chars[0];

	while (n > 0) {
		str += conf.chars[n % base];
		n = Math.floor(n / base);
	}

	return str;
}

function getElemPos(elem) {
	var curtop = 0;
	var curleft = 0;

	do {
		curtop += elem.offsetTop;
		curleft += elem.offsetLeft;
	} while (elem = elem.offsetParent);

	return {top: curtop, left: curleft};
}

var blobList = {
	blobs: {},
	container: null,
	overview: null,

	visible: false,
	needLoadBlobs: true,

	currentKey: "",

	createContainer: function() {
		var container = document.createElement("div");
		container.style = [
			"pointer-events: none",
			"display: none",
			"position: absolute;",
			"top: 0px",
			"left: 0px",
			"z-index: 2147483647",
			"box-sizing: content-box",
			""
		].join(" !important;");
		document.body.appendChild(container);
		blobList.container = container;
	},

	createOverview: function() {
		var overview = document.createElement("div");
		overview.style = [
			"position: fixed",
			"top: 0px",
			"left: 0px",
			"background-color: white",
			"border-bottom: 2px solid black",
			"border-right: 2px solid black",
			"color: black",
			"font: 12px sans-serif",
			"padding: 3px",
			"height: 15px",
			"line-height: 15px",
			"z-index: 2147483647",
			"box-sizing: content-box",
			""
		].join(" !important;");
		blobList.container.appendChild(overview);
		blobList.overview = overview;
	},

	init: function() {
		if (!onWebPage)
			return;

		blobList.createContainer();

		window.addEventListener("scroll", function() {
			blobList.needLoadBlobs = true;
		});
	},

	currentIndex: 0,
	loadBlobs: function() {
		if (!onWebPage)
			return;

		var linkElems = document.querySelectorAll("a, button, input, textarea");

		//Remove old container contents
		blobList.container.innerHTML = "";
		blobList.createOverview();

		//Remove old blobs
		blobList.blobs = {};

		var i = 0;
		var nRealBlobs = 0;
		function addBlob() {
			var linkElem = linkElems[i];

			if (i++ >= linkElems.length)
				return false;

			if (linkElem === undefined)
				return true;

			//We don't want hidden elements
			if ((linkElem === undefined)
			||  (linkElem.style.display == "none")
			||  (linkElem.style.visibility == "hidden")) {
				return true;
			}

			//Get element's absolute position
			var pos = getElemPos(linkElem);
	
			//Lots of things which don't really exist have an X and Y value of 0
			if (pos.top == 0 && pos.left == 0)
				return true;

			//We don't need to get things far above our current scroll position
			if (pos.top < (window.scrollY - 100))
				return true;

			//We don't need things below our scroll position either
			if (pos.top - 100 > (window.scrollY + window.innerHeight))
				return true;

			//Create the blob's key
			key = createKey(nRealBlobs);
			nRealBlobs += 1;

			var blobElem = document.createElement("div");
			blobElem.innerHTML = key.toUpperCase();
			blobElem.style = [
				"position: absolute",
				"background-color: yellow",
				"border: 1px solid black",
				"border-radius: 10px",
				"padding-left: 3px",
				"padding-right: 3px",
				"color: black",
				"font: 12px sans-serif",
				"top: "+pos.top+"px",
				"left: "+pos.left+"px",
				"line-height: 12px",
				"font-size: 12px",
				""
			].join(" !important;");
			blobList.container.appendChild(blobElem);

			blobList.blobs[key] = {
				blobElem: blobElem,
				linkElem: linkElem
			}

			return true;
		}

		while (addBlob()) {};

	},

	showBlobs: function() {
		blobList.visible = true;
		blobList.container.style.display = "block";
	},

	hideBlobs: function() {
		blobList.currentKey = "";
		blobList.visible = false;
		blobList.container.style.display = "none";
	},

	click: function() {
		if (!blobList.visible)
			return;

		var blob = blobList.blobs[blobList.currentKey];
		if (!blob)
			return;

		if (blob.linkElem.tagName == "A") {
			blobList.hideBlobs();
			location.href = blob.linkElem.href;
		} else {
			blobList.hideBlobs();
			blob.linkElem.click();
			blob.linkElem.focus();
		}
	},

	clickNewTab: function() {
		if (!blobList.visible)
			return;

		var blob = blobList.blobs[blobList.currentKey];
		if (!blob)
			return;

		blobList.hideBlobs();
		if (blob.linkElem.tagName == "A" && blob.linkElem.href) {
			bridge.openTab(blob.linkElem.href);
		} else {
			blob.linkElem.click();
			blob.linkElem.focus();
		}
	},

	clickClipboard: function() {
		if (!blobList.visible)
			return;

		var blob = blobList.blobs[blobList.currentKey];
		if (!blob)
			return;

		if (!blob.linkElem.href)
			return;

		bridge.setClipboard(blob.linkElem.href);

		blobList.hideBlobs();
	},

	appendKey: function(c) {
		blobList.currentKey += c;
		blobList.overview.innerHTML = blobList.currentKey;
	},

	backspace: function() {
		blobList.currentKey = blobList.currentKey.substring(0, blobList.currentKey.length - 1);
		blobList.overview.innerHTML = blobList.currentKey;
	}
}
blobList.init();

//Reload blobs whenever the URL changes
var currentUrl = location.href;
setInterval(function() {
	if (currentUrl !== location.href) {
		blobList.loadBlobs();
	}
	currentUrl = location.href;
}, conf.location_change_check_timeout);

var pressedKeys = [];

function inArray(arr, val) {
	return (arr.indexOf(val) !== -1);
}

function isValidElem(elem) {
	var tag = elem.tagName.toLowerCase();

	if (tag === "textarea")
		return false;

	if (tag === "select")
		return false;

	if (tag === "canvas")
		return false;

	if (elem.contentEditable.toLowerCase() === "true")
		return false;

	if ((tag === "input")
	&&  (!inArray(conf.input_whitelist, elem.type.toLowerCase()))) {
		return false;
	}

	return true;
}

window.addEventListener("keydown", function(evt) {
	if (/about:.+/.test(location.href))
		return;

	var active = document.activeElement;

	//We don't want to do anything if the user is tpying in an input field,
	//unless the key is to deselect an input field
	if (!isValidElem(active)) {
		if (isMatch(keys.elem_deselect, evt)) {
			active.blur();
			blobList.hideBlobs();
			return;
		} else {
			return;
		}
	}

	//User is typing a key to a blob
	if (blobList.visible) {

		//Hide blobs if appropriate
		if (isMatch(keys.blobs_hide, evt)) {
			blobList.hideBlobs();
			return;
		}

		//Backspace if appropriate
		if (isMatch(keys.blobs_backspace, evt)) {
			blobList.backspace();
			return;
		}

		var c = evt.key;
		if (conf.chars.indexOf(c) !== -1) {
			blobList.appendKey(c);
			evt.preventDefault();
			evt.stopPropagation();
			return false;
		}
	}

	//Handle other key presses

	//Deselect element
	if (onWebPage && isMatch(keys.elem_deselect, evt)) {
		blobList.hideBlobs();
		active.blur();

	//Show/hide/reload blobs
	} else if (onWebPage && !blobList.visible && isMatch(keys.blobs_show, evt)) {
		blobList.loadBlobs();
		blobList.needLoadBlobs = false;
		blobList.showBlobs();
	} else if (onWebPage && blobList.visible && isMatch(keys.blobs_hide, evt)) {
		blobList.hideBlobs();

	//Simulate clicks
	} else if (onWebPage && blobList.visible && isMatch(keys.blobs_click, evt)) {
		blobList.click();
	} else if (onWebPage && blobList.visible && isMatch(keys.blobs_click_new_tab, evt)) {
		blobList.clickNewTab();
	} else if (onWebPage && blobList.visible && isMatch(keys.blobs_click_clipboard, evt)) {
		blobList.clickClipboard();

	//Scrolling
	} else if (onWebPage && isMatch(keys.scroll_up, evt)) {
		scroll.start(-conf.scroll_speed);
	} else if (onWebPage && isMatch(keys.scroll_down, evt)) {
		scroll.start(conf.scroll_speed);
	} else if (onWebPage && isMatch(keys.scroll_up_fast, evt)) {
		scroll.start(-conf.scroll_speed_fast);
	} else if (onWebPage && isMatch(keys.scroll_down_fast, evt)) {
		scroll.start(conf.scroll_speed_fast);

	//Back and forwards
	} else if (isMatch(keys.history_back, evt)) {
		history.back();
	} else if (isMatch(keys.history_forward, evt)) {
		history.forward();

	//Change tab
	} else if (isMatch(keys.change_tab_left, evt)) {
		bridge.changeTabLeft();
	} else if (isMatch(keys.change_tab_right, evt)) {
		bridge.changeTabRight();

	//Move tab
	} else if (isMatch(keys.move_tab_left, evt)) {
		bridge.moveTabLeft();
	} else if (isMatch(keys.move_tab_right, evt)) {
		bridge.moveTabRight();

	//We don't want to stop the event from propagating
	//if it hasn't matched anything yet
	} else {
		return true;
	}

	evt.preventDefault();
	evt.stopPropagation();
	return false;
}, true);

window.addEventListener("keyup", function(evt) {
	if ((isMatch(keys.scroll_up, evt))
	||  (isMatch(keys.scroll_down, evt))
	||  (isMatch(keys.scroll_up_fast, evt))
	||  (isMatch(keys.scroll_down_fast, evt))) {
		scroll.stop();
	}
}, true);

var scroll = {
	start: function(acceleration) {
		scroll.acceleration = acceleration;

		if (scroll.raf == null)
			scroll.update();
	},

	stop: function() {
		scroll.acceleration = 0;
	},

	update: function() {
		var tdiff = scroll.endTime - scroll.startTime;
		if (tdiff < 100) {
			scroll.velocity += scroll.acceleration;
			window.scrollBy(0, scroll.velocity * tdiff);
			scroll.velocity *= conf.scroll_friction;
		}

		if (tdiff < 100 && scroll.velocity > -0.1 && scroll.velocity < 0.1) {
			scroll.velocity = 0;
			cancelAnimationFrame(scroll.raf);
			scroll.raf = null;
		} else {
			scroll.startTime = scroll.endTime;
			scroll.endTime = new Date().getTime();
			scroll.raf = requestAnimationFrame(scroll.update);
		}
	},

	raf: null,
	acceleration: 0,
	velocity: 0,
	startDate: 0,
	endDate: 0
}
