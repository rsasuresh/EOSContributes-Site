/* EoS landing page interactions. No dependencies beyond Bootstrap's bundle. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  var bs = window.bootstrap; // undefined if the CDN is blocked; the page still works without it
  root.classList.add('js');

  function storageGet(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function storageSet(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* storage unavailable */ } }

  /* Theme toggle — remembers the choice, otherwise follows the OS setting */
  var themeBtn = document.getElementById('themeToggle');
  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    themeBtn.innerHTML = theme === 'dark' ? '<i class="bi bi-moon-stars"></i>' : '<i class="bi bi-sun"></i>';
  }
  var savedTheme = storageGet('eos-theme');
  applyTheme(savedTheme || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));
  themeBtn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    storageSet('eos-theme', next);
  });

  /* Bootstrap tooltips */
  if (bs) {
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(function (el) {
      new bs.Tooltip(el);
    });
  }

  /* Collapse the mobile menu after a link is tapped */
  var navCollapse = document.getElementById('nav');
  navCollapse.querySelectorAll('.nav-link').forEach(function (link) {
    link.addEventListener('click', function () {
      if (bs && navCollapse.classList.contains('show')) bs.Collapse.getOrCreateInstance(navCollapse).hide();
    });
  });

  /* Scroll: progress bar, nav border, back-to-top, active nav link */
  var nav = document.querySelector('.glass-nav');
  var progress = document.querySelector('.scroll-progress');
  var toTop = document.querySelector('.back-to-top');
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    nav.classList.toggle('scrolled', y > 10);
    toTop.classList.toggle('show', y > 600);

    var current = '';
    sections.forEach(function (s) { if (y >= s.offsetTop - 120) current = s.id; });
    navLinks.forEach(function (l) { l.classList.toggle('active', l.getAttribute('href') === '#' + current); });
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();
  toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); });

  /* Count-up numbers */
  function countUp(el) {
    var target = parseFloat(el.dataset.count);
    var decimals = parseInt(el.dataset.decimals || '0', 10);
    var suffix = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = target.toFixed(decimals) + suffix; return; }
    var start = null, duration = 1600;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (p < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }

  /* Scroll reveal, staggered within each row */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var siblings = el.parentElement ? el.parentElement.querySelectorAll(':scope > .reveal') : [];
        var index = Array.prototype.indexOf.call(siblings, el);
        el.style.transitionDelay = (index > 0 ? index * 80 : 0) + 'ms';
        el.classList.add('visible');
        el.querySelectorAll('[data-count]').forEach(countUp);
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('visible'); });
    document.querySelectorAll('[data-count]').forEach(countUp);
  }

  /* Hero word rotator */
  var typeTarget = document.getElementById('typeTarget');
  var words = ['Every target.', 'Linux hosts.', 'Cortex-M.', 'Cortex-R.', 'Your product.'];
  if (!reduceMotion) {
    var wi = 0, ci = words[0].length, deleting = true;
    (function tick() {
      var word = words[wi];
      typeTarget.textContent = word.slice(0, ci);
      var delay = deleting ? 45 : 85;
      if (deleting) {
        ci--;
        if (ci < 0) { deleting = false; wi = (wi + 1) % words.length; ci = 0; delay = 300; }
      } else {
        ci++;
        if (ci > words[wi].length) { deleting = true; ci = words[wi].length; delay = 2200; }
      }
      setTimeout(tick, delay);
    })();
  }

  /* Terminal typing animation */
  var term = document.querySelector('#terminal code');
  var script = [
    { cmd: 'cmake -B build/host -DEOS_BUILD_TESTS=ON -DEOS_PRODUCT=vbox_test' },
    { out: '<span class="dim">-- The C compiler identification is AppleClang</span>' },
    { out: '<span class="dim">-- Configuring done · Generating done</span>' },
    { cmd: 'cmake --build build/host --parallel' },
    { out: '<span class="dim">[100%] Built target eos_kernel</span>' },
    { cmd: 'ctest --test-dir build/host --output-on-failure' },
    { out: '<span class="ok">100% tests passed</span> <span class="dim">— illustrative output</span>' }
  ];
  function renderStatic() {
    term.innerHTML = script.map(function (l) {
      return l.cmd ? '<span class="prompt">❯</span> ' + l.cmd : l.out;
    }).join('\n');
  }
  if (reduceMotion) {
    renderStatic();
  } else {
    var html = '', li = 0;
    function nextLine() {
      if (li >= script.length) {
        term.innerHTML = html + '\n<span class="prompt">❯</span> <span class="caret">&nbsp;</span>';
        setTimeout(function () { html = ''; li = 0; nextLine(); }, 4000);
        return;
      }
      var line = script[li++];
      if (line.out) {
        html += line.out + '\n';
        term.innerHTML = html;
        setTimeout(nextLine, 380);
        return;
      }
      var prefix = '<span class="prompt">❯</span> ', i = 0;
      (function typeChar() {
        term.innerHTML = html + prefix + line.cmd.slice(0, i) + '<span class="caret">&nbsp;</span>';
        if (i++ < line.cmd.length) { setTimeout(typeChar, 22 + Math.random() * 30); return; }
        html += prefix + line.cmd + '\n';
        setTimeout(nextLine, 300);
      })();
    }
    nextLine();
  }

  /* Pointer micro-interactions (skipped on touch and reduced motion) */
  var finePointer = window.matchMedia('(pointer: fine)').matches;
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('.feature-card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
    document.querySelectorAll('.tilt').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'perspective(1000px) rotateY(' + (x * 8) + 'deg) rotateX(' + (-y * 8) + 'deg)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
    document.querySelectorAll('.magnetic').forEach(function (btn) {
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        btn.style.transform = 'translate(' + (x * 0.15) + 'px,' + (y * 0.25) + 'px)';
      });
      btn.addEventListener('pointerleave', function () { btn.style.transform = ''; });
    });
  }

  /* Copy-to-clipboard for code blocks */
  var toastEl = document.getElementById('copyToast');
  var toast = bs ? bs.Toast.getOrCreateInstance(toastEl, { delay: 1800 }) : null;
  document.querySelectorAll('.copy-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.parentElement.querySelector('code').innerText;
      if (!navigator.clipboard) return;
      navigator.clipboard.writeText(text).then(function () {
        btn.classList.add('copied');
        btn.innerHTML = '<i class="bi bi-check2"></i>';
        if (toast) toast.show();
        setTimeout(function () { btn.classList.remove('copied'); btn.innerHTML = '<i class="bi bi-clipboard"></i>'; }, 1800);
      });
    });
  });

  /* Live GitHub star and fork counts for eos and ebuild; on failure the build-time counts stay */
  function compact(n) { return n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n); }
  var repoEls = {};
  document.querySelectorAll('[data-repo]').forEach(function (el) {
    (repoEls[el.dataset.repo] = repoEls[el.dataset.repo] || []).push(el);
  });
  Object.keys(repoEls).forEach(function (repo) {
    fetch('https://api.github.com/repos/' + repo, { headers: { Accept: 'application/vnd.github+json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data || typeof data.stargazers_count !== 'number') return;
        repoEls[repo].forEach(function (el) {
          el.querySelectorAll('[data-stars]').forEach(function (s) { s.textContent = (s.dataset.prefix || '') + compact(data.stargazers_count); });
          el.querySelectorAll('[data-forks]').forEach(function (f) { f.textContent = compact(data.forks_count); });
        });
      })
      .catch(function () { /* offline or blocked — keep the build-time counts */ });
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
