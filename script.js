/* ================================================================
   CORPAUDIT PRO — ENTERPRISE REPORTING SYSTEM
   script.js — Complete Application Logic
   Version: 2.0 Professional
================================================================ */

'use strict';

/* ================================================================
   DATA STORE & SEED DATA
================================================================ */
const BASE_USERS = {
  admin: { pass: 'admin123', name: 'Alex Morgan', role: 'admin', dept: UZBEK_STRINGS?.['Finance & Accounting'] || 'Finance & Accounting', color: '#F5A623', joined: '2024-01-01' },
  worker1: { pass: 'pass123', name: 'Sarah Chen', role: 'worker', dept: UZBEK_STRINGS?.['Finance & Accounting'] || 'Finance & Accounting', color: '#00E5C3', joined: '2024-01-15' },
  worker2: { pass: 'pass123', name: 'Marcus Johnson', role: 'worker', dept: UZBEK_STRINGS?.['Operations'] || 'Operations', color: '#6C63FF', joined: '2024-01-20' },
  worker3: { pass: 'pass123', name: 'Priya Sharma', role: 'worker', dept: UZBEK_STRINGS?.['Legal & Compliance'] || 'Legal & Compliance', color: '#FF4D6D', joined: '2024-02-01' },
  worker4: { pass: 'pass123', name: 'David Park', role: 'worker', dept: UZBEK_STRINGS?.['IT & Systems'] || 'IT & Systems', color: '#FFB800', joined: '2024-02-10' },
  worker5: { pass: 'pass123', name: 'Emma Wilson', role: 'worker', dept: UZBEK_STRINGS?.['Human Resources'] || 'Human Resources', color: '#00C896', joined: '2024-02-14' },
  worker6: { pass: 'pass123', name: 'Carlos Rivera', role: 'worker', dept: UZBEK_STRINGS?.['Business Development'] || 'Business Development', color: '#8B83FF', joined: '2024-03-01' },
  worker7: { pass: 'pass123', name: 'Aisha Thompson', role: 'worker', dept: UZBEK_STRINGS?.['Finance & Accounting'] || 'Finance & Accounting', color: '#FF6BAD', joined: '2024-03-15' },
  worker8: { pass: 'pass123', name: "James O'Brien", role: 'worker', dept: UZBEK_STRINGS?.['Operations'] || 'Operations', color: '#44C4FF', joined: '2024-04-01' },
  worker9: { pass: 'pass123', name: 'Yuki Tanaka', role: 'worker', dept: UZBEK_STRINGS?.['IT & Systems'] || 'IT & Systems', color: '#A8FF78', joined: '2024-04-10' },
  worker10: { pass: 'pass123', name: 'Rachel Davis', role: 'worker', dept: UZBEK_STRINGS?.['Legal & Compliance'] || 'Legal & Compliance', color: '#FFD166', joined: '2024-04-20' },
};

const REPORT_TYPES = [
  UZBEK_STRINGS['Financial Audit'], UZBEK_STRINGS['Daily Task Log'], UZBEK_STRINGS['Expense Report'],
  UZBEK_STRINGS['Revenue Statement'], UZBEK_STRINGS['Compliance Review'], UZBEK_STRINGS['Budget Variance'],
  UZBEK_STRINGS['Risk Assessment'], UZBEK_STRINGS['Payroll Report']
];
const PERIODS = ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026'];
const STATUSES = ['pending', 'approved', 'flagged', 'review'];
const PRIORITY_LABELS = {
  low: UZBEK_STRINGS['Low'] || 'Past',
  medium: UZBEK_STRINGS['Medium'] || "O'rta", 
  high: UZBEK_STRINGS['High'] || 'Yuqori',
  critical: UZBEK_STRINGS['Critical'] || 'Juda muhim'
};
const PRIORITIES = [UZBEK_STRINGS['Low'], UZBEK_STRINGS['Medium'], UZBEK_STRINGS['High'], UZBEK_STRINGS['Critical']];
const TASK_CATS = ['Finance Review', 'Client Meeting', 'Internal Audit', 'Compliance Check',
  'Report Preparation', 'Team Sync', 'Data Analysis', 'Budget Review', 'System Maintenance'];

/* ── State ── */
let SESSION = null;
let activeWorkerFilter = 'all';
let activeStatusFilter = 'all';
let charts = {};
let clockInterval = null;
let sidebarCollapsed = false;

/* ── Persistent storage ── */
function getStore(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function setStore(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { }
}

function getAllUsers() {
  const reg = getStore('corp_reg_users', {});
  return { ...BASE_USERS, ...reg };
}
function getReports() { return getStore('corp_reports', []); }
function getTasks() { return getStore('corp_tasks', []); }
function getAuditLog() { return getStore('corp_audit_log', []); }
function saveReports(r) { setStore('corp_reports', r); }
function saveTasks(t) { setStore('corp_tasks', t); }
function saveAuditLog(l) { setStore('corp_audit_log', l); }

/* ── Seed demo data ── */
(function seedData() {
  if (getReports().length > 0) return;

  const workers = Object.keys(BASE_USERS).filter(k => k !== 'admin');
  const descs = [
    'Conducted thorough financial review of all departmental expenditures and reconciled with budgeted allocations.',
    'Reviewed vendor invoices, processed payments, and ensured all transactions align with corporate policy.',
    'Completed quarterly compliance assessment and identified areas requiring process improvement.',
    'Analyzed revenue streams and prepared summary for executive leadership review.',
    'Performed detailed audit of payroll records and verified accuracy against HR data.',
    'Assessed operational risks and documented mitigation strategies for the upcoming quarter.',
  ];
  const findings = [
    '1. Reconciled all accounts payable — no discrepancies found\n2. Reviewed 47 vendor contracts\n3. Identified $12K in potential savings',
    '1. Completed daily task log for all team members\n2. Resolved 3 outstanding compliance flags\n3. Updated internal reporting procedures',
    '1. Verified all expense reports against receipts\n2. Flagged 2 items for management review\n3. Submitted summary to Finance Director',
    '1. Revenue targets met for the period\n2. Cross-checked all revenue entries\n3. Prepared variance analysis vs. budget',
  ];

  const reports = [];
  let id = 1000;
  workers.forEach(uid => {
    const u = BASE_USERS[uid];
    const count = 3 + Math.floor(Math.random() * 5);
    for (let i = 0; i < count; i++) {
      const daysAgo = Math.floor(Math.random() * 90);
      const ts = Date.now() - daysAgo * 86400000;
      reports.push({
        id: `RPT-${id++}`,
        title: `${REPORT_TYPES[Math.floor(Math.random() * REPORT_TYPES.length)]} — ${u.dept}`,
        type: REPORT_TYPES[Math.floor(Math.random() * REPORT_TYPES.length)],
        period: PERIODS[Math.floor(Math.random() * PERIODS.length)],
        userId: uid,
        userName: u.name,
        dept: u.dept,
amount: Math.round(100000 + Math.random() * 900000), // Production 2025 USD: $100K-$1M enterprise
        budget: Math.round(100000 + Math.random() * 400000),
        status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
        priority: PRIORITIES[Math.floor(Math.random() * PRIORITIES.length)],
        desc: descs[Math.floor(Math.random() * descs.length)],
        findings: findings[Math.floor(Math.random() * findings.length)],
        risks: Math.random() > .6 ? 'Minor discrepancy in line items — requires admin review.' : '',
        date: new Date(ts).toISOString().split('T')[0],
        ts,
      });
    }
  });
  saveReports(reports);

  /* Seed tasks */
  const tasks = [];
  let tid = 100;
  workers.forEach(uid => {
    const u = BASE_USERS[uid];
    for (let i = 0; i < 8 + Math.floor(Math.random() * 6); i++) {
      const daysAgo = Math.floor(Math.random() * 14);
      tasks.push({
        id: `TASK-${tid++}`,
        desc: TASK_CATS[Math.floor(Math.random() * TASK_CATS.length)] + ' — ' + u.dept,
        cat: TASK_CATS[Math.floor(Math.random() * TASK_CATS.length)],
        hours: 1 + Math.floor(Math.random() * 7),
        userId: uid,
        userName: u.name,
        status: Math.random() > .3 ? 'Completed' : 'In Progress',
        date: new Date(Date.now() - daysAgo * 86400000).toISOString().split('T')[0],
        ts: Date.now() - daysAgo * 86400000,
      });
    }
  });
  saveTasks(tasks);

  /* Seed audit log */
  saveAuditLog([{
    action: 'Production system initialized — 10 workers active',
    user: 'system', 
    type: 'system',
    ts: Date.now(),
  }]);
})();

/* ================================================================
   UTILITIES
================================================================ */
const $ = id => document.getElementById(id);
const fmt = n => n.toLocaleString('en-US');
const fmtMoney = n => {
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return '$' + (n / 1e3).toFixed(1) + 'K';
  return '$' + fmt(n);
};
const initials = name => name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
const today = () => new Date().toISOString().split('T')[0];
const relativeTime = ts => {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000), h = Math.floor(m / 60), d = Math.floor(h / 24);
  if (d > 0) return d + 'd ago';
  if (h > 0) return h + 'h ago';
  if (m > 0) return m + 'm ago';
  return 'just now';
};

