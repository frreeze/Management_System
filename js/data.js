/**
 * LabOS - Shared Mock Data Layer
 * Provides demo data for all dashboards
 */

window.LabData = {
  currentUser: { name: '张同学', role: 'user', avatar: '张', dept: '计算机学院' },

  // Devices
  devices: [
    { id: 'LAB-2024-001', name: '扫描电子显微镜', model: 'Zeiss Sigma 500', category: 'precision', location: 'A楼302室', status: 'available', danger: 'high', value: 328000, maxHours: 4, maxWeek: 2, emoji: '🔬', acquireDate: '2022-06-15', note: '需持有高危设备操作证方可使用', lastMaint: '2026-01-10' },
    { id: 'LAB-2024-002', name: '气相色谱质谱联用仪', model: 'Agilent 7890B', category: 'chemical', location: 'B楼108室', status: 'available', danger: 'normal', value: 186000, maxHours: 3, maxWeek: 3, emoji: '⚗️', acquireDate: '2021-09-20', note: '使用前检查气路是否正常', lastMaint: '2026-02-05' },
    { id: 'LAB-2024-003', name: '数控铣床', model: 'FANUC Mate-0i', category: 'mechanical', location: 'C楼工坊', status: 'busy', danger: 'high', value: 215000, maxHours: 6, maxWeek: 2, emoji: '⚙️', acquireDate: '2020-03-10', note: '必须戴安全防护眼镜和手套', lastMaint: '2026-01-25' },
    { id: 'LAB-2024-004', name: '高速离心机', model: 'Beckman Coulter Optima', category: 'chemical', location: 'B楼205室', status: 'maintenance', danger: 'high', value: 145000, maxHours: 4, maxWeek: 4, emoji: '🌀', acquireDate: '2023-01-05', note: '转速超过10000rpm需提前申请', lastMaint: '2025-12-01' },
    { id: 'LAB-2024-005', name: '傅里叶红外光谱仪', model: 'Thermo Nicolet iS50', category: 'precision', location: 'A楼401室', status: 'available', danger: 'normal', value: 98000, maxHours: 3, maxWeek: 5, emoji: '📡', acquireDate: '2022-11-12', note: '样品制备请参考操作手册第3章', lastMaint: '2026-02-18' },
    { id: 'LAB-2024-006', name: '全自动PCR仪', model: 'Bio-Rad CFX Connect', category: 'chemical', location: 'D楼生物室', status: 'available', danger: 'normal', value: 72000, maxHours: 3, maxWeek: 6, emoji: '🧬', acquireDate: '2023-06-01', note: '实验后需彻底清洁', lastMaint: '2026-03-01' },
    { id: 'LAB-2024-007', name: '三坐标测量机', model: 'Zeiss Contura', category: 'precision', location: 'C楼精密室', status: 'available', danger: 'normal', value: 280000, maxHours: 4, maxWeek: 2, emoji: '📐', acquireDate: '2021-04-15', note: '测量前需预热30分钟', lastMaint: '2026-01-30' },
    { id: 'LAB-2024-008', name: '激光雕刻机', model: 'Epilog Fusion Pro', category: 'mechanical', location: 'C楼工坊', status: 'available', danger: 'high', value: 55000, maxHours: 4, maxWeek: 3, emoji: '✨', acquireDate: '2023-09-20', note: '操作期间禁止直视激光', lastMaint: '2026-02-10' },
    { id: 'LAB-2024-009', name: '原子力显微镜', model: 'Bruker MultiMode 8', category: 'precision', location: 'A楼302室', status: 'available', danger: 'normal', value: 480000, maxHours: 3, maxWeek: 2, emoji: '⚛️', acquireDate: '2022-02-28', note: '探针耗材贵重，请小心操作', lastMaint: '2026-03-05' },
    { id: 'LAB-2024-010', name: '高压灭菌锅', model: 'TOMY SX-600', category: 'chemical', location: 'D楼生物室', status: 'available', danger: 'high', value: 28000, maxHours: 2, maxWeek: 10, emoji: '♨️', acquireDate: '2020-08-01', note: '操作前检查密封圈完整性', lastMaint: '2026-02-20' },
    { id: 'LAB-2024-011', name: '频谱分析仪', model: 'Rohde Schwarz FSW50', category: 'electrical', location: 'E楼电子室', status: 'available', danger: 'normal', value: 165000, maxHours: 4, maxWeek: 3, emoji: '📊', acquireDate: '2023-03-10', note: '输入信号幅值不超过+30dBm', lastMaint: '2026-01-15' },
    { id: 'LAB-2024-012', name: '车床 (精密型)', model: 'GILDEMEISTER CTX310', category: 'mechanical', location: 'C楼工坊', status: 'busy', danger: 'high', value: 190000, maxHours: 6, maxWeek: 2, emoji: '🔧', acquireDate: '2019-11-05', note: '切屑锋利，必须戴防护手套', lastMaint: '2026-02-28' }
  ],

  // Reservations
  reservations: [
    { id: 'RV-20260327-001', deviceId: 'LAB-2024-001', deviceName: '扫描电子显微镜', userId: 'user01', userName: '张同学', date: '2026-03-27', startTime: '09:00', endTime: '11:00', duration: 2, purpose: 'research', purposeLabel: '科研项目', desc: '纳米材料表面形貌表征', status: 'approved', submitTime: '2026-03-25 10:23', approveTime: '2026-03-25 14:12', certRequired: true, deviceStatus: null },
    { id: 'RV-20260327-002', deviceId: 'LAB-2024-005', deviceName: '傅里叶红外光谱仪', userId: 'user01', userName: '张同学', date: '2026-03-28', startTime: '14:00', endTime: '17:00', duration: 3, purpose: 'course', purposeLabel: '课程实验', desc: '有机化学实验课程', status: 'pending', submitTime: '2026-03-26 09:15', certRequired: false, deviceStatus: null },
    { id: 'RV-20260320-003', deviceId: 'LAB-2024-002', deviceName: '气相色谱质谱联用仪', userId: 'user01', userName: '张同学', date: '2026-03-20', startTime: '10:00', endTime: '12:00', duration: 2, purpose: 'graduation', purposeLabel: '毕业设计', desc: '挥发性有机物检测分析', status: 'approved', submitTime: '2026-03-18 16:42', approveTime: '2026-03-19 09:30', certRequired: false, deviceStatus: 'normal' },
    { id: 'RV-20260315-004', deviceId: 'LAB-2024-003', deviceName: '数控铣床', userId: 'user01', userName: '张同学', date: '2026-03-15', startTime: '13:00', endTime: '17:00', duration: 4, purpose: 'graduation', purposeLabel: '毕业设计', desc: '加工样件', status: 'rejected', submitTime: '2026-03-13 11:00', rejectTime: '2026-03-13 15:20', rejectReason: '操作证已过期，请先更新高危设备操作证', certRequired: true, deviceStatus: null },
    { id: 'RV-20260310-005', deviceId: 'LAB-2024-006', deviceName: '全自动PCR仪', userId: 'user01', userName: '张同学', date: '2026-03-10', startTime: '09:00', endTime: '12:00', duration: 3, purpose: 'research', purposeLabel: '科研项目', desc: '基因扩增实验', status: 'cancelled', submitTime: '2026-03-08 14:00', certRequired: false, deviceStatus: null }
  ],

  // Notifications
  notifications: [
    { id: 'N001', type: 'success', title: '预约审核通过', desc: '您对扫描电子显微镜的预约申请 (3月27日 09:00-11:00) 已通过审核，请按时使用。', time: '2小时前', read: false },
    { id: 'N002', type: 'warning', title: '操作证即将到期', desc: '您的高危设备操作证将于2026年04月15日到期，请及时更新以避免影响设备预约。', time: '1天前', read: false },
    { id: 'N003', type: 'info', title: '维保通知', desc: '高速离心机 (LAB-2024-004) 正在维修中，预计4月1日恢复正常使用。', time: '2天前', read: false },
    { id: 'N004', type: 'error', title: '预约申请被拒绝', desc: '您对数控铣床的预约申请被拒绝。原因：操作证已过期，请先更新高危设备操作证。', time: '5天前', read: true },
    { id: 'N005', type: 'success', title: '签退确认', desc: '您于3月20日对气相色谱质谱联用仪的使用已记录，使用时长2小时。', time: '1周前', read: true }
  ],

  // Admin: all pending audits
  pendingAudits: [
    { id: 'RV-20260327-A01', deviceId: 'LAB-2024-009', deviceName: '原子力显微镜', userId: 'usr_20210001', userName: '王小明', dept: '材料学院', avatar: '王', date: '2026-03-30', startTime: '09:00', endTime: '12:00', duration: 3, purpose: '科研项目', desc: 'MoS2薄膜表面形貌测量', certRequired: false, submitTime: '2026-03-27 08:32', status: 'pending', level: 'normal' },
    { id: 'RV-20260327-A02', deviceId: 'LAB-2024-001', deviceName: '扫描电子显微镜', userId: 'usr_20220045', userName: '李芳', dept: '物理学院', avatar: '李', date: '2026-03-29', startTime: '14:00', endTime: '18:00', duration: 4, purpose: '课程实验', desc: '金属断口形貌分析', certRequired: true, certVerified: true, submitTime: '2026-03-27 09:15', status: 'pending', level: 'high' },
    { id: 'RV-20260327-A03', deviceId: 'LAB-2024-011', deviceName: '频谱分析仪', userId: 'usr_20230012', userName: '陈大鹏', dept: '电子信息学院', avatar: '陈', date: '2026-03-28', startTime: '10:00', endTime: '12:00', duration: 2, purpose: '毕业设计', desc: '天线辐射特性测量', certRequired: false, submitTime: '2026-03-26 16:55', status: 'pending', level: 'normal' },
    { id: 'RV-20260327-A04', deviceId: 'LAB-2024-008', deviceName: '激光雕刻机', userId: 'usr_20210078', userName: '赵磊', dept: '机械学院', avatar: '赵', date: '2026-03-31', startTime: '13:00', endTime: '17:00', duration: 4, purpose: '竞赛项目', desc: '亚克力零件加工', certRequired: true, certVerified: false, submitTime: '2026-03-27 10:45', status: 'pending', level: 'high' },
    { id: 'RV-20260327-A05', deviceId: 'LAB-2024-007', deviceName: '三坐标测量机', userId: 'usr_20220089', userName: '刘梅', dept: '机械学院', avatar: '刘', date: '2026-03-29', startTime: '09:00', endTime: '11:00', duration: 2, purpose: '科研项目', desc: '零件几何精度检测', certRequired: false, submitTime: '2026-03-27 11:00', status: 'pending', level: 'normal' }
  ],

  // Maintenance tickets
  maintenanceTickets: [
    { id: 'MT-2026-001', deviceId: 'LAB-2024-004', deviceName: '高速离心机', type: 'fault', status: 'inprogress', priority: 'high', reporter: '张同学', reportTime: '2026-03-15 10:23', desc: '使用过程中出现异常震动，转速不稳定', technician: '李维修员', startTime: '2026-03-16 09:00', estimateEnd: '2026-04-01' },
    { id: 'MT-2026-002', deviceId: 'LAB-2024-003', deviceName: '数控铣床', type: 'plan', status: 'pending', priority: 'medium', reporter: '系统自动', reportTime: '2026-03-20 08:00', desc: '计划季度保养：润滑油更换、导轨清洁、精度校准', technician: null, startTime: null, estimateEnd: '2026-04-15' },
    { id: 'MT-2026-003', deviceId: 'LAB-2024-001', deviceName: '扫描电子显微镜', type: 'plan', status: 'done', priority: 'low', reporter: '李管理员', reportTime: '2026-01-05 09:00', desc: '年度校准维保，更换灯丝', technician: 'Zeiss工程师', startTime: '2026-01-10', estimateEnd: '2026-01-10', finishTime: '2026-01-10', finishNote: '校准完成，参数正常' }
  ],

  // Inventory
  inventory: [
    { id: 'INV-001', name: '碳导电双面胶', spec: '15mm×20m', stock: 8, warning: 5, unit: '卷', status: 'good' },
    { id: 'INV-002', name: 'SEM导电胶', spec: '25ml/瓶', stock: 3, warning: 5, unit: '瓶', status: 'low' },
    { id: 'INV-003', name: 'GC色谱柱 HP-5MS', spec: '30m×0.25mm', stock: 2, warning: 3, unit: '根', status: 'critical' },
    { id: 'INV-004', name: 'PCR管 0.2ml', spec: '1000支/盒', stock: 20, warning: 10, unit: '盒', status: 'good' },
    { id: 'INV-005', name: '洗耳球', spec: '通用', stock: 6, warning: 5, unit: '个', status: 'good' },
    { id: 'INV-006', name: '氮气钢瓶 (高纯)', spec: '40L', stock: 1, warning: 2, unit: '瓶', status: 'critical' }
  ],

  // System users
  users: [
    { id: 'U001', username: '20210001', name: '王小明', role: 'user', dept: '材料学院', status: 'active', lastLogin: '2026-03-27 08:30' },
    { id: 'U002', username: '20220045', name: '李芳', role: 'user', dept: '物理学院', status: 'active', lastLogin: '2026-03-26 16:22' },
    { id: 'U003', username: 'admin001', name: '李管理员', role: 'admin', dept: '实验中心', status: 'active', lastLogin: '2026-03-27 07:55' },
    { id: 'U004', username: 'sysadmin', name: '王系统员', role: 'sysadmin', dept: 'IT中心', status: 'active', lastLogin: '2026-03-27 09:00' },
    { id: 'U005', username: '20230012', name: '陈大鹏', role: 'user', dept: '电子信息学院', status: 'active', lastLogin: '2026-03-25 14:10' },
    { id: 'U006', username: '20210078', name: '赵磊', role: 'user', dept: '机械学院', status: 'disabled', lastLogin: '2026-03-01 09:30' }
  ],

  // Audit Log
  auditLogs: [
    { id: 'AL001', time: '2026-03-27 09:18', user: '王小明', ip: '192.168.1.45', type: 'book', action: '提交预约申请 - 原子力显微镜', status: 'success' },
    { id: 'AL002', time: '2026-03-27 09:05', user: '李管理员', ip: '10.0.0.12', type: 'device', action: '更新设备状态 - 高速离心机 → 维修中', status: 'success' },
    { id: 'AL003', time: '2026-03-27 08:55', user: '王系统员', ip: '10.0.0.1', type: 'user', action: '禁用用户账号 - 赵磊 (20210078)', status: 'success' },
    { id: 'AL004', time: '2026-03-27 08:30', user: '王小明', ip: '192.168.1.45', type: 'login', action: '用户登录', status: 'success' },
    { id: 'AL005', time: '2026-03-26 23:45', user: '未知', ip: '198.51.0.23', type: 'login', action: '多次登录失败尝试 (5次/分钟)', status: 'failed' },
    { id: 'AL006', time: '2026-03-26 22:10', user: 'admin001', ip: '10.0.0.12', type: 'device', action: '批准预约申请 RV-20260326-028', status: 'success' }
  ],

  // Backup records
  backups: [
    { name: 'backup_20260327_02h00m', type: '自动', size: '1.24 GB', time: '2026-03-27 02:00', status: 'success' },
    { name: 'backup_20260326_02h00m', type: '自动', size: '1.23 GB', time: '2026-03-26 02:00', status: 'success' },
    { name: 'backup_manual_20260325', type: '手动', size: '1.22 GB', time: '2026-03-25 14:30', status: 'success' },
    { name: 'backup_20260325_02h00m', type: '自动', size: '1.22 GB', time: '2026-03-25 02:00', status: 'success' }
  ]
};

// Helper: purpose label mapping
window.LabData.purposeMap = { course: '课程实验', research: '科研项目', graduation: '毕业设计', competition: '学科竞赛', other: '其他' };
