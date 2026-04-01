/**
 * LabOS - User Dashboard Logic
 */
document.addEventListener('DOMContentLoaded', () => {
  const D = window.LabData;

  renderOverview();
  renderDevicePage();
  renderBookPage();
  renderCheckinPage();
  renderHistoryPage();
  renderNotificationsPage();
  setupBookModal();
  setupDeviceModal();

  // === Overview ===
  function renderOverview() {
    // Upcoming reservations
    const list = document.getElementById('upcomingList');
    if (list) {
      const upcoming = D.reservations.filter(r => r.status === 'approved' || r.status === 'pending').slice(0, 4);
      list.innerHTML = upcoming.map(r => `
        <div class="reservation-item">
          <div class="res-dot" style="background:${r.status === 'approved' ? '#30D158' : '#5856D6'}"></div>
          <div class="res-info">
            <p class="res-device">${r.deviceName}</p>
            <p class="res-time">📅 ${r.date} &nbsp; ⏰ ${r.startTime}–${r.endTime}</p>
          </div>
          ${statusTag(r.status)}
        </div>`).join('') || '<p style="color:var(--text-tertiary);padding:12px;text-align:center">暂无近期预约</p>';
    }

    // Popular devices
    const pd = document.getElementById('popularDevices');
    if (pd) {
      pd.innerHTML = D.devices.filter(d => d.status === 'available').slice(0, 5).map(d => `
        <div class="device-quick-item" onclick="openDeviceModal('${d.id}')">
          <div class="device-quick-icon">${d.emoji}</div>
          <div>
            <p class="device-quick-name">${d.name}</p>
            <p class="device-quick-loc">📍 ${d.location}</p>
          </div>
          ${statusTag(d.status)}
        </div>`).join('');
    }

    // Notification preview
    renderNotifList('notifPreview', D.notifications.slice(0, 4));
  }

  // === Device Browse ===
  function renderDevicePage() {
    renderDeviceGrid(D.devices);

    const catFilter = document.getElementById('catFilter');
    const statusFilter = document.getElementById('statusFilter');
    const levelFilter = document.getElementById('levelFilter');

    if (catFilter) {
      catFilter.querySelectorAll('.seg-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          catFilter.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          applyDeviceFilters();
        });
      });
    }
    if (statusFilter) statusFilter.addEventListener('change', applyDeviceFilters);
    if (levelFilter) levelFilter.addEventListener('change', applyDeviceFilters);

    // View toggle
    document.getElementById('gridViewBtn')?.addEventListener('click', () => {
      document.getElementById('deviceGrid').classList.remove('list-view');
      document.getElementById('gridViewBtn').classList.add('active');
      document.getElementById('listViewBtn').classList.remove('active');
    });
    document.getElementById('listViewBtn')?.addEventListener('click', () => {
      document.getElementById('deviceGrid').classList.add('list-view');
      document.getElementById('listViewBtn').classList.add('active');
      document.getElementById('gridViewBtn').classList.remove('active');
    });
  }

  function applyDeviceFilters() {
    const cat = document.querySelector('#catFilter .seg-btn.active')?.dataset.val || 'all';
    const status = document.getElementById('statusFilter')?.value || 'all';
    const level = document.getElementById('levelFilter')?.value || 'all';

    const filtered = D.devices.filter(d =>
      (cat === 'all' || d.category === cat) &&
      (status === 'all' || d.status === status) &&
      (level === 'all' || d.danger === level)
    );
    renderDeviceGrid(filtered);
  }

  function renderDeviceGrid(devices) {
    const grid = document.getElementById('deviceGrid');
    if (!grid) return;
    if (devices.length === 0) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--text-tertiary)"><p style="font-size:3rem">🔍</p><p>暂无符合条件的设备</p></div>';
      return;
    }
    grid.innerHTML = devices.map(d => `
      <div class="device-card" onclick="openDeviceModal('${d.id}')">
        <div class="device-card-header">
          <div class="device-icon-box">${d.emoji}</div>
          <span class="device-card-danger ${d.danger}">${d.danger === 'high' ? '⚠️ 高危' : '✅ 普通'}</span>
        </div>
        <p class="device-name">${d.name}</p>
        <p class="device-model">${d.model}</p>
        <div class="device-meta">
          <div class="device-meta-row">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            ${d.location}
          </div>
          <div class="device-meta-row">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            单次最长 ${d.maxHours} 小时 &nbsp;·&nbsp; 每周最多 ${d.maxWeek} 次
          </div>
        </div>
        <div class="device-card-footer">
          ${statusTag(d.status)}
          <button class="book-now-btn" onclick="event.stopPropagation(); quickBook('${d.id}')" ${d.status !== 'available' ? 'disabled' : ''}>
            ${d.status === 'available' ? '立即预约' : d.status === 'busy' ? '使用中' : '维修中'}
          </button>
        </div>
      </div>`).join('');
  }

  // === Book Page ===
  function renderBookPage() {
    renderBookList('all');

    const tabStrip = document.getElementById('bookTabStrip');
    if (tabStrip) {
      tabStrip.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          tabStrip.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          renderBookList(btn.dataset.status);
        });
      });
    }

    document.getElementById('newBookBtn')?.addEventListener('click', () => openModal('bookModal'));
  }

  function renderBookList(filter) {
    const list = document.getElementById('bookList');
    if (!list) return;
    const items = filter === 'all' ? D.reservations : D.reservations.filter(r => r.status === filter);
    if (items.length === 0) {
      list.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-tertiary)"><p style="font-size:2rem">📋</p><p>暂无预约记录</p></div>';
      return;
    }
    list.innerHTML = items.map(r => `
      <div class="book-item" onclick="showBookDetail('${r.id}')">
        <div class="book-item-header">
          <span class="book-item-name">${r.deviceName}</span>
          ${statusTag(r.status)}
        </div>
        <div class="book-item-time">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>
          ${r.date} &nbsp; ${r.startTime}–${r.endTime}
        </div>
        <div class="book-item-footer">
          <span class="book-item-purpose">${r.purposeLabel}</span>
          <span style="font-size:0.75rem;color:var(--text-tertiary)">${r.submitTime.slice(0, 10)} 提交</span>
        </div>
      </div>`).join('');
  }

  window.showBookDetail = function(id) {
    const r = D.reservations.find(x => x.id === id);
    if (!r) return;

    document.querySelectorAll('.book-item').forEach(el => el.classList.remove('selected'));
    document.querySelector(`.book-item[onclick*="${id}"]`)?.classList.add('selected');

    const placeholder = document.getElementById('detailPlaceholder');
    const content = document.getElementById('bookDetailContent');
    if (placeholder) placeholder.classList.add('hidden');
    if (content) {
      content.classList.remove('hidden');
      content.innerHTML = `
        <div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
            <h4 style="font-size:1.05rem;font-weight:700">${r.deviceName}</h4>
            ${statusTag(r.status)}
          </div>
          <div class="detail-field"><span class="detail-label">预约编号</span><span class="detail-value" style="font-size:0.82rem;font-family:monospace">${r.id}</span></div>
          <div class="detail-field"><span class="detail-label">使用日期</span><span class="detail-value">${r.date}</span></div>
          <div class="detail-field"><span class="detail-label">使用时间</span><span class="detail-value">${r.startTime} – ${r.endTime} (${r.duration}小时)</span></div>
          <div class="detail-field"><span class="detail-label">使用用途</span><span class="detail-value">${r.purposeLabel}</span></div>
          <div class="detail-field"><span class="detail-label">详细说明</span><span class="detail-value" style="font-weight:400;font-size:0.875rem">${r.desc || '—'}</span></div>
          <div class="detail-field"><span class="detail-label">提交时间</span><span class="detail-value">${r.submitTime}</span></div>
          ${r.approveTime ? `<div class="detail-field"><span class="detail-label">审核时间</span><span class="detail-value">${r.approveTime}</span></div>` : ''}
          ${r.status === 'rejected' ? `<div style="padding:12px;background:rgba(255,69,58,0.07);border:1px solid rgba(255,69,58,0.2);border-radius:12px;font-size:0.85rem;color:#CC2F23"><strong>拒绝原因：</strong>${r.rejectReason}</div>` : ''}
        </div>
        <div class="detail-actions">
          ${r.status === 'approved' ? '<button class="btn-primary" style="width:100%" onclick="showToast(\'已发起签到，请前往实验室\', \'success\')">发起签到</button>' : ''}
          ${r.status === 'pending' ? `<button class="btn-danger btn-outline" style="width:100%;border-color:var(--accent-red);color:var(--accent-red)" onclick="showToast('取消申请已提交','info')">取消申请</button>` : ''}
        </div>`;
    }
  };

  // === Check-in Page ===
  function renderCheckinPage() {
    const list = document.getElementById('todaysList');
    if (!list) return;
    const today = D.reservations.filter(r => r.status === 'approved');
    list.innerHTML = today.map((r, i) => `
      <div class="today-item ${r._checkedIn ? 'checked-in' : ''}" id="today-${i}" onclick="handleCheckin(${i})">
        <div style="font-size:1.5rem">${D.devices.find(d => d.id === r.deviceId)?.emoji || '🔬'}</div>
        <div class="today-item-info">
          <p class="today-item-name">${r.deviceName}</p>
          <p class="today-item-time">${r.startTime}–${r.endTime} · ${D.devices.find(d => d.id === r.deviceId)?.location}</p>
        </div>
        <div>${r._checkedIn ? '<span class="status-tag approved">已签到</span>' : '<span class="status-tag pending">待签到</span>'}</div>
      </div>`).join('') || '<p style="color:var(--text-tertiary);text-align:center;padding:32px">今日暂无待签到预约</p>';
  }

  window.handleCheckin = function(idx) {
    showToast('已确认签到，请开始使用设备', 'success');
    const item = document.querySelector(`#today-${idx}`);
    if (item) {
      item.classList.add('checked-in');
      item.querySelector('div:last-child').innerHTML = '<span class="status-tag approved">已签到</span>';
    }
  };

  // === History Page ===
  function renderHistoryPage() {
    const body = document.getElementById('historyBody');
    if (!body) return;
    body.innerHTML = D.reservations.map(r => `
      <tr>
        <td><strong>${r.deviceName}</strong></td>
        <td>${r.date} ${r.startTime}–${r.endTime}</td>
        <td>${r.duration ? r.duration + 'h' : '—'}</td>
        <td>${r.purposeLabel}</td>
        <td>${r.deviceStatus ? statusTag(r.deviceStatus) : '—'}</td>
        <td>${statusTag(r.status)}</td>
      </tr>`).join('');
  }

  // === Notifications ===
  function renderNotificationsPage() {
    renderNotifList('notifListFull', D.notifications);
  }

  function renderNotifList(containerId, notifications) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const typeIcon = { success: '✅', warning: '⚠️', info: 'ℹ️', error: '❌' };
    el.innerHTML = notifications.map(n => `
      <div class="notif-item ${n.read ? '' : 'unread'}">
        <div class="notif-icon ${n.type}">${typeIcon[n.type] || 'ℹ️'}</div>
        <div class="notif-content">
          <p class="notif-title">${n.title}</p>
          <p class="notif-desc">${n.desc}</p>
          <p class="notif-time">${n.time}</p>
        </div>
        ${!n.read ? '<div class="notif-unread-dot"></div>' : ''}
      </div>`).join('') || '<p style="color:var(--text-tertiary);text-align:center;padding:32px">暂无通知</p>';
  }

  // === Book Modal ===
  function setupBookModal() {
    // Populate device select
    const sel = document.getElementById('bookDevice');
    if (sel) {
      D.devices.filter(d => d.status === 'available').forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.id;
        opt.textContent = `${d.emoji} ${d.name} (${d.location})`;
        sel.appendChild(opt);
      });
    }

    // Set today as default date
    const dateInput = document.getElementById('bookDate');
    if (dateInput) {
      const today = new Date();
      dateInput.min = today.toISOString().split('T')[0];
      dateInput.value = today.toISOString().split('T')[0];
    }

    document.getElementById('closeBookModal')?.addEventListener('click', () => closeModal('bookModal'));
    document.getElementById('cancelBookBtn')?.addEventListener('click', () => closeModal('bookModal'));
    document.getElementById('submitBookBtn')?.addEventListener('click', submitBook);
    document.getElementById('bookModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'bookModal') closeModal('bookModal');
    });
  }

  function submitBook() {
    const device = document.getElementById('bookDevice').value;
    const date = document.getElementById('bookDate').value;
    const start = document.getElementById('bookStart').value;
    const duration = document.getElementById('bookDuration').value;
    const purpose = document.getElementById('bookPurpose').value;

    if (!device || !date || !start || !duration || !purpose) {
      showToast('请填写所有必填项', 'warning');
      return;
    }

    closeModal('bookModal');
    showToast('预约申请已提交，等待管理员审核', 'success');
  }

  // === Device Modal ===
  function setupDeviceModal() {
    document.getElementById('closeDeviceModal')?.addEventListener('click', () => closeModal('deviceModal'));
    document.getElementById('deviceModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'deviceModal') closeModal('deviceModal');
    });
  }

  window.openDeviceModal = function(id) {
    const d = D.devices.find(x => x.id === id);
    if (!d) return;
    const content = document.getElementById('deviceDetailContent');
    if (content) {
      content.innerHTML = `
        <div style="padding:var(--space-xl)">
          <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px">
            <div style="font-size:3rem">${d.emoji}</div>
            <div>
              <h3 style="font-size:1.3rem;font-weight:800">${d.name}</h3>
              <p style="color:var(--text-secondary)">${d.model}</p>
              <div style="margin-top:8px;display:flex;gap:8px">${statusTag(d.status)}<span class="device-card-danger ${d.danger}">${d.danger === 'high' ? '⚠️ 高危设备' : '✅ 普通设备'}</span></div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px">
            <div class="detail-field"><span class="detail-label">设备编号</span><span class="detail-value" style="font-family:monospace">${d.id}</span></div>
            <div class="detail-field"><span class="detail-label">存放位置</span><span class="detail-value">📍 ${d.location}</span></div>
            <div class="detail-field"><span class="detail-label">购置价值</span><span class="detail-value">¥${d.value.toLocaleString()}</span></div>
            <div class="detail-field"><span class="detail-label">购置日期</span><span class="detail-value">${d.acquireDate}</span></div>
            <div class="detail-field"><span class="detail-label">单次最长时长</span><span class="detail-value">${d.maxHours} 小时</span></div>
            <div class="detail-field"><span class="detail-label">每周最多次数</span><span class="detail-value">${d.maxWeek} 次</span></div>
            <div class="detail-field"><span class="detail-label">上次维保</span><span class="detail-value">${d.lastMaint}</span></div>
          </div>
          ${d.danger === 'high' ? '<div style="padding:12px 16px;background:rgba(255,159,10,0.1);border:1px solid rgba(255,159,10,0.25);border-radius:12px;display:flex;gap:10px;align-items:flex-start;margin-bottom:16px"><span>⚠️</span><div><p style="font-weight:600;font-size:0.875rem;color:#CC7A00">高危设备提示</p><p style="font-size:0.82rem;color:var(--text-secondary);margin-top:4px">使用本设备需提供有效的高危设备操作证</p></div></div>' : ''}
          <div style="padding:12px 16px;background:var(--bg-tertiary);border-radius:12px;margin-bottom:24px">
            <p style="font-size:0.78rem;font-weight:700;text-transform:uppercase;letter-spacing: 0.06em;color:var(--text-tertiary);margin-bottom:8px">操作注意事项</p>
            <p style="font-size:0.875rem">${d.note}</p>
          </div>
          <button class="btn-primary" style="width:100%" onclick="closeModal('deviceModal');openModal('bookModal');document.getElementById('bookDevice').value='${d.id}'" ${d.status !== 'available' ? 'disabled' : ''}>
            ${d.status === 'available' ? '立即预约此设备' : d.status === 'busy' ? '设备使用中，暂不可预约' : '设备维修中，暂不可预约'}
          </button>
        </div>`;
    }
    openModal('deviceModal');
  };

  window.quickBook = function(deviceId) {
    document.getElementById('bookDevice') ? (document.getElementById('bookDevice').value = deviceId) : null;
    openModal('bookModal');
    switchPage('book');
  };

  // Global search
  document.getElementById('globalSearch')?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    if (!q) return;
    const results = D.devices.filter(d => d.name.toLowerCase().includes(q) || d.model.toLowerCase().includes(q) || d.location.toLowerCase().includes(q));
    if (results.length > 0) {
      switchPage('devices');
      renderDeviceGrid(results);
    }
  });
});
