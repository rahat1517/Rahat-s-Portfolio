// ─── CONFIG ────────────────────────────────────
const LEETCODE_USERNAME   = "Rahat1517";
const CODEFORCES_HANDLE   = "rahat1517";

// Shown if the live APIs are unreachable. Update these now and then.
const LC_FALLBACK = { total: 116, easy: 106, medium: 10, hard: 0 };
const CF_FALLBACK = { solved: 41 };
// ───────────────────────────────────────────────

const stats = { lc: LC_FALLBACK.total, cf: CF_FALLBACK.solved };


// ─── CUSTOM CURSOR (mouse / trackpad only) ─────
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (finePointer && !reduceMotion) {
  document.body.classList.add("custom-cursor");
  const cursor     = document.getElementById("cursor");
  const cursorRing = document.getElementById("cursorRing");
  let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

  document.addEventListener("mousemove", (e) => {
    document.body.classList.add("cursor-on");
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + "px";
    cursor.style.top  = mouseY + "px";
  });

  (function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    cursorRing.style.left = ringX + "px";
    cursorRing.style.top  = ringY + "px";
    requestAnimationFrame(animateRing);
  })();

  document.addEventListener("mouseover", (e) => {
    if (e.target.closest("a, button")) {
      cursor.style.transform = "translate(-50%, -50%) scale(2)";
      cursorRing.style.opacity = "1";
    }
  });
  document.addEventListener("mouseleave", () => document.body.classList.remove("cursor-on"));
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest("a, button")) {
      cursor.style.transform = "translate(-50%, -50%) scale(1)";
      cursorRing.style.opacity = "0.5";
    }
  });
}


// ─── NAV SCROLL EFFECT ─────────────────────────
const nav = document.getElementById("nav");
const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 50);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();


// ─── MOBILE MENU ───────────────────────────────
const burger   = document.getElementById("navBurger");
const navLinks = document.getElementById("navLinks");

function setMenu(open) {
  navLinks.classList.toggle("open", open);
  burger.classList.toggle("open", open);
  burger.setAttribute("aria-expanded", String(open));
  burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}

burger.addEventListener("click", () => setMenu(!navLinks.classList.contains("open")));
navLinks.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });


// ─── ACTIVE NAV LINK ON SCROLL ─────────────────
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      navLinks.querySelectorAll("a").forEach((a) => {
        a.classList.toggle("active", a.getAttribute("href") === "#" + id);
      });
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);
document.querySelectorAll("main section[id]").forEach((s) => sectionObserver.observe(s));


// ─── SCROLL REVEAL ─────────────────────────────
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (!entry.isIntersecting) return;
      setTimeout(() => entry.target.classList.add("visible"), i * 80);
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.08 }
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));


// ─── COUNTERS ──────────────────────────────────
function animateCount(el, to, suffix = "") {
  if (!el) return;
  if (reduceMotion) { el.textContent = to + suffix; return; }
  let current = 0;
  const step = Math.max(1, Math.ceil(to / 60));
  const timer = setInterval(() => {
    current = Math.min(current + step, to);
    el.textContent = current + suffix;
    if (current >= to) clearInterval(timer);
  }, 22);
}

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      animateCount(el, parseInt(el.dataset.target, 10), el.dataset.suffix ?? "+");
      counterObserver.unobserve(el);
    });
  },
  { threshold: 0.5 }
);
document.querySelectorAll(".stat-num[data-target]").forEach((el) => counterObserver.observe(el));


// ─── PROJECT FILTERS ───────────────────────────
const filterBtns = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll(".project-card");

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const f = btn.dataset.filter;
    filterBtns.forEach((b) => {
      b.classList.toggle("active", b === btn);
      b.setAttribute("aria-pressed", String(b === btn));
    });
    projectCards.forEach((card) => {
      const show = f === "all" || card.dataset.category === f;
      card.classList.toggle("hidden", !show);
      if (show) card.classList.add("visible");
    });
  });
});


// ─── COPY EMAIL ────────────────────────────────
document.querySelectorAll(".copy-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const original = btn.textContent;
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      btn.textContent = "✓ Copied!";
    } catch {
      btn.textContent = btn.dataset.copy;
    }
    setTimeout(() => (btn.textContent = original), 2000);
  });
});


