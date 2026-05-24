if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

const forceHeroOnRefresh = () => {
  if (window.location.hash) return;
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
};

forceHeroOnRefresh();
window.addEventListener("DOMContentLoaded", forceHeroOnRefresh, { once: true });
window.addEventListener("pageshow", forceHeroOnRefresh);
window.addEventListener("load", forceHeroOnRefresh, { once: true });

document.documentElement.classList.add("motion-ready");

const nav = document.querySelector("[data-nav]");
const progress = document.querySelector("[data-progress]");
const cursor = document.querySelector("[data-cursor]");
const depthCanvas = document.querySelector("[data-depth-scene]");
const revealItems = document.querySelectorAll(".reveal");
const depthItems = document.querySelectorAll("[data-depth]");
const glitchTitle = document.querySelector(".glitch-title");
const projectDetails = document.querySelectorAll("[data-project-detail]");
const projectBackButtons = document.querySelectorAll("[data-project-back]");
const parallaxItems = document.querySelectorAll(
  ".project-card, .project-detail-panel, .certificate-card, .skill-panel, .timeline article, .contact-panel, .hero-metrics div"
);
const hoverItems = document.querySelectorAll(
  "a, button, .project-card, .project-detail-panel, .certificate-card, .skill-panel, .timeline article, .contact-panel, .hero-metrics div"
);
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointerQuery = window.matchMedia("(pointer: fine)");

const pointer = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
  nx: 0,
  ny: 0,
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
let currentScrollDepth = 0;
let scrollFrame = null;
let pointerFrame = null;

const canUseRichMotion = () => !reduceMotion && finePointerQuery.matches && window.innerWidth > 780;

const updateScrollState = () => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progressValue = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
  const depthValue = clamp(scrollTop / Math.max(window.innerHeight, 1), 0, 3);
  const useParallax = canUseRichMotion();

  nav?.classList.toggle("is-scrolled", scrollTop > 16);
  currentScrollDepth = depthValue;
  document.documentElement.style.setProperty("--scroll-depth", depthValue.toFixed(3));

  if (progress) {
    progress.style.width = `${clamp(progressValue, 0, 100)}%`;
  }

  if (!useParallax) {
    return;
  }

  parallaxItems.forEach((item, index) => {
    const rect = item.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const viewportCenter = window.innerHeight / 2;
    const offset = clamp((midpoint - viewportCenter) / window.innerHeight, -1.2, 1.2);
    const depth = 16 + (index % 4) * 7;

    item.style.setProperty("--parallax-y", `${(-offset * depth).toFixed(2)}px`);
    item.style.setProperty("--parallax-z", `${((1 - Math.abs(offset)) * 8).toFixed(2)}px`);
  });
};

const requestScrollState = () => {
  if (scrollFrame) return;

  scrollFrame = window.requestAnimationFrame(() => {
    scrollFrame = null;
    updateScrollState();
  });
};

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0, rootMargin: '0px 0px -5% 0px' }
  );

  revealItems.forEach((item, i) => {
    // Stagger sibling cards within grids
    const parent = item.parentElement;
    if (parent && (parent.classList.contains("project-grid") || parent.classList.contains("skill-grid") || parent.classList.contains("timeline"))) {
      const siblings = Array.from(parent.querySelectorAll(".reveal"));
      const idx = siblings.indexOf(item);
      item.style.transitionDelay = `${idx * 80}ms`;
    }
    revealObserver.observe(item);
  });
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

window.setTimeout(() => {
  if (typeof isMobile === "function" && isMobile() && window.gsap && !reduceMotion) return;
  revealItems.forEach((item) => item.classList.add("is-visible"));
}, 700);

// Scroll chevron fade
const heroScroll = document.querySelector(".hero-scroll");
if (heroScroll) {
  window.addEventListener("scroll", () => {
    const opacity = Math.max(0, 1 - window.scrollY / 300);
    heroScroll.style.opacity = opacity;
    if (opacity <= 0) heroScroll.style.pointerEvents = "none";
    else heroScroll.style.pointerEvents = "";
  }, { passive: true });
}


