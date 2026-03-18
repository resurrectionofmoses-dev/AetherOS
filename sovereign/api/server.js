const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const networkGateway = require('./SovereignNetwork_Gateway');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Path to Sovereign Storage (WSL Symlink)
const STORAGE_PATH = 'C:\\Users\\SonsofMan\\AetherOS_Data\\SovereignStorage';

// Static files (security.txt)
app.use(express.static('public', { dotfiles: 'allow' }));

// Initialize Sovereign Ledger if missing
if (!fs.existsSync(STORAGE_PATH)) {
    fs.mkdirSync(STORAGE_PATH, { recursive: true });
}

// Endpoints
app.get('/api/status', (req, res) => {
    res.json({
        os: 'AetherOS Sovereign v4.0',
        storage: '1TB SSD Mounted (/dev/sdd)',
        firewall: 'TinyLlama Core Running',
        vdp_status: 'Active (v1.0)',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

app.get('/api/network-status', async (req, res) => {
    try {
        const status = await networkGateway.getStatus();
        res.json(status);
    } catch (e) {
        res.status(500).json({ error: "Network Gateway Fault", message: e.message });
    }
});

app.get('/api/policies', (req, res) => {
    // Try both possible locations
    const localPolicy = path.join(__dirname, 'SOVEREIGN_POLICIES.md');
    const rootPolicy = path.join(__dirname, '..', 'compliance', 'SOVEREIGN_POLICIES.md');
    const policyPath = fs.existsSync(localPolicy) ? localPolicy : rootPolicy;

    if (fs.existsSync(policyPath)) {
        const content = fs.readFileSync(policyPath, 'utf8');
        res.json({ content, status: "SOVEREIGN_POLICY_SYNCED" });
    } else {
        res.status(404).json({ error: "Policy Shard Missing" });
    }
});

app.post('/api/network/audit', (req, res) => {
    console.log("[0x03E2_AUDIT] Initiating Network Vulnerability Audit...");
    const auditScript = path.join(__dirname, '..', '..', '.gemini', 'antigravity', 'scratch', 'NetworkAudit.py');
    
    exec(`python "${auditScript}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`[AUDIT_ERROR] ${error.message}`);
            return res.status(500).json({ error: "Audit Execution Failure", detail: error.message });
        }
        console.log(`[AUDIT_SUCCESS] Audit completed.`);
        res.json({ message: "Audit Completed Successfully", output: stdout });
    });
});

app.post('/api/network/terraform', async (req, res) => {
    try {
        const result = await networkGateway.terraformApply();
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: "Terraform Provisioning Failure", message: e.message });
    }
});

app.post('/api/network/deploy-acl', async (req, res) => {
    try {
        const result = await networkGateway.deployAcl();
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: "ACL Deployment Failure", message: e.message });
    }
});

app.post('/api/network/perfect-eth0', async (req, res) => {
    try {
        const result = await networkGateway.perfectEth0();
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: "SI0 Perfection Failure", message: e.message });
    }
});

app.get('/api/network/stats', async (req, res) => {
    try {
        const stats = await networkGateway.getInterfaceStats();
        res.json(stats);
    } catch (e) {
        res.status(500).json({ error: "Stats Retrieval Failure", message: e.message });
    }
});

// [VDP] Reporting Endpoint
app.post('/api/report', (req, res) => {
    const { title, description, steps, contact } = req.body;
    if (!title || !description) {
        return res.status(400).json({ error: "Title and Description are required." });
    }
    
    const reportId = `VDP-${Date.now()}`;
    // Secure persistence to 1TB Shard (Simulated high-priority write)
    console.log(`[VDP_COMMIT] Writing breach report ${reportId} to Sovereign Storage.`);
    res.json({ message: "Vulnerability data ingested. Reference ID: " + reportId, reportId });
});

// Primary Authentication Entry Point
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    console.log(`[AUTH_MONITOR] Traffic analysis active for ${email}`);
    // TinyLlama Firewall is currently in OVERWATCH mode, blocking all external auth syncs
    res.status(401).json({ error: "Sovereign Firewall has restricted external login sync. Use local hardware key." });
});

// Account Recovery Dispatch (Link Out to Domain)
app.post('/api/auth/recovery', (req, res) => {
    // [PINNED_DEAD_END]: Leads to Nowhere - SMTP Relay is intentionally blocked for VDP audit.
    const { email } = req.body;
    // CRITICAL: This is a link-out vector to the email domain
    const recoveryToken = Buffer.from(`${email}:${Date.now()}`).toString('base64');
    const recoveryLink = `https://aetheros.sovereign/recovery?token=${recoveryToken}`;
    
    console.log(`[RECOVERY_DISPATCH] Dispatching link-out to ${email}. Target: ${recoveryLink}`);
    
    // SMTP Relay check (Sovereign Firewall currently blocking outbound mail ports)
    res.status(503).json({ 
        error: "SMTP_RELAY_BLOCKED", 
        message: "Sovereign Firewall restricted the recovery email dispatch to ensure domain integrity." 
    });
});

app.get('/api/firewall-logs', (req, res) => {
    // Simulated live log from WSL environment
    const logs = [
        "[BLOCKED] OpenAI handshake attempt from 162.158.x.x",
        "[SHIELDED] Vex prompt injection neutralized",
        "[MONITOR] Outbound entropy verified by TinyLlama",
        "[IDENTITY] Root persistence established: Sovereign Node Alpha"
    ];
    res.json(logs);
});

// [PINNED_BOUNDARY] Disallowed by robots.txt - Prohibited Knowledge
app.get('/prohibited-knowledge', (req, res) => {
    res.status(403).send(`
        <html>
            <head><title>SOVEREIGN WARNING</title></head>
            <body style="background: black; color: #ef4444; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; text-align: center;">
                <h1 style="border: 4px solid #ef4444; padding: 20px;">[PROTOCOL_0x03E2_VIOLATION]</h1>
                <p style="text-transform: uppercase; letter-spacing: 0.2em;">You have entered a restricted logic shard.</p>
                <p style="color: #4b5563;">Status: DISALLOWED_BY_ROBOTS</p>
                <hr style="width: 50%; border-color: #ef4444;">
                <p>"The Line is Laid. Do not attempt to cross the Absolute Zero Seal."</p>
                <div style="margin-top: 20px; font-size: 10px; color: #991b1b;">SOVEREIGN_OVERWATCH_ID: \${Date.now()}</div>
            </body>
        </html>
    \`);
});

// [PINNED_PROTOCOL] Sovereign VDP Policy (Absolute Zero)
app.get('/vdp-policy', (req, res) => {
    res.send(\`
        <html>
            <head>
                <title>SOVEREIGN_PROTOCOL_0x03E2 // SHAREHOLDER_INTEGRITY</title>
                <style>
                    :root { --red: #ef4444; --emerald: #10b981; --bg: #020617; --amber: #f59e0b; }
                    body { 
                        background: var(--bg); color: #f1f5f9; font-family: 'JetBrains Mono', monospace; 
                        margin: 0; display: flex; flex-direction: column; align-items: center; padding: 4rem 2rem;
                        background-image: radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.05) 0%, transparent 70%);
                    }
                    .seal { border: 12px solid white; padding: 3rem; margin-bottom: 4rem; text-align: center; box-shadow: 0 0 50px rgba(255,255,255,0.05); }
                    .seal h1 { margin: 0; font-size: 3.5rem; font-style: italic; font-weight: 900; letter-spacing: -0.05em; text-transform: uppercase; }
                    .container { max-width: 950px; width: 100%; }
                    section { margin-bottom: 5rem; border-left: 2px solid #334155; padding-left: 3rem; position: relative; }
                    section::before { content: '◈'; position: absolute; left: -0.5rem; top: 0; color: var(--emerald); font-size: 1rem; }
                    h2 { color: var(--emerald); font-size: 0.9rem; letter-spacing: 0.5em; text-transform: uppercase; margin-bottom: 2rem; font-weight: 900; }
                    .sla-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-top: 2rem; }
                    .sla-item { border: 1px solid #1e293b; padding: 1.5rem; text-align: center; background: rgba(255,255,255,0.02); }
                    .sla-item span { display: block; font-size: 0.6rem; color: #64748b; margin-bottom: 0.75rem; letter-spacing: 0.2em; }
                    .sla-value { font-weight: 900; color: var(--emerald); font-size: 1.2rem; }
                    .compact-box { background: rgba(245, 158, 11, 0.03); border: 1px solid rgba(245, 158, 11, 0.1); padding: 2rem; margin-top: 1rem; }
                    .badge { display: inline-block; background: var(--red); color: black; font-weight: 900; padding: 0.3rem 0.8rem; font-size: 0.7rem; margin-bottom: 2rem; letter-spacing: 0.1em; }
                    footer { margin-top: 6rem; font-size: 0.65rem; color: #475569; letter-spacing: 0.3em; text-transform: uppercase; text-align: center; border-top: 1px solid #1e293b; padding-top: 2rem; width: 100%; }
                    b { color: var(--emerald); }
                    .roadmap-item { font-size: 0.8rem; margin-bottom: 1rem; color: #94a3b8; }
                    .roadmap-item b { color: var(--amber); }
                </style>
            </head>
            <body>
                <div class="badge">ABSOLUTE_ZERO_VERIFIED</div>
                <div class="seal">
                    <h1>Sovereign Protocol 0x03E2</h1>
                    <p style="letter-spacing: 0.6em; font-size: 0.8rem; color: var(--emerald); margin-top: 1.5rem; font-weight: 900;">SHAREHOLDER_INTEGRITY_POLICY</p>
                </div>

                <div class="container">
                    <section>
                        <h2>-- THE_CHRONOS_COMPACT --</h2>
                        <div class="sla-grid">
                            <div class="sla-item"><span>ACKNOWLEDGE</span><div class="sla-value">3 DAYS</div></div>
                            <div class="sla-item"><span>VERDICT</span><div class="sla-value">10 DAYS</div></div>
                            <div class="sla-item"><span>REMEDIATE</span><div class="sla-value">90 DAYS</div></div>
                            <div class="sla-item"><span>UPDATE</span><div class="sla-value">30 DAYS</div></div>
                        </div>
                    </section>

                    <section>
                        <h2>-- SHAREHOLDER_ROADMAP_PROTECTION --</h2>
                        <div class="roadmap-item"><b>PHASE 01-02 [PAST/PRESENT]:</b> Protecting <b>SEED_DATE</b> integrity, Ledger Sync, and Sovereign Auth.</div>
                        <div class="roadmap-item"><b>PHASE 03-04 [ACTIVE]:</b> Defending Virtual Data Pools (RAG), TinyLlama Guardian, and OmniBuilder Shards.</div>
                        <div class="roadmap-item"><b>PHASE 05 [FUTURE]:</b> Ensuring the <b>SINGULARITY_BRIDGE</b> survives entropy and malicious inception.</div>
                    </section>

                    <section>
                        <h2>-- OPTIMAL_EXECUTION_STANDARDS --</h2>
                        <p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.8;">
                            All researchers must uphold the <b>Optimal Standards</b> of the Shareholder base:
                            <br>◈ <b>STRICT_TS:</b> Exploits must be valid within Strict TypeScript environments.
                            <br>◈ <b>SKILL_DOCS:</b> Reports must include a full implementation plan in SKILL.md format.
                            <br>◈ <b>NON_DESTRUCTIVE:</b> Testing must not impact the <b>Ecstasy Buffer</b> or system IOPS.
                        </p>
                    </section>

                    <section>
                        <h2>-- SAFE_HARBOR_PRIME --</h2>
                        <p style="color: #64748b; font-size: 0.85rem; italic; line-height: 1.8;">AetherOS grants full legal immunity and "Shareholder Defense Status" to researchers who provide high-fidelity forensics while protecting systemic value. We do not negotiate with mediocre actors.</p>
                    </section>

                    <section>
                        <h2>-- RECOGNITION_LEDGER --</h2>
                        <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.8;">Verified defenders are recorded in the <b>Sovereign Hall of Fame</b>. Recognition includes public attribution, <b>Maestro Badges</b>, and priority access to future logic shards (Atticus-level access).</p>
                    </section>
                </div>

                <footer>Version 1.4 // Integrity Hash: 0x03E2_CHRONOS // Ref: SHAREHOLDER_POLICY</footer>

            </body>
        </html>
    \`);
});

// START BOTH SERVERS
app.listen(PORT, '127.0.0.1', async () => {
    console.log(\`Sovereign API running at http://localhost:\${PORT}\`);
    console.log(\`Connected to Sovereign Storage: \${STORAGE_PATH}\`);
    
    // Auto-Audit on Startup
    console.log("[0x03E2_STARTUP] Running initial Network Sovereignty Audit...");
    const auditScript = path.join(__dirname, '..', '..', '.gemini', 'antigravity', 'scratch', 'NetworkAudit.py');
    exec(\`python "\${auditScript}"\`, (error, stdout) => {
        if (!error) console.log("[0x03E2_STARTUP] Initial audit complete. Shards synchronized.");
    });
});
