/* ═══════════════════════════════════════════════════════
   CRISISEYE — Shared JavaScript
   script.js — used across all pages
   ═══════════════════════════════════════════════════════ */

/* ── NAV SCROLL BEHAVIOR ─────────────────────────────── */
(function () {
  const nav = document.getElementById('mainNav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });
})();

/* ── HAMBURGER / MOBILE MENU ─────────────────────────── */
(function () {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
  });
})();

/* ── COUNTER ANIMATION ───────────────────────────────── */
function animateCounter(el) {
  const target   = parseInt(el.dataset.count, 10);
  const duration = 1800;
  const start    = performance.now();

  function step(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const ease     = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(ease * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString();
  }
  requestAnimationFrame(step);
}

/* ── INTERSECTION OBSERVER (reveal + counters) ───────── */
(function () {
  const revealEls  = document.querySelectorAll('.reveal');
  const counterEls = document.querySelectorAll('[data-count]');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger siblings
        const siblings = [...entry.target.parentElement.querySelectorAll('.reveal')];
        const idx = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = (idx * 80) + 'ms';
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  revealEls.forEach(el  => revealObserver.observe(el));
  counterEls.forEach(el => counterObserver.observe(el));
})();

/* ── TICKER DUPLICATE (seamless scroll) ──────────────── */
(function () {
  const ticker = document.getElementById('ticker');
  if (!ticker) return;
  // Duplicate children for seamless loop
  const items = ticker.innerHTML;
  ticker.innerHTML = items + items;
})();

/* ══════════════════════════════════════════════════════
   REPORT PAGE — form logic
══════════════════════════════════════════════════════ */
(function () {
  const form = document.getElementById('reportForm');
  if (!form) return;

  // Severity selector
  const severityBtns = form.querySelectorAll('.severity-btn');
  const severityInput = document.getElementById('severityInput');
  severityBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      severityBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      severityInput.value = btn.dataset.value;
    });
  });

  // Emergency type selector
  const typeBtns = form.querySelectorAll('.type-btn');
  const typeInput = document.getElementById('typeInput');
  typeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      typeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      typeInput.value = btn.dataset.value;
    });
  });

  // Form submission
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const submitBtn = form.querySelector('.btn--submit');
    const original  = submitBtn.textContent;

    // Basic validation
    const type     = typeInput.value;
    const severity = severityInput.value;
    const location = form.querySelector('#location').value.trim();
    const desc     = form.querySelector('#description').value.trim();

    if (!type || !severity || !location || !desc) {
      showFormMsg('Please fill in all required fields.', 'error');
      return;
    }

    // Simulate submission
    submitBtn.disabled = true;
    submitBtn.textContent = 'Transmitting…';

    setTimeout(() => {
      submitBtn.textContent = '✓ Report Submitted';
      showFormMsg('Your emergency report has been received. Relevant agencies have been notified.', 'success');
      setTimeout(() => {
        submitBtn.disabled   = false;
        submitBtn.textContent = original;
        form.reset();
        severityBtns.forEach(b => b.classList.remove('active'));
        typeBtns.forEach(b => b.classList.remove('active'));
        severityInput.value = '';
        typeInput.value     = '';
      }, 4000);
    }, 1800);
  });

  function showFormMsg(msg, type) {
    let el = document.getElementById('formMsg');
    if (!el) {
      el = document.createElement('div');
      el.id = 'formMsg';
      form.appendChild(el);
    }
    el.textContent  = msg;
    el.className    = 'form-msg form-msg--' + type;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 5000);
  }
})();