const moveCursor = (event) => {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  pointer.nx = pointer.x / window.innerWidth - 0.5;
  pointer.ny = pointer.y / window.innerHeight - 0.5;

  document.documentElement.style.setProperty("--mx", `${pointer.x}px`);
  document.documentElement.style.setProperty("--my", `${pointer.y}px`);

  if (!finePointerQuery.matches) return;

  if (!pointerFrame) {
    pointerFrame = window.requestAnimationFrame(() => {
      pointerFrame = null;
      document.documentElement.style.setProperty("--cursor-x", `${pointer.x}px`);
      document.documentElement.style.setProperty("--cursor-y", `${pointer.y}px`);
      cursor?.classList.add("is-visible");
    });
  }

  depthItems.forEach((item) => {
    const depth = Number(item.dataset.depth || 10);
    item.style.setProperty("--tilt-x", (pointer.nx * depth).toFixed(2));
    item.style.setProperty("--tilt-y", (pointer.ny * depth).toFixed(2));
  });
};

const armCursor = () => cursor?.classList.add("is-armed");
const disarmCursor = () => cursor?.classList.remove("is-armed");

// click / throw animation
document.addEventListener("pointerdown", () => {
  if (!cursor) return;
  cursor.classList.remove("is-clicking");
  // Force reflow so the animation restarts if clicked rapidly
  void cursor.offsetWidth;
  cursor.classList.add("is-clicking");
  window.setTimeout(() => cursor.classList.remove("is-clicking"), 420);
});


hoverItems.forEach((item) => {
  item.addEventListener("pointerenter", armCursor);
  item.addEventListener("pointerleave", disarmCursor);

  item.addEventListener("pointermove", (event) => {
    if (!canUseRichMotion()) return;

    const rect = item.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const rotateY = (x - 0.5) * 9;
    const rotateX = (0.5 - y) * 7;

    item.style.setProperty("--card-x", `${(x * 100).toFixed(2)}%`);
    item.style.setProperty("--card-y", `${(y * 100).toFixed(2)}%`);
    item.style.setProperty("--rotate-x", `${rotateX.toFixed(2)}deg`);
    item.style.setProperty("--rotate-y", `${rotateY.toFixed(2)}deg`);
  });

  item.addEventListener("pointerleave", () => {
    item.style.setProperty("--rotate-x", "0deg");
    item.style.setProperty("--rotate-y", "0deg");
  });
});

const pulseGlitch = () => {
  if (!glitchTitle || reduceMotion) return;

  glitchTitle.classList.add("is-glitching");
  window.setTimeout(() => glitchTitle.classList.remove("is-glitching"), 660);
};

window.setInterval(pulseGlitch, 3600);
window.setTimeout(pulseGlitch, 900);

