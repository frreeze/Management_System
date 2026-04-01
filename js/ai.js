/**
 * LabOS AI Assistant Engine
 * Role-aware intelligent assistant with simulated AI responses
 * Covers: device recommendations, audit risk scoring, anomaly detection
 */

(function () {
  'use strict';

  // ==========================================
  // Detect current page role
  // ==========================================
  const PAGE_ROLE = document.body.classList.contains('admin-theme')
    ? 'admin'
    : document.body.classList.contains('sysadmin-theme')
      ? 'sysadmin'
      : 'user';

  const D = window.LabData || {};

  // ==========================================
  // Knowledge Base - Role-specific quick actions
  // ==========================================
  const QUICK_ACTIONS = {
    user: [
      { label: '🔍 推荐设备', prompt: '根据我的科研方向，推荐适合的设备' },
      { label: '📅 最佳预约时段', prompt: '哪个时段预约扫描电子显微镜最容易通过？' },
      { label: '📋 预约攻略', prompt: '高危设备的预约需要注意什么？' },
      { label: '🔔 我的提醒', prompt: '我有哪些待处理事项？' }
    ],
    admin: [
      { label: '⚠️ 风险预警', prompt: '当前有哪些高风险预约申请？' },
      { label: '🤖 快速审核建议', prompt: '帮我分析当前所有待审核申请的风险' },
      { label: '🔧 故障预测', prompt: '根据使用数据，哪些设备可能近期出现故障？' },
      { label: '📊 今日数据摘要', prompt: '给我今天的设备使用情况摘要' }
    ],
    sysadmin: [
      { label: '🚨 异常行为分析', prompt: '分析最近的异常操作日志' },
      { label: '🛡️ 安全风险评估', prompt: '当前系统有哪些安全风险？' },
      { label: '📈 性能优化建议', prompt: '基于当前系统指标，给出优化建议' },
      { label: '👥 用户行为洞察', prompt: '分析用户使用行为模式' }
    ]
  };

  // ==========================================
  // AI Response Database (simulated intent matching)
  // ==========================================
  const AI_RESPONSES = {
    user: [
      {
        patterns: ['推荐设备', '科研', '适合', '建议设备'],
        response: (input) => ({
          text: '根据您的使用历史（偏向材料分析和化学检测），我为您推荐以下设备：',
          cards: [
            { name: '扫描电子显微镜', reason: '表面形貌表征首选，您已有使用经验', tag: '⭐ 最推荐', color: '#007AFF' },
            { name: '傅里叶红外光谱仪', reason: '有机物分析利器，上手难度低', tag: '✅ 适合初学', color: '#30D158' },
            { name: '原子力显微镜', reason: '纳米级分辨率，适合薄膜研究', tag: '🔬 精密仪器', color: '#5856D6' }
          ],
          chips: ['查看SEM详情', '预约红外光谱仪', '了解AFM操作规程']
        })
      },
      {
        patterns: ['最佳', '时段', '预约时间', '什么时候', '容易通过'],
        response: () => ({
          text: '根据近30天预约数据分析，以下时段审核通过率最高：\n\n📅 **工作日上午 9:00–11:00**\n通过率 94%，等待时间约 2小时\n\n📅 **周三下午 14:00–16:00**  \n通过率 91%，设备使用率相对较低\n\n⚠️ 请避开周一早上（申请积压多）和周五下午（管理员工作量大）',
          chips: ['立即预约推荐时段', '查看设备空闲日历']
        })
      },
      {
        patterns: ['高危', '注意', '攻略', '操作证', '资质'],
        response: () => ({
          text: '高危设备预约需满足以下条件：\n\n🪪 **资质要求**\n必须上传有效的特种设备操作证，证件有效期需大于30天\n\n📝 **申请要点**\n• 详细描述使用目的，避免填写"课程实验"等模糊表述\n• 提前3天以上申请，避免审核被拒\n• 说明安全措施（佩戴防护装备等）\n\n⏰ **我的提醒**\n您的操作证将于 **04月15日** 到期，请尽快更新！',
          chips: ['上传最新操作证', '提前预约扫描电镜']
        })
      },
      {
        patterns: ['待处理', '提醒', '事项', '消息', '通知'],
        response: () => ({
          text: '您当前有以下待处理事项：\n\n🔔 **操作证到期提醒** - 15天后到期\n📋 **待审核预约** - 傅里叶红外（3月28日）待管理员审核\n✅ **明日预约确认** - 扫描电子显微镜 09:00–11:00 已通过',
          chips: ['处理操作证', '查看预约详情']
        })
      },
      {
        patterns: ['使用方法', '怎么用', '操作', '手册', '教程'],
        response: () => ({
          text: '我可以为您提供设备使用指导。请告诉我您想了解哪台设备？\n\n以下是您常用设备的快速要点：\n\n🔬 **SEM** - 样品需干燥、导电，不导电样品需镀金\n⚗️ **GC-MS** - 使用前检查进样口密封性，载气流速调至1mL/min\n📡 **FTIR** - ATR模式操作便捷，需用异丙醇清洁ATR晶体',
          chips: ['查看SEM操作手册', '预约实验指导']
        })
      }
    ],

    admin: [
      {
        patterns: ['风险', '高风险', '预约申请', '危险'],
        response: () => {
          const pending = (D.pendingAudits || []).filter(a => a.level === 'high');
          return {
            text: `当前共有 **${(D.pendingAudits || []).length}** 条待审核申请，AI风险评估如下：`,
            riskList: (D.pendingAudits || []).map(a => ({
              name: `${a.userName} → ${a.deviceName}`,
              risk: a.certRequired && !a.certVerified ? 'high' : a.level === 'high' ? 'medium' : 'low',
              riskScore: a.certRequired && !a.certVerified ? 85 : a.level === 'high' ? 52 : 18,
              reason: a.certRequired && !a.certVerified ? '⚠️ 高危设备且未上传操作证' : a.level === 'high' ? '⚡ 高危设备，建议核实资质' : '✅ 信息完整，可直接通过'
            })),
            chips: ['前往审核页', '一键通过低风险申请']
          };
        }
      },
      {
        patterns: ['摘要', '汇总', '今日', '今天', '数据'],
        response: () => ({
          text: '**今日 (03/27) 运营摘要**\n\n📊 今日预约总数：47 条\n✅ 已通过：38 条（通过率 80.9%）\n⏳ 待处理：5 条\n❌ 已拒绝：4 条\n\n⚙️ 设备使用率：73%（较昨日 +5%）\n🔧 故障报修：0 条新增\n👥 活跃用户：62 人\n\n💡 **AI建议**：今日使用高峰期为 10:00–12:00，建议提前安排设备巡检',
          chips: ['查看详细报表', '导出今日数据']
        })
      },
      {
        patterns: ['故障', '预测', '维修', '隐患', '异常'],
        response: () => ({
          text: '基于设备使用频率、历史故障率和传感器数据分析，以下设备存在近期故障风险：',
          deviceRisks: [
            { name: '数控铣床 (LAB-2024-003)', risk: 'high', score: 78, reason: '累计使用时长超出维保周期40%，主轴温度异常' },
            { name: '高速离心机 (LAB-2024-004)', risk: 'medium', score: 55, reason: '当前维修中，历史同款故障复发率38%' },
            { name: '气相色谱仪 (LAB-2024-002)', risk: 'low', score: 22, reason: '色谱柱使用寿命接近推荐更换周期' }
          ],
          chips: ['创建预防性维保工单', '查看维修历史']
        })
      },
      {
        patterns: ['审核建议', '分析申请', '应该', '通过还是'],
        response: () => ({
          text: '根据申请人历史记录、资质状态、设备可用性综合分析，AI 建议如下：\n\n✅ **建议通过** (3条)：王小明、陈大鹏、刘梅的申请 — 资质完整，历史良好\n\n⚠️ **需人工复核** (1条)：李芳的 SEM 申请 — 高危设备，操作证已上传但需核实有效性\n\n❌ **建议拒绝** (1条)：赵磊的激光雕刻机申请 — 高危设备且未上传操作证\n\n⏱ 预计处理以上申请仅需 **8分钟**',
          chips: ['一键执行AI建议', '前往审核页逐一核查']
        })
      }
    ],

    sysadmin: [
      {
        patterns: ['异常', '日志', '操作', '分析', '恶意'],
        response: () => ({
          text: '**异常行为分析报告**\n\n🚨 检测到 **3** 条高风险行为：\n\n1. **暴力破解尝试**\n   IP 198.51.0.23 于昨晚 23:45 在1分钟内尝试登录 5次，已自动封禁\n\n2. **异常时段访问**\n   用户 admin001 在 02:15 (非工作时间) 修改了设备状态记录\n\n3. **批量数据查询**\n   未知访问在今晨 01:30 短时间内查询了全量设备信息\n\n💡 **建议**：启用二步验证并加强非工作时段访问限制',
          chips: ['封禁可疑IP', '查看完整日志', '开启双因素认证']
        })
      },
      {
        patterns: ['安全', '风险', '漏洞', '防护'],
        response: () => ({
          text: '**系统安全评分：82/100 ✅ 良好**\n\n当前安全状况：\n\n🟢 **已防护** (8项)\n• HTTPS加密通信\n• SQL注入防护\n• XSS过滤\n• 访问频率限制\n\n🟡 **建议改进** (3项)\n• SSL证书即将过期（30天后）\n• 5个用户账号超过90天未修改密码\n• 数据库备份加密强度可提升至AES-256',
          chips: ['立即续签证书', '强制密码更新', '查看安全报告']
        })
      },
      {
        patterns: ['性能', '优化', '慢', '资源', '建议', '指标'],
        response: () => ({
          text: '**性能分析报告**\n\nCPU 当前 80%（峰值时段）\n建议：将邮件发送任务移至夜间低峰期执行\n\n内存 60% 使用中\n建议：设置会话缓存上限，防止内存泄漏\n\n数据库查询\n检测到 3 个慢查询（>500ms）\n建议：为 device_reservations 表添加复合索引\n\n预计优化后响应时间提升 **35%**',
          chips: ['查看慢查询详情', '下载优化方案']
        })
      },
      {
        patterns: ['用户', '行为', '模式', '洞察'],
        response: () => ({
          text: '**用户行为分析**\n\n📊 高活跃用户集中在 **材料学院和机械学院**\n🕐 预约高峰：工作日 9–11点 和 14–16点\n📉 设备浪费：约 **12%** 的预约在通过后被取消或未签到\n\n💡 **AI建议**：\n• 对取消率 >15% 的用户自动发送提醒\n• 设置无故不签到扣除预约权益机制\n• 向历史评分高的用户开放快速审核通道',
          chips: ['查看用户行为报告', '配置自动提醒规则']
        })
      }
    ]
  };

  // ==========================================
  // AI Match Engine
  // ==========================================
  function findResponse(userInput) {
    const lowerInput = userInput.toLowerCase();
    const responses = AI_RESPONSES[PAGE_ROLE] || AI_RESPONSES.user;

    for (const item of responses) {
      if (item.patterns.some(p => lowerInput.includes(p))) {
        return typeof item.response === 'function' ? item.response(userInput) : item.response;
      }
    }

    // Fallback
    return {
      text: `关于"${userInput}"，我正在分析相关数据...\n\n基于当前系统信息，建议您通过侧边栏导航查找相关功能，或使用上方快捷操作按钮获取智能摘要。\n\n您也可以尝试提问：\n• 推荐适合我的设备\n• 当前有哪些风险提醒\n• 今日数据摘要`,
      chips: ['查看我的提醒', '回到首页']
    };
  }

  // ==========================================
  // UI Rendering
  // ==========================================
  function createPanel() {
    const quickActions = QUICK_ACTIONS[PAGE_ROLE] || QUICK_ACTIONS.user;
    const roleNames = { user: '使用者助手', admin: '管理智能体', sysadmin: '运维AI' };
    const roleDesc = { user: '设备推荐 · 预约助手', admin: '审核分析 · 故障预警', sysadmin: '安全监控 · 运维建议' };

    document.body.insertAdjacentHTML('beforeend', `
      <!-- AI FAB -->
      <button class="ai-fab" id="aiFab" title="AI 智能助手">
        <div class="ai-fab-pulse"></div>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12c0-2.76 1.12-5.26 2.93-7.07"/>
          <path d="M12 6v6l4 2"/>
          <circle cx="12" cy="12" r="1" fill="currentColor"/>
        </svg>
        <div class="ai-fab-badge">AI</div>
      </button>

      <!-- AI Panel -->
      <div class="ai-panel hidden" id="aiPanel">
        <div class="ai-header">
          <div class="ai-avatar">
            🤖
            <div class="ai-avatar-dot"></div>
          </div>
          <div class="ai-header-info">
            <p class="ai-header-name">LabOS AI · ${roleNames[PAGE_ROLE]}</p>
            <p class="ai-header-status">${roleDesc[PAGE_ROLE]}</p>
          </div>
          <div class="ai-header-actions">
            <button class="ai-header-btn" id="aiClearBtn" title="清空对话">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
            </button>
            <button class="ai-header-btn" id="aiCloseBtn" title="关闭">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        <div class="ai-quickbar" id="aiQuickbar">
          ${quickActions.map(a => `<button class="ai-quick-btn" data-prompt="${a.prompt}">${a.label}</button>`).join('')}
        </div>

        <div class="ai-messages" id="aiMessages"></div>

        <div class="ai-input-area">
          <div class="ai-input-wrapper">
            <textarea class="ai-input" id="aiInput" placeholder="向AI提问..." rows="1"></textarea>
          </div>
          <button class="ai-send-btn" id="aiSend">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    `);
  }

  function addMessage(role, content, isHtml = false) {
    const msgs = document.getElementById('aiMessages');
    if (!msgs) return;

    const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    const isUser = role === 'user';

    const el = document.createElement('div');
    el.className = `ai-msg ${isUser ? 'user' : 'ai'}`;
    el.innerHTML = `
      <div class="ai-msg-avatar">${isUser ? '你' : '🤖'}</div>
      <div>
        <div class="ai-msg-bubble">${isHtml ? content : escapeHtml(content).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')}</div>
        <p class="ai-msg-time">${time}</p>
      </div>`;
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
    return el;
  }

  function addTypingIndicator() {
    const msgs = document.getElementById('aiMessages');
    const el = document.createElement('div');
    el.className = 'ai-msg ai ai-typing';
    el.id = 'aiTyping';
    el.innerHTML = `
      <div class="ai-msg-avatar">🤖</div>
      <div class="ai-msg-bubble">
        <div class="ai-typing-dot"></div>
        <div class="ai-typing-dot"></div>
        <div class="ai-typing-dot"></div>
      </div>`;
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function removeTyping() {
    document.getElementById('aiTyping')?.remove();
  }

  function renderRichResponse(data) {
    let html = '';

    if (data.text) {
      html += escapeHtml(data.text)
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
    }

    // Device recommendation cards
    if (data.cards) {
      html += '<div style="display:flex;flex-direction:column;gap:8px;margin-top:10px">';
      data.cards.forEach(c => {
        html += `<div class="ai-card" style="border-left:3px solid ${c.color}">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <strong style="font-size:0.85rem">${escapeHtml(c.name)}</strong>
            <span style="font-size:0.72rem;padding:2px 8px;border-radius:999px;background:rgba(0,122,255,0.1);color:var(--accent-blue)">${escapeHtml(c.tag)}</span>
          </div>
          <p style="font-size:0.78rem;color:var(--text-secondary);margin-top:4px">${escapeHtml(c.reason)}</p>
        </div>`;
      });
      html += '</div>';
    }

    // Risk list (admin)
    if (data.riskList) {
      html += '<div style="display:flex;flex-direction:column;gap:8px;margin-top:10px">';
      data.riskList.forEach(r => {
        const riskLabel = { low: '低风险', medium: '中风险', high: '高风险' }[r.risk];
        html += `<div class="ai-card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:0.82rem;font-weight:600">${escapeHtml(r.name)}</span>
            <span class="risk-badge ${r.risk}">${riskLabel}</span>
          </div>
          <div class="ai-risk-bar"><div class="ai-risk-fill ${r.risk}" style="width:${r.riskScore}%"></div></div>
          <p style="font-size:0.75rem;color:var(--text-secondary);margin-top:4px">${escapeHtml(r.reason)}</p>
        </div>`;
      });
      html += '</div>';
    }

    // Device risk prediction (admin)
    if (data.deviceRisks) {
      html += '<div style="display:flex;flex-direction:column;gap:8px;margin-top:10px">';
      data.deviceRisks.forEach(r => {
        const riskLabel = { low: '低', medium: '中', high: '高' }[r.risk];
        html += `<div class="ai-card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
            <strong style="font-size:0.82rem">${escapeHtml(r.name)}</strong>
            <span class="risk-badge ${r.risk}">故障风险：${riskLabel}</span>
          </div>
          <div class="ai-risk-bar"><div class="ai-risk-fill ${r.risk}" style="width:${r.score}%"></div></div>
          <p style="font-size:0.75rem;color:var(--text-secondary);margin-top:4px">${escapeHtml(r.reason)}</p>
        </div>`;
      });
      html += '</div>';
    }

    // Suggestion chips
    if (data.chips && data.chips.length) {
      html += '<div class="ai-chips">';
      data.chips.forEach(chip => {
        html += `<button class="ai-chip" onclick="window.__aiSendMsg('${escapeHtml(chip)}')">${escapeHtml(chip)}</button>`;
      });
      html += '</div>';
    }

    addMessage('ai', html, true);
  }

  function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ==========================================
  // Core Send Logic
  // ==========================================
  function sendMessage(text) {
    if (!text.trim()) return;

    const input = document.getElementById('aiInput');
    if (input) input.value = '';

    addMessage('user', text);
    addTypingIndicator();

    // Simulate AI thinking delay (600–1400ms)
    const delay = 600 + Math.random() * 800;
    setTimeout(() => {
      removeTyping();
      const responseData = findResponse(text);
      renderRichResponse(responseData);
    }, delay);
  }

  // Public API for chip clicks
  window.__aiSendMsg = sendMessage;

  // ==========================================
  // Welcome Message based on role
  // ==========================================
  function sendWelcome() {
    const welcomes = {
      user: {
        text: '你好！我是 **LabOS AI 使用助手** 🤖\n\n我可以帮您：\n• 根据您的需求推荐设备\n• 分析最佳预约时段\n• 提醒资质到期和重要事项\n• 解答使用规范问题\n\n请问您需要什么帮助？',
        chips: ['推荐适合的设备', '帮我查看代办事项']
      },
      admin: {
        text: '欢迎回来，李管理员！我是 **LabOS 管理智能体** 🤖\n\n今日快讯：\n• **5条**待审核申请，其中**1条**高风险需优先处理\n• 数控铣床故障风险评估 **78/100** ⚠️\n\n需要我帮您做什么？',
        chips: ['分析待审核申请风险', '查看今日运营摘要']
      },
      sysadmin: {
        text: '系统监控正常，王管理员！我是 **LabOS 运维AI** 🤖\n\n安全提醒：\n• 检测到 **1次**暴力登录尝试（已拦截）\n• SSL证书 **30天**后到期\n• 系统安全评分：**82/100**\n\n请告诉我您需要分析什么？',
        chips: ['分析异常行为日志', '查看安全风险评估']
      }
    };
    const w = welcomes[PAGE_ROLE];
    renderRichResponse(w);
  }

  // ==========================================
  // Event Binding
  // ==========================================
  function bindEvents() {
    const fab = document.getElementById('aiFab');
    const panel = document.getElementById('aiPanel');
    const closeBtn = document.getElementById('aiCloseBtn');
    const clearBtn = document.getElementById('aiClearBtn');
    const sendBtn = document.getElementById('aiSend');
    const inputEl = document.getElementById('aiInput');
    const quickbar = document.getElementById('aiQuickbar');

    let isOpen = false;

    fab?.addEventListener('click', () => {
      isOpen = !isOpen;
      panel.classList.toggle('hidden', !isOpen);
      fab.classList.toggle('open', isOpen);
      if (isOpen && document.getElementById('aiMessages').children.length === 0) {
        sendWelcome();
      }
    });

    closeBtn?.addEventListener('click', () => {
      isOpen = false;
      panel.classList.add('hidden');
      fab.classList.remove('open');
    });

    clearBtn?.addEventListener('click', () => {
      const msgs = document.getElementById('aiMessages');
      if (msgs) msgs.innerHTML = '';
      sendWelcome();
    });

    sendBtn?.addEventListener('click', () => {
      sendMessage(inputEl.value.trim());
    });

    inputEl?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(inputEl.value.trim());
      }
      // Auto resize
      setTimeout(() => {
        inputEl.style.height = 'auto';
        inputEl.style.height = Math.min(inputEl.scrollHeight, 80) + 'px';
      }, 0);
    });

    quickbar?.addEventListener('click', (e) => {
      const btn = e.target.closest('.ai-quick-btn');
      if (btn) sendMessage(btn.dataset.prompt);
    });
  }

  // ==========================================
  // Admin: Inject AI Risk Scores into audit list
  // ==========================================
  function enhanceAdminAuditList() {
    if (PAGE_ROLE !== 'admin') return;

    // Add risk badges to audit items after they render
    const observer = new MutationObserver(() => {
      document.querySelectorAll('.audit-item').forEach(item => {
        if (item.dataset.aiRated) return;
        item.dataset.aiRated = '1';
        const isHigh = item.textContent.includes('高危');
        const hasCert = !item.textContent.includes('未上传');
        const riskLevel = isHigh && !hasCert ? 'high' : isHigh ? 'medium' : 'low';
        const riskText = { high: 'AI: 高风险', medium: 'AI: 中风险', low: 'AI: 低风险' }[riskLevel];
        const badge = document.createElement('span');
        badge.className = `risk-badge ${riskLevel}`;
        badge.textContent = riskText;
        badge.style.marginLeft = '6px';
        const header = item.querySelector('.audit-item-header');
        if (header) header.appendChild(badge);
      });
    });
    const auditList = document.getElementById('auditList');
    if (auditList) observer.observe(auditList, { childList: true, subtree: true });
  }

  // ==========================================
  // User: Add AI recommendation banner to overview
  // ==========================================
  function enhanceUserOverview() {
    if (PAGE_ROLE !== 'user') return;

    const banner = document.querySelector('.welcome-banner');
    if (!banner || banner.dataset.aiAdded) return;
    banner.dataset.aiAdded = '1';

    const aiTip = document.createElement('div');
    aiTip.className = 'ai-insight-banner';
    aiTip.style.marginTop = '12px';
    aiTip.innerHTML = `
      <div class="ai-insight-icon">🤖</div>
      <div class="ai-insight-text">
        <p class="ai-insight-title">AI 今日推荐：傅里叶红外光谱仪空闲率最高</p>
        <p class="ai-insight-sub">周三下午 14:00–17:00 预约通过率达 91%，点击查看 →</p>
      </div>
      <svg class="ai-insight-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
    `;
    aiTip.addEventListener('click', () => {
      const fab = document.getElementById('aiFab');
      if (fab && !document.getElementById('aiPanel').classList.contains('hidden') === false) fab.click();
      setTimeout(() => sendMessage('推荐今日最佳预约时段'), 300);
    });
    banner.parentNode.insertBefore(aiTip, banner.nextSibling);
  }

  // ==========================================
  // SysAdmin: Add anomaly alert banner
  // ==========================================
  function enhanceSysAdminOverview() {
    if (PAGE_ROLE !== 'sysadmin') return;

    const alertList = document.getElementById('sysAlertList');
    if (!alertList || alertList.dataset.aiAdded) return;
    alertList.dataset.aiAdded = '1';

    const aiBadge = document.createElement('div');
    aiBadge.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 10px;background:linear-gradient(135deg,rgba(0,122,255,0.08),rgba(88,86,214,0.05));border-radius:10px;margin-bottom:10px;cursor:pointer;border:1px solid rgba(0,122,255,0.15)';
    aiBadge.innerHTML = `<span style="font-size:1rem">🤖</span><div><p style="font-size:0.82rem;font-weight:700">AI已自动分析3条异常行为模式</p><p style="font-size:0.75rem;color:var(--text-secondary)">点击获取详细分析报告</p></div>`;
    aiBadge.addEventListener('click', () => {
      document.getElementById('aiFab')?.click();
      setTimeout(() => sendMessage('分析最近的异常操作日志'), 300);
    });
    alertList.prepend(aiBadge);
  }

  // ==========================================
  // Init
  // ==========================================
  document.addEventListener('DOMContentLoaded', () => {
    createPanel();
    bindEvents();

    // Delayed enhancement (after page data renders)
    setTimeout(enhanceUserOverview, 600);
    setTimeout(enhanceAdminAuditList, 500);
    setTimeout(enhanceSysAdminOverview, 600);
  });

})();
