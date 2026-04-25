/* ═══════════════════════════════════════════════════════════════════════
   RideEasy – Main Client JavaScript
═══════════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Navbar mobile toggle ────────────────────────────────────────────
  const navToggle = document.getElementById('navToggle');
  const navMenu   = document.getElementById('navMenu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => navMenu.classList.toggle('open'));
    // Close menu when link clicked
    navMenu.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => navMenu.classList.remove('open'))
    );
  }

  // ── Auto-dismiss flash messages ─────────────────────────────────────
  const flashes = document.querySelectorAll('.flash');
  flashes.forEach(flash => {
    setTimeout(() => flash.style.opacity = '0', 4500);
    setTimeout(() => flash.remove(), 5000);
    flash.querySelector('.flash__close')?.addEventListener('click', () => flash.remove());
  });

  // ── Filter panel toggle (mobile) ────────────────────────────────────
  const filterToggle = document.getElementById('filterToggle');
  const filterPanel  = document.getElementById('filterPanel');
  if (filterToggle && filterPanel) {
    filterToggle.addEventListener('click', () => filterPanel.classList.toggle('open'));
  }

  // ── Auto-submit filter form on select change ─────────────────────────
  const filterForm = document.getElementById('filterForm');
  if (filterForm) {
    filterForm.querySelectorAll('select').forEach(sel =>
      sel.addEventListener('change', () => filterForm.submit())
    );
  }

  // ── Live search (autocomplete) ──────────────────────────────────────
  const searchInputs = document.querySelectorAll('input[name="q"]');
  searchInputs.forEach(input => {
    let timeout;
    const dropdown = document.createElement('div');
    dropdown.className = 'search-dropdown';
    dropdown.style.cssText = `
      position:absolute;top:100%;left:0;right:0;background:#fff;
      border:1px solid #e2e8f0;border-radius:10px;z-index:500;
      box-shadow:0 8px 24px rgba(0,0,0,.12);display:none;max-height:320px;overflow-y:auto;
    `;
    input.parentElement.style.position = 'relative';
    input.parentElement.appendChild(dropdown);

    input.addEventListener('input', () => {
      clearTimeout(timeout);
      const q = input.value.trim();
      if (q.length < 2) { dropdown.style.display = 'none'; return; }
      timeout = setTimeout(async () => {
        const res  = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const bikes = await res.json();
        if (!bikes.length) { dropdown.style.display = 'none'; return; }
        dropdown.innerHTML = bikes.map(b => `
          <a href="/bikes/${b._id}" style="display:flex;gap:10px;padding:10px 14px;align-items:center;text-decoration:none;color:#1a1a2e;border-bottom:1px solid #f1f5f9;">
            <img src="${b.images[0] || '/images/bike-default.jpg'}" style="width:44px;height:34px;object-fit:cover;border-radius:6px"/>
            <div>
              <strong>${b.name}</strong>
              <small style="display:block;color:#6b7280">${b.city} · ${b.type} · ₹${b.pricePerDay}/day</small>
            </div>
            <span style="margin-left:auto;color:#ff6b35;font-weight:700">★ ${b.avgRating}</span>
          </a>
        `).join('');
        dropdown.style.display = 'block';
      }, 350);
    });

    document.addEventListener('click', e => {
      if (!dropdown.contains(e.target) && e.target !== input) dropdown.style.display = 'none';
    });
  });

  // ── Navbar scroll effect ────────────────────────────────────────────
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    const onScroll = () => {
      if (window.scrollY > 40) {
        navbar.style.background = 'rgba(26,26,46,1)';
      } else {
        navbar.style.background = 'rgba(26,26,46,0.95)';
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ── Booking form: set min end date based on start date ───────────────
  const startDate = document.getElementById('startDate');
  const endDate   = document.getElementById('endDate');
  if (startDate && endDate) {
    startDate.addEventListener('change', () => {
      if (startDate.value) endDate.min = startDate.value;
    });
    // Set default start to now + 1 hour
    const now = new Date();
    now.setHours(now.getHours() + 1, 0, 0, 0);
    startDate.min = now.toISOString().slice(0, 16);
  }

  // ── Smooth scroll for anchor links ──────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── Lazy-load images with Intersection Observer ──────────────────────
  if ('IntersectionObserver' in window) {
    const imgObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) { img.src = img.dataset.src; }
          img.classList.add('loaded');
          obs.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });
    document.querySelectorAll('img[loading="lazy"]').forEach(img => imgObserver.observe(img));
  }

  // ── Confirm dangerous actions ────────────────────────────────────────
  document.querySelectorAll('[data-confirm]').forEach(el => {
    el.addEventListener('click', e => {
      if (!confirm(el.dataset.confirm)) e.preventDefault();
    });
  });

  // ── Admin: Bike type chart animation ─────────────────────────────────
  document.querySelectorAll('.chart-bar__fill').forEach(bar => {
    const w = bar.style.width;
    bar.style.width = '0';
    setTimeout(() => { bar.style.transition = 'width .8s ease'; bar.style.width = w; }, 200);
  });

  // ── Revenue chart animation ──────────────────────────────────────────
  document.querySelectorAll('.rev-bar__fill').forEach(bar => {
    const h = bar.style.height;
    bar.style.height = '0';
    setTimeout(() => { bar.style.transition = 'height .8s ease'; bar.style.height = h; }, 300);
  });

  // ── Tooltip init ──────────────────────────────────────────────────────
  document.querySelectorAll('[data-tip]').forEach(el => {
    el.setAttribute('title', el.dataset.tip);
  });

  // ── Print booking detail ──────────────────────────────────────────────
  const printBtn = document.getElementById('printBooking');
  if (printBtn) printBtn.addEventListener('click', () => window.print());

});
