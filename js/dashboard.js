/**
 * LabOS - Shared Dashboard Utilities
 * Toast notifications, page switching, sidebar behavior
 */

// Page switching
function switchPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  const target = document.getElementById('page-' + pageId);
  if (target) {
    target.classList.remove('hidden');
  }
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === pageId);
  });
  const titles = {
    overview: '概览', devices: '设备浏览', book: '预约申请', checkin: '签到/签退',
    history: '历史记录', notifications: '通知',
    audit: '预约审核', monitor: '使用监控', maintenance: '维护管理',
    inventory: '库存管理', reports: '统计报表',
    users: '用户管理', permissions: '权限配置', 'audit-log': '操作审计日志',
    settings: '系统设置', integration: '系统集成', backup: '备份与恢复'
  };
  const adminAdminTitles = {
    overview: '数据看板'
  };
  const el = document.getElementById('pageTitle');
  if (el) el.textContent = adminAdminTitles[pageId] || titles[pageId] || pageId;
}

// Toast
function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = {
    success: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>',
    error: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    warning: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
  };

  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.innerHTML = icons[type] + `<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 350);
  }, duration);
}

// Modal open/close helpers
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('hidden');
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('hidden');
}

// Navigation setup
function setupNavigation() {
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', () => switchPage(item.dataset.page));
  });
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('确认退出登录？')) {
        window.location.href = 'index.html';
      }
    });
  }
}

// Status tag builder
function statusTag(status) {
  const labels = {
    available: '可用', busy: '使用中', maintenance: '维修中',
    pending: '待审核', approved: '已通过', rejected: '已拒绝',
    cancelled: '已取消', normal: '正常', retired: '已报废',
    inprogress: '维修中', done: '已修复', plan: '维保计划',
    active: '正常', disabled: '已禁用', success: '成功', failed: '失败'
  };
  return `<span class="status-tag ${status}">${labels[status] || status}</span>`;
}

// Date formatter
function fmtDate(d) {
  if (!d) return '-';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }).replace('/', '月') + '日';
}

// Init sidebar toggle
function setupSidebarToggle() {
  const btn = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  const main = document.getElementById('mainContent');
  if (!btn || !sidebar) return;
  btn.addEventListener('click', () => {
    const collapsed = sidebar.style.width === '72px';
    sidebar.style.width = collapsed ? 'var(--sidebar-w)' : '72px';
    if (main) main.style.marginLeft = collapsed ? 'var(--sidebar-w)' : '72px';
    sidebar.querySelectorAll('.sidebar-brand, .user-info, .nav-item span, .nav-badge, .nav-section-label, .user-role-badge').forEach(el => {
      el.style.opacity = collapsed ? '1' : '0';
      el.style.pointerEvents = collapsed ? '' : 'none';
    });
  });
}

// Charts using Canvas (no external lib) 
function drawBarChart(canvas, labels, datasets, opts = {}) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width = canvas.offsetWidth;
  const H = canvas.height = canvas.offsetHeight || 200;
  ctx.clearRect(0, 0, W, H);

  const pad = { top: 20, right: 20, bottom: 40, left: 40 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  const allVals = datasets.flatMap(d => d.data);
  const maxVal = Math.max(...allVals, 1);
  const yStep = Math.ceil(maxVal / 5);
  const yMax = yStep * 5;

  // Grid lines
  ctx.strokeStyle = 'rgba(0,0,0,0.06)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = pad.top + chartH - (i / 5) * chartH;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + chartW, y); ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(Math.round(yStep * i), pad.left - 6, y + 4);
  }

  const barGroups = labels.length;
  const groupW = chartW / barGroups;
  const barW = Math.min((groupW / datasets.length) * 0.7, 32);
  const colors = ['rgba(0,122,255,0.85)', 'rgba(48,209,88,0.85)', 'rgba(255,159,10,0.85)', 'rgba(191,90,242,0.85)'];

  datasets.forEach((ds, di) => {
    ctx.fillStyle = ds.color || colors[di];
    ds.data.forEach((val, i) => {
      const x = pad.left + i * groupW + (groupW - barW * datasets.length) / 2 + di * barW;
      const barH = (val / yMax) * chartH;
      const y = pad.top + chartH - barH;
      ctx.beginPath();
      ctx.roundRect(x, y, barW - 3, barH, [4, 4, 0, 0]);
      ctx.fill();
    });
  });

  // X labels
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.font = '10px Inter, sans-serif';
  ctx.textAlign = 'center';
  labels.forEach((label, i) => {
    ctx.fillText(label, pad.left + i * groupW + groupW / 2, H - 8);
  });
}

function drawDonutChart(canvas, segments, opts = {}) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width = canvas.offsetWidth || 200;
  const H = canvas.height = canvas.offsetHeight || 180;
  const cx = W / 2, cy = H / 2;
  const radius = Math.min(W, H) * 0.38;
  const innerR = radius * 0.62;

  let startAngle = -Math.PI / 2;
  const total = segments.reduce((s, seg) => s + seg.value, 0);

  segments.forEach(seg => {
    const angle = (seg.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, startAngle + angle);
    ctx.closePath();
    ctx.fillStyle = seg.color;
    ctx.fill();
    startAngle += angle;
  });

  // Inner circle cutout
  ctx.beginPath();
  ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
}

// Datetime display
function startDatetimeDisplay() {
  const el = document.getElementById('datetimeDisplay');
  if (!el) return;
  function update() {
    const now = new Date();
    el.textContent = now.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  }
  update();
  setInterval(update, 30000);
}

// Init on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupSidebarToggle();
  startDatetimeDisplay();
});