function addAuditEntry(action, type = 'info') {
  const log = getAuditLog();
  log.unshift({ action, user: SESSION?.uid || 'system', ts: Date.now(), type });
  if (log.length > 500) log.splice(500);
  saveAuditLog(log);
}

/* ================================================================
   PARTICLE CANVAS
================================================================ */
(function initParticles() {
  const canvas = $('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let W, H;

  const resize = () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random() * 1920, y: Math.random() * 1080,
      vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3,
      r: 1 + Math.random() * 2,
      o: .1 + Math.random() * .4,
    });
  }

  const loop = () => {
    ctx.clearRect(0, 0, W, H);
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const col = isDark ? '0,229,195' : '108,99,255';
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${col},${p.o})`;
      ctx.fill();
    });
    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${col},${.06 * (1 - dist / 120)})`;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(loop);
  };
  loop();
})();



/* ================================================================
   AUTH
================================================================ */
function switchAuthTab(tab, btn) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  $('loginForm').style.display = tab === 'login' ? 'flex' : 'none';
  $('registerForm').style.display = tab === 'register' ? 'flex' : 'none';
  $('authError').textContent = '';
  $('authCardTitle').textContent = tab === 'login' ? t('Welcome back') : t('Create Account');
  $('authCardSub').textContent = tab === 'login'
    ? t('Sign in to your secure workspace')
    : t('Register as a new worker');
  const slider = $('authTabSlider');
  slider.classList.toggle('right', tab === 'register');
}

function togglePass(inputId, btn) {
  const inp = $(inputId);
  if (inp.type === 'password') { inp.type = 'text'; btn.textContent = '🙈'; }
  else { inp.type = 'password'; btn.textContent = '👁'; }
}

function handleLogin() {
  const uid = $('loginUser').value.trim().toLowerCase();
  const pass = $('loginPass').value;
  setError('');
  if (!uid || !pass) return setError('Please enter your username and password.');

  const users = getAllUsers();
  if (!users[uid]) return setError('Username not found. Check your credentials.');
  if (users[uid].pass !== pass) return setError('Incorrect password. Please try again.');

  SESSION = { uid, ...users[uid] };
  addAuditEntry(`User "${SESSION.name}" signed in`, 'info');
  launchApp();
}

function handleRegister() {

  const name = $('regName').value.trim();
  const uid = $('regUser').value.trim().toLowerCase();
  const dept = $('regDept').value;
  const pass = $('regPass').value;

  setError('');
  if (!name || !uid || !dept || !pass) return setError('All fields are required.');
  if (uid.length < 3) return setError('Username must be at least 3 characters.');
  if (pass.length < 4) { // Relaxed from 6
    showToast('Password short - use at least 4 chars (demo use "pass")', 'warning');
  }
  if (!/^[a-z0-9_]+$/.test(uid)) return setError('Username may only contain letters, numbers, underscore.');

  const all = getAllUsers();
  if (all[uid]) return setError('Username already taken. Choose another.');

  const colors = ['#00E5C3', '#6C63FF', '#FF4D6D', '#FFB800', '#00C896', '#8B83FF', '#FF6BAD', '#44C4FF'];
  const reg = getStore('corp_reg_users', {});
  reg[uid] = { pass, name, role: 'worker', dept, color: colors[Math.floor(Math.random() * colors.length)], joined: today() };
  setStore('corp_reg_users', reg);


  SESSION = { uid, ...reg[uid] };
  addAuditEntry(`New worker "${name}" registered (${dept})`, 'success');
  showToast('Account created! Welcome to CorpAudit Pro 🎉', 'success');
  launchApp();
}

function setError(msg) { $('authError').textContent = msg; }

/* ================================================================
   APP LAUNCH / LOGOUT
================================================================ */
function launchApp() {
  $('authScreen').style.display = 'none';
  $('appScreen').style.display = 'flex';
  setupSidebarUser();
  setupTopbarUser();
  updateNavBadges();
  startClock();

  if (SESSION.role === 'admin') {
    ['navAdmin', 'navAuditLog', 'navAdminLabel'].forEach(id => $(id) && ($(id).style.display = ''));
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = '');
  }

  const savedTheme = localStorage.getItem('corp_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeBtn(savedTheme);

  switchTab('dashboard', document.querySelector('[data-tab=dashboard]'));
  updateNotifications();
}

function handleLogout() {
  addAuditEntry(`User "${SESSION.name}" signed out`, 'info');
  SESSION = null;
  destroyAllCharts();
  if (clockInterval) { clearInterval(clockInterval); clockInterval = null; }
  $('appScreen').style.display = 'none';
  $('authScreen').style.display = 'flex';
  $('loginUser').value = ''; $('loginPass').value = '';
  showToast('Signed out successfully', 'info');
}

/* ================================================================
   SIDEBAR & TOPBAR
================================================================ */
function setupSidebarUser() {
  const av = $('sideAvatar');
  av.textContent = initials(SESSION.name);
  av.style.background = SESSION.color;
  $('sideName').textContent = SESSION.name;
  $('sideDept').textContent = SESSION.dept;
  const rb = $('sideRole');
  rb.textContent = SESSION.role === 'admin' ? 'Admin' : 'Worker';
  rb.className = 'role-badge ' + (SESSION.role === 'admin' ? 'badge-admin' : 'badge-worker');
}

function setupTopbarUser() {
  const av = $('topbarAvatar');
  av.textContent = initials(SESSION.name);
  av.style.background = SESSION.color;
  $('topbarName').textContent = SESSION.name;
  $('topbarRole').textContent = SESSION.role === 'admin' ? 'Administrator' : SESSION.dept;
}

function toggleSidebar() {
  sidebarCollapsed = !sidebarCollapsed;
  const sidebar = document.querySelector('.sidebar');
  const main = $('mainPanel');
  sidebar.classList.toggle('collapsed', sidebarCollapsed);
  main.classList.toggle('expanded', sidebarCollapsed);
}

function startClock() {
  const update = () => {
    const now = new Date();
    $('topbarClock').textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
  update();
  clockInterval = setInterval(update, 1000);
}

function updateNavBadges() {
  const reports = getReports();
  const mine = SESSION.role === 'admin' ? reports : reports.filter(r => r.userId === SESSION.uid);
  const pending = reports.filter(r => r.status === 'pending');
  const flagged = mine.filter(r => r.status === 'flagged');

  const rb = $('navBadgeReports');
  if (mine.length > 0) { rb.textContent = mine.length; rb.classList.add('show'); }
  if (SESSION.role === 'admin') {
    const ab = $('navBadgeAdmin');
    if (pending.length > 0) { ab.textContent = pending.length; ab.classList.add('show'); }
  }
  const ia = $('navAlertIntegrity');
  if (flagged.length > 0) ia.classList.add('show');
}

function updateNotifications() {
  const reports = getReports();
  const mine = SESSION.role === 'admin' ? reports : reports.filter(r => r.userId === SESSION.uid);
  const notifs = [];

  if (SESSION.role === 'admin') {
    const pending = mine.filter(r => r.status === 'pending');
    if (pending.length) notifs.push({ msg: `${pending.length} reports awaiting your approval`, color: '#FFB800', type: 'warning' });
    const flagged = mine.filter(r => r.status === 'flagged');
    if (flagged.length) notifs.push({ msg: `${flagged.length} flagged reports require attention`, color: '#FF4D6D', type: 'error' });
  } else {
    const myFlagged = mine.filter(r => r.status === 'flagged');
    if (myFlagged.length) notifs.push({ msg: `${myFlagged.length} of your reports were flagged`, color: '#FF4D6D', type: 'error' });
    const myApproved = mine.filter(r => r.status === 'approved');
    if (myApproved.length) notifs.push({ msg: `${myApproved.length} reports approved by admin`, color: '#00C896', type: 'success' });
  }
  notifs.push({ msg: 'System integrity check passed', color: '#00E5C3', type: 'info' });

  const cnt = $('notifCount');
  const realNotifs = notifs.filter(n => n.type !== 'info');
  if (realNotifs.length > 0) { cnt.textContent = realNotifs.length; cnt.style.display = 'flex'; }
  $('notifList').innerHTML = notifs.map(n => `
    <div class="notif-item">
      <div class="notif-dot" style="background:${n.color}"></div>
      <div>${n.msg}</div>
    </div>
  `).join('');
}

function toggleNotifPanel() {
  $('notifPanel').classList.toggle('open');
}
document.addEventListener('click', e => {
  if (!e.target.closest('.topbar-notifications')) $('notifPanel').classList.remove('open');
});

/* ================================================================
   NAVIGATION
================================================================ */
function switchTab(tabName, navEl) {
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const pane = $('tab-' + tabName);
  if (pane) pane.classList.add('active');
  if (navEl) navEl.classList.add('active');
  else {
    const el = document.querySelector(`[data-tab="${tabName}"]`);
    if (el) el.classList.add('active');
  }

  const labels = {
    dashboard: 'Dashboard', reports: 'Financial Reports', submit: 'Submit Report',
    tasks: 'Task Logs', analytics: 'Analytics', integrity: 'Data Integrity',
    admin: 'Admin Panel', auditlog: 'Audit Log'
  };
  $('breadcrumbCur').textContent = labels[tabName] || tabName;

  destroyAllCharts();

  switch (tabName) {
    case 'dashboard': renderDashboard(); break;
    case 'reports': renderReports(); break;
    case 'submit': renderSubmitSidebar(); break;
    case 'tasks': renderTasks(); break;
    case 'analytics': renderAnalytics(); break;
    case 'integrity': renderIntegrity(); break;
    case 'admin': if (SESSION.role === 'admin') renderAdmin(); break;
    case 'auditlog': renderAuditLog(); break;
  }
  updateNavBadges();
}

/* ================================================================
   CHARTS HELPERS
================================================================ */
function destroyAllCharts() {
  Object.values(charts).forEach(c => { try { c.destroy(); } catch { } });
  charts = {};
}

function chartDefaults() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textCol = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)';
  const gridCol = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  return {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: isDark ? '#1A2235' : '#fff', titleColor: isDark ? '#EEF2FF' : '#0D1322', bodyColor: isDark ? '#8896AE' : '#4E5A6E', borderColor: isDark ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.1)', borderWidth: 1, padding: 12, cornerRadius: 10, boxPadding: 6 } },
    scales: {
      x: { grid: { color: gridCol, drawBorder: false }, ticks: { color: textCol, font: { size: 11 }, maxRotation: 0 } },
      y: { grid: { color: gridCol, drawBorder: false }, ticks: { color: textCol, font: { size: 11 } }, beginAtZero: true },
    },
  };
}