const createDepthScene = () => {
  if (!depthCanvas || !window.THREE) return null;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 100);
  camera.position.set(0, 0.4, 8);

  const renderer = new THREE.WebGLRenderer({
    canvas: depthCanvas,
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: false,
    powerPreference: "high-performance",
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 780 ? 1.15 : 1.5));
  renderer.setClearColor(0x000000, 0);

  const world = new THREE.Group();
  scene.add(world);

  const starGeometry = new THREE.BufferGeometry();
  const starCount = window.innerWidth < 780 ? 130 : 420;
  const starPositions = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i += 1) {
    const index = i * 3;
    starPositions[index] = (Math.random() - 0.5) * 18;
    starPositions[index + 1] = (Math.random() - 0.5) * 9;
    starPositions[index + 2] = -Math.random() * 18;
  }

  starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));

  const starMaterial = new THREE.PointsMaterial({
    color: 0x35d8e6,
    size: 0.035,
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
  });
  const stars = new THREE.Points(starGeometry, starMaterial);
  world.add(stars);

  const shardGroup = new THREE.Group();
  world.add(shardGroup);

  const shardMaterials = [
    new THREE.MeshBasicMaterial({ color: 0xff0a5b, wireframe: true, transparent: true, opacity: 0.46 }),
    new THREE.MeshBasicMaterial({ color: 0x35d8e6, wireframe: true, transparent: true, opacity: 0.42 }),
    new THREE.MeshBasicMaterial({ color: 0xf5e64a, wireframe: true, transparent: true, opacity: 0.26 }),
  ];

  const shardCount = window.innerWidth < 780 ? 8 : 14;

  for (let i = 0; i < shardCount; i += 1) {
    const geometry = i % 2 === 0 ? new THREE.TetrahedronGeometry(0.22 + Math.random() * 0.24) : new THREE.IcosahedronGeometry(0.14 + Math.random() * 0.18, 0);
    const mesh = new THREE.Mesh(geometry, shardMaterials[i % shardMaterials.length]);

    mesh.position.set((Math.random() - 0.5) * 13, (Math.random() - 0.5) * 6, -2 - Math.random() * 10);
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    mesh.userData.speed = 0.002 + Math.random() * 0.006;
    mesh.userData.drift = 0.3 + Math.random() * 0.8;
    shardGroup.add(mesh);
  }

  const grid = new THREE.GridHelper(22, 22, 0xff0a5b, 0x35d8e6);
  grid.position.set(0, -3.15, -4.5);
  grid.material.transparent = true;
  grid.material.opacity = 0.2;
  world.add(grid);

  const resize = () => {
    const rect = depthCanvas.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 780 ? 1.15 : 1.5));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  const animate = (time = 0) => {
    if (document.hidden) {
      window.requestAnimationFrame(animate);
      return;
    }

    const scrollDepth = currentScrollDepth;
    const t = time * 0.001;

    world.rotation.y += (pointer.nx * 0.34 - world.rotation.y) * 0.045;
    world.rotation.x += (-pointer.ny * 0.16 - world.rotation.x) * 0.045;
    world.position.y = -scrollDepth * 0.22;
    camera.position.z = 7.6 - scrollDepth * 0.42;

    stars.rotation.y = t * 0.026 + pointer.nx * 0.08;
    stars.position.z = (scrollDepth % 1) * 1.4;

    shardGroup.children.forEach((mesh, index) => {
      mesh.rotation.x += mesh.userData.speed;
      mesh.rotation.y += mesh.userData.speed * 1.4;
      mesh.position.y += Math.sin(t * mesh.userData.drift + index) * 0.0018;
    });

    grid.position.z = -4.5 + (scrollDepth % 1) * 1.25;
    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
  };

  window.addEventListener("resize", () => {
    window.requestAnimationFrame(resize);
  });
  resize();

  if (!reduceMotion) {
    animate();
  } else {
    renderer.render(scene, camera);
  }

  return { renderer, scene, camera, resize };
};

window.addEventListener("scroll", requestScrollState, { passive: true });
window.addEventListener("resize", requestScrollState);
window.addEventListener("pointermove", moveCursor, { passive: true });
window.addEventListener("pointerleave", () => cursor?.classList.remove("is-visible"));

const depthScene = createDepthScene();

updateScrollState();
depthScene?.resize();

/* ── Project detail panels ── */
let savedScrollY = 0;

function openPanel(projectId) {
  const panel = document.getElementById("panel-" + projectId);
  if (!panel) return;

  savedScrollY = window.scrollY;
  panel.removeAttribute("hidden");

  // Let display:block kick in, then slide
  requestAnimationFrame(() => {
    panel.scrollTop = 0;
  });

  document.body.style.overflow = "hidden";
}

function closePanel() {
  const openPanels = document.querySelectorAll(".project-panel:not([hidden])");
  openPanels.forEach(p => {
    p.setAttribute("hidden", "");
  });
  document.body.style.overflow = "";
  window.scrollTo(0, savedScrollY);
}

// Open on card click
document.querySelectorAll("[data-open-project]").forEach(card => {
  card.addEventListener("click", () => openPanel(card.dataset.openProject));
  card.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openPanel(card.dataset.openProject);
    }
  });
});

// Close on back button
document.querySelectorAll("[data-close-project]").forEach(btn => {
  btn.addEventListener("click", closePanel);
});

// Close on Escape
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closePanel();
});

