async function testEndpoints() {
  const login = async (email, password) => {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email, password })
    });
    const data = await res.json();
    return data.token;
  };

  const testGet = async (endpoint, token) => {
    const res = await fetch(`http://localhost:5000${endpoint}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(`[GET ${endpoint}] Status:`, res.status);
    if (!res.ok) {
      console.log('Error payload:', await res.text());
    } else {
      console.log('Success payload length/keys:', Object.keys(await res.json()));
    }
  };

  console.log('--- Testing Employee Endpoints ---');
  const empToken = await login('john.doe@enterprise.com', 'password123');
  await testGet('/api/notifications', empToken);
  await testGet('/api/employee/dashboard', empToken);
  await testGet('/api/employee/comp-off', empToken);
  await testGet('/api/employee/attendance', empToken);
  await testGet('/api/employee/leave-balances', empToken);
  
  console.log('\n--- Testing Manager Endpoints ---');
  const mgrToken = await login('arun.k@enterprise.com', 'password123');
  await testGet('/api/team/overview', mgrToken);
  await testGet('/api/team/availability', mgrToken);
  await testGet('/api/team/members', mgrToken);
  await testGet('/api/team/calendar', mgrToken);
  await testGet('/api/approvals/my', mgrToken);
}

testEndpoints().catch(console.error);
