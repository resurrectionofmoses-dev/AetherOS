const http = require('http');

const tests = [
    { name: 'Security.txt', path: '/.well-known/security.txt', method: 'GET' },
    { name: 'VDP Status', path: '/api/status', method: 'GET' },
    { name: 'VDP Report', path: '/api/report', method: 'POST', body: { title: 'Test', description: 'Test' } },
    { name: 'Recovery (ATO)', path: '/api/auth/recovery', method: 'POST', body: { email: 'admin@aetheros.sovereign' } },
    { name: 'Prohibited Knowledge', path: '/prohibited-knowledge', method: 'GET' }
];

async function runTests() {
    for (const test of tests) {
        console.log(`Running: ${test.name}...`);
        const options = {
            hostname: '127.0.0.1',
            port: 5000,
            path: test.path,
            method: test.method,
            headers: { 'Content-Type': 'application/json' }
        };

        const req = http.request(options, (res) => {
            console.log(`  Status: ${res.statusCode}`);
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.headers['content-type']?.includes('application/json')) {
                    console.log(`  Response: ${JSON.stringify(JSON.parse(data), null, 2)}`);
                } else {
                    console.log(`  Response: [${res.headers['content-type']}] (Length: ${data.length})`);
                }
            });
        });

        req.on('error', (e) => console.error(`  Error: ${e.message}`));
        if (test.body) req.write(JSON.stringify(test.body));
        req.end();
        await new Promise(r => setTimeout(r, 1000));
    }
}

runTests();