/* ── Mobile Hamburger Menu ── */
const hamburger = document.querySelector("[data-hamburger]");
const drawer = document.querySelector("[data-drawer]");
const drawerBackdrop = document.querySelector("[data-drawer-backdrop]");
const drawerClose = document.querySelector("[data-drawer-close]");
const drawerLinks = document.querySelectorAll("[data-drawer-link]");

function openDrawer() {
  if (!drawer) return;
  drawer.classList.add('is-open');
  drawerBackdrop?.classList.add('is-open');
  hamburger?.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
  // Focus first interactive element for accessibility
  setTimeout(() => drawer.querySelector('a, button')?.focus(), 50);
}

function closeDrawer() {
  if (!drawer) return;
  drawer.classList.remove('is-open');
  drawerBackdrop?.classList.remove('is-open');
  hamburger?.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
  hamburger?.focus();
}

function toggleDrawer() {
  if (drawer?.classList.contains("is-open")) {
    closeDrawer();
  } else {
    openDrawer();
  }
}

hamburger?.addEventListener("click", toggleDrawer);
drawerClose?.addEventListener("click", closeDrawer);
drawerBackdrop?.addEventListener("click", closeDrawer);

// Close on nav link tap + smooth scroll
drawerLinks.forEach(link => {
  link.addEventListener("click", () => {
    closeDrawer();
  });
});

// Escape key closes drawer
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && drawer?.classList.contains("is-open")) {
    closeDrawer();
  }
});

// Trap focus inside drawer while open
drawer?.addEventListener("keydown", e => {
  if (e.key !== "Tab") return;
  const focusable = drawer.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey) {
    if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
  } else {
    if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
  }
});

/* ═══════════════════════════════════════════════════════════════
   MOBILE CINEMATIC UPGRADE
   All features guarded by isMobile() / isTouch checks.
   Desktop is NEVER affected.
   ═══════════════════════════════════════════════════════════════ */

const isMobile = () => window.innerWidth <= 780;
const isTouch = window.matchMedia('(pointer: coarse)').matches;

/* ─────────────────────────────────────────────
   1. CINEMATIC LOADER
───────────────────────────────────────────── */
function initMobileLoader(onComplete) {
  const loader = document.getElementById('mobile-loader');
  if (!loader) { onComplete?.(); return; }

  if (!isMobile()) {
    loader.remove();
    onComplete?.();
    return;
  }

  const brandImg    = loader.querySelector('.loader-brand-img');
  const shimmerBar  = loader.querySelector('#loader-shimmer');
  const progressFill = loader.querySelector('#loader-progress');
  const blade       = loader.querySelector('.loader-blade');

  // ── Progress bar: rAF-driven 0 → 85% over ~1600ms, then 100% before blade ──
  const PROGRESS_DURATION = 1600;
  let progressStart = null;
  let progressFrame = null;

  function tickProgress(ts) {
    if (!progressStart) progressStart = ts;
    const elapsed = ts - progressStart;
    const pct = Math.min((elapsed / PROGRESS_DURATION) * 85, 85);
    if (progressFill) progressFill.style.width = pct.toFixed(1) + '%';
    if (pct < 85) {
      progressFrame = requestAnimationFrame(tickProgress);
    }
  }
  progressFrame = requestAnimationFrame(tickProgress);

  // Step 1 — Brand logo springs in
  setTimeout(() => {
    if (!brandImg) return;
    brandImg.style.transition = 'transform 0.65s cubic-bezier(0.34,1.56,0.64,1), opacity 0.45s ease';
    brandImg.style.transform  = 'scale(1)';
    brandImg.style.opacity    = '1';
  }, 150);

  // Step 2 — Shimmer bar sweeps across
  setTimeout(() => {
    if (!shimmerBar) return;
    shimmerBar.classList.add('is-sweeping');
  }, 700);

  // Step 3 — Glitch flicker on the logo
  setTimeout(() => {
    if (!brandImg) return;
    brandImg.classList.add('is-glitching');
    setTimeout(() => brandImg.classList.remove('is-glitching'), 560);
  }, 1100);

  // Step 4 — Progress bar snaps to 100%
  setTimeout(() => {
    cancelAnimationFrame(progressFrame);
    if (progressFill) {
      progressFill.style.transition = 'width 0.22s ease';
      progressFill.style.width = '100%';
    }
  }, 1680);

  // Step 5 — blade slash wipes left across the loader
  setTimeout(() => {
    if (!blade) return;
    blade.style.transition = 'clip-path 0.38s cubic-bezier(0.7,0,0.3,1)';
    blade.style.clipPath = 'polygon(-10% 0, 110% 0, 110% 100%, -10% 100%)';
  }, 1900);

  // Step 6 — remove loader, run callback
  setTimeout(() => {
    window.scrollTo(0, 0);
    loader.classList.add('loader-hidden');
    setTimeout(() => loader.remove(), 200);
    onComplete?.();
  }, 2300);
}

