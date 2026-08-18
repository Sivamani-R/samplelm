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

const runVerification = async () => {
  console.log('===============================================================');
  console.log('🚀 RUNNING RIGOROUS HIERARCHY & AUTO-ESCALATION TEST SUITE');
  console.log('===============================================================');

  const BASE_URL = 'http://localhost:5000/api';

  const api = async (endpoint, method = 'GET', body = null, token = null) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null
    });
    const data = await res.json();
    return { status: res.status, ok: res.ok, data };
  };

  const pg = await import('./backend/node_modules/pg/lib/index.js');
  const pool = new pg.default.Pool({
    user: process.env.POSTGRES_USER || 'nexleave',
    host: process.env.POSTGRES_HOST || 'localhost',
    database: process.env.POSTGRES_DB || 'nexleave_db',
    password: process.env.POSTGRES_PASSWORD || 'nexleave_password',
    port: parseInt(process.env.POSTGRES_PORT || '5433', 10),
  });

  // 1. Authenticate users
  console.log('\n🔑 1. Authenticating Roles...');
  const empAuth = (await api('/auth/login', 'POST', { username: 'john.doe@enterprise.com', password: 'password123' })).data;
  const tlAuth = (await api('/auth/login', 'POST', { username: 'priya.s@enterprise.com', password: 'password123' })).data;
  const mgrAuth = (await api('/auth/login', 'POST', { username: 'arun.k@enterprise.com', password: 'password123' })).data;
  const adminAuth = (await api('/auth/login', 'POST', { username: 'admin@enterprise.com', password: 'admin123' })).data;

  console.log('  ✅ Employee Authenticated (John Doe, ID: EMP001)');
  console.log('  ✅ Team Lead Authenticated (Priya Sharma, ID: TL001)');
  console.log('  ✅ Manager Authenticated (Arun Kumar, ID: MGR001)');
  console.log('  ✅ Admin Authenticated (Devin Vance, ID: ADM001)');

  const randomOffset = Math.floor(Math.random() * 200) + 100;

  // 2. Employee submits leave (Standard 2-tier approval flow)
  console.log('\n📝 2. Testing Employee Leave Submission & Multi-Tier Routing...');
  const pair1 = getNextWeekdayPair(randomOffset);

  const leaveSubmitRes = await api('/employee/leaves', 'POST', {
    leaveTypeId: 'CAT-PTO',
    startDate: pair1.startDate,
    endDate: pair1.endDate,
    startSession: 'FULL_DAY',
    endSession: 'FULL_DAY',
    reason: 'Family holiday trip'
  }, empAuth.token);

  if (!leaveSubmitRes.ok) throw new Error(`Leave submit failed: ${JSON.stringify(leaveSubmitRes.data)}`);
  const leaveId = leaveSubmitRes.data.requestId || leaveSubmitRes.data.id;
  console.log(`  ✅ Leave Request Created: #${leaveId} (${pair1.startDate} to ${pair1.endDate})`);

  // Check Employee Leave History
  const empLeavesRes = await api('/employee/leaves', 'GET', null, empAuth.token);
  const myLeave = empLeavesRes.data.find(l => l.id === leaveId);
  if (!myLeave) throw new Error(`Request #${leaveId} not found in Employee Leave History`);
  console.log(`  ✅ Verified in Employee Leave History: Status = ${myLeave.status}`);
  console.log(`     Approval Chain:`, myLeave.approvalChain.map(s => `${s.role} -> ${s.approverName} [${s.status}]`));

  // Check Team Lead Pending Approvals
  const tlPendingRes = await api('/approvals/my', 'GET', null, tlAuth.token);
  const tlFound = tlPendingRes.data.find(a => a.id === leaveId);
  if (!tlFound) throw new Error(`Request #${leaveId} not found in Team Lead approvals queue`);
  console.log(`  ✅ Verified in Team Lead Queue: Found #${tlFound.id} from ${tlFound.employee?.name}`);

  // 3. Team Lead Approves -> Should advance to Manager
  console.log('\n👍 3. Testing Team Lead Approval -> Advance to Manager...');
  const tlApproveRes = await api(`/approvals/${leaveId}/approve`, 'POST', { remarks: 'Approved by TL Priya' }, tlAuth.token);
  if (!tlApproveRes.ok) throw new Error(`TL approval failed: ${JSON.stringify(tlApproveRes.data)}`);
  console.log(`  ✅ Team Lead Approved #${leaveId}`);

  // Verify now pending for Manager
  const mgrPendingRes = await api('/approvals/my', 'GET', null, mgrAuth.token);
  const mgrFound = mgrPendingRes.data.find(a => a.id === leaveId);
  if (!mgrFound) throw new Error(`Request #${leaveId} did not advance to Manager queue`);
  console.log(`  ✅ Verified in Manager Queue: Found #${mgrFound.id} from ${mgrFound.employee?.name}`);

  // Manager Approves -> Final Approval
  const mgrApproveRes = await api(`/approvals/${leaveId}/approve`, 'POST', { remarks: 'Final Director Approval' }, mgrAuth.token);
  if (!mgrApproveRes.ok) throw new Error(`Manager approval failed: ${JSON.stringify(mgrApproveRes.data)}`);
  console.log(`  ✅ Manager Approved #${leaveId}`);

  // Check Employee History Final Status
  const empFinalLeavesRes = await api('/employee/leaves', 'GET', null, empAuth.token);
  const myFinalLeave = empFinalLeavesRes.data.find(l => l.id === leaveId);
  if (myFinalLeave.status !== 'APPROVED') throw new Error(`Expected status APPROVED but got ${myFinalLeave.status}`);
  console.log(`  ✅ Verified Final Employee Leave Status: ${myFinalLeave.status}`);
  console.log(`     Final Timeline:`, myFinalLeave.approvalChain.map(s => `${s.role} -> ${s.approverName} [${s.status}] (${s.remarks})`));

  // 4. Test 2-Day SLA Auto-Escalation Engine
  console.log('\n⏰ 4. Testing 2-Day SLA Auto-Escalation Engine...');
  const pair2 = getNextWeekdayPair(randomOffset + 4);

  const escSubmitRes = await api('/employee/leaves', 'POST', {
    leaveTypeId: 'CAT-PTO',
    startDate: pair2.startDate,
    endDate: pair2.endDate,
    startSession: 'FULL_DAY',
    endSession: 'FULL_DAY',
    reason: 'Testing SLA escalation engine'
  }, empAuth.token);

  if (!escSubmitRes.ok) throw new Error(`Escalation test leave submit failed: ${JSON.stringify(escSubmitRes.data)}`);
  const escLeaveId = escSubmitRes.data.requestId || escSubmitRes.data.id;
  console.log(`  ✅ Submitted Request for Escalation Test: #${escLeaveId} (${pair2.startDate} to ${pair2.endDate})`);

  // Artificially simulate 2-day timeout breach in PostgreSQL
  await pool.query(`
    UPDATE leave_requests
    SET escalation_deadline = NOW() - interval '1 hour', applied_date = NOW() - interval '3 days'
    WHERE id = $1
  `, [escLeaveId]);

  await pool.query(`
    UPDATE approval_instances
    SET deadline = NOW() - interval '1 hour'
    WHERE leave_request_id = $1 AND role = 'TEAM_LEAD'
  `, [escLeaveId]);
  console.log(`  ⏱️ Simulated 2-Day SLA Timeout in PostgreSQL for #${escLeaveId}`);

  // Fetch Manager Pending & Escalated Approvals (triggers auto-escalation scan)
  const mgrEscalatedRes = await api('/approvals/escalated', 'GET', null, mgrAuth.token);
  const escFound = mgrEscalatedRes.data.find(a => a.id === escLeaveId);
  if (!escFound) throw new Error(`Request #${escLeaveId} not found in Manager Escalated Approvals list`);
  console.log(`  ✅ Auto-Escalation Succeeded! Found #${escFound.id} in Manager Escalated Queue`);
  console.log(`     Escalation Flag: isEscalated = ${escFound.sla?.isEscalated}`);

  // Check Employee Leave History reflects ESCALATED status
  const empEscLeavesRes = await api('/employee/leaves', 'GET', null, empAuth.token);
  const myEscLeave = empEscLeavesRes.data.find(l => l.id === escLeaveId);
  console.log(`  ✅ Verified Employee Leave History for Escalated Request:`);
  console.log(`     Current Approver: ${myEscLeave.currentApprover?.name} (${myEscLeave.currentApprover?.role})`);
  console.log(`     Chain Steps:`, myEscLeave.approvalChain.map(s => `${s.role} -> ${s.approverName} [${s.status}] (${s.remarks || 'No remarks'})`));

  const tlStep = myEscLeave.approvalChain.find(s => s.role === 'TEAM_LEAD');
  const mgrStep = myEscLeave.approvalChain.find(s => s.role === 'MANAGER');
  if (tlStep.status !== 'ESCALATED') throw new Error(`Expected TEAM_LEAD step to be ESCALATED but got ${tlStep.status}`);
  if (mgrStep.status !== 'PENDING') throw new Error(`Expected MANAGER step to be PENDING but got ${mgrStep.status}`);

  // Manager can approve the escalated request directly
  const mgrEscApproveRes = await api(`/approvals/${escLeaveId}/approve`, 'POST', { remarks: 'Approved after auto-escalation' }, mgrAuth.token);
  if (!mgrEscApproveRes.ok) throw new Error(`Manager failed to approve escalated request: ${JSON.stringify(mgrEscApproveRes.data)}`);
  console.log(`  ✅ Manager Approved Escalated Request #${escLeaveId}`);

  // 5. Test Team Lead applying for leave (should bypass TL step and route to Manager)
  console.log('\n👤 5. Testing Team Lead Applying for Leave (Hierarchy Bypass)...');
  const pair3 = getNextWeekdayPair(randomOffset + 8);
  const tlLeaveRes = await api('/employee/leaves', 'POST', {
    leaveTypeId: 'CAT-PTO',
    startDate: pair3.startDate,
    endDate: pair3.endDate,
    startSession: 'FULL_DAY',
    endSession: 'FULL_DAY',
    reason: 'Lead vacation'
  }, tlAuth.token);
  if (!tlLeaveRes.ok) throw new Error(`TL leave submit failed: ${JSON.stringify(tlLeaveRes.data)}`);
  const tlLeaveId = tlLeaveRes.data.requestId || tlLeaveRes.data.id;
  const tlLeavesRes = await api('/employee/leaves', 'GET', null, tlAuth.token);
  const myTlLeave = tlLeavesRes.data.find(l => l.id === tlLeaveId);
  console.log(`  ✅ Team Lead Leave #${tlLeaveId} History:`, myTlLeave.approvalChain.map(s => `${s.role} -> ${s.approverName} [${s.status}]`));
  if (myTlLeave.approvalChain.some(s => s.role === 'TEAM_LEAD')) throw new Error('Team Lead leave should not include a self-approval Team Lead step');

  // 6. Test Manager applying for leave (should route to Admin)
  console.log('\n👔 6. Testing Manager Applying for Leave (Hierarchy Route to Admin)...');
  const pair4 = getNextWeekdayPair(randomOffset + 12);
  const mgrLeaveRes = await api('/employee/leaves', 'POST', {
    leaveTypeId: 'CAT-PTO',
    startDate: pair4.startDate,
    endDate: pair4.endDate,
    startSession: 'FULL_DAY',
    endSession: 'FULL_DAY',
    reason: 'Director conference'
  }, mgrAuth.token);
  if (!mgrLeaveRes.ok) throw new Error(`Manager leave submit failed: ${JSON.stringify(mgrLeaveRes.data)}`);
  const mgrLeaveId = mgrLeaveRes.data.requestId || mgrLeaveRes.data.id;
  const mgrLeavesRes = await api('/employee/leaves', 'GET', null, mgrAuth.token);
  const myMgrLeave = mgrLeavesRes.data.find(l => l.id === mgrLeaveId);
  console.log(`  ✅ Manager Leave #${mgrLeaveId} History:`, myMgrLeave.approvalChain.map(s => `${s.role} -> ${s.approverName} [${s.status}]`));
  if (myMgrLeave.approvalChain[0].role !== 'ADMIN') throw new Error(`Expected Manager leave to route to ADMIN, got ${myMgrLeave.approvalChain[0].role}`);

  await pool.end();

  console.log('\n===============================================================');
  console.log('🎉 ALL RIGOROUS HIERARCHY & ESCALATION TESTS PASSED (100%)');
  console.log('===============================================================');
};

runVerification().catch(err => {
  console.error('\n❌ TEST FAILED WITH ERROR:', err);
  process.exit(1);
});
