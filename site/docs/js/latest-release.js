// Points download links at the newest published Crater release.
//
// Release assets carry the version in their file names
// (Crater-Setup-0.7.1.exe), so a static link goes stale the moment a new
// version ships. Every download link on the site is written against a known
// release and tagged with data-crater-asset; this script swaps in the current
// release's URL when GitHub answers, and leaves the static link alone when it
// doesn't (offline, rate limited, blocked).

(function () {
	var API = "https://api.github.com/repos/vygr-labs/crater-v2/releases/latest";
	var CACHE_KEY = "crater-latest-release";
	var CACHE_MS = 60 * 60 * 1000;

	var PATTERNS = {
		"win-setup": /^Crater-Setup-[\d.]+\.exe$/,
		"win-zip": /^Crater-[\d.]+-win64\.zip$/,
		"mac-dmg": /^Crater-[\d.]+-macos\.dmg$/,
		"mac-zip": /^Crater-[\d.]+-macos\.zip$/,
		checksums: /^SHA256SUMS\.txt$/,
	};

	function readCache() {
		try {
			var raw = sessionStorage.getItem(CACHE_KEY);
			if (!raw) return null;
			var entry = JSON.parse(raw);
			return Date.now() - entry.at < CACHE_MS ? entry.release : null;
		} catch (e) {
			return null;
		}
	}

	function writeCache(release) {
		try {
			sessionStorage.setItem(
				CACHE_KEY,
				JSON.stringify({ at: Date.now(), release: release }),
			);
		} catch (e) {}
	}

	function formatSize(bytes) {
		return Math.round(bytes / (1024 * 1024)) + " MB";
	}

	function apply(release) {
		var assets = {};
		release.assets.forEach(function (asset) {
			Object.keys(PATTERNS).forEach(function (key) {
				if (PATTERNS[key].test(asset.name)) assets[key] = asset;
			});
		});

		document.querySelectorAll("[data-crater-asset]").forEach(function (link) {
			var asset = assets[link.getAttribute("data-crater-asset")];
			if (asset) link.href = asset.url;
		});
		document.querySelectorAll("[data-crater-size]").forEach(function (el) {
			var asset = assets[el.getAttribute("data-crater-size")];
			if (asset) el.textContent = formatSize(asset.size);
		});
		document.querySelectorAll("[data-crater-version]").forEach(function (el) {
			el.textContent = release.tag;
		});
		document
			.querySelectorAll("[data-crater-release-page]")
			.forEach(function (link) {
				link.href = release.page;
			});
	}

	function run() {
		if (!document.querySelector("[data-crater-asset], [data-crater-version]"))
			return;

		var cached = readCache();
		if (cached) return apply(cached);

		fetch(API, { headers: { Accept: "application/vnd.github+json" } })
			.then(function (res) {
				if (!res.ok) throw new Error("GitHub answered " + res.status);
				return res.json();
			})
			.then(function (data) {
				var release = {
					tag: data.tag_name,
					page: data.html_url,
					assets: data.assets.map(function (a) {
						return { name: a.name, url: a.browser_download_url, size: a.size };
					}),
				};
				writeCache(release);
				apply(release);
			})
			.catch(function () {});
	}

	if (document.readyState === "loading")
		document.addEventListener("DOMContentLoaded", run);
	else run();
})();
