/**
 * LabOS - Admin Dashboard Logic
 */
document.addEventListener('DOMContentLoaded', () => {
  const D = window.LabData;

  renderAdminOverview();
  renderDeviceLedger();
  renderAuditPage();
  renderMonitorPage();
  renderMaintenancePage();
  renderInventoryPage();
  renderReportsPage();
  setupDeviceFormModal();

  // === Overview ===
  function renderAdminOverview() {
    // Audit preview
    const list = document.getElementById('auditPreviewList');
    if (list) {
      list.innerHTML = D.pendingAudits.slice(0, 4).map(a => `
        <div class="audit-preview-item">
          <div class="audit-preview-user">${a.avatar}</div>
          <div class="audit-preview-info">
            <p class="audit-preview-device">${a.deviceName}</p>
            <p class="audit-preview-meta">${a.userName} · ${a.date} ${a.startTime}–${a.endTime}</p>
          </div>
          <div class="audit-quick-btns">
            <button class="audit-approve-btn" onclick="quickAudit('${a.id}','approve')">通过</button>
            <button class="audit-reject-btn" onclick="quickAudit('${a.id}','reject')">拒绝</button>
          </div>
        </div>`).join('');
    }

    // Maintenance alerts
    const mList = document.getElementById('maintAlertList');
    if (mList) {
      mList.innerHTML = D.maintenanceTickets.filter(m => m.status !== 'done').map(m => `
        <div class="maint-alert-item">
          <div class="maint-alert-icon ${m.status === 'inprogress' ? 'overdue' : 'upcoming'}">
            ${m.status === 'inprogress' ? '🔧' : '📅'}
          </div>
          <div class="maint-alert-info">
            <p class="maint-alert-device">${m.deviceName}</p>
            <p class="maint-alert-meta">${m.status === 'inprogress' ? '维修中' : '计划维保'} · 预计 ${m.estimateEnd}</p>
          </div>
          ${statusTag(m.status)}
        </div>`).join('');
    }

    // Draw charts
    requestAnimationFrame(() => {
      const trendCanvas = document.getElementById('trendChart');
      if (trendCanvas) {
        drawBarChart(trendCanvas, ['周一','周二','周三','周四','周五','周六','周日'], [
          { data: [32, 28, 45, 41, 38, 22, 18], color: 'rgba(0,122,255,0.8)' },
          { data: [28, 25, 40, 37, 34, 19, 15], color: 'rgba(48,209,88,0.8)' }
        ]);
      }
    });

    requestAnimationFrame(() => {
      const statusCanvas = document.getElementById('statusChart');
      if (statusCanvas) {
        drawDonutChart(statusCanvas, [
          { value: 98, color: '#30D158' },
          { value: 18, color: '#FF9F0A' },
          { value: 7, color: '#FF453A' },
          { value: 5, color: '#AEAEB2' }
        ]);
        const legend = document.getElementById('statusLegend');
        if (legend) {
          legend.innerHTML = [
            { label: '正常 116', color: '#30D158' },
            { label: '维修中 18', color: '#FF9F0A' },
            { label: '停用 7', color: '#FF453A' },
            { label: '报废 5', color: '#AEAEB2' }
          ].map(l => `<div style="display:flex;align-items:center;gap:5px"><div class="legend-dot" style="background:${l.color}"></div><span>${l.label}</span></div>`).join('');
        }
      }
    });
  }

  // === Device Ledger ===
  function renderDeviceLedger() {
    const body = document.getElementById('adminDeviceBody');
    if (!body) return;
    renderDeviceTable(D.devices);

    document.getElementById('deviceSearch')?.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      const filtered = D.devices.filter(d => d.name.toLowerCase().includes(q) || d.id.toLowerCase().includes(q) || d.location.toLowerCase().includes(q));
      renderDeviceTable(filtered);
    });
    document.getElementById('adminDeviceFilter')?.addEventListener('change', (e) => {
      const val = e.target.value;
      const filtered = val === 'all' ? D.devices : D.devices.filter(d => d.status === val);
      renderDeviceTable(filtered);
    });
    document.getElementById('addDeviceBtn')?.addEventListener('click', () => {
      document.getElementById('deviceFormTitle').textContent = '新增设备';
      document.getElementById('deviceForm').reset();
      openModal('deviceFormModal');
    });
  }

  function renderDeviceTable(devices) {
    const body = document.getElementById('adminDeviceBody');
    if (!body) return;
    const catLabels = { precision: '精密仪器', chemical: '化学分析', mechanical: '机械加工', electrical: '电子电气' };
    body.innerHTML = devices.map(d => `
      <tr>
        <td><code style="font-size:0.78rem;background:var(--bg-tertiary);padding:2px 6px;border-radius:4px">${d.id}</code></td>
        <td><strong>${d.emoji} ${d.name}</strong></td>
        <td style="color:var(--text-secondary)">${d.model}</td>
        <td>📍 ${d.location}</td>
        <td>${statusTag(d.status)}</td>
        <td><span class="device-card-danger ${d.danger}" style="font-size:0.75rem">${d.danger === 'high' ? '⚠️ 高危' : '✅ 普通'}</span></td>
        <td style="color:var(--text-secondary)">${d.lastMaint || '—'}</td>
        <td>
          <div style="display:flex;gap:6px">
            <button class="text-btn" onclick="editDevice('${d.id}')">编辑</button>
            <button class="text-btn" style="color:var(--accent-orange)" onclick="showToast('已生成维保工单','info')">维保</button>
          </div>
        </td>
      </tr>`).join('');
  }

  window.editDevice = function(id) {
    const d = D.devices.find(x => x.id === id);
    if (!d) return;
    document.getElementById('deviceFormTitle').textContent = '编辑设备';
    document.getElementById('devId').value = d.id;
    document.getElementById('devName').value = d.name;
    document.getElementById('devModel').value = d.model;
    document.getElementById('devLocation').value = d.location;
    document.getElementById('devLevel').value = d.danger;
    document.getElementById('devCategory').value = d.category;
    document.getElementById('devNotes').value = d.note;
    openModal('deviceFormModal');
  };

  // === Audit Page ===
  function renderAuditPage() {
    renderAuditList('pending');

    document.getElementById('auditTabStrip')?.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('auditTabStrip').querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderAuditList(btn.dataset.status);
      });
    });
  }

  function renderAuditList(filter) {
    const list = document.getElementById('auditList');
    if (!list) return;
    const items = filter === 'pending' ? D.pendingAudits : D.pendingAudits.filter(a => a.status === filter);
    if (items.length === 0) {
      list.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-tertiary)"><p style="font-size:2rem">✅</p><p>没有待处理的审核申请</p></div>';
      return;
    }
    list.innerHTML = items.map(a => `
      <div class="audit-item" onclick="showAuditDetail('${a.id}')">
        <div class="audit-item-header">
          <span class="audit-name">${a.deviceName}</span>
          ${a.level === 'high' ? '<span class="device-card-danger high" style="font-size:0.72rem">⚠️ 高危</span>' : ''}
        </div>
        <div class="audit-sub">
          <span>👤 ${a.userName} (${a.dept})</span>
          <span>📅 ${a.date} ${a.startTime}–${a.endTime}</span>
          <span>🎯 ${a.purpose}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
          <span style="font-size:0.75rem;color:var(--text-tertiary)">提交: ${a.submitTime}</span>
          ${statusTag(a.status)}
        </div>
      </div>`).join('');
  }

  window.showAuditDetail = function(id) {
    const a = D.pendingAudits.find(x => x.id === id);
    if (!a) return;
    document.querySelectorAll('.audit-item').forEach(el => el.classList.remove('selected'));
    document.querySelector(`.audit-item[onclick*="${id}"]`)?.classList.add('selected');

    const placeholder = document.querySelector('#auditDetailPanel .detail-placeholder');
    const content = document.getElementById('auditDetailContent');
    if (placeholder) placeholder.style.display = 'none';
    if (content) {
      content.classList.remove('hidden');
      content.innerHTML = `
        <div>
          <h4 style="font-size:1.05rem;font-weight:700;margin-bottom:16px">预约申请详情</h4>
          <div class="detail-field"><span class="detail-label">申请编号</span><span class="detail-value" style="font-size:0.8rem;font-family:monospace">${a.id}</span></div>
          <div class="detail-field"><span class="detail-label">申请设备</span><span class="detail-value">${a.deviceName}</span></div>
          <div class="detail-field"><span class="detail-label">申请人</span><span class="detail-value">${a.userName} · ${a.dept}</span></div>
          <div class="detail-field"><span class="detail-label">使用时间</span><span class="detail-value">${a.date} ${a.startTime}–${a.endTime} (${a.duration}h)</span></div>
          <div class="detail-field"><span class="detail-label">用途</span><span class="detail-value">${a.purpose}</span></div>
          <div class="detail-field"><span class="detail-label">说明</span><span class="detail-value" style="font-weight:400">${a.desc}</span></div>
          ${a.certRequired ? `<div style="padding:10px;border-radius:10px;background:${a.certVerified ? 'rgba(48,209,88,0.08)' : 'rgba(255,69,58,0.08)'};border:1px solid ${a.certVerified ? 'rgba(48,209,88,0.25)' : 'rgba(255,69,58,0.25)'};font-size:0.82rem;color:${a.certVerified ? '#1A9E40' : '#CC2F23'};margin-bottom:8px">
            ${a.certVerified ? '✅ 已上传有效操作资质证明' : '❌ 未上传操作资质证明（高危设备必须）'}
          </div>` : ''}
          <div class="detail-field"><span class="detail-label">提交时间</span><span class="detail-value">${a.submitTime}</span></div>
        </div>
        <div class="detail-actions">
          <div class="form-group" id="rejectReasonGroup" style="display:none">
            <label class="form-label">拒绝原因</label>
            <textarea class="form-input" id="rejectReasonInput" rows="2" placeholder="请填写拒绝原因..."></textarea>
          </div>
          <button class="btn-primary" style="width:100%;background:linear-gradient(135deg,#30D158,#007AFF)" onclick="doAudit('${a.id}','approve')">✓ 通过申请</button>
          <button class="btn-outline" style="width:100%;color:var(--accent-red);border-color:var(--accent-red)" onclick="toggleReject()">✗ 拒绝申请</button>
          <button class="btn-danger btn-primary hidden" id="confirmRejectBtn" style="width:100%" onclick="doAudit('${a.id}','reject')">确认拒绝</button>
        </div>`;
    }
  };

  window.toggleReject = function() {
    const group = document.getElementById('rejectReasonGroup');
    const confirmBtn = document.getElementById('confirmRejectBtn');
    if (group) group.style.display = group.style.display === 'none' ? '' : 'none';
    if (confirmBtn) confirmBtn.classList.toggle('hidden');
  };

  window.doAudit = function(id, action) {
    if (action === 'reject') {
      const reason = document.getElementById('rejectReasonInput')?.value;
      if (!reason) { showToast('请填写拒绝原因', 'warning'); return; }
    }
    const a = D.pendingAudits.find(x => x.id === id);
    if (a) a.status = action === 'approve' ? 'approved' : 'rejected';
    showToast(action === 'approve' ? '已通过申请，申请人将收到通知' : '已拒绝申请，申请人将收到通知', action === 'approve' ? 'success' : 'info');
    renderAuditList('pending');
    document.getElementById('auditDetailContent')?.classList.add('hidden');
    document.querySelector('#auditDetailPanel .detail-placeholder') && (document.querySelector('#auditDetailPanel .detail-placeholder').style.display = '');
  };

  window.quickAudit = function(id, action) {
    const a = D.pendingAudits.find(x => x.id === id);
    if (a) a.status = action === 'approve' ? 'approved' : 'rejected';
    showToast(action === 'approve' ? '✅ 已通过申请' : '❌ 已拒绝申请', action === 'approve' ? 'success' : 'info');
    renderAdminOverview();
  };

  // === Monitor Page ===
  function renderMonitorPage() {
    const labMap = document.getElementById('labMap');
    if (labMap) {
      const statuses = ['busy', 'available', 'available', 'reserved', 'busy', 'available', 'available', 'offline', 'busy', 'available', 'available', 'reserved', 'available', 'busy', 'available', 'available', 'reserved', 'available'];
      labMap.innerHTML = statuses.map((s, i) => `<div class="lab-station ${s}" title="工位 ${String(i+1).padStart(2,'0')}">${String(i+1).padStart(2,'0')}</div>`).join('');
    }

    const usageList = document.getElementById('currentUsageList');
    if (usageList) {
      usageList.innerHTML = [
        { station: '01', device: '扫描电子显微镜', user: '张同学', time: '01:23' },
        { station: '04', device: '气相色谱质谱仪', user: '李芳', time: '00:45' },
        { station: '09', device: '精密天平', user: '陈大鹏', time: '02:10' },
        { station: '14', device: '傅里叶红外光谱仪', user: '刘梅', time: '00:18' }
      ].map(u => `
        <div class="usage-item">
          <span class="usage-station">${u.station}</span>
          <div class="usage-item-info"><p class="usage-item-name">${u.device}</p><p class="usage-item-user">${u.user}</p></div>
          <span class="usage-timer">⏱ ${u.time}</span>
        </div>`).join('');
    }

    const log = document.getElementById('activityLog');
    if (log) {
      [
        { text: '<strong>张同学</strong> 完成签退 · 扫描电子显微镜', time: '5分钟前' },
        { text: '<strong>李芳</strong> 签到成功 · 扫描电子显微镜', time: '1小时前' },
        { text: '<strong>陈大鹏</strong> 签到成功 · 精密天平', time: '2小时前' },
        { text: '高速离心机 (LAB-2024-004) 状态更新为<strong>维修中</strong>', time: '3小时前' }
      ].forEach(item => {
        log.innerHTML += `<div class="activity-item"><div class="activity-dot"></div><div class="activity-content"><p class="activity-text">${item.text}</p><p class="activity-time">${item.time}</p></div></div>`;
      });
    }
  }

  // === Maintenance Page ===
  function renderMaintenancePage() {
    const list = document.getElementById('maintList');
    if (!list) return;
    list.innerHTML = D.maintenanceTickets.map(m => `
      <div class="maint-item" onclick="showMaintDetail('${m.id}')">
        <div class="maint-item-header">
          <span class="maint-name">${m.deviceName}</span>
          ${statusTag(m.status)}
        </div>
        <div class="maint-sub">
          <span>${m.type === 'fault' ? '🔧 故障报修' : '📅 计划维保'}</span>
          <span>优先级: ${m.priority === 'high' ? '⚡ 高' : m.priority === 'medium' ? '⚠️ 中' : '📌 低'}</span>
        </div>
        <p style="font-size:0.8rem;color:var(--text-secondary);margin-top:6px">${m.desc}</p>
      </div>`).join('');

    document.getElementById('newMaintBtn')?.addEventListener('click', () => showToast('维保工单功能开发中', 'info'));
  }

  window.showMaintDetail = function(id) {
    const m = D.maintenanceTickets.find(x => x.id === id);
    if (!m) return;
    document.querySelectorAll('.maint-item').forEach(el => el.classList.remove('selected'));
    document.querySelector(`.maint-item[onclick*="${id}"]`)?.classList.add('selected');

    const placeholder = document.querySelector('#maintDetailPanel .detail-placeholder');
    const content = document.getElementById('maintDetailContent');
    if (placeholder) placeholder.style.display = 'none';
    if (content) {
      content.classList.remove('hidden');
      content.innerHTML = `
        <div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
            <h4 style="font-weight:700">${m.deviceName}</h4>
            ${statusTag(m.status)}
          </div>
          <div class="detail-field"><span class="detail-label">工单编号</span><span class="detail-value" style="font-family:monospace;font-size:0.8rem">${m.id}</span></div>
          <div class="detail-field"><span class="detail-label">类型</span><span class="detail-value">${m.type === 'fault' ? '🔧 故障报修' : '📅 计划维保'}</span></div>
          <div class="detail-field"><span class="detail-label">描述</span><span class="detail-value" style="font-weight:400">${m.desc}</span></div>
          <div class="detail-field"><span class="detail-label">上报人</span><span class="detail-value">${m.reporter}</span></div>
          <div class="detail-field"><span class="detail-label">上报时间</span><span class="detail-value">${m.reportTime}</span></div>
          ${m.technician ? `<div class="detail-field"><span class="detail-label">维修人员</span><span class="detail-value">${m.technician}</span></div>` : ''}
          <div class="detail-field"><span class="detail-label">预计完成</span><span class="detail-value">${m.estimateEnd}</span></div>
          ${m.finishNote ? `<div style="background:rgba(48,209,88,0.08);border:1px solid rgba(48,209,88,0.2);padding:10px;border-radius:10px;font-size:0.82rem;color:#1A9E40"><strong>维修结果：</strong>${m.finishNote}</div>` : ''}
        </div>
        <div class="detail-actions">
          ${m.status === 'inprogress' ? '<button class="btn-primary" style="width:100%;background:linear-gradient(135deg,#30D158,#00B550)" onclick="showToast(\'已标记为修复完成\',\'success\')">标记为已修复</button>' : ''}
          ${m.status === 'pending' ? '<button class="btn-primary" style="width:100%" onclick="showToast(\'已开始处理工单\',\'info\')">开始处理</button>' : ''}
        </div>`;
    }
  };

  // === Inventory Page ===
  function renderInventoryPage() {
    const body = document.getElementById('inventoryBody');
    if (!body) return;
    body.innerHTML = D.inventory.map(inv => `
      <tr>
        <td><strong>${inv.name}</strong></td>
        <td style="color:var(--text-secondary)">${inv.spec}</td>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <strong style="color:${inv.status === 'good' ? 'var(--text-primary)' : inv.status === 'low' ? '#CC7A00' : '#CC2F23'}">${inv.stock}</strong>
            <span class="inv-progress ${inv.status}"><div class="inv-progress-fill" style="width:${Math.min(100, inv.stock / inv.warning / 1.5 * 100)}%"></div></span>
          </div>
        </td>
        <td style="color:var(--text-secondary)">${inv.warning} ${inv.unit}</td>
        <td>${inv.status === 'good' ? '<span class="badge-pill green">充足</span>' : inv.status === 'low' ? '<span class="badge-pill orange">偏少</span>' : '<span class="badge-pill red">紧缺</span>'}</td>
        <td><button class="text-btn">补货记录</button></td>
      </tr>`).join('');
  }

  // === Reports Page ===
  function renderReportsPage() {
    const userStats = document.getElementById('userStatsBody');
    if (userStats) {
      userStats.innerHTML = [
        { name: '张同学', dept: '计算机学院', count: 24, hours: '48h', cancelRate: '4%', issues: 0 },
        { name: '李芳', dept: '物理学院', count: 18, hours: '36h', cancelRate: '0%', issues: 0 },
        { name: '陈大鹏', dept: '电子信息学院', count: 12, hours: '28h', cancelRate: '8%', issues: 1 },
        { name: '赵磊', dept: '机械学院', count: 8, hours: '20h', cancelRate: '12%', issues: 0 }
      ].map(u => `
        <tr>
          <td><strong>${u.name}</strong></td>
          <td style="color:var(--text-secondary)">${u.dept}</td>
          <td>${u.count}</td>
          <td>${u.hours}</td>
          <td style="color:${parseFloat(u.cancelRate) > 10 ? '#CC2F23' : 'var(--text-primary)'}">${u.cancelRate}</td>
          <td>${u.issues > 0 ? `<span class="badge-pill red">${u.issues}</span>` : '<span class="badge-pill green">0</span>'}</td>
        </tr>`).join('');
    }

    requestAnimationFrame(() => {
      const monthlyCanvas = document.getElementById('monthlyChart');
      if (monthlyCanvas) {
        drawBarChart(monthlyCanvas, ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
          [{ data: [65, 58, 72, 80, 75, 60, 45, 42, 78, 82, 70, 65], color: 'rgba(0,122,255,0.8)' }]);
      }
      const rankCanvas = document.getElementById('rankChart');
      if (rankCanvas) {
        drawBarChart(rankCanvas, ['SEM','GC-MS','PCR','AFM','FTIR','CNC','激光','天平','频谱','坐标'],
          [{ data: [128, 115, 108, 95, 89, 82, 76, 73, 65, 58], color: 'rgba(88,86,214,0.8)' }]);
      }
    });
  }

  // === Device Form Modal ===
  function setupDeviceFormModal() {
    document.getElementById('closeDeviceFormModal')?.addEventListener('click', () => closeModal('deviceFormModal'));
    document.getElementById('cancelDeviceFormBtn')?.addEventListener('click', () => closeModal('deviceFormModal'));
    document.getElementById('saveDeviceBtn')?.addEventListener('click', () => {
      showToast('设备信息已保存', 'success');
      closeModal('deviceFormModal');
    });
  }
});
