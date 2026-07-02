/* ===== Bropicer — GSAP + Lenis. Cinematic-dark editorial motion ===== */
(function () {
  "use strict";
  var REDUCE = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
  if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Split text into chars (manual, no plugin) ---------- */
  function splitChars(el) {
    var text = el.textContent;
    el.textContent = "";
    var frag = document.createDocumentFragment();
    for (var i = 0; i < text.length; i++) {
      var s = document.createElement("span");
      s.className = "char";
      s.textContent = text[i] === " " ? " " : text[i];
      frag.appendChild(s);
    }
    el.appendChild(frag);
    return el.querySelectorAll(".char");
  }

  /* ---------- Lenis smooth scroll ---------- */
  var lenis = null;
  function initLenis() {
    if (REDUCE || !window.Lenis) return;
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  function scrollTo(target) {
    if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.2 });
    else document.querySelector(target) && document.querySelector(target).scrollIntoView();
  }
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    if (a.closest(".menu")) return; // menu links керуються initMenu (закрити → доскролити)
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length > 1 && document.querySelector(id)) { e.preventDefault(); scrollTo(id); }
    });
  });

  /* ---------- Custom cursor + magnetic ---------- */
  function initCursor() {
    if (REDUCE) return;
    var cursor = document.getElementById("cursor");
    if (!cursor || window.matchMedia("(pointer:coarse)").matches) { if (cursor) cursor.style.display = "none"; return; }
    document.documentElement.classList.add("cursor-none"); // ховаємо системний курсор — лишається тільки кастомний
    var dot = cursor.querySelector(".cursor__dot");
    var ring = cursor.querySelector(".cursor__ring");
    var dx = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3" });
    var dy = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3" });
    var rx = gsap.quickTo(ring, "x", { duration: 0.42, ease: "power3" });
    var ry = gsap.quickTo(ring, "y", { duration: 0.42, ease: "power3" });
    window.addEventListener("pointermove", function (e) {
      dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
    });
    // hover grow + magnetic pull toward CTA/links
    document.querySelectorAll("[data-magnetic]").forEach(function (m) {
      m.addEventListener("pointerenter", function () { gsap.to(ring, { scale: 1.9, duration: 0.35, ease: "power3" }); });
      m.addEventListener("pointerleave", function () {
        gsap.to(ring, { scale: 1, duration: 0.35, ease: "power3" });
        gsap.to(m, { x: 0, y: 0, duration: 0.55, ease: "elastic.out(1,0.4)" });
      });
      // menu-лінки НЕ рухаємо вслід за мишкою (лишається лише зростання кільця + roll-hover)
      if (!m.classList.contains("menu__link")) {
        m.addEventListener("pointermove", function (e) {
          var r = m.getBoundingClientRect();
          gsap.to(m, { x: (e.clientX - (r.left + r.width / 2)) * 0.3, y: (e.clientY - (r.top + r.height / 2)) * 0.4, duration: 0.4, ease: "power3" });
        });
      }
    });
    document.addEventListener("pointerdown", function () { gsap.to(ring, { scale: 0.7, duration: 0.18 }); });
    document.addEventListener("pointerup", function () { gsap.to(ring, { scale: 1, duration: 0.3 }); });
  }

  /* ---------- Build scene (runs after intro reveals) ---------- */
  var built = false;
  function buildScene() {
    if (built) return; built = true;
    if (REDUCE || !gsap) { document.querySelectorAll("[data-reveal]").forEach(function (e) { e.classList.add("reveal-in"); }); return; }

    // Hero kinetic reveal
    var heroChars = [];
    document.querySelectorAll(".hero .split").forEach(function (el) {
      heroChars = heroChars.concat(Array.prototype.slice.call(splitChars(el)));
    });
    gsap.set(heroChars, { yPercent: 45, opacity: 0 });
    gsap.to(heroChars, { yPercent: 0, opacity: 1, duration: 0.9, ease: "power3.out", stagger: 0.025, delay: 0.1 });
    gsap.from(".hero__kicker, .hero__note, .hero__scroll", { opacity: 0, y: 20, duration: 0.9, ease: "power3.out", stagger: 0.1, delay: 0.5 });

    // Hero parallax: шари на різних швидкостях = виражена глибина
    var heroPx = gsap.timeline({ scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 } });
    heroPx.to(".hero__cluster--top", { yPercent: -55, ease: "none" }, 0)
          .to("#hero-bottle", { yPercent: 26, ease: "none" }, 0)
          .to("#cluster-bot", { yPercent: -85, ease: "none" }, 0);

    // Marquee infinite + scroll-velocity skew
    var mt = document.getElementById("marquee-track");
    if (mt) {
      var mq = gsap.to(mt, { xPercent: -50, repeat: -1, duration: 22, ease: "none" });
      ScrollTrigger.create({
        trigger: ".marquee", start: "top bottom", end: "bottom top",
        onUpdate: function (self) {
          var v = gsap.utils.clamp(-18, 18, self.getVelocity() / 60);
          gsap.to(".marquee", { skewX: v, duration: 0.4, ease: "power2.out", overwrite: "auto" });
          mq.timeScale(1 + Math.min(Math.abs(self.getVelocity()) / 2500, 4));
        }
      });
    }

    // Manifesto — pinned scrollytelling.
    // Є дві версії рядків (--wide 4 / --tall 6) — беремо лише видиму за поточної орієнтації.
    var mlines = gsap.utils.toArray(".mline").filter(function (el) { return el.offsetParent !== null; });
    if (mlines.length) {
      gsap.set(mlines, { yPercent: 110, opacity: 0 });
      var mtl = gsap.timeline({
        scrollTrigger: { trigger: ".manifesto", start: "top top", end: "+=120%", pin: ".manifesto__pin", scrub: 0.6 }
      });
      mlines.forEach(function (l) { mtl.to(l, { yPercent: 0, opacity: 1, duration: 1, ease: "power3.out" }, "+=0.2"); });
    }

    // Reel horizontal pan (desktop only)
    var mm = gsap.matchMedia();
    mm.add("(min-width: 901px)", function () {
      var track = document.getElementById("reel-track");
      var vp = document.getElementById("reel-viewport");
      if (!track || !vp) return;
      var getDist = function () { return track.scrollWidth - window.innerWidth; };
      var panels = gsap.utils.toArray(".panel");
      var tween = gsap.to(track, {
        x: function () { return -getDist(); }, ease: "none",
        scrollTrigger: {
          trigger: ".reel__viewport", start: "top top", end: function () { return "+=" + getDist(); },
          pin: ".reel__viewport", scrub: 1, invalidateOnRefresh: true, anticipatePin: 1
        }
      });
      // per-panel index parallax
      panels.forEach(function (p) {
        var idx = p.querySelector(".panel__idx");
        if (idx) gsap.to(idx, { xPercent: -18, ease: "none",
          scrollTrigger: { trigger: p, containerAnimation: tween, start: "left right", end: "right left", scrub: true } });
      });
      return function () { tween.scrollTrigger && tween.scrollTrigger.kill(); tween.kill(); gsap.set(track, { x: 0 }); };
    });

    // Pour parallax image + copy
    gsap.to(".pour__img", { yPercent: -18, ease: "none",
      scrollTrigger: { trigger: ".pour", start: "top bottom", end: "bottom top", scrub: 1 } });

    // Craft image parallax
    gsap.fromTo(".craft__media img", { yPercent: -8 }, { yPercent: 8, ease: "none",
      scrollTrigger: { trigger: ".craft__media", start: "top bottom", end: "bottom top", scrub: 1 } });

    // Distributor: cap повільно обертається + дрейф на скролі
    if (document.getElementById("dist-cap")) {
      gsap.fromTo("#dist-cap", { rotation: -12, yPercent: -6 }, { rotation: 38, yPercent: 10, ease: "none",
        scrollTrigger: { trigger: ".dist", start: "top bottom", end: "bottom top", scrub: 1 } });
    }

    // Split-lines headings reveal
    gsap.utils.toArray("[data-split-lines]").forEach(function (el) {
      gsap.from(el, { opacity: 0, yPercent: 30, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%" } });
    });

    // Generic reveals (meaningful, staggered per-section)
    ScrollTrigger.batch("[data-reveal]", {
      start: "top 88%",
      onEnter: function (els) { els.forEach(function (e, i) { setTimeout(function () { e.classList.add("reveal-in"); }, i * 90); }); }
    });

    ScrollTrigger.refresh();
  }

  /* ---------- Preloader / intro (= age gate) ---------- */
  function initIntro() {
    var intro = document.getElementById("intro");
    var num = document.getElementById("intro-num");
    var gate = document.getElementById("intro-gate");
    var yes = document.getElementById("age-yes");
    var already = false;
    try { already = sessionStorage.getItem("bropicer_age_ok") === "1"; } catch (e) {}

    function enter() {
      try { sessionStorage.setItem("bropicer_age_ok", "1"); } catch (e) {}
      document.body.classList.remove("lock");
      if (REDUCE || !gsap) { intro.style.display = "none"; buildScene(); return; }
      var tl = gsap.timeline({ onComplete: function () { intro.classList.add("is-done"); intro.style.display = "none"; } });
      tl.to(intro, { yPercent: -100, duration: 1.0, ease: "power4.inOut" });
      buildScene();
    }
    yes.addEventListener("click", enter);

    if (already) { intro.style.display = "none"; document.body.classList.remove("lock"); buildScene(); return; }

    document.body.classList.add("lock");
    if (REDUCE || !gsap) { num.textContent = "18"; gate.hidden = false; gate.style.opacity = 1; return; }
    // counter 00 -> 100 then reveal gate
    var counter = { v: 0 };
    gsap.to(counter, {
      v: 100, duration: 1.6, ease: "power2.inOut",
      onUpdate: function () { num.textContent = String(Math.round(counter.v)).padStart(2, "0"); },
      onComplete: function () {
        gate.hidden = false;
        gsap.fromTo(gate, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" });
      }
    });
    gsap.from(".intro__brand", { opacity: 0, y: 30, duration: 1, ease: "power3.out" });
  }

  /* ---------- Fullscreen menu (curtain overlay) ---------- */
  function initMenu() {
    var burger = document.getElementById("burger");
    var label = document.getElementById("burger-label");
    var menu = document.getElementById("menu");
    if (!burger || !menu) return;
    var bg = menu.querySelector(".menu__bg");
    var items = menu.querySelectorAll(".menu__item");
    var links = menu.querySelectorAll(".menu__link");
    var foot = menu.querySelector(".menu__foot");
    var open = false, animating = false;

    function setState(isOpen) {
      burger.classList.toggle("is-open", isOpen);
      burger.setAttribute("aria-expanded", String(isOpen));
      burger.setAttribute("aria-label", isOpen ? "Закрити меню" : "Відкрити меню");
      if (label) label.textContent = isOpen ? "Закрити" : "Меню";
      menu.setAttribute("aria-hidden", String(!isOpen));
    }

    function openMenu() {
      if (open || animating) return;
      open = true;
      menu.classList.add("is-ready");
      setState(true);
      if (lenis) lenis.stop();
      document.body.classList.add("lock");
      if (REDUCE || !gsap) return;
      animating = true;
      gsap.killTweensOf([bg, items]);
      gsap.set(bg, { clipPath: "inset(0 0 100% 0)" });
      gsap.set(items, { yPercent: 115, opacity: 0 });
      gsap.set(foot, { opacity: 0, y: 14 });
      var tl = gsap.timeline({ onComplete: function () { animating = false; } });
      tl.to(bg, { clipPath: "inset(0 0 0% 0)", duration: 0.75, ease: "power4.inOut" })
        .to(items, { yPercent: 0, opacity: 1, duration: 0.7, ease: "power3.out", stagger: 0.07 }, "-=0.35")
        .to(foot, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, "-=0.3");
    }

    function closeMenu(after) {
      if (!open) { if (after) after(); return; }
      open = false;
      setState(false);
      document.body.classList.remove("lock");
      if (lenis) lenis.start();
      if (REDUCE || !gsap) { menu.classList.remove("is-ready"); if (after) after(); return; }
      animating = true;
      gsap.killTweensOf([bg, items]);
      var tl = gsap.timeline({ onComplete: function () {
        menu.classList.remove("is-ready"); animating = false; if (after) after();
      } });
      tl.to(items, { yPercent: 60, opacity: 0, duration: 0.35, ease: "power2.in", stagger: 0.03 })
        .to(bg, { clipPath: "inset(0 0 100% 0)", duration: 0.6, ease: "power4.inOut" }, "-=0.1");
    }

    burger.addEventListener("click", function () { open ? closeMenu() : openMenu(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
    links.forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (id && id.length > 1 && document.querySelector(id)) {
          e.preventDefault();
          closeMenu(function () { scrollTo(id); });
        } else {
          closeMenu();
        }
      });
    });
  }

  /* ---------- Cart ---------- */
  function initCart() {
    var cart = {};
    var listEl = document.getElementById("cart-list");
    var emptyEl = document.getElementById("cart-empty");
    function render() {
      listEl.innerHTML = "";
      var names = Object.keys(cart);
      emptyEl.style.display = names.length ? "none" : "";
      names.forEach(function (name) {
        var li = document.createElement("li");
        li.className = "cart__row";
        li.innerHTML = '<span class="cart__name"></span><span class="cart__ctrl">' +
          '<span class="qty"><button type="button" aria-label="Менше">−</button><span></span>' +
          '<button type="button" aria-label="Більше">+</button></span>' +
          '<button type="button" class="cart__rm">Прибрати</button></span>';
        li.querySelector(".cart__name").textContent = name;
        li.querySelector(".qty span").textContent = cart[name];
        var b = li.querySelectorAll(".qty button");
        b[0].addEventListener("click", function () { change(name, -1); });
        b[1].addEventListener("click", function () { change(name, 1); });
        li.querySelector(".cart__rm").addEventListener("click", function () { delete cart[name]; render(); sync(); });
        listEl.appendChild(li);
      });
    }
    function change(name, d) { cart[name] = (cart[name] || 0) + d; if (cart[name] < 1) delete cart[name]; render(); sync(); }
    function sync() {
      document.querySelectorAll(".add").forEach(function (btn) {
        var inC = !!cart[btn.getAttribute("data-name")];
        btn.classList.toggle("is-added", inC);
        btn.textContent = inC ? "Додано ✓" : "Додати в замовлення";
      });
    }
    document.querySelectorAll(".add").forEach(function (btn) {
      btn.addEventListener("click", function () { var n = btn.getAttribute("data-name"); cart[n] = (cart[n] || 0) + 1; render(); sync(); });
    });
  }

  /* ---------- Accordion ---------- */
  function initAcc() {
    document.querySelectorAll(".acc__q").forEach(function (q) {
      q.addEventListener("click", function () {
        var open = q.getAttribute("aria-expanded") === "true";
        var panel = q.nextElementSibling;
        q.setAttribute("aria-expanded", String(!open));
        panel.style.height = open ? "0px" : panel.scrollHeight + "px";
        if (lenis) setTimeout(function () { ScrollTrigger.refresh(); }, 420);
      });
    });
  }

  /* ---------- Form ---------- */
  function initForm() {
    var form = document.getElementById("order-form");
    var ok = document.getElementById("order-ok");
    function setErr(id, msg) {
      var f = document.getElementById(id).closest(".field");
      f.classList.toggle("is-invalid", !!msg);
      var s = form.querySelector('[data-for="' + id + '"]'); if (s) s.textContent = msg || "";
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok1 = true, name = document.getElementById("f-name"), phone = document.getElementById("f-phone"), city = document.getElementById("f-city");
      if (!name.value.trim()) { setErr("f-name", "Вкажи імʼя"); ok1 = false; } else setErr("f-name", "");
      if (!/[0-9]{6,}/.test(phone.value.replace(/\D/g, ""))) { setErr("f-phone", "Некоректний телефон"); ok1 = false; } else setErr("f-phone", "");
      if (!city.value.trim()) { setErr("f-city", "Вкажи місто"); ok1 = false; } else setErr("f-city", "");
      if (!ok1) return;
      ok.hidden = false;
      form.querySelector(".submit").textContent = "Прийнято ✓";
    });
  }

  /* ---------- Reel: horizontal carousel on ≤900px (swipe + arrows + dots) ----------
     Десктоп (≥901px) використовує pinned горизонтальний пан у buildScene().
     Тут — нативний scroll-snap-слайдер: свайп працює сам, JS керує лише
     крапками/стрілками/активним станом. matchMedia вмикає/вимикає на ресайзі. */
  function initReelCarousel() {
    var vp = document.getElementById("reel-viewport");
    var track = document.getElementById("reel-track");
    var dotsWrap = document.getElementById("reel-dots");
    var navWrap = document.querySelector(".reel__nav");
    if (!vp || !track || !dotsWrap) return;
    var panels = Array.prototype.slice.call(track.querySelectorAll(".panel"));
    var arrows = navWrap ? Array.prototype.slice.call(navWrap.querySelectorAll(".reel__arrow")) : [];
    var dots = [];
    var active = 0, bound = false, raf = 0;

    function buildDots() {
      if (dots.length) return;
      panels.forEach(function (p, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "reel__dot";
        b.setAttribute("role", "tab");
        b.setAttribute("aria-label", "Сорт " + (i + 1));
        b.addEventListener("click", function () { go(i); });
        dotsWrap.appendChild(b);
        dots.push(b);
      });
    }
    function go(i) {
      i = Math.max(0, Math.min(panels.length - 1, i));
      vp.scrollTo({ left: i * vp.clientWidth, behavior: "smooth" });
    }
    function update() {
      var w = vp.clientWidth || 1;
      var idx = Math.max(0, Math.min(panels.length - 1, Math.round(vp.scrollLeft / w)));
      active = idx;
      dots.forEach(function (d, i) {
        d.classList.toggle("is-active", i === idx);
        d.setAttribute("aria-selected", String(i === idx));
      });
      if (arrows[0]) arrows[0].disabled = idx === 0;
      if (arrows[1]) arrows[1].disabled = idx === panels.length - 1;
    }
    function onScroll() { if (raf) cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }
    function onArrow() { go(active + parseInt(this.getAttribute("data-dir"), 10)); }

    function enable() {
      if (bound) return; bound = true;
      buildDots();
      vp.setAttribute("data-lenis-prevent", "");           // хай Lenis не перехоплює свайп каруселі
      vp.addEventListener("scroll", onScroll, { passive: true });
      arrows.forEach(function (a) { a.addEventListener("click", onArrow); });
      vp.scrollLeft = 0;
      update();
    }
    function disable() {
      if (!bound) return; bound = false;
      vp.removeAttribute("data-lenis-prevent");
      vp.removeEventListener("scroll", onScroll);
      arrows.forEach(function (a) { a.removeEventListener("click", onArrow); });
      vp.scrollLeft = 0;
    }

    var mq = window.matchMedia("(max-width:900px)");
    function handle(e) { (e.matches ? enable : disable)(); }
    handle(mq);
    if (mq.addEventListener) mq.addEventListener("change", handle);
    else if (mq.addListener) mq.addListener(handle);
    window.addEventListener("resize", function () { if (bound) update(); });
  }

  /* ---------- Boot ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    initLenis();
    initCursor();
    initMenu();
    initAcc();
    initReelCarousel();
    initIntro();
    if (!REDUCE && gsap) window.addEventListener("load", function () { ScrollTrigger.refresh(); });
  });
})();