/* ─────────────────────────────────────────────
   2. GSAP SCROLL-TRIGGERED REVEALS
───────────────────────────────────────────── */
function initMobileGSAP() {
  if (!isMobile() || !window.gsap || !window.ScrollTrigger) return;
  if (reduceMotion) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  document.documentElement.classList.add('gsap-init');

  const buildRevealItems = (selector, options = {}) => gsap.utils.toArray(selector).map((target) => {
    const parentCards = target.parentElement
      ? Array.from(target.parentElement.querySelectorAll(options.siblingSelector || selector))
      : [];
    const index = Math.max(parentCards.indexOf(target), 0);

    return {
      target,
      trigger: target,
      delay: Math.min(index * (options.staggerDelay || 0), options.maxDelay || 0),
      y: options.y || 46,
      duration: options.duration || 1.15,
    };
  });

  const headingItems = buildRevealItems('.section .section-heading, .section .about-copy', {
    y: 34,
    duration: 1,
  });
  const cardItems = buildRevealItems(
    '.section .project-card, .section .cert-card, .section .skill-panel, .section .timeline article, .section .contact-panel',
    {
      siblingSelector: '.project-card, .cert-card, .skill-panel, .timeline article, .contact-panel',
      staggerDelay: 0.08,
      maxDelay: 0.28,
      y: 46,
      duration: 1.15,
    }
  );
  const revealItemsMobile = [...headingItems, ...cardItems];

  document.querySelectorAll('.section .timeline').forEach((container) => {
    container.classList.add('is-visible');
  });

  const revealItem = (item) => {
    if (item.revealed) return;
    item.revealed = true;
    item.timeline.play(0);
  };

  const revealVisibleItems = () => {
    revealItemsMobile.forEach((item) => {
      if (item.revealed) return;
      const rect = item.trigger.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.92 && rect.bottom >= 0) {
        revealItem(item);
      }
    });
  };

  revealItemsMobile.forEach((item) => {
    gsap.set(item.target, {
      autoAlpha: 0.18,
      y: item.y,
      force3D: true,
      transition: 'none',
      willChange: 'transform, opacity',
    });

    item.timeline = gsap.timeline({
      paused: true,
      defaults: { ease: 'power2.out' },
      onComplete() {
        item.target.classList.add('is-visible');
        gsap.set(item.target, { clearProps: 'willChange,transition,transform,opacity,visibility' });
      },
    }).to(item.target, {
      autoAlpha: 1,
      y: 0,
      duration: item.duration,
      delay: item.delay,
    });

    ScrollTrigger.create({
      trigger: item.trigger,
      start: 'top 92%',
      end: 'bottom top',
      once: true,
      invalidateOnRefresh: true,
      onEnter: () => revealItem(item),
      onEnterBack: () => revealItem(item),
    });
  });

  const mobileHeroContent = document.querySelector('.hero-content');
  if (mobileHeroContent) {
    gsap.fromTo(mobileHeroContent,
      { y: 42, opacity: 0.18 },
      { y: 0, opacity: 1, duration: 1.15, ease: 'power2.out', delay: 0.15 });
  }

  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const item = revealItemsMobile.find((revealItemConfig) => revealItemConfig.trigger === entry.target);
        if (item) {
          revealItem(item);
          sectionObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.01, rootMargin: '0px 0px -8% 0px' });

    revealItemsMobile.forEach((item) => sectionObserver.observe(item.trigger));
  }

  let revealFrame = null;
  window.addEventListener('scroll', () => {
    if (revealFrame) return;
    revealFrame = window.requestAnimationFrame(() => {
      revealFrame = null;
      revealVisibleItems();
    });
  }, { passive: true });

  window.requestAnimationFrame(() => {
    ScrollTrigger.refresh();
    revealVisibleItems();
  });
  return;
}

