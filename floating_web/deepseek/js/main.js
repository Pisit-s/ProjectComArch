/* =========================================================
   main.js — shared UI behaviours: nav toggle, tabs, copy
   (loaded on every page)
   ========================================================= */
(function () {
  "use strict";

  /* --- Mobile nav toggle --- */
  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.getElementById("site-nav");
  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = siteNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
    // Close menu when a link is clicked (nice on mobile)
    siteNav.addEventListener("click", (e) => {
      if (e.target.closest("a") && siteNav.classList.contains("open")) {
        siteNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* --- Generic tab switching (role=tablist / role=tab) --- */
  document.querySelectorAll('[role="tablist"]').forEach((tablist) => {
    const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => {
          const panel = document.getElementById(t.getAttribute("aria-controls"));
          const selected = t === tab;
          t.setAttribute("aria-selected", String(selected));
          t.classList.toggle("active", selected);
          if (panel) panel.hidden = !selected;
        });
      });
    });
  });

  /* --- Copy helper used by encoder tools ---
     Exposed globally: window.BinaryLab.copyToClipboard(text, buttonEl) */
  async function copyToClipboard(text, buttonEl) {
    try {
      await navigator.clipboard.writeText(text);
      if (buttonEl) {
        const original = buttonEl.textContent;
        buttonEl.textContent = "คัดลอกแล้ว ✓";
        buttonEl.disabled = true;
        setTimeout(() => { buttonEl.textContent = original; buttonEl.disabled = false; }, 1400);
      }
    } catch {
      // Fallback for non-secure contexts
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch { /* ignore */ }
      document.body.removeChild(ta);
    }
  }

  window.BinaryLab = window.BinaryLab || {};
  window.BinaryLab.copyToClipboard = copyToClipboard;
})();