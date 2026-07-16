(async () => {
  try {
    const loginRes = await fetch('http://localhost:3002/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'h200258v@hit.ac.zw', password: 'rady1441', role: 'admin' }),
    });
    const loginText = await loginRes.text();
    console.log('Login status:', loginRes.status);
    console.log('Login body:', loginText);

    let token = null;
    try {
      const json = JSON.parse(loginText);
      token = json.token;
      if (!token) console.error('No token in response');
    } catch (e) {
      console.error('Failed to parse login JSON');
    }

    if (token) {
      const classesRes = await fetch('http://localhost:3002/api/classes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const classesJson = await classesRes.json();
      console.log('Classes status:', classesRes.status);
      console.log('Classes body:', JSON.stringify(classesJson, null, 2));
    }
  } catch (err) {
    console.error('Test client error', err);
  }
})();