/* ─────────────────────────────────────────────
   3. SKILL BAR COUNT-UP
───────────────────────────────────────────── */
function initSkillCounters() {
  if (!isMobile()) return;

  document.querySelectorAll('.skill-bar').forEach(bar => {
    const fill = bar.querySelector('.skill-fill[data-pct]');
    if (!fill) return;
    const target = parseInt(fill.dataset.pct, 10);
    if (isNaN(target)) return;

    // Inject label above bar
    const label = document.createElement('span');
    label.className = 'skill-pct-label';
    label.textContent = '0%';
    bar.insertBefore(label, fill);

    // Reset width — GSAP or CSS will drive it
    fill.style.width = '0%';
    fill.style.transition = 'none';

    const panel = bar.closest('.skill-panel');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        panel?.classList.add('is-counted');

        if (window.gsap) {
          gsap.to(fill, { width: `${target}%`, duration: 1.4, ease: 'power2.out' });
          gsap.to({ v: 0 }, {
            v: target, duration: 1.4, ease: 'power2.out',
            onUpdate() { label.textContent = Math.round(this.targets()[0].v) + '%'; },
            onComplete() { label.textContent = target + '%'; }
          });
        } else {
          fill.style.transition = 'width 1.2s ease';
          fill.style.width = `${target}%`;
          label.textContent = `${target}%`;
        }
      });
    }, { threshold: 0.35 });

    if (panel) obs.observe(panel);
  });
}

/* ─────────────────────────────────────────────
   4. SECTION GLITCH FLASH — REMOVED
───────────────────────────────────────────── */
// Removed: was too distracting on scroll

/* ─────────────────────────────────────────────
   5. CONTACT HEADING TYPEOUT
───────────────────────────────────────────── */
function initTerminalContact() {
  if (!isMobile()) return;

  const titleEl = document.getElementById('contact-title');
  if (!titleEl) return;

  const original = titleEl.textContent.trim();
  titleEl.textContent = '';

  const textSpan = document.createElement('span');
  textSpan.id = 'terminal-heading';
  const cursorSpan = document.createElement('span');
  cursorSpan.className = 'term-cursor';
  titleEl.appendChild(textSpan);
  titleEl.appendChild(cursorSpan);

  // Pre-populate so heading is NEVER empty on load
  textSpan.textContent = original;

  // When section scrolls into view — clear and retype for the effect
  let typed = false;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting || typed) return;
      typed = true;
      obs.disconnect();
      cursorSpan.classList.add('is-active');
      textSpan.textContent = '';
      let i = 0;
      const tick = setInterval(() => {
        if (i < original.length) {
          textSpan.textContent += original[i++];
        } else {
          clearInterval(tick);
        }
      }, 52);
    });
  }, { threshold: 0.25 }); // lower threshold — fires sooner

  const section = document.getElementById('contact');
  if (section) obs.observe(section);
}

/* ─────────────────────────────────────────────
   6. TOUCH EFFECTS — REMOVED
───────────────────────────────────────────── */
// Ember trail and tap ripple removed per user request.
function initTouchEffects() { }

/* ─────────────────────────────────────────────
   BOOT SEQUENCE
───────────────────────────────────────────── */
function bootMobile() {
  initTouchEffects();           // touch ripple + ember trail (no deps)
  initSkillCounters();          // skill counter (no GSAP dep)
  initTerminalContact();        // contact terminal (no GSAP dep)

  // GSAP features run after loader completes
  const afterLoader = () => {
    initMobileGSAP();
  };

  initMobileLoader(afterLoader);
}

// Defer until GSAP deferred scripts have loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootMobile);
} else {
  // Give deferred GSAP scripts a tick to register
  setTimeout(bootMobile, 0);
}

