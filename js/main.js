(() => {
  "use strict";

  // Year in footer
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Header shadow on scroll
  const header = document.getElementById("siteHeader");
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 8);
  };
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile menu
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("mobileMenu");
  if (toggle && menu) {
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      menu.hidden = !open;
      document.body.style.overflow = open ? "hidden" : "";
    };
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      setOpen(open);
    });
    menu.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => setOpen(false))
    );
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  // Lightbox — groups by data-gallery
  const lightbox = document.getElementById("lightbox");
  const lbImage = document.getElementById("lbImage");
  const lbCaption = document.getElementById("lbCaption");
  const lbClose = document.getElementById("lbClose");
  const lbPrev = document.getElementById("lbPrev");
  const lbNext = document.getElementById("lbNext");
  const triggers = Array.from(document.querySelectorAll("[data-gallery]"));

  if (lightbox && triggers.length) {
    let currentGroup = [];
    let currentIndex = 0;
    let lastTrigger = null;

    const show = (i) => {
      if (!currentGroup.length) return;
      currentIndex = (i + currentGroup.length) % currentGroup.length;
      const btn = currentGroup[currentIndex];
      lbImage.src = btn.getAttribute("data-img");
      lbImage.alt = btn.querySelector("img")?.alt || "";
      lbCaption.textContent = btn.getAttribute("data-caption") || "";
      const hasMany = currentGroup.length > 1;
      lbPrev.hidden = !hasMany;
      lbNext.hidden = !hasMany;
    };

    const open = (trigger) => {
      const gallery = trigger.getAttribute("data-gallery");
      currentGroup = triggers.filter(
        (t) => t.getAttribute("data-gallery") === gallery
      );
      currentIndex = currentGroup.indexOf(trigger);
      lastTrigger = trigger;
      show(currentIndex);
      lightbox.hidden = false;
      requestAnimationFrame(() => lightbox.classList.add("open"));
      document.body.classList.add("lightbox-open");
      lbClose.focus();
    };

    const close = () => {
      lightbox.classList.remove("open");
      document.body.classList.remove("lightbox-open");
      setTimeout(() => {
        lightbox.hidden = true;
        lbImage.src = "";
        if (lastTrigger) lastTrigger.focus();
      }, 220);
    };

    triggers.forEach((btn) =>
      btn.addEventListener("click", () => open(btn))
    );
    lbClose.addEventListener("click", close);
    lbPrev.addEventListener("click", () => show(currentIndex - 1));
    lbNext.addEventListener("click", () => show(currentIndex + 1));
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) close();
    });
    document.addEventListener("keydown", (e) => {
      if (lightbox.hidden) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") show(currentIndex - 1);
      else if (e.key === "ArrowRight") show(currentIndex + 1);
    });
  }

  // Portrait slideshow (crossfade, auto-advance, dots, pause on hover, reduced-motion)
  const slider = document.getElementById("portraitSlider");
  if (slider) {
    const slides = Array.from(slider.querySelectorAll(".portrait-slide"));
    const dots = Array.from(slider.querySelectorAll(".portrait-dot"));
    const prefersReduce =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    let idx = 0;
    let timer = null;
    const INTERVAL = 4500;

    const go = (next) => {
      idx = (next + slides.length) % slides.length;
      slides.forEach((s, i) => s.classList.toggle("is-active", i === idx));
      dots.forEach((d, i) => {
        d.classList.toggle("is-active", i === idx);
        d.setAttribute("aria-selected", i === idx ? "true" : "false");
      });
    };

    const start = () => {
      if (prefersReduce || timer) return;
      timer = setInterval(() => go(idx + 1), INTERVAL);
    };
    const stop = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    dots.forEach((dot, i) =>
      dot.addEventListener("click", () => {
        go(i);
        stop();
        start();
      })
    );

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    slider.addEventListener("focusin", stop);
    slider.addEventListener("focusout", start);
    document.addEventListener("visibilitychange", () =>
      document.hidden ? stop() : start()
    );

    start();
  }

  // Reveal on scroll
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }
})();