// ─── RÉSUMÉ BUTTONS ────────────────────────────
// Hides the résumé buttons until a resume.pdf is added next to index.html,
// so visitors never hit a broken link.
(async function checkResume() {
  const btns = document.querySelectorAll(".resume-btn");
  try {
    const res = await fetch("resume.pdf", { method: "HEAD", cache: "no-store" });
    const type = res.headers.get("content-type") || "";
    if (!res.ok || type.includes("text/html")) throw new Error("missing");
  } catch {
    btns.forEach((b) => (b.hidden = true));
  }
})();


// ─── FOOTER YEAR ───────────────────────────────
document.getElementById("year").textContent = new Date().getFullYear();


// ─── TOTAL SOLVED (hero) ───────────────────────
function updateTotalSolved() {
  const total = stats.lc + stats.cf;
  const rounded = Math.floor(total / 10) * 10;
  const el = document.getElementById("hero-solved");
  if (el) el.textContent = (total % 10 === 0 ? total : rounded + "+");
}


// ─── LEETCODE LIVE DATA ────────────────────────
async function fetchJSON(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}

async function fetchLeetCodeStats() {
  const sources = [
    async () => {
      const d = await fetchJSON(`https://alfa-leetcode-api.onrender.com/${LEETCODE_USERNAME}/solved`);
      return { total: d.solvedProblem, easy: d.easySolved, medium: d.mediumSolved, hard: d.hardSolved };
    },
    async () => {
      const d = await fetchJSON(`https://leetcode-stats-api.herokuapp.com/${LEETCODE_USERNAME}`);
      if (d.status === "error") throw new Error(d.message);
      return { total: d.totalSolved, easy: d.easySolved, medium: d.mediumSolved, hard: d.hardSolved };
    },
  ];

  for (const source of sources) {
    try {
      const s = await source();
      if (typeof s.total !== "number" || s.total < LC_FALLBACK.total) throw new Error("bad data");
      applyLeetCodeStats(s, true);
      return;
    } catch (err) {
      console.warn("[LeetCode] source failed:", err.message);
    }
  }
  applyLeetCodeStats(LC_FALLBACK, false);
}

function applyLeetCodeStats({ total, easy, medium, hard }, live) {
  stats.lc = total;
  animateCount(document.getElementById("lc-stat"), total);
  animateCount(document.getElementById("lc-cp-count"), total);
  document.getElementById("terminal-lc").textContent = total;
  document.getElementById("lc-breakdown").innerHTML = `
    <span class="diff easy">Easy: ${easy}</span>
    <span class="diff medium">Medium: ${medium}</span>
    <span class="diff hard">Hard: ${hard}</span>`;
  document.getElementById("lc-live").hidden = !live;
  updateTotalSolved();
}


// ─── CODEFORCES LIVE DATA (official API) ───────
async function fetchCodeforcesStats() {
  try {
    const [info, status] = await Promise.all([
      fetchJSON(`https://codeforces.com/api/user.info?handles=${CODEFORCES_HANDLE}`),
      fetchJSON(`https://codeforces.com/api/user.status?handle=${CODEFORCES_HANDLE}`),
    ]);
    if (info.status !== "OK" || status.status !== "OK") throw new Error("API not OK");

    const solved = new Set(
      status.result
        .filter((s) => s.verdict === "OK")
        .map((s) => `${s.problem.contestId}-${s.problem.index}`)
    ).size;

    const user = info.result[0];
    applyCodeforcesStats(Math.max(solved, CF_FALLBACK.solved), user, true);
  } catch (err) {
    console.warn("[Codeforces] API failed:", err.message);
    applyCodeforcesStats(CF_FALLBACK.solved, null, false);
  }
}

function applyCodeforcesStats(solved, user, live) {
  stats.cf = solved;
  animateCount(document.getElementById("cf-stat"), solved);
  animateCount(document.getElementById("cf-cp-count"), solved);
  document.getElementById("terminal-cf").textContent = solved;
  document.getElementById("cf-live").hidden = !live;

  if (user && user.rating) {
    const rank = user.rank ? user.rank.replace(/\b\w/g, (c) => c.toUpperCase()) : "Rated";
    document.getElementById("cf-breakdown").innerHTML = `
      <span class="diff easy">Rating: ${user.rating}</span>
      <span class="diff medium">Max: ${user.maxRating}</span>
      <span class="diff easy">${rank}</span>`;
  }
  updateTotalSolved();
}


// Kick it off + refresh every 10 minutes while the tab is open
fetchLeetCodeStats();
fetchCodeforcesStats();
setInterval(() => { fetchLeetCodeStats(); fetchCodeforcesStats(); }, 10 * 60 * 1000);
