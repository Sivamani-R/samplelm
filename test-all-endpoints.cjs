async function runComprehensiveTests() {
  console.log('====================================================');
  console.log('🚀 RUNNING COMPREHENSIVE END-TO-END SYSTEM TESTS');
  console.log('====================================================');

  const BASE_URL = 'http://localhost:5000/api';

  const login = async (email, password) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email, password })
    });
    if (!res.ok) {
      throw new Error(`Login failed for ${email}: ${res.status} ${await res.text()}`);
    }
    const data = await res.json();
    return { token: data.token, user: data.user };
  };

  const req = async (endpoint, method = 'GET', body = null, token = null) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null
    });
    const status = res.status;
    const text = await res.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {
      json = text;
    }
    return { status, ok: res.ok, data: json };
  };

  let passed = 0;
  let failed = 0;

  const test = async (name, fn) => {
    try {
      await fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ [FAIL] ${name}:`, err.message);
      failed++;
    }
  };

  console.log('\n🔑 1. AUTHENTICATION TESTS FOR ALL ROLES');
  let adminAuth, mgrAuth, tlAuth, empAuth;

  await test('Admin Login (admin@enterprise.com)', async () => {
    adminAuth = await login('admin@enterprise.com', 'admin123');
    if (!adminAuth.token || adminAuth.user.role !== 'ADMIN') throw new Error('Invalid admin payload');
  });

  await test('Manager Login (arun.k@enterprise.com)', async () => {
    mgrAuth = await login('arun.k@enterprise.com', 'password123');
    if (!mgrAuth.token || mgrAuth.user.role !== 'MANAGER') throw new Error('Invalid manager payload');
  });

  await test('Team Lead Login (priya.s@enterprise.com)', async () => {
    tlAuth = await login('priya.s@enterprise.com', 'password123');
    if (!tlAuth.token || tlAuth.user.role !== 'TEAM_LEAD') throw new Error('Invalid team lead payload');
  });

  await test('Employee Login (john.doe@enterprise.com)', async () => {
    empAuth = await login('john.doe@enterprise.com', 'password123');
    if (!empAuth.token || empAuth.user.role !== 'EMPLOYEE') throw new Error('Invalid employee payload');
  });

  console.log('\n🏛️ 2. ADMIN PORTAL ENDPOINT TESTS');
  await test('GET /admin/stats (Dashboard Overview)', async () => {
    const res = await req('/admin/stats', 'GET', null, adminAuth.token);
    if (!res.ok || typeof res.data.totalEmployees !== 'number') throw new Error(`Status ${res.status}`);
  });

  await test('GET /admin/employees (Employee Directory)', async () => {
    const res = await req('/admin/employees', 'GET', null, adminAuth.token);
    if (!res.ok || !Array.isArray(res.data) || res.data.length === 0) throw new Error(`Expected array of employees`);
    if (!res.data[0].locationName) throw new Error('Missing locationName in employee record');
  });

  await test('GET /admin/team-leads', async () => {
    const res = await req('/admin/team-leads', 'GET', null, adminAuth.token);
    if (!res.ok || !Array.isArray(res.data)) throw new Error(`Status ${res.status}`);
  });

  await test('GET /admin/managers', async () => {
    const res = await req('/admin/managers', 'GET', null, adminAuth.token);
    if (!res.ok || !Array.isArray(res.data)) throw new Error(`Status ${res.status}`);
  });

  await test('GET /admin/mappings (Hierarchy Mappings)', async () => {
    const res = await req('/admin/mappings', 'GET', null, adminAuth.token);
    if (!res.ok || !Array.isArray(res.data) || !res.data[0].employee) throw new Error(`Invalid mapping structure`);
  });

  await test('PUT /admin/mappings/:employeeId (Update Hierarchy)', async () => {
    const res = await req('/admin/mappings/EMP001', 'PUT', { teamLeadId: 'TL001', managerId: 'MGR001' }, adminAuth.token);
    if (!res.ok) throw new Error(`Status ${res.status}`);
  });

  await test('GET /admin/locations', async () => {
    const res = await req('/admin/locations', 'GET', null, adminAuth.token);
    if (!res.ok || !Array.isArray(res.data)) throw new Error(`Status ${res.status}`);
  });

  await test('GET /admin/leave-categories', async () => {
    const res = await req('/admin/leave-categories', 'GET', null, adminAuth.token);
    if (!res.ok || !Array.isArray(res.data)) throw new Error(`Status ${res.status}`);
  });

  await test('GET /admin/leave-policies', async () => {
    const res = await req('/admin/leave-policies', 'GET', null, adminAuth.token);
    if (!res.ok || !Array.isArray(res.data)) throw new Error(`Status ${res.status}`);
  });

  await test('GET /admin/approval-workflows', async () => {
    const res = await req('/admin/approval-workflows', 'GET', null, adminAuth.token);
    if (!res.ok || !Array.isArray(res.data)) throw new Error(`Status ${res.status}`);
  });

  await test('GET /admin/audit-logs', async () => {
    const res = await req('/admin/audit-logs', 'GET', null, adminAuth.token);
    if (!res.ok || !Array.isArray(res.data)) throw new Error(`Status ${res.status}`);
  });

  console.log('\n👤 3. EMPLOYEE PORTAL ENDPOINTS & LEAVE LIFECYCLE TESTS');
  await test('GET /employee/dashboard', async () => {
    const res = await req('/employee/dashboard', 'GET', null, empAuth.token);
    if (!res.ok || !res.data.leaveBalances || !res.data.upcomingHolidays) throw new Error(`Status ${res.status}`);
  });

  await test('GET /employee/leave-balances', async () => {
    const res = await req('/employee/leave-balances', 'GET', null, empAuth.token);
    if (!res.ok || !Array.isArray(res.data) || res.data.length === 0) throw new Error(`Status ${res.status}`);
  });

  await test('GET /employee/holidays', async () => {
    const res = await req('/employee/holidays', 'GET', null, empAuth.token);
    if (!res.ok || !Array.isArray(res.data)) throw new Error(`Status ${res.status}`);
  });

  await test('POST /employee/leaves/calculate-duration', async () => {
    const res = await req('/employee/leaves/calculate-duration', 'POST', {
      startDate: '2026-09-01',
      endDate: '2026-09-03',
      startSession: 'FULL_DAY',
      endSession: 'FULL_DAY'
    }, empAuth.token);
    if (!res.ok || typeof res.data.workingDays !== 'number' || res.data.workingDays !== 3) {
      throw new Error(`Duration calculation mismatch: ${JSON.stringify(res.data)}`);
    }
  });

  await test('POST /employee/leaves/check-overlap', async () => {
    const res = await req('/employee/leaves/check-overlap', 'POST', {
      startDate: '2026-09-01',
      endDate: '2026-09-03'
    }, empAuth.token);
    if (!res.ok || res.data.hasOverlap === undefined) throw new Error(`Status ${res.status}`);
  });

  function getNextWeekdayPair(offsetWeeks = 1) {
    const d = new Date();
    d.setDate(d.getDate() + (offsetWeeks * 7));
    const day = d.getDay();
    const diffToMonday = (1 - day + 7) % 7 || 7;
    d.setDate(d.getDate() + diffToMonday);
    const monday = d.toISOString().split('T')[0];
    d.setDate(d.getDate() + 1);
    const tuesday = d.toISOString().split('T')[0];
    return { startDate: monday, endDate: tuesday };
  }

  let createdLeaveId = null;
  const testPair = getNextWeekdayPair(Math.floor(Math.random() * 40) + 15);
  const startDateStr = testPair.startDate;
  const endDateStr = testPair.endDate;

  await test('POST /employee/leaves (Submit Leave Request)', async () => {
    const res = await req('/employee/leaves', 'POST', {
      leaveTypeId: 'CAT-PTO',
      startDate: startDateStr,
      endDate: endDateStr,
      startSession: 'FULL_DAY',
      endSession: 'FULL_DAY',
      reason: 'Testing comprehensive leave request submission'
    }, empAuth.token);
    if (!res.ok) {
      throw new Error(`Failed to create leave: ${JSON.stringify(res.data)}`);
    } else {
      createdLeaveId = res.data.requestId || res.data.id;
    }
  });

  await test('GET /employee/leaves (My Leaves History)', async () => {
    const res = await req('/employee/leaves', 'GET', null, empAuth.token);
    if (!res.ok || !Array.isArray(res.data)) throw new Error(`Status ${res.status}`);
    const found = res.data.find(l => l.id === createdLeaveId);
    if (!found) throw new Error('Created leave request not present in history');
  });

  console.log('\n👥 4. TEAM LEAD & MANAGER APPROVAL WORKFLOW TESTS');
  await test('GET /team/overview', async () => {
    const res = await req('/team/overview', 'GET', null, mgrAuth.token);
    if (!res.ok || typeof res.data.teamSize !== 'number') throw new Error(`Status ${res.status}`);
  });

  await test('GET /team/availability', async () => {
    const res = await req('/team/availability', 'GET', null, mgrAuth.token);
    if (!res.ok || !Array.isArray(res.data.members)) throw new Error(`Status ${res.status}`);
  });

  await test('GET /team/members', async () => {
    const res = await req('/team/members', 'GET', null, mgrAuth.token);
    if (!res.ok || !Array.isArray(res.data)) throw new Error(`Status ${res.status}`);
  });

  await test('GET /team/calendar', async () => {
    const res = await req('/team/calendar', 'GET', null, mgrAuth.token);
    if (!res.ok || !Array.isArray(res.data)) throw new Error(`Status ${res.status}`);
  });

  await test('GET /approvals/my (Pending Approvals for TL/Manager)', async () => {
    const res = await req('/approvals/my', 'GET', null, tlAuth.token);
    if (!res.ok || !Array.isArray(res.data)) throw new Error(`Status ${res.status}`);
  });

  if (createdLeaveId) {
    await test(`GET /approvals/${createdLeaveId} (Approval Details & Steps)`, async () => {
      const res = await req(`/approvals/${createdLeaveId}`, 'GET', null, tlAuth.token);
      if (!res.ok || !res.data.steps) throw new Error(`Failed to load approval details`);
    });

    await test(`POST /approvals/${createdLeaveId}/approve (Process Approval)`, async () => {
      const res = await req(`/approvals/${createdLeaveId}/approve`, 'POST', { remarks: 'Approved in test' }, tlAuth.token);
      if (!res.ok) throw new Error(`Failed to approve: ${JSON.stringify(res.data)}`);
    });
  }

  console.log('\n🔔 5. NOTIFICATIONS TESTS');
  await test('GET /notifications', async () => {
    const res = await req('/notifications', 'GET', null, empAuth.token);
    if (!res.ok || typeof res.data.unreadCount !== 'number' || !Array.isArray(res.data.notifications)) {
      throw new Error(`Invalid notification format: ${JSON.stringify(res.data)}`);
    }
  });

  await test('POST /notifications/mark-all-read', async () => {
    const res = await req('/notifications/mark-all-read', 'POST', {}, empAuth.token);
    if (!res.ok) throw new Error(`Status ${res.status}`);
  });

  console.log('\n====================================================');
  console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');
}

runComprehensiveTests().catch(console.error);
