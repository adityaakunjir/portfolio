document.documentElement.classList.add("motion-ready");

const nav = document.querySelector("[data-nav]");
const progress = document.querySelector("[data-progress]");
const cursor = document.querySelector("[data-cursor]");
const depthCanvas = document.querySelector("[data-depth-scene]");
const revealItems = document.querySelectorAll(".reveal");
const depthItems = document.querySelectorAll("[data-depth]");
const glitchTitle = document.querySelector(".glitch-title");
const parallaxItems = document.querySelectorAll(
  ".project-card, .skill-panel, .timeline article, .contact-panel, .hero-metrics div"
);
const hoverItems = document.querySelectorAll(
  "a, button, .project-card, .skill-panel, .timeline article, .contact-panel, .hero-metrics div"
);
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
<<<<<<< HEAD
const finePointerQuery = window.matchMedia("(pointer: fine)");
=======
>>>>>>> f8c887761bd423e02ba0992cb06be6165fe47037

const pointer = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
  nx: 0,
  ny: 0,
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
<<<<<<< HEAD
let currentScrollDepth = 0;
let scrollFrame = null;
let pointerFrame = null;

const canUseRichMotion = () => !reduceMotion && finePointerQuery.matches && window.innerWidth > 780;
=======
>>>>>>> f8c887761bd423e02ba0992cb06be6165fe47037

const updateScrollState = () => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progressValue = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
  const depthValue = clamp(scrollTop / Math.max(window.innerHeight, 1), 0, 3);
<<<<<<< HEAD
  const useParallax = canUseRichMotion();

  nav?.classList.toggle("is-scrolled", scrollTop > 16);
  currentScrollDepth = depthValue;
=======

  nav?.classList.toggle("is-scrolled", scrollTop > 16);
>>>>>>> f8c887761bd423e02ba0992cb06be6165fe47037
  document.documentElement.style.setProperty("--scroll-depth", depthValue.toFixed(3));

  if (progress) {
    progress.style.width = `${clamp(progressValue, 0, 100)}%`;
  }

<<<<<<< HEAD
  if (!useParallax) {
    return;
  }

=======
>>>>>>> f8c887761bd423e02ba0992cb06be6165fe47037
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

<<<<<<< HEAD
const requestScrollState = () => {
  if (scrollFrame) return;

  scrollFrame = window.requestAnimationFrame(() => {
    scrollFrame = null;
    updateScrollState();
  });
};

=======
>>>>>>> f8c887761bd423e02ba0992cb06be6165fe47037
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
    { threshold: 0.16 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

window.setTimeout(() => {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}, 700);

const moveCursor = (event) => {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  pointer.nx = pointer.x / window.innerWidth - 0.5;
  pointer.ny = pointer.y / window.innerHeight - 0.5;

  document.documentElement.style.setProperty("--mx", `${pointer.x}px`);
  document.documentElement.style.setProperty("--my", `${pointer.y}px`);
<<<<<<< HEAD

  if (!finePointerQuery.matches) return;

  if (!pointerFrame) {
    pointerFrame = window.requestAnimationFrame(() => {
      pointerFrame = null;
      document.documentElement.style.setProperty("--cursor-x", `${pointer.x}px`);
      document.documentElement.style.setProperty("--cursor-y", `${pointer.y}px`);
      cursor?.classList.add("is-visible");
    });
  }
=======
  document.documentElement.style.setProperty("--cursor-x", `${pointer.x}px`);
  document.documentElement.style.setProperty("--cursor-y", `${pointer.y}px`);

  cursor?.classList.add("is-visible");
>>>>>>> f8c887761bd423e02ba0992cb06be6165fe47037

  depthItems.forEach((item) => {
    const depth = Number(item.dataset.depth || 10);
    item.style.setProperty("--tilt-x", (pointer.nx * depth).toFixed(2));
    item.style.setProperty("--tilt-y", (pointer.ny * depth).toFixed(2));
  });
};

const armCursor = () => cursor?.classList.add("is-armed");
const disarmCursor = () => cursor?.classList.remove("is-armed");

hoverItems.forEach((item) => {
  item.addEventListener("pointerenter", armCursor);
  item.addEventListener("pointerleave", disarmCursor);

  item.addEventListener("pointermove", (event) => {
<<<<<<< HEAD
    if (!canUseRichMotion()) return;
=======
    if (reduceMotion) return;
>>>>>>> f8c887761bd423e02ba0992cb06be6165fe47037

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
<<<<<<< HEAD
    preserveDrawingBuffer: false,
    powerPreference: "high-performance",
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 780 ? 1.15 : 1.5));
=======
    preserveDrawingBuffer: true,
    powerPreference: "high-performance",
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
>>>>>>> f8c887761bd423e02ba0992cb06be6165fe47037
  renderer.setClearColor(0x000000, 0);

  const world = new THREE.Group();
  scene.add(world);

  const starGeometry = new THREE.BufferGeometry();
<<<<<<< HEAD
  const starCount = window.innerWidth < 780 ? 130 : 420;
=======
  const starCount = window.innerWidth < 700 ? 260 : 620;
>>>>>>> f8c887761bd423e02ba0992cb06be6165fe47037
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

<<<<<<< HEAD
  const shardCount = window.innerWidth < 780 ? 8 : 14;

  for (let i = 0; i < shardCount; i += 1) {
=======
  for (let i = 0; i < 18; i += 1) {
>>>>>>> f8c887761bd423e02ba0992cb06be6165fe47037
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

<<<<<<< HEAD
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 780 ? 1.15 : 1.5));
=======
>>>>>>> f8c887761bd423e02ba0992cb06be6165fe47037
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  const animate = (time = 0) => {
<<<<<<< HEAD
    if (document.hidden) {
      window.requestAnimationFrame(animate);
      return;
    }

    const scrollDepth = currentScrollDepth;
=======
    const scrollDepth = Number(
      getComputedStyle(document.documentElement).getPropertyValue("--scroll-depth") || 0
    );
>>>>>>> f8c887761bd423e02ba0992cb06be6165fe47037
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

<<<<<<< HEAD
  window.addEventListener("resize", () => {
    window.requestAnimationFrame(resize);
  });
=======
  window.addEventListener("resize", resize);
>>>>>>> f8c887761bd423e02ba0992cb06be6165fe47037
  resize();

  if (!reduceMotion) {
    animate();
  } else {
    renderer.render(scene, camera);
  }

  return { renderer, scene, camera, resize };
};

<<<<<<< HEAD
window.addEventListener("scroll", requestScrollState, { passive: true });
window.addEventListener("resize", requestScrollState);
=======
window.addEventListener("scroll", updateScrollState, { passive: true });
window.addEventListener("resize", updateScrollState);
>>>>>>> f8c887761bd423e02ba0992cb06be6165fe47037
window.addEventListener("pointermove", moveCursor, { passive: true });
window.addEventListener("pointerleave", () => cursor?.classList.remove("is-visible"));

const depthScene = createDepthScene();

updateScrollState();
depthScene?.resize();
