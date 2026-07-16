// Grupo Patrón — vanilla JS (no jQuery / Bootstrap / AOS / Owl Carousel)

document.addEventListener("DOMContentLoaded", function () {
	initNav();
	initNavScroll();
	initScrollReveal();
	initProductTabs();
	initScrollRestore();
	initYear();
	initCounters();
});

// Keep the footer copyright year current
function initYear() {
	var el = document.getElementById("year");
	if (el) el.textContent = new Date().getFullYear();
}

// Mobile navigation toggle
function initNav() {
	var toggle = document.querySelector(".nav-toggle");
	var links = document.querySelector(".nav-links");
	if (!toggle || !links) return;

	toggle.addEventListener("click", function () {
		var isOpen = links.classList.toggle("is-open");
		toggle.classList.toggle("is-open", isOpen);
		toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
	});

	links.querySelectorAll("a").forEach(function (link) {
		link.addEventListener("click", function () {
			links.classList.remove("is-open");
			toggle.classList.remove("is-open");
			toggle.setAttribute("aria-expanded", "false");
		});
	});
}

// Transparent navbar over the hero/banner, solid once scrolled (or mobile menu open)
function initNavScroll() {
	var nav = document.querySelector(".navbar");
	var links = document.querySelector(".nav-links");
	var toggle = document.querySelector(".nav-toggle");
	if (!nav) return;

	function update() {
		var menuOpen = links && links.classList.contains("is-open");
		nav.classList.toggle("scrolled", window.scrollY > 40 || !!menuOpen);
	}

	window.addEventListener("scroll", update, { passive: true });
	if (toggle) toggle.addEventListener("click", update);
	update();
}

// Fade-up on scroll (replaces AOS)
function initScrollReveal() {
	var items = document.querySelectorAll("[data-reveal]");
	if (!items.length) return;

	if (!("IntersectionObserver" in window)) {
		items.forEach(function (el) { el.classList.add("is-visible"); });
		return;
	}

	var observer = new IntersectionObserver(
		function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					entry.target.classList.add("is-visible");
					observer.unobserve(entry.target);
				}
			});
		},
		{ threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
	);

	items.forEach(function (el) { observer.observe(el); });

	// Safety net: guarantee content isn't stuck invisible if the observer
	// never fires (e.g. tab opened in the background).
	window.setTimeout(function () {
		items.forEach(function (el) { el.classList.add("is-visible"); });
		observer.disconnect();
	}, 2500);
}

// Brand tabs for the product showcase (productos.html)
function initProductTabs() {
	var tabs = document.querySelectorAll(".product-tab");
	var panels = document.querySelectorAll(".product-panel");
	if (!tabs.length) return;

	function activate(name) {
		tabs.forEach(function (tab) {
			var isActive = tab.dataset.tab === name;
			tab.classList.toggle("active", isActive);
			tab.setAttribute("aria-selected", isActive ? "true" : "false");
		});
		panels.forEach(function (panel) {
			panel.hidden = panel.id !== "panel-" + name;
		});
	}

	tabs.forEach(function (tab) {
		tab.addEventListener("click", function () {
			activate(tab.dataset.tab);
		});
	});
}

// Quick count-up animation for the stat numbers (index.html, nosotros.html)
function initCounters() {
	var items = document.querySelectorAll("[data-count-to]");
	if (!items.length) return;

	function render(el, value, suffix) {
		var formatted = value.toLocaleString("es-MX");
		el.textContent = "";
		if (suffix.charAt(suffix.length - 1) === "+") {
			el.appendChild(document.createTextNode(formatted + suffix.slice(0, -1)));
			var plusEl = document.createElement("span");
			plusEl.className = "stat-suffix-plus";
			plusEl.textContent = "+";
			el.appendChild(plusEl);
		} else {
			el.appendChild(document.createTextNode(formatted + suffix));
		}
	}

	function animate(el) {
		var target = parseInt(el.dataset.countTo, 10);
		var suffix = el.dataset.suffix || "";
		var duration = 900;
		var start = null;

		function step(timestamp) {
			if (start === null) start = timestamp;
			var progress = Math.min((timestamp - start) / duration, 1);
			var eased = 1 - Math.pow(1 - progress, 3);
			render(el, Math.round(target * eased), suffix);
			if (progress < 1) {
				window.requestAnimationFrame(step);
			}
		}

		window.requestAnimationFrame(step);
	}

	if (!("IntersectionObserver" in window)) {
		items.forEach(function (el) {
			render(el, parseInt(el.dataset.countTo, 10), el.dataset.suffix || "");
		});
		return;
	}

	var observer = new IntersectionObserver(
		function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					animate(entry.target);
					observer.unobserve(entry.target);
				}
			});
		},
		{ threshold: 0.4 }
	);

	items.forEach(function (el) { observer.observe(el); });
}

// Preserve original behaviour: don't restore scroll position on reload
function initScrollRestore() {
	if ("scrollRestoration" in history) {
		history.scrollRestoration = "manual";
	} else {
		window.onbeforeunload = function () {
			window.scrollTo(0, 0);
		};
	}
}
