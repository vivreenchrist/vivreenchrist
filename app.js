/* Académie Vivre en Christ — comportements du site
   Tout est en local : aucune donnée n'est envoyée à un serveur. */
(function () {
  "use strict";

  var STORAGE_THEME = "vec_theme";
  var STORAGE_PROGRESS = "vec_progress_v1";

  // ---------------------------------------------------------------- thème
  function applyTheme(t) {
    if (t === "dark") document.documentElement.setAttribute("data-theme", "dark");
    else document.documentElement.removeAttribute("data-theme");
  }
  function currentTheme() {
    return localStorage.getItem(STORAGE_THEME) ||
      (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }
  applyTheme(currentTheme());

  document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.getElementById("theme-toggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        applyTheme(next);
        localStorage.setItem(STORAGE_THEME, next);
      });
    }

    // -------------------------------------------------------------- drawer
    var openBtn = document.getElementById("nav-open");
    var closeBtn = document.getElementById("nav-close");
    var backdrop = document.querySelector(".drawer-backdrop");
    function openDrawer() { document.body.classList.add("drawer-open"); }
    function closeDrawer() { document.body.classList.remove("drawer-open"); }
    if (openBtn) openBtn.addEventListener("click", openDrawer);
    if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
    if (backdrop) backdrop.addEventListener("click", closeDrawer);

    // ---------------------------------------------------------- progression
    var steps = window.__VEC_STEPS__ || [];
    var slug = window.__VEC_SLUG__ || "";

    function getDone() {
      try { return JSON.parse(localStorage.getItem(STORAGE_PROGRESS)) || []; }
      catch (e) { return []; }
    }
    function setDone(arr) {
      localStorage.setItem(STORAGE_PROGRESS, JSON.stringify(arr));
    }
    function markDone(s) {
      var d = getDone();
      if (d.indexOf(s) === -1) { d.push(s); setDone(d); }
    }
    function unmarkDone(s) {
      var d = getDone().filter(function (x) { return x !== s; });
      setDone(d);
    }
    function isDone(s) { return getDone().indexOf(s) !== -1; }

    // decorate drawer nav ticks
    document.querySelectorAll(".drawer-list a[data-slug]").forEach(function (a) {
      if (isDone(a.getAttribute("data-slug"))) a.classList.add("done");
    });

    // decorate homepage step cards
    document.querySelectorAll(".step-card[data-slug]").forEach(function (card) {
      if (isDone(card.getAttribute("data-slug"))) card.classList.add("is-done");
    });

    // progress rail + stat
    var railFill = document.getElementById("progress-fill");
    if (railFill && steps.length) {
      var doneCount = steps.filter(function (s) { return isDone(s.slug); }).length;
      var pct = Math.round((doneCount / steps.length) * 100);
      railFill.style.width = pct + "%";
    }
    document.querySelectorAll("[data-progress-count]").forEach(function (el) {
      var doneCount = steps.filter(function (s) { return isDone(s.slug); }).length;
      el.textContent = doneCount;
    });
    document.querySelectorAll("[data-progress-total]").forEach(function (el) {
      el.textContent = steps.length;
    });
    document.querySelectorAll("[data-progress-pct]").forEach(function (el) {
      var doneCount = steps.filter(function (s) { return isDone(s.slug); }).length;
      el.textContent = steps.length ? Math.round((doneCount / steps.length) * 100) : 0;
    });

    // mark-done checkbox on a content page
    var checkbox = document.getElementById("mark-done-checkbox");
    if (checkbox && slug) {
      checkbox.checked = isDone(slug);
      checkbox.addEventListener("change", function () {
        if (checkbox.checked) markDone(slug); else unmarkDone(slug);
      });
    }

    // auto-mark as done when the reader clicks "Suivant"
    var nextLink = document.getElementById("next-step-link");
    if (nextLink && slug) {
      nextLink.addEventListener("click", function () { markDone(slug); });
    }

    // print button
    var printBtn = document.getElementById("print-btn");
    if (printBtn) printBtn.addEventListener("click", function () { window.print(); });

    // reset progress (used on the home page, optional utility)
    var resetBtn = document.getElementById("reset-progress");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        if (confirm("Effacer votre progression enregistrée sur cet appareil ?")) {
          localStorage.removeItem(STORAGE_PROGRESS);
          location.reload();
        }
      });
    }
  });
})();
