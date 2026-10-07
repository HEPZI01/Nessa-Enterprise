const fetch = require('node-fetch'); // Use built-in fetch if Node >= 18
fetch('http://localhost:3000/api/register', { 
  method: 'POST', 
  headers: {'Content-Type': 'application/json'}, 
  body: JSON.stringify({ name: 'Testing', email: 'hello3@hello.com', password: 'abc'})
}).then(r=>r.text()).then(console.log);