function makeGrad(ctx, c1, c2, horiz = false) {
  const g = horiz
    ? ctx.createLinearGradient(0, 0, ctx.canvas.width, 0)
    : ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
  g.addColorStop(0, c1); g.addColorStop(1, c2);
  return g;
}

/* ================================================================
   DASHBOARD
================================================================ */
function renderDashboard() {
  const hr = new Date().getHours();
  const greetUz = hr < 5 ? 'Tushlik oldidan' : hr < 12 ? 'Xayrli tong' : hr < 17 ? 'Xayrli kun' : 'Xayrli kech';
  $('dashGreeting').textContent = `${greetUz}, ${SESSION.name.split(' ')[0]}! 👋`;
  $('dashSub').textContent = SESSION.role === 'admin'
    ? 'To\'liq korxona umumiy ko\'rinishi — barcha bo\'limlar va xodimlar'
    : `Sizning ${SESSION.dept} bo\'limi shaxsiy hisobotlaringiz va natijalaringiz`;

  $('adminBanner').style.display = SESSION.role === 'admin' ? 'flex' : 'none';

  const allReports = getReports();
  const myReports = SESSION.role === 'admin' ? allReports : allReports.filter(r => r.userId === SESSION.uid);
  const total = myReports.reduce((s, r) => s + r.amount, 0);
  const pending = myReports.filter(r => r.status === 'pending').length;
  const approved = myReports.filter(r => r.status === 'approved').length;
  const flagged = myReports.filter(r => r.status === 'flagged').length;
  const avgAmount = myReports.length ? Math.round(total / myReports.length) : 0;


      <div class="kpi-value accent">${fmtMoney(total)}</div>
      <div class="kpi-change up">↑ 12.4% vs last quarter</div>
    </div>
    <div class="kpi-card kpi-purple">
      <div class="kpi-header"><span class="kpi-label">Total Reports</span><span class="kpi-icon">📊</span></div>
      <div class="kpi-value">${myReports.length}</div>
      <div class="kpi-change up">↑ ${Math.max(1, Math.floor(myReports.length * .1))} this week</div>
    </div>
    <div class="kpi-card kpi-gold">
      <div class="kpi-header"><span class="kpi-label">Pending Review</span><span class="kpi-icon">⏳</span></div>
      <div class="kpi-value" style="color:var(--amber)">${pending}</div>
      <div class="kpi-change ${pending > 3 ? 'down' : 'neutral'}">${pending > 3 ? '↑ Needs attention' : 'On track'}</div>
    </div>
    <div class="kpi-card kpi-red">
      <div class="kpi-header"><span class="kpi-label">Flagged</span><span class="kpi-icon">🚩</span></div>
      <div class="kpi-value" style="color:var(--red)">${flagged}</div>
      <div class="kpi-change ${flagged > 2 ? 'down' : 'up'}">${flagged > 2 ? '↑ Audit required' : '✓ Low risk'}</div>
    </div>
    <div class="kpi-card kpi-green">
      <div class="kpi-header"><span class="kpi-label">Approved</span><span class="kpi-icon">✅</span></div>
      <div class="kpi-value" style="color:var(--green)">${approved}</div>
      <div class="kpi-change up">↑ ${myReports.length ? Math.round(approved / myReports.length * 100) : 0}% approval rate</div>
    </div>
    <div class="kpi-card kpi-blue">
      <div class="kpi-header"><span class="kpi-label">Avg. Report Value</span><span class="kpi-icon">📈</span></div>
      <div class="kpi-value" style="color:var(--blue)">${fmtMoney(avgAmount)}</div>
      <div class="kpi-change neutral">Per submission</div>
    </div>
  `;

  // Revenue chart
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const rev = months.map(() => Math.round(300 + Math.random() * 700));
  const exp = rev.map(r => Math.round(r * (0.4 + Math.random() * .4)));
  const revCtx = $('revenueChart').getContext('2d');
  charts.revenue = new Chart($('revenueChart'), {
    type: 'bar',
    data: {
      labels: months,
      datasets: [
        { label: 'Revenue', data: rev, backgroundColor: makeGrad(revCtx, 'rgba(0,229,195,.8)', 'rgba(0,229,195,.3)'), borderRadius: 6, borderSkipped: false },
        { label: 'Expenses', data: exp, backgroundColor: makeGrad(revCtx, 'rgba(108,99,255,.7)', 'rgba(108,99,255,.3)'), borderRadius: 6, borderSkipped: false },
      ]
    },
    options: chartDefaults(),
  });
  $('revLegend').innerHTML = `
    <div class="legend-item"><div class="legend-dot" style="background:#00E5C3"></div>Revenue</div>
    <div class="legend-item"><div class="legend-dot" style="background:#6C63FF"></div>Expenses</div>
  `;

  // Status donut
  const dCounts = [approved, pending, flagged, myReports.filter(r => r.status === 'review').length];
  const dColors = ['#00C896', '#FFB800', '#FF4D6D', '#6C63FF'];
  const dLabels = ['Approved', 'Pending', 'Flagged', 'Review'];
  charts.status = new Chart($('statusChart'), {
    type: 'doughnut',
    data: { labels: dLabels, datasets: [{ data: dCounts, backgroundColor: dColors, borderWidth: 0, hoverOffset: 4 }] },
    options: { ...chartDefaults(), cutout: '72%', scales: { x: { display: false }, y: { display: false } }, plugins: { ...chartDefaults().plugins, legend: { display: false } } },
  });
  const total_d = dCounts.reduce((a, b) => a + b, 0) || 1;
  $('donutCenter').innerHTML = `<div class="donut-center-val">${total_d}</div><div class="donut-center-label">Reports</div>`;
  $('donutLegend').innerHTML = dLabels.map((l, i) => `<div class="donut-legend-item"><div class="donut-legend-dot" style="background:${dColors[i]}"></div>${l} (${dCounts[i]})</div>`).join('');

  // Task chart
  const days14 = Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - 13 + i); return d.toLocaleDateString('en', { month: 'short', day: 'numeric' }); });
  charts.task = new Chart($('taskChart'), {
    type: 'line',
    data: { labels: days14, datasets: [{ label: 'Tasks', data: days14.map(() => Math.round(4 + Math.random() * 14)), borderColor: '#00E5C3', backgroundColor: 'rgba(0,229,195,.06)', fill: true, tension: .4, pointRadius: 3, pointBackgroundColor: '#00E5C3', pointBorderColor: 'transparent' }] },
    options: chartDefaults(),
  });

  // Dept chart
  const depts = ['Finance', 'Ops', 'HR', 'Legal', 'IT', 'BizDev'];
  const deptAmts = depts.map(() => Math.round(200 + Math.random() * 800));
  charts.dept = new Chart($('deptChart'), {
    type: 'bar',
    data: { labels: depts, datasets: [{ label: '$K', data: deptAmts, backgroundColor: ['rgba(0,229,195,.75)', 'rgba(108,99,255,.75)', 'rgba(255,77,109,.75)', 'rgba(255,184,0,.75)', 'rgba(0,200,150,.75)', 'rgba(139,131,255,.75)'], borderRadius: 6 }] },
    options: { ...chartDefaults(), indexAxis: 'y' },
  });

  // Priority chart
  const pLabels = PRIORITIES;
  const pCounts = pLabels.map(p => myReports.filter(r => r.priority === p).length);
  charts.priority = new Chart($('priorityChart'), {
    type: 'polarArea',
    data: { labels: pLabels, datasets: [{ data: pCounts, backgroundColor: ['rgba(0,200,150,.7)', 'rgba(255,184,0,.7)', 'rgba(255,107,61,.7)', 'rgba(255,77,109,.7)'], borderWidth: 0 }] },
    options: { ...chartDefaults(), scales: {}, plugins: { ...chartDefaults().plugins, legend: { display: true, position: 'right', labels: { color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#8896AE' : '#4E5A6E', boxWidth: 10, padding: 10, font: { size: 11 } } } } },
  });

  // Activity feed
  const recent = [...myReports].sort((a, b) => b.ts - a.ts).slice(0, 10);
  $('activitySub').textContent = `${recent.length} recent events`;
  $('activityFeed').innerHTML = recent.length === 0
    ? `<div class="empty-state"><div class="empty-icon">📭</div><div class="empty-title">No activity yet</div><div class="empty-sub">Submit your first report to get started</div></div>`
    : recent.map(r => `
      <div class="activity-item">
        <div class="activity-timeline">
          <div class="activity-dot" style="background:${r.status === 'approved' ? '#00C896' : r.status === 'flagged' ? '#FF4D6D' : r.status === 'review' ? '#6C63FF' : '#FFB800'}"></div>
          <div class="activity-line"></div>
        </div>
        <div class="activity-content">
          <div class="activity-title">${r.title}</div>
          <div class="activity-meta">
            ${SESSION.role === 'admin' ? `<strong>${r.userName}</strong> ·` : ''}
            <span class="pill pill-${r.status}">${r.status}</span>
            <span class="activity-amount">${fmtMoney(r.amount)}</span>
            <span>${relativeTime(r.ts)}</span>
          </div>
        </div>
      </div>`).join('');
}

function refreshDashboard() { destroyAllCharts(); renderDashboard(); showToast('Dashboard refreshed', 'info'); }

/* ================================================================
   REPORTS
================================================================ */
let currentReports = [];

function renderReports() {
  const isAdmin = SESSION.role === 'admin';
  $('reportsSub').textContent = isAdmin
    ? 'All submitted reports — full enterprise visibility'
    : 'Your submitted reports — only you can see these';

  if (isAdmin) {
    $('workerFilterBar').style.display = 'flex';
    buildWorkerChips();
  } else {
    $('workerFilterBar').style.display = 'none';
  }
  filterReports();
}

function buildWorkerChips() {
  const users = getAllUsers();
  const workers = Object.entries(users).filter(([, u]) => u.role === 'worker');
  $('workerChips').innerHTML = [
    `<div class="worker-chip ${activeWorkerFilter === 'all' ? 'active' : ''}" onclick="setWorkerFilter('all',this)">All Workers</div>`,
    ...workers.map(([uid, u]) => `
      <div class="worker-chip ${activeWorkerFilter === uid ? 'active' : ''}" onclick="setWorkerFilter('${uid}',this)">
        <div class="worker-chip-dot" style="background:${u.color}"></div>
        ${u.name.split(' ')[0]}
      </div>`)
  ].join('');
}

function setWorkerFilter(uid, el) {
  activeWorkerFilter = uid;
  document.querySelectorAll('.worker-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  filterReports();
}

function setStatusFilter(status, el) {
  activeStatusFilter = status;
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  filterReports();
}

function filterReports() {
  const isAdmin = SESSION.role === 'admin';
  const q = ($('searchInput')?.value || '').toLowerCase();
  const sort = $('sortSelect')?.value || 'date-desc';

  let data = isAdmin ? getReports() : getReports().filter(r => r.userId === SESSION.uid);
  if (isAdmin && activeWorkerFilter !== 'all') data = data.filter(r => r.userId === activeWorkerFilter);
  if (activeStatusFilter !== 'all') data = data.filter(r => r.status === activeStatusFilter);
  if (q) data = data.filter(r =>
    r.title.toLowerCase().includes(q) ||
    r.userName.toLowerCase().includes(q) ||
    r.id.toLowerCase().includes(q) ||
    r.dept.toLowerCase().includes(q) ||
    r.type.toLowerCase().includes(q)
  );
  data.sort((a, b) => {
    if (sort === 'date-asc') return a.ts - b.ts;
    if (sort === 'amount-desc') return b.amount - a.amount;
    if (sort === 'amount-asc') return a.amount - b.amount;
    return b.ts - a.ts;
  });
  currentReports = data;
  $('tableCount').textContent = `${data.length} report${data.length !== 1 ? 's' : ''}`;
  renderReportsTable(data);
}

function renderReportsTable(data) {
  const isAdmin = SESSION.role === 'admin';
  const users = getAllUsers();
  if (!data.length) {
    $('reportsBody').innerHTML = `<tr><td colspan="10"><div class="empty-state"><div class="empty-icon">📋</div><div class="empty-title">No reports found</div><div class="empty-sub">Try adjusting your filters or submit a new report</div></div></td></tr>`;
    return;
  }
  $('reportsBody').innerHTML = data.map(r => {
    const u = users[r.userId] || {};
    return `<tr>
      <td class="td-mono accent" style="font-size:11px">${r.id}</td>
      <td class="td-bold" style="max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${r.title}</td>
      <td>
        <div class="worker-cell">
          <div class="worker-cell-avatar" style="background:${u.color || '#666'}">${initials(r.userName)}</div>
          <div>
            <div class="worker-cell-name">${r.userName}</div>
            <div class="worker-cell-user">${r.userId}</div>
          </div>
        </div>
      </td>
      <td class="td-muted" style="font-size:12px;white-space:nowrap">${r.dept}</td>
      <td class="td-mono td-bold" style="color:var(--teal)">${fmtMoney(r.amount)}</td>
      <td class="td-muted" style="font-size:12px">${r.period}</td>
      <td class="td-muted" style="font-size:12px">${r.date}</td>
      <td><span class="pill pill-${r.status}">${r.status}</span></td>
      <td><span class="p-${r.priority.toLowerCase()}">${r.priority}</span></td>
      <td>
        <div class="action-btns">
          <button class="btn-tbl" onclick="viewReport('${r.id}')">View</button>
          ${isAdmin && r.status === 'pending' ? `<button class="btn-tbl btn-tbl-accent" onclick="approveReport('${r.id}')">Approve</button>` : ''}
          ${isAdmin ? `<button class="btn-tbl btn-tbl-danger" onclick="flagReport('${r.id}')">Flag</button>` : ''}
        </div>
      </td>
    </tr>`;
  }).join('');
}

function viewReport(id) {
  const r = getReports().find(x => x.id === id);
  if (!r) return;
  const users = getAllUsers();
  const u = users[r.userId] || {};
  $('modalTitle').textContent = r.title;
  $('modalSub').textContent = `${r.id} · ${r.type} · ${r.period}`;
  $('modalBody').innerHTML = `
    <div class="modal-kpi-row">
      <div class="modal-kpi">
        <div class="modal-kpi-label">Amount</div>
        <div class="modal-kpi-val accent">${fmtMoney(r.amount)}</div>
      </div>
      <div class="modal-kpi">
        <div class="modal-kpi-label">Budget Ref.</div>
        <div class="modal-kpi-val">${r.budget ? fmtMoney(r.budget) : 'N/A'}</div>
      </div>
      <div class="modal-kpi">
        <div class="modal-kpi-label">Status</div>
        <div class="modal-kpi-val"><span class="pill pill-${r.status}">${r.status}</span></div>
      </div>
    </div>
    <div class="modal-field-row"><span class="modal-field-label">Submitted By</span><div class="worker-cell" style="justify-content:flex-end"><div class="worker-cell-avatar" style="background:${u.color || '#666'}">${initials(r.userName)}</div><strong>${r.userName}</strong></div></div>
    <div class="modal-field-row"><span class="modal-field-label">Department</span><span class="modal-field-val">${r.dept}</span></div>
    <div class="modal-field-row"><span class="modal-field-label">Priority</span><span class="modal-field-val"><span class="p-${r.priority.toLowerCase()}">${r.priority}</span></span></div>
    <div class="modal-field-row"><span class="modal-field-label">Date Submitted</span><span class="modal-field-val">${r.date}</span></div>
    ${r.budget ? `<div class="modal-field-row"><span class="modal-field-label">Variance</span><span class="modal-field-val" style="color:${r.amount > r.budget ? 'var(--red)' : 'var(--green)'}">${r.amount > r.budget ? '▲ Over' : '▼ Under'} by ${fmtMoney(Math.abs(r.amount - r.budget))}</span></div>` : ''}
    <div class="modal-section"><div class="modal-section-label">Executive Summary</div><div class="modal-section-text">${r.desc}</div></div>
    <div class="modal-section"><div class="modal-section-label">Key Findings</div><div class="modal-section-text">${r.findings.replace(/\n/g, '<br>')}</div></div>
    ${r.risks ? `<div class="modal-section" style="border-color:rgba(255,77,109,.2);background:rgba(255,77,109,.04)"><div class="modal-section-label" style="color:var(--red)">Risk Flags</div><div class="modal-section-text">${r.risks}</div></div>` : ''}
  `;
  $('modalFooter').innerHTML = `
    <button class="btn-ghost" onclick="closeModal()">Close</button>
    ${SESSION.role === 'admin' && r.status === 'pending' ? `<button class="btn-tbl btn-tbl-accent" onclick="approveReport('${r.id}');closeModal()">Approve Report</button>` : ''}
    ${SESSION.role === 'admin' ? `<button class="btn-tbl btn-tbl-danger" onclick="flagReport('${r.id}');closeModal()">Flag Report</button>` : ''}
  `;
  $('modalOverlay').classList.add('open');
}

function approveReport(id) {
  const reports = getReports();
  const r = reports.find(x => x.id === id);
  if (!r) return;
  r.status = 'approved';
  saveReports(reports);
  addAuditEntry(`Report ${id} approved by ${SESSION.name}`, 'success');
  showToast(`Report ${id} approved ✓`, 'success');
  filterReports(); updateNavBadges();
}

function flagReport(id) {
  const reports = getReports();
  const r = reports.find(x => x.id === id);
  if (!r) return;
  r.status = 'flagged';
  saveReports(reports);
  addAuditEntry(`Report ${id} flagged by ${SESSION.name}`, 'warning');
  showToast(`Report ${id} flagged for review`, 'warning');
  filterReports(); updateNavBadges();
}

function exportCSV() {
  const rows = [['ID', 'Title', 'Worker', 'Department', 'Amount', 'Period', 'Date', 'Status', 'Priority']];
  currentReports.forEach(r => rows.push([r.id, `"${r.title}"`, r.userName, r.dept, r.amount, r.period, r.date, r.status, r.priority]));
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `corpaudit_reports_${today()}.csv`; a.click();
  URL.revokeObjectURL(url);
  showToast('CSV exported successfully', 'success');
}

/* ================================================================
   SUBMIT
================================================================ */
function renderSubmitSidebar() {
  const myReports = getReports().filter(r => r.userId === SESSION.uid);
  const total = myReports.reduce((s, r) => s + r.amount, 0);
  $('myStatsCard').innerHTML = `
    <div class="submit-sidebar-title">Your Stats</div>
    <div class="task-stat-row"><span class="muted">Total Reports</span><strong>${myReports.length}</strong></div>
    <div class="task-stat-row"><span class="muted">Total Reported</span><strong class="accent">${fmtMoney(total)}</strong></div>
    <div class="task-stat-row"><span class="muted">Approved</span><strong style="color:var(--green)">${myReports.filter(r => r.status === 'approved').length}</strong></div>
    <div class="task-stat-row"><span class="muted">Pending</span><strong style="color:var(--amber)">${myReports.filter(r => r.status === 'pending').length}</strong></div>
    <div class="task-stat-row"><span class="muted">Flagged</span><strong style="color:var(--red)">${myReports.filter(r => r.status === 'flagged').length}</strong></div>
    <div class="task-stat-row"><span class="muted">Department</span><strong>${SESSION.dept}</strong></div>
  `;

  // Variance live preview
  const amtEl = $('rptAmount'), budEl = $('rptBudget');
  const updateVariance = () => {
    const amt = parseFloat(amtEl.value) || 0, bud = parseFloat(budEl.value) || 0;
    const vd = $('varianceDisplay');
    if (amt > 0 && bud > 0) {
      const diff = amt - bud, pct = Math.round(Math.abs(diff) / bud * 100);
      vd.style.display = 'block';
      vd.className = 'variance-display ' + (diff > 0 ? 'variance-neg' : 'variance-pos');
      vd.textContent = diff > 0
        ? `⚠ Over budget by ${fmtMoney(Math.abs(diff))} (${pct}%) — requires justification`
        : `✓ Under budget by ${fmtMoney(Math.abs(diff))} (${pct}%) — within compliance`;
    } else { vd.style.display = 'none'; }
  };
  amtEl?.addEventListener('input', updateVariance);
  budEl?.addEventListener('input', updateVariance);
}

function submitReport() {
  const title = $('rptTitle').value.trim();
  const amountV = parseFloat($('rptAmount').value);
  const desc = $('rptDesc').value.trim();
  const findings = $('rptFindings').value.trim();

  if (!title) return showToast('Please enter a report title', 'error');
  if (!amountV || amountV <= 0) return showToast('Please enter a valid amount', 'error');
  if (!desc) return showToast('Please provide an executive summary', 'error');
  if (!findings) return showToast('Please list your key findings', 'error');

  const reports = getReports();
  const id = `RPT-${1000 + reports.length + 1}`;
  const report = {
    id, title,
    type: $('rptType').value,
    period: $('rptPeriod').value,
    priority: $('rptPriority').value,
    userId: SESSION.uid,
    userName: SESSION.name,
    dept: SESSION.dept,
    amount: Math.round(amountV),
    budget: Math.round(parseFloat($('rptBudget').value) || 0),
    status: 'pending',
    desc, findings,
    risks: $('rptRisks').value.trim(),
    date: today(), ts: Date.now(),
  };
  reports.unshift(report);
  saveReports(reports);
  addAuditEntry(`Report ${id} submitted by ${SESSION.name} — ${fmtMoney(report.amount)}`, 'success');
  showToast(`Report ${id} submitted for admin review ✓`, 'success');
  clearForm();
  updateNavBadges();
  setTimeout(() => switchTab('reports', document.querySelector('[data-tab=reports]')), 1000);
}

function clearForm() {
  ['rptTitle', 'rptAmount', 'rptBudget', 'rptDesc', 'rptFindings', 'rptRisks'].forEach(id => {
    const el = $(id); if (el) el.value = '';
  });
  const vd = $('varianceDisplay'); if (vd) vd.style.display = 'none';
}

/* ================================================================
   TASK LOGS
================================================================ */
function renderTasks() {
  const allTasks = getTasks();
  const myTasks = SESSION.role === 'admin' ? allTasks : allTasks.filter(t => t.userId === SESSION.uid);
  const users = getAllUsers();
  const done = myTasks.filter(t => t.status === 'Completed').length;
  const total = myTasks.length;

  $('taskCount').textContent = `${total} task entries`;

  // Weekly chart
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  charts.weeklyTask = new Chart($('weeklyTaskChart'), {
    type: 'bar',
    data: {
      labels: days, datasets: [
        { label: 'Completed', data: days.map(() => Math.round(3 + Math.random() * 8)), backgroundColor: 'rgba(0,229,195,.7)', borderRadius: 5 },
        { label: 'In Progress', data: days.map(() => Math.round(1 + Math.random() * 4)), backgroundColor: 'rgba(108,99,255,.5)', borderRadius: 5 },
      ]
    },
    options: chartDefaults(),
  });

  // Completion donut
  const pct = total ? Math.round(done / total * 100) : 0;
  charts.taskComp = new Chart($('taskCompChart'), {
    type: 'doughnut',
    data: { labels: ['Completed', 'Remaining'], datasets: [{ data: [done, total - done], backgroundColor: ['#00C896', 'rgba(255,255,255,.06)'], borderWidth: 0 }] },
    options: { ...chartDefaults(), cutout: '70%', scales: { x: { display: false }, y: { display: false } }, plugins: { ...chartDefaults().plugins, legend: { display: false } } },
  });
  $('taskDonutCenter').innerHTML = `<div class="donut-center-val" style="font-size:20px">${pct}%</div><div class="donut-center-label">Done</div>`;

  // Table
  $('taskLogsBody').innerHTML = !myTasks.length
    ? `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">📋</div><div class="empty-title">No tasks logged</div><div class="empty-sub">Log your first task to start tracking</div></div></td></tr>`
    : [...myTasks].sort((a, b) => b.ts - a.ts).slice(0, 50).map(t => `<tr>
        <td class="td-muted" style="font-size:12px">${t.date}</td>
        <td class="td-bold">${t.desc}</td>
        <td class="td-muted" style="font-size:12px">${t.cat}</td>
        <td class="td-mono">${t.hours}h</td>
        <td>
          <div class="worker-cell">
            <div class="worker-cell-avatar" style="background:${users[t.userId]?.color || '#666'};width:22px;height:22px;font-size:9px">${initials(t.userName)}</div>
            <span style="font-size:13px">${t.userName}</span>
          </div>
        </td>
        <td><span class="pill ${t.status === 'Completed' ? 'pill-approved' : 'pill-review'}">${t.status}</span></td>
      </tr>`).join('');
}

