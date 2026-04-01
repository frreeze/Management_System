/**
 * LabOS - AI Experiment Planner (v2)
 * User types experiment name → AI shows required lab + equipment
 */

(function () {
  'use strict';

  const D = window.LabData || {};

  // =====================================================
  // Experiment Knowledge Base
  // Each entry: name aliases → { lab, devices, consumables }
  // =====================================================
  const EXPERIMENTS = [
    {
      names: ['扫描电子显微镜', 'sem', '电镜', '表面形貌', '断口', '微观形貌', '纳米形貌', '形貌表征'],
      label: '扫描电子显微镜表征实验',
      emoji: '🔬',
      lab: { name: 'A栋302室 — 精密电镜实验室', capacity: 4 },
      devices: [
        { id: 'LAB-2024-001', role: '核心设备', slots: ['09:00–11:00', '14:00–16:00'] }
      ],
      consumables: [
        { name: '碳导电双面胶',   qty: '2片',   status: 'in-stock', color: '#5856D6' },
        { name: 'SEM导电胶（银胶）', qty: '5 mL', status: 'low',      color: '#FF9F0A' },
        { name: '镀金样品台',     qty: '2个',   status: 'in-stock', color: '#007AFF' }
      ],
      safety: '⚠️ 高危设备，需持有操作证。不导电样品须提前镀金（联系管理员）',
      duration: '2h',
      purpose: 'research'
    },
    {
      names: ['ftir', '红外光谱', '傅里叶', '官能团', '化学键', '分子结构'],
      label: '傅里叶变换红外光谱分析（FTIR）',
      emoji: '📡',
      lab: { name: 'A栋401室 — 光谱分析实验室', capacity: 6 },
      devices: [
        { id: 'LAB-2024-005', role: '核心设备', slots: ['14:00–17:00', '09:00–12:00'] }
      ],
      consumables: [
        { name: '异丙醇（ATR晶体清洁）', qty: '适量',  status: 'in-stock', color: '#30D158' },
        { name: '无尘擦拭纸',           qty: '1包',   status: 'in-stock', color: '#5856D6' },
        { name: 'KBr（压片模式）',       qty: '按需',  status: 'in-stock', color: '#007AFF' }
      ],
      safety: '清洁 ATR 晶体时切勿用力擦拭，轻柔操作',
      duration: '3h',
      purpose: 'course'
    },
    {
      names: ['gcms', 'gc-ms', 'gc/ms', '气相色谱', '挥发性有机', '有机物检测', '色谱'],
      label: '气相色谱–质谱联用分析（GC-MS）',
      emoji: '⚗️',
      lab: { name: 'B栋108室 — 化学分析实验室', capacity: 3 },
      devices: [
        { id: 'LAB-2024-002', role: '核心设备', slots: ['10:00–12:00', '14:00–16:00'] }
      ],
      consumables: [
        { name: 'HP-5MS 色谱柱',   qty: '确认可用', status: 'low',      color: '#FF453A' },
        { name: '高纯氦气钢瓶',    qty: '确认余量', status: 'in-stock', color: '#5856D6' },
        { name: '进样针 10 μL',   qty: '2 支',   status: 'in-stock', color: '#007AFF' },
        { name: '样品瓶 2 mL',    qty: '10 个',  status: 'in-stock', color: '#FF9F0A' }
      ],
      safety: '有机溶液样品请在通风橱内配制，检查进样口密封性',
      duration: '2h',
      purpose: 'research'
    },
    {
      names: ['pcr', '基因扩增', '核酸', 'dna', 'rna', '扩增'],
      label: 'PCR 基因扩增实验',
      emoji: '🧬',
      lab: { name: 'D栋生物实验室', capacity: 8 },
      devices: [
        { id: 'LAB-2024-006', role: '核心设备', slots: ['09:00–12:00', '14:00–17:00'] }
      ],
      consumables: [
        { name: 'PCR 管 0.2 mL', qty: '20 支',  status: 'in-stock', color: '#30D158' },
        { name: 'Taq DNA 聚合酶', qty: '10 U',   status: 'in-stock', color: '#007AFF' },
        { name: 'dNTP Mix 10 mM', qty: '10 μL', status: 'in-stock', color: '#5856D6' },
        { name: '琼脂糖（电泳验证）', qty: '0.5 g', status: 'in-stock', color: '#FF9F0A' }
      ],
      safety: '全程佩戴手套，模板 DNA 需在冰上操作',
      duration: '3h',
      purpose: 'research'
    },
    {
      names: ['三坐标', '坐标测量', '形位公差', '几何精度', '尺寸检测'],
      label: '三坐标精密几何检测实验',
      emoji: '📐',
      lab: { name: 'C栋精密测量室', capacity: 4 },
      devices: [
        { id: 'LAB-2024-007', role: '核心设备', slots: ['09:00–11:00', '14:00–16:00'] }
      ],
      consumables: [
        { name: '测量固定夹具', qty: '按需领取', status: 'in-stock', color: '#5856D6' },
        { name: '无绒擦拭布',  qty: '若干',   status: 'in-stock', color: '#007AFF' }
      ],
      safety: '设备开机后预热 30 分钟，安装样品前清洁基准面',
      duration: '2h',
      purpose: 'graduation'
    },
    {
      names: ['数控', 'cnc', '铣床', '车削', '车床', '机械加工', '切削'],
      label: 'CNC 数控加工实验',
      emoji: '⚙️',
      lab: { name: 'C栋机械制造工坊', capacity: 6 },
      devices: [
        { id: 'LAB-2024-003', role: '核心设备（铣床）',  slots: ['13:00–17:00'] },
        { id: 'LAB-2024-007', role: '后处理（坐标检测）', slots: ['17:00–18:00'] }
      ],
      consumables: [
        { name: '立铣刀 φ6mm', qty: '2 支', status: 'in-stock', color: '#5856D6' },
        { name: '切削液',      qty: '约 2 L', status: 'in-stock', color: '#007AFF' },
        { name: 'G 代码程序', qty: '自备',   status: 'in-stock', color: '#FF9F0A' }
      ],
      safety: '⚠️ 高危设备，必须佩戴防护眼镜和手套，持有操作证',
      duration: '4h',
      purpose: 'graduation'
    },
    {
      names: ['原子力', 'afm', '纳米粗糙度', '表面力', '薄膜厚度', '纳米表征'],
      label: '原子力显微镜（AFM）纳米表征',
      emoji: '⚛️',
      lab: { name: 'A栋302室 — 精密电镜实验室', capacity: 4 },
      devices: [
        { id: 'LAB-2024-009', role: '核心设备', slots: ['09:00–12:00'] }
      ],
      consumables: [
        { name: 'AFM 悬臂探针 RTESP-300', qty: '2 支（贵重）', status: 'in-stock', color: '#FF453A' },
        { name: '硅基底片',              qty: '5 片',       status: 'in-stock', color: '#5856D6' }
      ],
      safety: '探针极脆，镊子轻取；逼近速度设为慢速',
      duration: '3h',
      purpose: 'research'
    },
    {
      names: ['激光', '雕刻', '激光加工', '激光切割', '亚克力'],
      label: '激光雕刻与切割实验',
      emoji: '✨',
      lab: { name: 'C栋机械制造工坊', capacity: 4 },
      devices: [
        { id: 'LAB-2024-008', role: '核心设备', slots: ['09:00–13:00', '14:00–18:00'] }
      ],
      consumables: [
        { name: '亚克力板材',  qty: '按需自备',    status: 'in-stock', color: '#5856D6' },
        { name: '排烟管路检查', qty: '使用前确认', status: 'in-stock', color: '#007AFF' }
      ],
      safety: '⚠️ 高危设备，禁止直视激光束，需持有操作证',
      duration: '4h',
      purpose: 'competition'
    },
    {
      names: ['离心', '离心机', '高速离心', '离心分离'],
      label: '高速离心分离实验',
      emoji: '🌀',
      lab: { name: 'B栋205室 — 化学分析实验室', capacity: 4 },
      devices: [
        { id: 'LAB-2024-004', role: '核心设备（维修中）', slots: ['—'] }
      ],
      consumables: [
        { name: '离心管 50 mL', qty: '10 支', status: 'in-stock', color: '#007AFF' },
        { name: '配平管',       qty: '按需',  status: 'in-stock', color: '#5856D6' }
      ],
      safety: '⚠️ 转速 >10000 rpm 需提前审批；对称配平',
      duration: '2h',
      purpose: 'research'
    }
  ];

  function searchExperiments(query) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return EXPERIMENTS.filter(exp =>
      exp.names.some(n => n.includes(q) || q.includes(n)) ||
      exp.label.toLowerCase().includes(q)
    );
  }

  function getDeviceById(id) {
    return (D.devices || []).find(d => d.id === id) || { name: id, emoji: '🔬', location: '待确认', model: '' };
  }

  function nextWorkday(offset) {
    const d = new Date();
    d.setDate(d.getDate() + offset + 1);
    while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
    return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }).replace('/', '月') + '日';
  }

  // =====================================================
  // State
  // =====================================================
  let selectedExp = null;
  let selectedDeviceIds = new Set();
  let selectedSlots = {};

  // =====================================================
  // Modal HTML
  // =====================================================
  function injectModal() {
    document.body.insertAdjacentHTML('beforeend', `
      <div class="ai-planner-modal hidden" id="aiPlannerModal">
        <div class="ai-planner-box" style="max-width:840px">

          <!-- Header -->
          <div class="ai-planner-header">
            <div class="ai-planner-header-icon">🧪</div>
            <div class="ai-planner-header-info">
              <p class="ai-planner-header-title">AI 实验规划助手</p>
              <p class="ai-planner-header-sub">输入实验名称 → 自动给出实验室、器材和耗材 → 一键提交预约</p>
            </div>
            <button class="ai-planner-close" id="plannerClose">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <!-- Steps -->
          <div class="ai-planner-steps" id="plannerSteps">
            <div class="planner-step active" data-step="1">
              <div class="planner-step-dot">1</div>选择实验
            </div>
            <div class="planner-step-line" id="stepLine1"></div>
            <div class="planner-step" data-step="2">
              <div class="planner-step-dot">2</div>确认器材
            </div>
            <div class="planner-step-line" id="stepLine2"></div>
            <div class="planner-step" data-step="3">
              <div class="planner-step-dot">3</div>提交预约
            </div>
          </div>

          <!-- Body — fixed height so absolute children work -->
          <div class="ai-planner-body" id="plannerBody" style="min-height:380px;flex:1;position:relative;overflow:hidden">

            <!-- STEP 1: Search & Select Experiment -->
            <div class="planner-step-panel" id="plannerStep1" style="position:absolute;inset:0;overflow-y:auto;padding:24px;transition:all .35s">
              <div style="max-width:580px;margin:0 auto">
                <h3 style="font-size:1.1rem;font-weight:800;margin-bottom:6px">🔍 输入您要做的实验名称</h3>
                <p style="color:var(--text-secondary);font-size:0.875rem;margin-bottom:18px">支持中英文关键词，例如："SEM"、"红外光谱"、"PCR"、"数控加工"…</p>

                <!-- Search Input -->
                <div style="position:relative;margin-bottom:20px">
                  <div style="display:flex;align-items:center;gap:10px;padding:14px 16px;border:2px solid var(--border-color);border-radius:14px;background:var(--bg-secondary);transition:border-color .2s" id="searchWrapper">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input type="text" id="expSearchInput" placeholder="输入实验名称…" autocomplete="off"
                      style="flex:1;border:none;background:transparent;outline:none;font-size:1rem;color:var(--text-primary);font-family:var(--font-main)"/>
                    <button id="expSearchClear" style="display:none;background:none;border:none;color:var(--text-tertiary);cursor:pointer;font-size:1.1rem;line-height:1">✕</button>
                  </div>
                  <!-- Dropdown results -->
                  <div id="expDropdown" style="display:none;position:absolute;top:calc(100% + 6px);left:0;right:0;z-index:10;background:var(--bg-primary);border:1.5px solid var(--border-color);border-radius:14px;box-shadow:0 16px 40px rgba(0,0,0,0.12);overflow:hidden"></div>
                </div>

                <!-- Suggested chips -->
                <div>
                  <p style="font-size:0.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-tertiary);margin-bottom:10px">常用实验快捷选择</p>
                  <div style="display:flex;flex-wrap:wrap;gap:8px" id="expChips">
                    ${EXPERIMENTS.map(e => `
                      <button class="planner-example-chip" data-exp-label="${e.label}" onclick="window.__plannerSelectExp('${e.label}')">
                        ${e.emoji} ${e.label.length > 12 ? e.label.slice(0, 12) + '…' : e.label}
                      </button>`).join('')}
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 2: Equipment Plan -->
            <div class="planner-step-panel hidden-right" id="plannerStep2" style="position:absolute;inset:0;overflow-y:auto;padding:24px;transition:all .35s">
              <div id="plannerPlanContent" style="display:flex;flex-direction:column;gap:18px"></div>
            </div>

            <!-- STEP 3: Confirm -->
            <div class="planner-step-panel hidden-right" id="plannerStep3" style="position:absolute;inset:0;overflow-y:auto;padding:24px;transition:all .35s">
              <div id="plannerConfirmContent" style="max-width:560px;margin:0 auto;display:flex;flex-direction:column;gap:16px"></div>
            </div>

            <!-- STEP 4: Success -->
            <div class="planner-step-panel hidden-right" id="plannerStep4" style="position:absolute;inset:0;overflow-y:auto;padding:24px;transition:all .35s"></div>

          </div>

          <!-- Footer -->
          <div class="ai-planner-footer" id="plannerFooter">
            <button class="planner-btn-back" id="plannerBack" style="visibility:hidden">← 上一步</button>
            <span style="font-size:0.78rem;color:var(--text-tertiary)" id="plannerFooterHint">请选择实验类型</span>
            <button class="planner-btn-next" id="plannerNext" disabled>
              查看器材方案
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

        </div>
      </div>`);
  }

  // =====================================================
  // Step navigation
  // =====================================================
  let currentStep = 1;

  function goToStep(step) {
    [1, 2, 3, 4].forEach(n => {
      const el = document.getElementById('plannerStep' + n);
      if (!el) return;
      el.classList.remove('hidden-left', 'hidden-right');
      if (n < step) el.classList.add('hidden-left');
      else if (n > step) el.classList.add('hidden-right');
    });
    updateIndicator(step);
    updateFooter(step);
    currentStep = step;
  }

  function updateIndicator(step) {
    document.querySelectorAll('.planner-step').forEach(el => {
      const s = parseInt(el.dataset.step);
      el.classList.remove('active', 'done');
      const dot = el.querySelector('.planner-step-dot');
      if (s === step) { el.classList.add('active'); dot.textContent = s; }
      else if (s < step) { el.classList.add('done'); dot.textContent = '✓'; }
      else { dot.textContent = s; }
    });
    document.getElementById('stepLine1')?.classList.toggle('done', step > 1);
    document.getElementById('stepLine2')?.classList.toggle('done', step > 2);
    const steps = document.getElementById('plannerSteps');
    if (steps) steps.style.display = step === 4 ? 'none' : '';
  }

  function updateFooter(step) {
    const footer = document.getElementById('plannerFooter');
    const back = document.getElementById('plannerBack');
    const next = document.getElementById('plannerNext');
    const hint = document.getElementById('plannerFooterHint');
    if (!footer) return;

    if (step === 4) { footer.style.display = 'none'; return; }
    footer.style.display = '';

    if (step === 1) {
      back.style.visibility = 'hidden';
      next.innerHTML = '查看器材方案 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>';
      next.disabled = !selectedExp;
      hint.textContent = selectedExp ? `已选：${selectedExp.label}` : '请选择实验类型';
    } else if (step === 2) {
      back.style.visibility = 'visible';
      next.innerHTML = '进入确认 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>';
      next.disabled = selectedDeviceIds.size === 0;
      hint.textContent = `已选 ${selectedDeviceIds.size} 台设备`;
    } else if (step === 3) {
      back.style.visibility = 'visible';
      next.innerHTML = '🚀 提交预约申请';
      next.disabled = false;
      hint.textContent = '确认无误后提交';
    }
  }

  // =====================================================
  // Step 1: Search
  // =====================================================
  function setupSearch() {
    const input = document.getElementById('expSearchInput');
    const wrapper = document.getElementById('searchWrapper');
    const dropdown = document.getElementById('expDropdown');
    const clearBtn = document.getElementById('expSearchClear');

    input?.addEventListener('focus', () => {
      wrapper.style.borderColor = 'var(--accent-blue)';
      wrapper.style.background = 'white';
    });
    input?.addEventListener('blur', () => {
      setTimeout(() => { dropdown.style.display = 'none'; }, 180);
      wrapper.style.borderColor = '';
      wrapper.style.background = '';
    });
    input?.addEventListener('input', () => {
      const q = input.value.trim();
      clearBtn.style.display = q ? 'block' : 'none';
      if (!q) { dropdown.style.display = 'none'; return; }
      const results = searchExperiments(q);
      if (!results.length) {
        dropdown.style.display = 'block';
        dropdown.innerHTML = '<div style="padding:14px 16px;color:var(--text-tertiary);font-size:0.875rem">未找到匹配的实验，请尝试其他关键词</div>';
        return;
      }
      dropdown.style.display = 'block';
      dropdown.innerHTML = results.map(e => `
        <div class="exp-dropdown-item" onclick="window.__plannerSelectExp('${e.label}')"
          style="display:flex;align-items:center;gap:12px;padding:12px 16px;cursor:pointer;transition:background .12s;border-bottom:1px solid var(--border-color)"
          onmouseover="this.style.background='rgba(0,122,255,0.06)'" onmouseout="this.style.background=''">
          <span style="font-size:1.4rem">${e.emoji}</span>
          <div>
            <p style="font-size:0.9rem;font-weight:600">${e.label}</p>
            <p style="font-size:0.78rem;color:var(--text-secondary)">📍 ${e.lab.name}</p>
          </div>
        </div>`).join('');
    });
    clearBtn?.addEventListener('click', () => {
      input.value = '';
      clearBtn.style.display = 'none';
      dropdown.style.display = 'none';
      selectedExp = null;
      updateFooter(1);
    });
  }

  window.__plannerSelectExp = function (label) {
    const exp = EXPERIMENTS.find(e => e.label === label);
    if (!exp) return;
    selectedExp = exp;
    const input = document.getElementById('expSearchInput');
    if (input) { input.value = exp.label; }
    document.getElementById('expDropdown').style.display = 'none';
    document.getElementById('expSearchClear').style.display = 'block';
    // Highlight chip
    document.querySelectorAll('.planner-example-chip').forEach(c => {
      c.classList.toggle('active', c.dataset.expLabel === label);
      if (c.dataset.expLabel === label) {
        c.style.borderColor = 'var(--accent-blue)';
        c.style.color = 'var(--accent-blue)';
        c.style.background = 'rgba(0,122,255,0.08)';
      } else {
        c.style.borderColor = '';
        c.style.color = '';
        c.style.background = '';
      }
    });
    updateFooter(1);
  };

  // =====================================================
  // Step 2: Render plan
  // =====================================================
  function renderPlan() {
    const exp = selectedExp;
    if (!exp) return;
    selectedDeviceIds = new Set(exp.devices.map(d => d.id));
    selectedSlots = {};
    exp.devices.forEach(d => { selectedSlots[d.id] = d.slots[0]; });

    const container = document.getElementById('plannerPlanContent');
    if (!container) return;

    // ----- Lab card -----
    const labHtml = `
      <div style="padding:16px 20px;border-radius:16px;background:linear-gradient(135deg,rgba(0,122,255,0.07),rgba(88,86,214,0.04));border:1.5px solid rgba(0,122,255,0.2)">
        <div style="display:flex;align-items:center;gap:14px">
          <div style="font-size:2rem">🏛️</div>
          <div>
            <p style="font-size:0.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-tertiary);margin-bottom:4px">所需实验室</p>
            <p style="font-size:1.05rem;font-weight:800">${exp.lab.name}</p>
            <p style="font-size:0.82rem;color:var(--text-secondary);margin-top:3px">👥 容纳 ${exp.lab.capacity} 人 &nbsp;·&nbsp; 🕐 建议提前1天预约</p>
          </div>
        </div>
      </div>`;

    // ----- Device cards -----
    const devicesHtml = exp.devices.map((d, idx) => {
      const info = getDeviceById(d.id);
      const date = nextWorkday(idx);
      return `
        <div class="planner-device-card editable" id="devCard-${d.id}" onclick="window.__plannerToggleDevice('${d.id}', this)"
          style="display:flex;align-items:center;gap:14px;padding:14px 16px;border:1.5px solid var(--accent-blue);border-radius:14px;background:rgba(0,122,255,0.04);cursor:pointer;transition:all .15s">
          <div id="chk-${d.id}" style="width:22px;height:22px;border-radius:6px;background:var(--accent-blue);border:2px solid var(--accent-blue);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:white">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div style="font-size:1.8rem;flex-shrink:0">${info.emoji}</div>
          <div style="flex:1;min-width:0">
            <p style="font-weight:700;font-size:0.95rem">${info.name}</p>
            <p style="font-size:0.8rem;color:var(--text-secondary);margin-top:3px">📍 ${info.location} &nbsp;·&nbsp; ${d.role}${info.danger === 'high' ? ' &nbsp;·&nbsp; ⚠️ 高危' : ''}</p>
          </div>
          <div style="text-align:right;flex-shrink:0">
            <select style="border:1px solid var(--border-color);border-radius:8px;padding:5px 8px;font-size:0.8rem;background:white;cursor:pointer" id="slot-${d.id}" onclick="event.stopPropagation()">
              ${d.slots.map(s => `<option value="${s}">${date} ${s}</option>`).join('')}
            </select>
          </div>
        </div>`;
    }).join('');

    // ----- Consumables -----
    const consumHtml = exp.consumables.map(c => `
      <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:10px;background:var(--bg-secondary);border:1px solid var(--border-color)">
        <div style="width:8px;height:8px;border-radius:50%;background:${c.color};flex-shrink:0"></div>
        <span style="flex:1;font-size:0.875rem;font-weight:500">${c.name}</span>
        <span style="font-size:0.8rem;color:var(--text-secondary)">${c.qty}</span>
        <span style="font-size:0.75rem;font-weight:700;color:${c.status === 'in-stock' ? '#1A9E40' : '#CC7A00'}">${c.status === 'in-stock' ? '✅ 充足' : '⚠️ 偏少'}</span>
      </div>`).join('');

    // ----- Safety -----
    const safetyHtml = exp.safety ? `
      <div style="padding:12px 16px;border-radius:12px;background:rgba(255,159,10,0.07);border:1px solid rgba(255,159,10,0.25);display:flex;gap:10px">
        <div style="flex:1;font-size:0.875rem;color:var(--text-primary)">${exp.safety}</div>
      </div>` : '';

    container.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;padding:12px;border-radius:12px;background:linear-gradient(135deg,rgba(0,122,255,0.06),rgba(88,86,214,0.04));border:1px solid rgba(0,122,255,0.15)">
        <span style="font-size:1.4rem">${exp.emoji}</span>
        <div>
          <p style="font-weight:800;font-size:1rem">${exp.label}</p>
          <p style="font-size:0.8rem;color:var(--text-secondary)">AI 已自动匹配实验室、设备与耗材，可按需取消勾选</p>
        </div>
      </div>

      ${labHtml}

      <div>
        <p style="font-size:0.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-tertiary);margin-bottom:10px;display:flex;align-items:center;gap:6px">
          <span style="width:24px;height:24px;border-radius:7px;background:rgba(0,122,255,0.1);display:inline-flex;align-items:center;justify-content:center">🔬</span>
          实验器材预约（勾选后一键提交）
        </p>
        <div style="display:flex;flex-direction:column;gap:10px">${devicesHtml}</div>
      </div>

      <div>
        <p style="font-size:0.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-tertiary);margin-bottom:10px;display:flex;align-items:center;gap:6px">
          <span style="width:24px;height:24px;border-radius:7px;background:rgba(48,209,88,0.1);display:inline-flex;align-items:center;justify-content:center">🧪</span>
          所需耗材（管理员提前备齐）
        </p>
        <div style="display:flex;flex-direction:column;gap:6px">${consumHtml}</div>
      </div>

      ${safetyHtml}

      <div>
        <p style="font-size:0.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-tertiary);margin-bottom:8px">实验备注（可修改）</p>
        <div style="display:flex;align-items:flex-start;gap:10px;padding:12px 14px;border:1.5px solid var(--border-color);border-radius:12px;background:var(--bg-secondary)">
          <label style="font-size:0.78rem;color:var(--text-secondary);min-width:48px;flex-shrink:0;padding-top:2px">用途</label>
          <select id="planPurpose" style="flex:1;border:none;background:transparent;outline:none;font-size:0.875rem">
            <option value="research" ${exp.purpose === 'research' ? 'selected' : ''}>科研项目</option>
            <option value="course" ${exp.purpose === 'course' ? 'selected' : ''}>课程实验</option>
            <option value="graduation" ${exp.purpose === 'graduation' ? 'selected' : ''}>毕业设计</option>
            <option value="competition" ${exp.purpose === 'competition' ? 'selected' : ''}>学科竞赛</option>
          </select>
        </div>
      </div>`;

    updateFooter(2);
  }

  window.__plannerToggleDevice = function (id, cardEl) {
    const chk = document.getElementById('chk-' + id);
    if (selectedDeviceIds.has(id)) {
      selectedDeviceIds.delete(id);
      if (chk) { chk.style.background = ''; chk.style.borderColor = 'var(--border-color)'; chk.innerHTML = ''; }
      cardEl.style.borderColor = 'var(--border-color)';
      cardEl.style.background = 'var(--bg-secondary)';
    } else {
      selectedDeviceIds.add(id);
      if (chk) {
        chk.style.background = 'var(--accent-blue)';
        chk.style.borderColor = 'var(--accent-blue)';
        chk.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>';
      }
      cardEl.style.borderColor = 'var(--accent-blue)';
      cardEl.style.background = 'rgba(0,122,255,0.04)';
    }
    updateFooter(2);
  };

  // =====================================================
  // Step 3: Confirm
  // =====================================================
  function renderConfirm() {
    const exp = selectedExp;
    const purposeLabels = { course: '课程实验', research: '科研项目', graduation: '毕业设计', competition: '学科竞赛' };
    const purpose = document.getElementById('planPurpose')?.value || exp.purpose;

    const selectedDevices = exp.devices.filter(d => selectedDeviceIds.has(d.id));
    const deviceLines = selectedDevices.map(d => {
      const info = getDeviceById(d.id);
      const slot = document.getElementById('slot-' + d.id)?.value || d.slots[0];
      return `<div style="display:flex;align-items:center;gap:10px;font-size:0.875rem;padding:6px 0">
        <span>${info.emoji}</span>
        <span style="flex:1">${info.name}</span>
        <span style="font-weight:600;color:var(--accent-blue)">${slot}</span>
      </div>`;
    }).join('');

    const hasDangerous = selectedDevices.some(d => getDeviceById(d.id).danger === 'high');

    document.getElementById('plannerConfirmContent').innerHTML = `
      <div style="padding:18px 20px;border-radius:16px;background:linear-gradient(135deg,rgba(48,209,88,0.08),rgba(0,122,255,0.05));border:1.5px solid rgba(48,209,88,0.25)">
        <p style="font-size:1rem;font-weight:800;margin-bottom:14px">📋 预约申请摘要</p>
        <div style="display:flex;flex-direction:column;gap:4px">
          <div style="display:flex;align-items:center;gap:10px;font-size:0.875rem;padding:6px 0;border-bottom:1px solid rgba(0,0,0,0.06)">
            <span>🧪</span><span style="flex:1">实验名称</span>
            <span style="font-weight:600;color:var(--accent-blue)">${exp.label}</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;font-size:0.875rem;padding:6px 0;border-bottom:1px solid rgba(0,0,0,0.06)">
            <span>🏛️</span><span style="flex:1">实验室</span>
            <span style="font-weight:600">${exp.lab.name}</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;font-size:0.875rem;padding:6px 0;border-bottom:1px solid rgba(0,0,0,0.06)">
            <span>🎯</span><span style="flex:1">用途</span>
            <span style="font-weight:600">${purposeLabels[purpose] || purpose}</span>
          </div>
          ${deviceLines}
          <div style="display:flex;align-items:center;gap:10px;font-size:0.875rem;padding:6px 0">
            <span>🧪</span><span style="flex:1">所需耗材</span>
            <span style="font-weight:600">${exp.consumables.length} 种（管理员将提前备齐）</span>
          </div>
        </div>
      </div>

      ${hasDangerous ? `<div style="padding:12px 14px;border-radius:12px;background:rgba(255,159,10,0.08);border:1px solid rgba(255,159,10,0.25);display:flex;gap:10px">
        <span>⚠️</span>
        <p style="font-size:0.82rem">您的申请包含高危设备，审核时管理员将核实操作资质证明。</p>
      </div>` : ''}

      <div style="padding:12px 14px;border-radius:12px;background:rgba(0,122,255,0.05);border:1px solid rgba(0,122,255,0.15)">
        <p style="font-size:0.82rem;color:var(--text-secondary)">提交后系统将创建 <strong style="color:var(--text-primary)">${selectedDevices.length} 条</strong> 预约申请，等待管理员审核，结果将通过消息通知您。</p>
      </div>

      <button class="planner-submit-btn" onclick="window.__plannerSubmit()">
        🚀 提交 ${selectedDevices.length} 条预约申请
      </button>`;
  }

  // =====================================================
  // Submit
  // =====================================================
  window.__plannerSubmit = function () {
    const btn = document.querySelector('.planner-submit-btn');
    if (btn) { btn.textContent = '提交中……'; btn.disabled = true; }
    setTimeout(() => {
      const exp = selectedExp;
      const selectedDevices = exp.devices.filter(d => selectedDeviceIds.has(d.id));
      const ids = selectedDevices.map(() => 'RV-' + Date.now().toString().slice(-8) + '-' + String(Math.random()).slice(2, 5));

      document.getElementById('plannerSteps').style.display = 'none';
      document.getElementById('plannerFooter').style.display = 'none';
      goToStep(4);

      document.getElementById('plannerStep4').innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 24px;gap:16px;text-align:center;min-height:300px">
          <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#30D158,#00B550);display:flex;align-items:center;justify-content:center;font-size:2.4rem;box-shadow:0 12px 36px rgba(48,209,88,.35);animation:bounceIn .6s cubic-bezier(.34,1.56,.64,1)">✓</div>
          <h3 style="font-size:1.3rem;font-weight:800">预约申请已提交！</h3>
          <p style="color:var(--text-secondary);font-size:0.9rem;max-width:360px;line-height:1.5">已提交 ${selectedDevices.length} 条申请，审核通过后将通知您。</p>
          <div style="display:flex;flex-direction:column;gap:6px;margin-top:8px;width:100%;max-width:360px">
            ${ids.map((id, i) => `<div style="padding:8px 14px;border-radius:8px;background:var(--bg-secondary);font-family:monospace;font-size:0.82rem;border:1px solid var(--border-color)">${id} · ${getDeviceById(selectedDevices[i].id).name}</div>`).join('')}
          </div>
          <div style="display:flex;gap:10px;margin-top:8px;width:100%;max-width:360px">
            <button class="planner-btn-back" style="flex:1;text-align:center" onclick="closePlanner()">关闭</button>
            <button class="planner-btn-next" style="flex:1;justify-content:center" onclick="closePlanner();switchPage('book')">查看预约记录 →</button>
          </div>
        </div>`;
      if (window.showToast) showToast('已提交 ' + selectedDevices.length + ' 条预约，等待审核', 'success', 4000);
    }, 1500);
  };

  // =====================================================
  // Open / Close
  // =====================================================
  function openPlanner() {
    selectedExp = null;
    selectedDeviceIds = new Set();
    selectedSlots = {};
    document.getElementById('aiPlannerModal')?.classList.remove('hidden');
    document.getElementById('plannerSteps').style.display = '';
    document.getElementById('plannerFooter').style.display = '';
    document.getElementById('plannerStep4').innerHTML = '';
    const input = document.getElementById('expSearchInput');
    if (input) { input.value = ''; }
    document.getElementById('expSearchClear').style.display = 'none';
    document.getElementById('expDropdown').style.display = 'none';
    document.querySelectorAll('.planner-example-chip').forEach(c => {
      c.style.borderColor = ''; c.style.color = ''; c.style.background = '';
    });
    goToStep(1);
  }
  window.closePlanner = function () {
    document.getElementById('aiPlannerModal')?.classList.add('hidden');
  };

  // =====================================================
  // Event Binding (Next / Back)
  // =====================================================
  function bindEvents() {
    document.getElementById('plannerClose')?.addEventListener('click', closePlanner);
    document.getElementById('aiPlannerModal')?.addEventListener('click', e => {
      if (e.target.id === 'aiPlannerModal') closePlanner();
    });

    document.getElementById('plannerNext')?.addEventListener('click', () => {
      if (currentStep === 1 && selectedExp) {
        goToStep(2);
        setTimeout(renderPlan, 40);
      } else if (currentStep === 2) {
        if (!selectedDeviceIds.size) { showToast('请至少选择一台设备', 'warning'); return; }
        goToStep(3);
        setTimeout(renderConfirm, 40);
      } else if (currentStep === 3) {
        window.__plannerSubmit();
      }
    });

    document.getElementById('plannerBack')?.addEventListener('click', () => {
      if (currentStep > 1) goToStep(currentStep - 1);
    });

    // Open from entry buttons
    document.addEventListener('click', e => {
      if (e.target.closest('[data-open-planner]') || e.target.closest('.ai-planner-entry')) openPlanner();
    });
  }

  // =====================================================
  // Inject entry button in overview
  // =====================================================
  function injectEntry() {
    const banner = document.querySelector('.welcome-banner');
    if (!banner || banner.dataset.plannerAdded) return;
    banner.dataset.plannerAdded = '1';
    const el = document.createElement('div');
    el.className = 'ai-planner-entry';
    el.setAttribute('data-open-planner', '1');
    el.innerHTML = `
      <div class="ai-planner-entry-icon">🧪</div>
      <div class="ai-planner-entry-text">
        <p class="ai-planner-entry-title">AI 实验规划助手</p>
        <p class="ai-planner-entry-sub">输入实验名称 → 自动给出所需实验室 + 器材清单 → 一键预约</p>
      </div>
      <span class="ai-planner-entry-arrow">→</span>`;
    banner.parentNode.insertBefore(el, banner.nextSibling);
  }

  // =====================================================
  // Init
  // =====================================================
  document.addEventListener('DOMContentLoaded', () => {
    if (document.body.classList.contains('admin-theme') || document.body.classList.contains('sysadmin-theme')) return;
    injectModal();
    setupSearch();
    bindEvents();
    setTimeout(injectEntry, 700);
  });

})();
