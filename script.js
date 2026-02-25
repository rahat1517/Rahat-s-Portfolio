
const LEETCODE_USERNAME = "Rahat1517";
// ───────────────────────────────────────────────


// ─── CUSTOM CURSOR ─────────────────────────────
const cursor    = document.getElementById("cursor");
const cursorRing = document.getElementById("cursorRing");

let mouseX = 0, mouseY = 0;
let ringX  = 0, ringY  = 0;

document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + "px";
  cursor.style.top  = mouseY + "px";
});

function animateRing() {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  cursorRing.style.left = ringX + "px";
  cursorRing.style.top  = ringY + "px";
  requestAnimationFrame(animateRing);
}
animateRing();

// Cursor scale on hover
document.querySelectorAll("a, button").forEach((el) => {
  el.addEventListener("mouseenter", () => {
    cursor.style.transform = "translate(-50%, -50%) scale(2)";
    cursorRing.style.opacity = "1";
  });
  el.addEventListener("mouseleave", () => {
    cursor.style.transform = "translate(-50%, -50%) scale(1)";
    cursorRing.style.opacity = "0.5";
  });
});


// ─── NAV SCROLL EFFECT ─────────────────────────
const nav = document.getElementById("nav");

window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 50);
});


// ─── MOBILE BURGER MENU ────────────────────────
const burger    = document.getElementById("navBurger");
const navLinks  = document.querySelector(".nav-links");

burger.addEventListener("click", () => {
  const isOpen = navLinks.style.display === "flex";
  navLinks.style.display = isOpen ? "none" : "flex";
  navLinks.style.flexDirection = "column";
  navLinks.style.position = "fixed";
  navLinks.style.top = "64px";
  navLinks.style.right = "0";
  navLinks.style.left = "0";
  navLinks.style.background = "#0a0a0a";
  navLinks.style.padding = "16px 24px 24px";
  navLinks.style.borderBottom = "1px solid #1a1a1a";
});

// Close nav on link click (mobile)
document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.style.display = "none";
  });
});


// ─── SCROLL REVEAL ─────────────────────────────
const revealEls = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add("visible");
        }, i * 80);
      }
    });
  },
  { threshold: 0.08 }
);

revealEls.forEach((el) => revealObserver.observe(el));


// ─── STAT COUNTER ANIMATION ────────────────────
const counterEls = document.querySelectorAll(".stat-num[data-target]");

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const el     = entry.target;
      const target = parseInt(el.dataset.target);
      const suffix = el.dataset.suffix ?? "+";
      let current  = 0;
      const step   = target / 60;

      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        el.textContent = Math.floor(current) + suffix;
      }, 22);

      counterObserver.unobserve(el);
    });
  },
  { threshold: 0.5 }
);

counterEls.forEach((el) => counterObserver.observe(el));


// ─── LEETCODE LIVE DATA ────────────────────────
// Uses alfa-leetcode-api (free, no auth needed)
// Fetches total + difficulty breakdown automatically.

async function fetchLeetCodeStats() {
  if (!LEETCODE_USERNAME || LEETCODE_USERNAME === "Rahat1517") {
    setLeetCodeFallback("100+");
    console.warn(
      "[LeetCode] Set LEETCODE_USERNAME in script.js to enable live stats."
    );
    return;
  }

  try {
    // Primary API
    const url = `https://alfa-leetcode-api.onrender.com/${LEETCODE_USERNAME}/solved`;
    const res  = await fetch(url, { signal: AbortSignal.timeout(8000) });

    if (!res.ok) throw new Error("API error " + res.status);

    const data = await res.json();

    // data shape: { solvedProblem, easySolved, mediumSolved, hardSolved }
    const total  = data.solvedProblem ?? data.totalSolved ?? null;
    const easy   = data.easySolved   ?? "—";
    const medium = data.mediumSolved ?? "—";
    const hard   = data.hardSolved   ?? "—";

    if (total === null) throw new Error("Unexpected API shape");

    applyLeetCodeStats(total, easy, medium, hard);

  } catch (err) {
    console.warn("[LeetCode] Primary API failed, trying fallback...", err.message);
    fetchLeetCodeFallbackAPI();
  }
}

async function fetchLeetCodeFallbackAPI() {
  try {
    // Fallback: leetcode-stats-api
    const url = `https://leetcode-stats-api.herokuapp.com/${LEETCODE_USERNAME}`;
    const res  = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const data = await res.json();

    if (data.status === "error") throw new Error(data.message);

    const total  = data.totalSolved;
    const easy   = data.easySolved;
    const medium = data.mediumSolved;
    const hard   = data.hardSolved;

    applyLeetCodeStats(total, easy, medium, hard);

  } catch (err) {
    console.warn("[LeetCode] Both APIs failed. Showing static data.", err.message);
    setLeetCodeFallback("100+");
  }
}

function applyLeetCodeStats(total, easy, medium, hard) {
  // Animate the main stat counter in stats bar
  const lcStat = document.getElementById("lc-stat");
  if (lcStat) {
    lcStat.removeAttribute("data-target"); // disable generic counter
    animateCount(lcStat, 0, total, "+");
  }

  // Terminal live value
  const termLc = document.getElementById("terminal-lc");
  if (termLc) termLc.textContent = total;

  // CP card big number
  const lcCpCount = document.getElementById("lc-cp-count");
  if (lcCpCount) animateCount(lcCpCount, 0, total, "+");

  // Difficulty breakdown
  const breakdown = document.getElementById("lc-breakdown");
  if (breakdown) {
    breakdown.innerHTML = `
      <span class="diff easy">Easy: ${easy}</span>
      <span class="diff medium">Medium: ${medium}</span>
      <span class="diff hard">Hard: ${hard}</span>
    `;
  }

  console.log(
    `[LeetCode] ✓ Loaded — Total: ${total} | Easy: ${easy} | Medium: ${medium} | Hard: ${hard}`
  );
}

function setLeetCodeFallback(label) {
  const ids = ["lc-stat", "lc-cp-count", "terminal-lc"];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = label;
  });
}

function animateCount(el, from, to, suffix = "") {
  let current = from;
  const step  = Math.ceil(to / 60);

  const timer = setInterval(() => {
    current += step;
    if (current >= to) {
      current = to;
      clearInterval(timer);
    }
    el.textContent = current + suffix;
  }, 22);
}

// Kick it off!
fetchLeetCodeStats();

// ─── AUTO-REFRESH every 5 minutes ──────────────
// So if the user keeps the tab open, stats stay fresh.
setInterval(fetchLeetCodeStats, 5 * 60 * 1000);