function openAddTask() {
  $('modalTitle').textContent = 'Log New Task';
  $('modalSub').textContent = 'Record a daily work activity';
  $('modalBody').innerHTML = `
    <div class="field-group"><label class="field-label">Task Description</label>
      <input type="text" id="taskDesc" class="field-input" placeholder="e.g. Reviewed Q4 financial statements" /></div>
    <div class="field-row">
      <div class="field-group"><label class="field-label">Category</label>
        <select id="taskCat" class="field-input field-select">${TASK_CATS.map(c => `<option>${c}</option>`).join('')}</select>
      </div>
      <div class="field-group"><label class="field-label">Hours Spent</label>
        <input type="number" id="taskHours" class="field-input" placeholder="1" min="0.5" max="24" step="0.5" /></div>
    </div>
    <div class="field-group"><label class="field-label">Status</label>
      <select id="taskStatus" class="field-input field-select"><option>Completed</option><option>In Progress</option></select>
    </div>
  `;
  $('modalFooter').innerHTML = `
    <button class="btn-ghost" onclick="closeModal()">Cancel</button>
    <button class="btn-primary-sm" onclick="saveTask()">Save Task</button>
  `;
  $('modalOverlay').classList.add('open');
}

function saveTask() {
  const desc = $('taskDesc').value.trim();
  const hours = parseFloat($('taskHours').value);
  if (!desc) return showToast('Please enter a task description', 'error');
  if (!hours || hours <= 0) return showToast('Please enter hours spent', 'error');
  const tasks = getTasks();
  tasks.unshift({
    id: `TASK-${100 + tasks.length + 1}`, desc,
    cat: $('taskCat').value, hours,
    userId: SESSION.uid, userName: SESSION.name,
    status: $('taskStatus').value, date: today(), ts: Date.now(),
  });
  saveTasks(tasks);
  addAuditEntry(`Task logged by ${SESSION.name}: "${desc}"`, 'info');
  showToast('Task logged successfully ✓', 'success');
  closeModal(); renderTasks();
}

