/**
 * LabOS - System Admin Dashboard Logic
 */
document.addEventListener('DOMContentLoaded', () => {
  const D = window.LabData;

  renderSysOverview();
  renderUsersPage();
  renderPermissionsPage();
  renderAuditLogPage();
  renderBackupPage();
  setupUserFormModal();
  setupToggles();

  // === System Overview ===
  function renderSysOverview() {
    // Alert list
    const alertList = document.getElementById('sysAlertList');
    if (alertList) {
      alertList.innerHTML = [
        { title: '异常登录尝试', desc: '来自 IP 198.51.0.23 的账号多次登录失败，已自动封禁', time: '昨晚 23:45' },
        { title: '存储空间预警', desc: '数据库存储使用率已达 85%，建议清理日志或扩容', time: '3小时前' },
        { title: '证书即将过期', desc: 'SSL证书将于30天后过期，请及时更新', time: '1天前' }
      ].map(a => `
        <div class="alert-item">
          <div class="alert-item-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div>
            <p class="alert-item-title">${a.title}</p>
            <p class="alert-item-desc">${a.desc}</p>
            <p class="alert-item-time">${a.time}</p>
          </div>
        </div>`).join('');
    }

    // Recent log
    const logList = document.getElementById('recentLogList');
    if (logList) {
      D.auditLogs.slice(0, 5).forEach(l => {
        logList.innerHTML += `
          <div class="log-item">
            <span class="log-type ${l.type}">${l.type}</span>
            <span class="log-user">${l.user}</span>
            <span class="log-action">${l.action}</span>
            <span class="log-time">${l.time.slice(11)}</span>
          </div>`;
      });
    }
  }

  // === Users Page ===
  function renderUsersPage() {
    renderUserTable(D.users);

    document.getElementById('userSearch')?.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      renderUserTable(D.users.filter(u => u.name.toLowerCase().includes(q) || u.username.includes(q) || u.dept?.toLowerCase().includes(q)));
    });
    document.getElementById('roleFilter')?.addEventListener('change', (e) => {
      const val = e.target.value;
      renderUserTable(val === 'all' ? D.users : D.users.filter(u => u.role === val));
    });
    document.getElementById('userStatusFilter')?.addEventListener('change', (e) => {
      const val = e.target.value;
      renderUserTable(val === 'all' ? D.users : D.users.filter(u => u.status === val));
    });
    document.getElementById('addUserBtn')?.addEventListener('click', () => openModal('userFormModal'));
  }

  function renderUserTable(users) {
    const body = document.getElementById('userBody');
    if (!body) return;
    const roleLabels = { user: '设备使用者', admin: '设备管理员', sysadmin: '系统管理员' };
    const roleBadge = { user: 'blue', admin: 'green', sysadmin: 'orange' };
    body.innerHTML = users.map(u => `
      <tr>
        <td><code style="font-size:0.8rem;background:var(--bg-tertiary);padding:2px 6px;border-radius:4px">${u.username}</code></td>
        <td><strong>${u.name}</strong></td>
        <td><span class="badge-pill ${roleBadge[u.role]}">${roleLabels[u.role]}</span></td>
        <td style="color:var(--text-secondary)">${u.dept || '—'}</td>
        <td>${statusTag(u.status)}</td>
        <td style="color:var(--text-secondary);font-size:0.82rem">${u.lastLogin}</td>
        <td>
          <div style="display:flex;gap:6px">
            <button class="text-btn" onclick="editUser('${u.id}')">编辑</button>
            ${u.status === 'active' ? `<button class="text-btn" style="color:var(--accent-red)" onclick="toggleUserStatus('${u.id}')">禁用</button>` : `<button class="text-btn" style="color:var(--accent-green)" onclick="toggleUserStatus('${u.id}')">启用</button>`}
          </div>
        </td>
      </tr>`).join('');
  }

  window.editUser = function(id) {
    const u = D.users.find(x => x.id === id);
    if (!u) return;
    document.getElementById('userFormTitle').textContent = '编辑用户';
    document.getElementById('newUsername').value = u.username;
    document.getElementById('newRealName').value = u.name;
    document.getElementById('newRole').value = u.role;
    document.getElementById('newDept').value = u.dept || '';
    openModal('userFormModal');
  };

  window.toggleUserStatus = function(id) {
    const u = D.users.find(x => x.id === id);
    if (!u) return;
    u.status = u.status === 'active' ? 'disabled' : 'active';
    showToast(`用户 ${u.name} 已${u.status === 'active' ? '启用' : '禁用'}`, u.status === 'active' ? 'success' : 'info');
    renderUserTable(D.users);
  };

  // === Permissions ===
  function renderPermissionsPage() {
    const permissions = {
      user: [
        { group: '设备', items: [{ name: '查看设备信息', granted: true }, { name: '修改设备信息', granted: false }, { name: '删除设备', granted: false }] },
        { group: '预约', items: [{ name: '提交预约申请', granted: true }, { name: '查看个人预约', granted: true }, { name: '查看全部预约', granted: false }, { name: '审核预约', granted: false }] },
        { group: '用户', items: [{ name: '查看个人信息', granted: true }, { name: '管理其他用户', granted: false }, { name: '系统配置', granted: false }] }
      ]
    };

    document.querySelectorAll('.role-item').forEach(item => {
      item.addEventListener('click', () => {
        document.querySelectorAll('.role-item').forEach(r => r.classList.remove('active'));
        item.classList.add('active');
        renderPermMatrix(item.dataset.role, permissions);
      });
    });

    // Render default
    renderPermMatrix('user', permissions);
  }

  function renderPermMatrix(role, permissions) {
    const matrix = document.getElementById('permMatrix');
    if (!matrix) return;
    const roleName = { user: '设备使用者', admin: '实验室设备管理员', sysadmin: '系统管理员' }[role] || role;
    const rolePerms = permissions[role] || permissions['user'];
    matrix.innerHTML = `<p class="perm-matrix-title">${roleName} 权限配置</p>` +
      rolePerms.map(group => `
        <div class="perm-group">
          <p class="perm-group-name">${group.group}管理</p>
          ${group.items.map(item => `
            <div class="perm-item">
              <span class="perm-item-name">${item.name}</span>
              <div class="perm-toggle">
                <div class="toggle-switch ${item.granted ? 'active' : ''}" onclick="this.classList.toggle('active');showToast('权限已更新','success')">
                  <div class="toggle-thumb"></div>
                </div>
              </div>
            </div>`).join('')}
        </div>`).join('');
  }

  // === Audit Log ===
  function renderAuditLogPage() {
    renderLogTable(D.auditLogs);

    document.getElementById('logType')?.addEventListener('change', (e) => {
      const val = e.target.value;
      renderLogTable(val === 'all' ? D.auditLogs : D.auditLogs.filter(l => l.type === val));
    });
    document.getElementById('exportLogBtn')?.addEventListener('click', () => showToast('日志导出请求已发送，文件将自动下载', 'info'));
  }

  function renderLogTable(logs) {
    const body = document.getElementById('auditLogBody');
    if (!body) return;
    body.innerHTML = logs.map(l => `
      <tr>
        <td style="font-size:0.8rem;font-variant-numeric:tabular-nums;white-space:nowrap">${l.time}</td>
        <td><strong>${l.user}</strong></td>
        <td style="font-family:monospace;font-size:0.78rem;color:var(--text-secondary)">${l.ip}</td>
        <td><span class="log-type ${l.type}">${l.type}</span></td>
        <td class="log-detail-cell" style="font-size:0.85rem">${l.action}</td>
        <td>${l.status === 'success' ? '<span class="badge-pill green">成功</span>' : '<span class="badge-pill red">失败</span>'}</td>
      </tr>`).join('');
  }

  // === Backup Page ===
  function renderBackupPage() {
    const body = document.getElementById('backupBody');
    if (!body) return;
    body.innerHTML = D.backups.map(b => `
      <tr>
        <td><code style="font-size:0.78rem;background:var(--bg-tertiary);padding:2px 6px;border-radius:4px">${b.name}</code></td>
        <td><span class="badge-pill ${b.type === '手动' ? 'blue' : 'green'}">${b.type}</span></td>
        <td>${b.size}</td>
        <td style="color:var(--text-secondary)">${b.time}</td>
        <td><span class="badge-pill green">完成</span></td>
        <td>
          <div style="display:flex;gap:6px">
            <button class="text-btn" onclick="showToast('正在下载备份文件...','info')">下载</button>
            <button class="text-btn" style="color:var(--accent-orange)" onclick="showToast('请确认后再恢复备份','warning')">恢复</button>
          </div>
        </td>
      </tr>`).join('');

    document.getElementById('createBackupBtn')?.addEventListener('click', () => showToast('正在创建手动备份，请稍候...', 'info'));
  }

  // === Setup Toggles ===
  function setupToggles() {
    document.querySelectorAll('.toggle-switch').forEach(sw => {
      sw.addEventListener('click', () => {
        sw.classList.toggle('active');
        showToast('设置已更新', 'success');
      });
    });
  }

  // === User Form Modal ===
  function setupUserFormModal() {
    document.getElementById('closeUserFormModal')?.addEventListener('click', () => closeModal('userFormModal'));
    document.getElementById('cancelUserFormBtn')?.addEventListener('click', () => closeModal('userFormModal'));
    document.getElementById('saveUserBtn')?.addEventListener('click', () => {
      const name = document.getElementById('newRealName').value;
      if (!name) { showToast('请填写姓名', 'warning'); return; }
      showToast(`用户 ${name} 已${document.getElementById('userFormTitle').textContent === '编辑用户' ? '更新' : '创建'}`, 'success');
      closeModal('userFormModal');
    });
  }
});