/* ══════════════════════════════════════════════════════
   MAP PAGE — incident list + filters
══════════════════════════════════════════════════════ */
(function () {
  const filterBtns = document.querySelectorAll('.filter-btn');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      const items  = document.querySelectorAll('.incident-item');
      items.forEach(item => {
        if (filter === 'all' || item.dataset.type === filter) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
})();

/* ══════════════════════════════════════════════════════
   DASHBOARD PAGE — charts (Canvas API)
══════════════════════════════════════════════════════ */
(function () {
  /* ── Trend Line Chart ───────────────────────────── */
  const trendCanvas = document.getElementById('trendChart');
  if (trendCanvas) {
    drawLineChart(trendCanvas, {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        { label: 'Total Incidents', data: [42, 58, 71, 63, 89, 104, 97, 112, 88, 76, 95, 110], color: '#38BDF8' },
        { label: 'Resolved',        data: [38, 51, 68, 60, 82,  96, 91, 105, 82, 71, 89, 104], color: '#10B981' },
      ]
    });
  }

  /* ── Donut Chart ────────────────────────────────── */
  const donutCanvas = document.getElementById('categoryChart');
  if (donutCanvas) {
    drawDonutChart(donutCanvas, {
      labels: ['Medical', 'Accident', 'Fire', 'Flood', 'Crime', 'Hazard'],
      data:   [87, 56, 43, 31, 29, 12],
      colors: ['#10B981', '#F97316', '#EF4444', '#38BDF8', '#94A3B8', '#FBBF24'],
    });
  }

  /* ── Bar Chart ──────────────────────────────────── */
  const barCanvas = document.getElementById('resolutionChart');
  if (barCanvas) {
    drawBarChart(barCanvas, {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      data:   [91, 88, 94, 96],
      color:  '#10B981',
    });
  }
})();

/* ── Chart Helpers ───────────────────────────────────── */
function drawLineChart(canvas, { labels, datasets }) {
  const ctx    = canvas.getContext('2d');
  const W      = canvas.offsetWidth;
  const H      = canvas.offsetHeight;
  canvas.width  = W * devicePixelRatio;
  canvas.height = H * devicePixelRatio;
  ctx.scale(devicePixelRatio, devicePixelRatio);

  const pad    = { top: 24, right: 24, bottom: 36, left: 44 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top  - pad.bottom;

  const allData = datasets.flatMap(d => d.data);
  const maxVal  = Math.max(...allData) * 1.15;
  const minVal  = 0;

  const xStep = chartW / (labels.length - 1);
  const yScale = (v) => pad.top + chartH - ((v - minVal) / (maxVal - minVal)) * chartH;
  const xAt    = (i) => pad.left + i * xStep;

  // Grid lines
  ctx.strokeStyle = 'rgba(30,41,59,1)';
  ctx.lineWidth   = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(pad.left + chartW, y);
    ctx.stroke();

    const val = Math.round(maxVal - (maxVal / 4) * i);
    ctx.fillStyle = '#64748B';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(val, pad.left - 8, y + 4);
  }

  // X labels
  ctx.fillStyle = '#64748B';
  ctx.font = '11px Inter, sans-serif';
  ctx.textAlign = 'center';
  labels.forEach((label, i) => {
    ctx.fillText(label, xAt(i), H - pad.bottom + 18);
  });

  // Datasets
  datasets.forEach(dataset => {
    const pts = dataset.data.map((v, i) => ({ x: xAt(i), y: yScale(v) }));

    // Fill gradient
    const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
    grad.addColorStop(0, dataset.color + '30');
    grad.addColorStop(1, dataset.color + '00');

    ctx.beginPath();
    ctx.moveTo(pts[0].x, yScale(0));
    pts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length - 1].x, yScale(0));
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = dataset.color;
    ctx.lineWidth   = 2;
    ctx.lineJoin    = 'round';
    ctx.stroke();

    // Dots
    pts.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle   = dataset.color;
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth   = 2;
      ctx.fill();
      ctx.stroke();
    });
  });
}

function drawDonutChart(canvas, { labels, data, colors }) {
  const ctx = canvas.getContext('2d');
  const W   = canvas.offsetWidth;
  const H   = canvas.offsetHeight;
  canvas.width  = W * devicePixelRatio;
  canvas.height = H * devicePixelRatio;
  ctx.scale(devicePixelRatio, devicePixelRatio);

  const total = data.reduce((a, b) => a + b, 0);
  const cx    = W / 2;
  const cy    = H / 2;
  const R     = Math.min(W, H) / 2 - 20;
  const inner = R * 0.58;

  let angle = -Math.PI / 2;
  data.forEach((v, i) => {
    const slice = (v / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, R, angle, angle + slice);
    ctx.closePath();
    ctx.fillStyle = colors[i];
    ctx.fill();
    angle += slice;
  });

  // Inner cutout
  ctx.beginPath();
  ctx.arc(cx, cy, inner, 0, Math.PI * 2);
  ctx.fillStyle = '#0F172A';
  ctx.fill();

  // Center text
  ctx.fillStyle = '#F8FAFC';
  ctx.font = `bold ${Math.round(W * 0.1)}px Space Grotesk, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(total, cx, cy - 8);
  ctx.font = `${Math.round(W * 0.045)}px Inter, sans-serif`;
  ctx.fillStyle = '#64748B';
  ctx.fillText('incidents', cx, cy + 14);
}

function drawBarChart(canvas, { labels, data, color }) {
  const ctx    = canvas.getContext('2d');
  const W      = canvas.offsetWidth;
  const H      = canvas.offsetHeight;
  canvas.width  = W * devicePixelRatio;
  canvas.height = H * devicePixelRatio;
  ctx.scale(devicePixelRatio, devicePixelRatio);

  const pad    = { top: 24, right: 24, bottom: 36, left: 44 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top  - pad.bottom;
  const maxVal = 100;
  const barW   = (chartW / labels.length) * 0.55;
  const gap    = chartW / labels.length;

  // Grid
  ctx.strokeStyle = 'rgba(30,41,59,1)';
  ctx.lineWidth   = 1;
  [0, 25, 50, 75, 100].forEach(v => {
    const y = pad.top + chartH - (v / maxVal) * chartH;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(pad.left + chartW, y);
    ctx.stroke();
    ctx.fillStyle = '#64748B';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(v + '%', pad.left - 8, y + 4);
  });

  // Bars
  data.forEach((v, i) => {
    const x   = pad.left + i * gap + gap / 2 - barW / 2;
    const barH = (v / maxVal) * chartH;
    const y   = pad.top + chartH - barH;

    const grad = ctx.createLinearGradient(0, y, 0, y + barH);
    grad.addColorStop(0, color);
    grad.addColorStop(1, color + '60');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, barW, barH, [4, 4, 0, 0]);
    ctx.fill();

    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 13px Space Grotesk, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(v + '%', x + barW / 2, y - 8);

    ctx.fillStyle = '#64748B';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText(labels[i], x + barW / 2, H - pad.bottom + 18);
  });
}