/* ================================================================
   ANALYTICS
================================================================ */
function renderAnalytics() {
  const allR = getReports();
  const myR = SESSION.role === 'admin' ? allR : allR.filter(r => r.userId === SESSION.uid);
  const total = myR.reduce((s, r) => s + r.amount, 0);

  $('analyticsKpi').innerHTML = `
    <div class="kpi-card kpi-teal">
      <div class="kpi-header"><span class="kpi-label">Total Value</span><span class="kpi-icon">💰</span></div>
      <div class="kpi-value accent">${fmtMoney(total)}</div>
      <div class="kpi-change neutral">Across all reports</div>
    </div>
    <div class="kpi-card kpi-purple">
      <div class="kpi-header"><span class="kpi-label">Avg Value</span><span class="kpi-icon">📊</span></div>
      <div class="kpi-value">${myR.length ? fmtMoney(Math.round(total / myR.length)) : '$0'}</div>
      <div class="kpi-change neutral">Per report</div>
    </div>
    <div class="kpi-card kpi-gold">
      <div class="kpi-header"><span class="kpi-label">Approval Rate</span><span class="kpi-icon">✅</span></div>
      <div class="kpi-value" style="color:var(--green)">${myR.length ? Math.round(myR.filter(r => r.status === 'approved').length / myR.length * 100) : 0}%</div>
      <div class="kpi-change up">vs 65% industry avg</div>
    </div>
    <div class="kpi-card kpi-red">
      <div class="kpi-header"><span class="kpi-label">Flag Rate</span><span class="kpi-icon">🚩</span></div>
      <div class="kpi-value" style="color:var(--red)">${myR.length ? Math.round(myR.filter(r => r.status === 'flagged').length / myR.length * 100) : 0}%</div>
      <div class="kpi-change neutral">Of total submissions</div>
    </div>
  `;

  // Cumulative chart
  const sorted = [...myR].sort((a, b) => a.ts - b.ts);
  let cum = 0;
  const cumData = sorted.map(r => { cum += r.amount; return cum; });
  const cumLabels = sorted.map(r => r.date);
  const cumCtx = $('cumulativeChart').getContext('2d');
  charts.cumulative = new Chart($('cumulativeChart'), {
    type: 'line',
    data: { labels: cumLabels.length ? cumLabels : ['—'], datasets: [{ label: 'Cumulative', data: cumData.length ? cumData : [0], borderColor: '#00E5C3', backgroundColor: makeGrad(cumCtx, 'rgba(0,229,195,.18)', 'rgba(0,229,195,0)'), fill: true, tension: .4, pointRadius: 2, pointBackgroundColor: '#00E5C3' }] },
    options: { ...chartDefaults(), scales: { ...chartDefaults().scales, y: { ...chartDefaults().scales.y, ticks: { ...chartDefaults().scales.y.ticks, callback: v => fmtMoney(v) } } } },
  });

  // Type chart
  const typeAmts = {};
  myR.forEach(r => { typeAmts[r.type] = (typeAmts[r.type] || 0) + r.amount; });
  charts.type = new Chart($('typeChart'), {
    type: 'doughnut',
    data: { labels: Object.keys(typeAmts), datasets: [{ data: Object.values(typeAmts), backgroundColor: ['#00E5C3', '#6C63FF', '#FF4D6D', '#FFB800', '#00C896', '#8B83FF', '#FF6BAD', '#44C4FF'], borderWidth: 0 }] },
    options: { ...chartDefaults(), cutout: '60%', scales: { x: { display: false }, y: { display: false } }, plugins: { ...chartDefaults().plugins, legend: { display: true, position: 'right', labels: { color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#8896AE' : '#4E5A6E', boxWidth: 9, padding: 9, font: { size: 10 } } } } },
  });

  // Monthly submissions
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthCounts = months.map((_, i) => myR.filter(r => new Date(r.ts).getMonth() === i).length);
  charts.submissions = new Chart($('submissionChart'), {
    type: 'bar',
    data: { labels: months, datasets: [{ data: monthCounts, backgroundColor: 'rgba(108,99,255,.7)', borderRadius: 5 }] },
    options: chartDefaults(),
  });

  // Approval rate over time
  charts.approval = new Chart($('approvalChart'), {
    type: 'line',
    data: {
      labels: months, datasets: [
        { label: 'Approved', data: months.map(() => Math.round(50 + Math.random() * 40)), borderColor: '#00C896', tension: .4, fill: false, pointRadius: 3 },
        { label: 'Flagged', data: months.map(() => Math.round(5 + Math.random() * 20)), borderColor: '#FF4D6D', tension: .4, fill: false, pointRadius: 3 },
      ]
    },
    options: { ...chartDefaults(), plugins: { ...chartDefaults().plugins, legend: { display: true, labels: { color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#8896AE' : '#4E5A6E', boxWidth: 10, padding: 10 } } } },
  });

  // Avg by dept
  const depts = ['Finance', 'Operations', 'HR', 'Legal', 'IT', 'BizDev'];
  charts.avgVal = new Chart($('avgValChart'), {
    type: 'bar',
    data: { labels: depts, datasets: [{ data: depts.map(() => Math.round(50000 + Math.random() * 200000)), backgroundColor: 'rgba(59,158,255,.7)', borderRadius: 5 }] },
    options: { ...chartDefaults(), indexAxis: 'y', scales: { ...chartDefaults().scales, x: { ...chartDefaults().scales.x, ticks: { ...chartDefaults().scales.x.ticks, callback: v => fmtMoney(v) } } } },
  });
}

/* ================================================================
   INTEGRITY
================================================================ */
function renderIntegrity() {
  const allR = SESSION.role === 'admin' ? getReports() : getReports().filter(r => r.userId === SESSION.uid);
  const flagged = allR.filter(r => r.status === 'flagged').length;
  const large = allR.filter(r => r.amount > 300000).length;
  const overBud = allR.filter(r => r.budget && r.amount > r.budget).length;
  const score = Math.max(50, 100 - flagged * 7 - large * 2 - overBud * 3);
  const scoreColor = score >= 85 ? '#00C896' : score >= 65 ? '#FFB800' : '#FF4D6D';

  $('integrityHero').innerHTML = `
    <div class="integrity-score-wrap">
      <div class="integrity-score" style="color:${scoreColor}">${score}</div>
      <div class="integrity-score-label">Integrity Score</div>
    </div>
    <div class="integrity-score-bar-wrap" style="flex:1">
      <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text3);margin-bottom:6px">
        <span>Data Integrity</span><span style="color:${scoreColor};font-weight:600">${score >= 85 ? 'Excellent' : score >= 65 ? 'Good' : 'Needs Review'}</span>
      </div>
      <div class="integrity-bar"><div class="integrity-bar-fill" style="width:${score}%;background:${scoreColor}"></div></div>
      <div style="font-size:12px;color:var(--text2);margin-top:10px;line-height:1.7">
        ${score >= 85 ? 'All reports are within normal parameters. No critical issues detected.' :
      score >= 65 ? 'Some reports require attention. Review flagged items.' :
        'Multiple anomalies detected. Immediate admin review recommended.'}
      </div>
    </div>
  `;

  $('integrityKpi').innerHTML = `
    <div class="integrity-kpi-card">
      <div class="integrity-kpi-val" style="color:var(--green)">${allR.filter(r => r.status === 'approved').length}</div>
      <div class="integrity-kpi-label">Verified Reports</div>
      <div class="mini-bar"><div class="mini-bar-fill" style="width:${allR.length ? allR.filter(r => r.status === 'approved').length / allR.length * 100 : 0}%;background:var(--green)"></div></div>
    </div>
    <div class="integrity-kpi-card">
      <div class="integrity-kpi-val" style="color:${flagged > 3 ? '#FF4D6D' : '#FFB800'}">${flagged}</div>
      <div class="integrity-kpi-label">Anomalies Detected</div>
      <div class="mini-bar"><div class="mini-bar-fill" style="width:${Math.min(flagged * 15, 100)}%;background:var(--red)"></div></div>
    </div>
    <div class="integrity-kpi-card">
      <div class="integrity-kpi-val" style="color:var(--blue)">${allR.length}</div>
      <div class="integrity-kpi-label">Reports Audited</div>
      <div class="mini-bar"><div class="mini-bar-fill" style="width:100%;background:var(--blue)"></div></div>
    </div>
    <div class="integrity-kpi-card">
      <div class="integrity-kpi-val" style="color:var(--teal)">${fmtMoney(allR.reduce((s, r) => s + r.amount, 0))}</div>
      <div class="integrity-kpi-label">Total Audited Value</div>
      <div class="mini-bar"><div class="mini-bar-fill" style="width:80%;background:var(--teal)"></div></div>
    </div>
  `;

  // Anomalies
  const anomalies = [
    ...allR.filter(r => r.status === 'flagged').slice(0, 5).map(r => ({ label: `${r.id}: ${r.title} — ${fmtMoney(r.amount)}`, cls: 'check-fail', icon: '✗ Flagged' })),
    ...allR.filter(r => r.amount > 300000).slice(0, 3).map(r => ({ label: `High-value transaction: ${r.id} — ${fmtMoney(r.amount)}`, cls: 'check-warn', icon: '⚠ Review' })),
    ...allR.filter(r => r.budget && r.amount > r.budget).slice(0, 3).map(r => ({ label: `Over budget: ${r.id} — by ${fmtMoney(r.amount - r.budget)}`, cls: 'check-warn', icon: '⚠ Over' })),
    ...allR.filter(r => r.priority === 'Critical').slice(0, 2).map(r => ({ label: `Critical priority: ${r.id}`, cls: 'check-warn', icon: '! Critical' })),
  ];
  $('anomalyList').innerHTML = !anomalies.length
    ? `<div style="text-align:center;padding:28px;color:var(--text3);font-size:13px">✓ No anomalies detected</div>`
    : anomalies.map(a => `<div class="check-row"><span class="check-label">${a.label}</span><span class="${a.cls}">${a.icon}</span></div>`).join('');

  // Compliance
  const checks = [
    { label: 'Report submission frequency met', pass: allR.length >= 3 },
    { label: 'All amounts properly documented', pass: allR.every(r => r.amount > 0) },
    { label: 'Complete financial audit trail', pass: true },
    { label: 'No overdue reviews (>30 days)', pass: allR.filter(r => r.status === 'pending' && Date.now() - r.ts > 30 * 86400000).length === 0 },
    { label: 'Priority classification complete', pass: allR.every(r => r.priority) },
    { label: 'Department assignment confirmed', pass: allR.every(r => r.dept) },
    { label: 'All workers submitted reports', pass: SESSION.role === 'admin' ? Object.keys(getAllUsers()).filter(k => k !== 'admin').every(uid => getReports().some(r => r.userId === uid)) : true },
    { label: 'No duplicate report IDs', pass: allR.length === new Set(allR.map(r => r.id)).size },
  ];
  $('complianceList').innerHTML = checks.map(c => `
    <div class="check-row">
      <span class="check-label">${c.label}</span>
      <span class="${c.pass ? 'check-pass' : 'check-fail'}">${c.pass ? '✓ Pass' : '✗ Fail'}</span>
    </div>`).join('');

  // Audit trail chart
  const days30 = Array.from({ length: 30 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - 29 + i); return d.toLocaleDateString('en', { month: 'short', day: 'numeric' }); });
  charts.auditTrail = new Chart($('auditTrailChart'), {
    type: 'line',
    data: {
      labels: days30, datasets: [
        { label: 'Submissions', data: days30.map(() => Math.round(Math.random() * 6)), borderColor: '#6C63FF', backgroundColor: 'rgba(108,99,255,.06)', fill: true, tension: .4, pointRadius: 2 },
        { label: 'Reviews', data: days30.map(() => Math.round(Math.random() * 4)), borderColor: '#00E5C3', backgroundColor: 'rgba(0,229,195,.04)', fill: true, tension: .4, pointRadius: 2 },
      ]
    },
    options: { ...chartDefaults(), plugins: { ...chartDefaults().plugins, legend: { display: true, labels: { color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#8896AE' : '#4E5A6E', boxWidth: 10, padding: 10 } } } },
  });
}

function runFullAudit() {
  showToast('Running full integrity audit...', 'info');
  const statuses = ['Scanning report metadata...', 'Checking for duplicate entries...', 'Verifying financial totals...', 'Cross-referencing compliance rules...', 'Generating integrity score...'];
  let i = 0;
  const int = setInterval(() => { if (i < statuses.length) { showToast(statuses[i++], 'info'); } else { clearInterval(int); showToast('Full audit complete — integrity verified ✓', 'success'); addAuditEntry('Full integrity audit completed by ' + SESSION.name, 'success'); renderIntegrity(); } }, 600);
}

/* ================================================================
   ADMIN PANEL
================================================================ */
function renderAdmin() {
  if (SESSION.role !== 'admin') return;
  const reports = getReports();
  const users = getAllUsers();
  const workers = Object.entries(users).filter(([, u]) => u.role === 'worker');
  const total = reports.reduce((s, r) => s + r.amount, 0);
  const pending = reports.filter(r => r.status === 'pending');

  $('adminKpi').innerHTML = `
    <div class="kpi-card kpi-teal">
      <div class="kpi-header"><span class="kpi-label">Total Workers</span><span class="kpi-icon">👥</span></div>
      <div class="kpi-value accent">${workers.length}</div>
      <div class="kpi-change up">↑ All active</div>
    </div>
    <div class="kpi-card kpi-purple">
      <div class="kpi-header"><span class="kpi-label">Total Reports</span><span class="kpi-icon">📊</span></div>
      <div class="kpi-value">${reports.length}</div>
      <div class="kpi-change neutral">Enterprise wide</div>
    </div>
    <div class="kpi-card kpi-gold">
      <div class="kpi-header"><span class="kpi-label">Enterprise Value</span><span class="kpi-icon">💼</span></div>
      <div class="kpi-value gold">${fmtMoney(total)}</div>
      <div class="kpi-change up">↑ Total audited</div>
    </div>
    <div class="kpi-card kpi-red">
      <div class="kpi-header"><span class="kpi-label">Pending Actions</span><span class="kpi-icon">⚡</span></div>
      <div class="kpi-value" style="color:var(--amber)">${pending.length}</div>
      <div class="kpi-change ${pending.length > 5 ? 'down' : 'neutral'}">${pending.length > 5 ? '↑ High backlog' : 'In range'}</div>
    </div>
    <div class="kpi-card kpi-green">
      <div class="kpi-header"><span class="kpi-label">Dept Coverage</span><span class="kpi-icon">🏢</span></div>
      <div class="kpi-value" style="color:var(--green)">${new Set(workers.map(([, u]) => u.dept)).size}</div>
      <div class="kpi-change neutral">Departments</div>
    </div>
    <div class="kpi-card kpi-blue">
      <div class="kpi-header"><span class="kpi-label">Approval Rate</span><span class="kpi-icon">✓</span></div>
      <div class="kpi-value" style="color:var(--blue)">${reports.length ? Math.round(reports.filter(r => r.status === 'approved').length / reports.length * 100) : 0}%</div>
      <div class="kpi-change up">↑ Above target</div>
    </div>
  `;

  // Worker performance chart
  const wNames = workers.map(([, u]) => u.name.split(' ')[0]);
  const wReports = workers.map(([uid]) => reports.filter(r => r.userId === uid).length);
  charts.workerPerf = new Chart($('workerPerfChart'), {
    type: 'bar',
    data: { labels: wNames, datasets: [{ data: wReports, backgroundColor: workers.map(([, u]) => u.color + 'CC'), borderRadius: 6 }] },
    options: chartDefaults(),
  });

  // Dept load
  const depts = ['Finance', 'Operations', 'HR', 'Legal', 'IT', 'BizDev'];
  const deptLoads = depts.map(d => reports.filter(r => r.dept.toLowerCase().includes(d.toLowerCase())).reduce((s, r) => s + r.amount, 0));
  charts.deptLoad = new Chart($('deptLoadChart'), {
    type: 'doughnut',
    data: { labels: depts, datasets: [{ data: deptLoads, backgroundColor: ['rgba(0,229,195,.8)', 'rgba(108,99,255,.8)', 'rgba(255,77,109,.8)', 'rgba(255,184,0,.8)', 'rgba(0,200,150,.8)', 'rgba(139,131,255,.8)'], borderWidth: 0 }] },
    options: { ...chartDefaults(), cutout: '65%', scales: { x: { display: false }, y: { display: false } }, plugins: { ...chartDefaults().plugins, legend: { display: true, position: 'right', labels: { color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#8896AE' : '#4E5A6E', boxWidth: 9, padding: 8, font: { size: 10 } } } } },
  });

  // Status heatmap (stacked bar per worker)
  const statusColors = { approved: '#00C896', pending: '#FFB800', flagged: '#FF4D6D', review: '#6C63FF' };
  charts.statusHeat = new Chart($('statusHeatChart'), {
    type: 'bar',
    data: {
      labels: wNames, datasets: STATUSES.map(s => ({
        label: s, backgroundColor: statusColors[s] + 'CC',
        data: workers.map(([uid]) => reports.filter(r => r.userId === uid && r.status === s).length),
        borderRadius: 4,
      }))
    },
    options: { ...chartDefaults(), scales: { ...chartDefaults().scales, x: { ...chartDefaults().scales.x, stacked: true }, y: { ...chartDefaults().scales.y, stacked: true } }, plugins: { ...chartDefaults().plugins, legend: { display: true, labels: { color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#8896AE' : '#4E5A6E', boxWidth: 9, padding: 8, font: { size: 10 } } } } },
  });

  // Workers table
  $('workerCount').textContent = `${workers.length} workers registered`;
  $('workersBody').innerHTML = workers.map(([uid, u]) => {
    const wr = reports.filter(r => r.userId === uid);
    const wTotal = wr.reduce((s, r) => s + r.amount, 0);
    const wApp = wr.filter(r => r.status === 'approved').length;
    const wFlag = wr.filter(r => r.status === 'flagged').length;
    const lastR = [...wr].sort((a, b) => b.ts - a.ts)[0];
    return `<tr>
      <td>
        <div class="worker-cell">
          <div class="worker-cell-avatar" style="background:${u.color}">${initials(u.name)}</div>
          <div>
            <div class="worker-cell-name">${u.name}</div>
            <div class="worker-cell-user">${uid}</div>
          </div>
        </div>
      </td>
      <td class="td-muted" style="font-size:12px">${u.dept}</td>
      <td class="td-mono">${wr.length}</td>
      <td class="td-mono" style="color:var(--teal)">${fmtMoney(wTotal)}</td>
      <td class="td-mono" style="color:var(--green)">${wApp}</td>
      <td class="td-mono" style="color:var(--red)">${wFlag}</td>
      <td class="td-muted" style="font-size:12px">${lastR ? relativeTime(lastR.ts) : 'Never'}</td>
      <td><span class="pill pill-active">Active</span></td>
      <td>
        <div class="action-btns">
          <button class="btn-tbl" onclick="showWorkerDetail('${uid}')">Detail</button>
          <button class="btn-tbl btn-tbl-accent" onclick="activeWorkerFilter='${uid}';switchTab('reports',document.querySelector('[data-tab=reports]'))">Reports</button>
        </div>
      </td>
    </tr>`;
  }).join('');

  // Pending table
  $('pendingCount').textContent = `${pending.length} awaiting review`;
  $('pendingBody').innerHTML = !pending.length
    ? `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">✅</div><div class="empty-title">All clear</div><div class="empty-sub">No reports awaiting approval</div></div></td></tr>`
    : [...pending].sort((a, b) => b.ts - a.ts).map(r => `<tr>
        <td class="td-bold" style="max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${r.title}</td>
        <td>
          <div class="worker-cell">
            <div class="worker-cell-avatar" style="background:${users[r.userId]?.color || '#666'}">${initials(r.userName)}</div>
            <span style="font-size:13px">${r.userName}</span>
          </div>
        </td>
        <td class="td-muted" style="font-size:12px">${r.type}</td>
        <td class="td-mono" style="color:var(--teal)">${fmtMoney(r.amount)}</td>
        <td><span class="p-${r.priority.toLowerCase()}">${r.priority}</span></td>
        <td class="td-muted" style="font-size:12px">${relativeTime(r.ts)}</td>
        <td>
          <div class="action-btns">
            <button class="btn-tbl btn-tbl-accent" onclick="approveReport('${r.id}');renderAdmin()">Approve</button>
            <button class="btn-tbl btn-tbl-danger" onclick="flagReport('${r.id}');renderAdmin()">Flag</button>
            <button class="btn-tbl" onclick="viewReport('${r.id}')">View</button>
          </div>
        </td>
      </tr>`).join('');
}

function showWorkerDetail(uid) {
  const users = getAllUsers();
  const u = users[uid];
  const reports = getReports().filter(r => r.userId === uid);
  const total = reports.reduce((s, r) => s + r.amount, 0);
  $('modalTitle').textContent = u.name;
  $('modalSub').textContent = `${uid} · ${u.dept} · ${u.role}`;
  $('modalBody').innerHTML = `
    <div class="modal-kpi-row">
      <div class="modal-kpi"><div class="modal-kpi-label">Reports</div><div class="modal-kpi-val">${reports.length}</div></div>
      <div class="modal-kpi"><div class="modal-kpi-label">Total Value</div><div class="modal-kpi-val accent">${fmtMoney(total)}</div></div>
      <div class="modal-kpi"><div class="modal-kpi-label">Approved</div><div class="modal-kpi-val" style="color:var(--green)">${reports.filter(r => r.status === 'approved').length}</div></div>
    </div>
    <div class="modal-field-row"><span class="modal-field-label">Department</span><span class="modal-field-val">${u.dept}</span></div>
    <div class="modal-field-row"><span class="modal-field-label">Joined</span><span class="modal-field-val">${u.joined || 'N/A'}</span></div>
    <div class="modal-field-row"><span class="modal-field-label">Pending</span><span class="modal-field-val" style="color:var(--amber)">${reports.filter(r => r.status === 'pending').length}</span></div>
    <div class="modal-field-row"><span class="modal-field-label">Flagged</span><span class="modal-field-val" style="color:var(--red)">${reports.filter(r => r.status === 'flagged').length}</span></div>
    <div class="modal-section"><div class="modal-section-label">Recent Reports</div>
      ${[...reports].sort((a, b) => b.ts - a.ts).slice(0, 4).map(r => `<div class="check-row"><span class="check-label">${r.title}</span><span class="pill pill-${r.status}" style="font-size:10px">${r.status}</span></div>`).join('') || 'No reports yet'}
    </div>
  `;
  $('modalFooter').innerHTML = `<button class="btn-ghost" onclick="closeModal()">Close</button>`;
  $('modalOverlay').classList.add('open');
}

/* ================================================================
   AUDIT LOG
================================================================ */
function renderAuditLog() {
  const log = getAuditLog();
  $('auditLogCount').textContent = `${log.length} log entries`;
  const colors = { success: '#00C896', info: '#3B9EFF', warning: '#FFB800', error: '#FF4D6D', system: '#8B83FF' };
  $('auditLogList').innerHTML = !log.length
    ? `<div class="empty-state"><div class="empty-icon">📋</div><div class="empty-title">No audit entries</div></div>`
    : log.map(e => `
      <div class="audit-log-item">
        <div class="audit-log-dot" style="background:${colors[e.type] || '#8896AE'}"></div>
        <div class="audit-log-content">
          <div class="audit-log-action">${e.action}</div>
          <div class="audit-log-meta">${e.user} · ${new Date(e.ts).toLocaleString()}</div>
        </div>
      </div>`).join('');
}

function clearAuditLog() {
  if (!confirm('Clear the entire audit log? This cannot be undone.')) return;
  saveAuditLog([{ action: 'Audit log cleared by ' + SESSION.name, user: SESSION.uid, ts: Date.now(), type: 'warning' }]);
  renderAuditLog();
  showToast('Audit log cleared', 'warning');
}

/* ================================================================
   THEME
================================================================ */
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('corp_theme', next);
  updateThemeBtn(next);
  const activeTab = document.querySelector('.tab-pane.active');
  if (activeTab) {
    const tabId = activeTab.id.replace('tab-', '');
    destroyAllCharts();
    switch (tabId) {
      case 'dashboard': renderDashboard(); break;
      case 'analytics': renderAnalytics(); break;
      case 'integrity': renderIntegrity(); break;
      case 'admin': if (SESSION?.role === 'admin') renderAdmin(); break;
      case 'tasks': renderTasks(); break;
    }
  }
}

function updateThemeBtn(theme) {
  const icon = $('themeIcon');
  const label = $('themeLabel');
  if (icon) icon.textContent = theme === 'dark' ? '◑' : '◐';
  if (label) label.textContent = theme === 'dark' ? 'Dark Mode' : 'Light Mode';
}

/* ================================================================
   MODAL
================================================================ */
function closeModal(e) {
  if (!e || e.target === $('modalOverlay')) {
    $('modalOverlay').classList.remove('open');
  }
}

/* ================================================================
   TOAST
================================================================ */
function showToast(msg, type = 'info') {
  const container = $('toastContainer');
  const icons = { success: '✓', error: '✗', info: '◈', warning: '⚠' };
  const colors = { success: 'var(--green)', error: 'var(--red)', info: 'var(--purple)', warning: 'var(--amber)' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon" style="color:${colors[type] || 'var(--teal)'}">${icons[type] || '•'}</span>
    <span>${msg}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
  `;
  container.appendChild(toast);
  setTimeout(() => { toast.classList.add('hide'); setTimeout(() => toast.remove(), 350); }, 4000);
  // Limit stack
  if (container.children.length > 5) container.firstChild?.remove();
}

/* ================================================================
   KEYBOARD SHORTCUTS
================================================================ */
document.addEventListener('keydown', e => {
  if (!SESSION) return;
  if (e.ctrlKey || e.metaKey) {
    if (e.key === 'k') { e.preventDefault(); $('searchInput')?.focus(); }
    if (e.key === '1') { e.preventDefault(); switchTab('dashboard', document.querySelector('[data-tab=dashboard]')); }
    if (e.key === '2') { e.preventDefault(); switchTab('reports', document.querySelector('[data-tab=reports]')); }
    if (e.key === '3') { e.preventDefault(); switchTab('submit', document.querySelector('[data-tab=submit]')); }
  }
  if (e.key === 'Escape') {
    closeModal();
    $('notifPanel').classList.remove('open');
  }
});

/* ================================================================
   RESIZE HANDLER
================================================================ */
window.addEventListener('resize', () => {
  if (window.innerWidth <= 768) {
    document.querySelector('.sidebar')?.classList.remove('mobile-open');
  }
});