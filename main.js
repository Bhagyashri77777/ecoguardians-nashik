/* =========================================================
   EcoGuardians — shared behaviour
   Mobile nav, scroll reveal, progress bar, counters,
   animated bars, lightbox, GPS helper
   ========================================================= */
(function () {
  "use strict";

  /* ---------- mobile nav ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.classList.remove("open");
      });
    });
  }

  /* ---------- scroll progress + back to top ---------- */
  var bar = document.getElementById("progress");
  var toTop = document.getElementById("toTop");
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
    if (bar) bar.style.width = pct + "%";
    if (toTop) toTop.classList.toggle("show", h.scrollTop > 500);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- reveal on scroll ---------- */
  var revealables = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealables.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealables.forEach(function (el) {
      el.classList.add("in");
    });
  }

  /* ---------- animated bars & counters ---------- */
  function animateBars(root) {
    root.querySelectorAll(".bar-fill,.fill").forEach(function (f) {
      var w = f.getAttribute("data-w") || f.dataset.w || "0";
      f.style.width = w + "%";
    });
  }
  function animateCounters(root) {
    root.querySelectorAll("[data-count]").forEach(function (el) {
      var target = parseFloat(el.getAttribute("data-count"));
      if (isNaN(target)) return;
      var suffix = el.getAttribute("data-suffix") || "";
      var pad = el.getAttribute("data-pad") === "true";
      var dur = 1100,
        start = null;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        var val = Math.round(target * eased);
        el.textContent = (pad && val < 10 ? "0" : "") + val + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }
  var animateTargets = document.querySelectorAll("[data-animate]");
  if ("IntersectionObserver" in window) {
    var io2 = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            animateBars(e.target);
            animateCounters(e.target);
            io2.unobserve(e.target);
          }
        });
      },
      { threshold: 0.25 }
    );
    animateTargets.forEach(function (el) {
      io2.observe(el);
    });
  } else {
    animateTargets.forEach(function (el) {
      animateBars(el);
      animateCounters(el);
    });
  }

  /* ---------- gallery lightbox ---------- */
  var lb = document.getElementById("lightbox");
  if (lb) {
    var lbImg = lb.querySelector("img");
    var lbCap = lb.querySelector(".lb-cap");
    document.querySelectorAll("[data-lightbox]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        lbImg.src = btn.getAttribute("data-src") || (btn.querySelector("img") || {}).src;
        lbImg.alt = btn.getAttribute("data-cap") || "";
        if (lbCap) lbCap.textContent = btn.getAttribute("data-cap") || "";
        lb.classList.add("open");
        document.body.style.overflow = "hidden";
      });
    });
    function close() {
      lb.classList.remove("open");
      document.body.style.overflow = "";
    }
    lb.addEventListener("click", function (e) {
      if (e.target === lb || e.target.classList.contains("lb-close")) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  /* ---------- GPS helper (community form) ---------- */
  window.useGPS = function () {
    var input = document.getElementById("locationInput");
    if (!input) return;
    if (!navigator.geolocation) {
      input.value = "GPS is not supported by this browser.";
      return;
    }
    input.value = "Locating…";
    navigator.geolocation.getCurrentPosition(
      function (p) {
        input.value =
          p.coords.latitude.toFixed(6) + ", " + p.coords.longitude.toFixed(6);
      },
      function () {
        input.value = "GPS unavailable — enter location manually.";
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  /* ---------- publish report (demo confirmation) ---------- */
  window.publishReport = function () {
    var note = document.getElementById("publishNote");
    if (!note) return;
    note.style.display = "block";
    note.textContent =
      "Demo build: this form is a front-end prototype. To collect real submissions, connect it to a free service such as Google Forms or Formspree.";
    note.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  /* ---------- footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
