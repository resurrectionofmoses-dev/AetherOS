import json
import os
import subprocess
import time
from datetime import datetime

# AetherOS Sovereign Network Audit v1.0
THREAT_POOL = r"C:\Users\SonsofMan\.gemini\antigravity\scratch\AetherOS-VDP\cisa_threat_shards.json"
REPORT_DIR = r"C:\Users\SonsofMan\.gemini\antigravity\scratch\NetworkAudit"
API_URL = "http://localhost:5000/api/report"

def audit_network_infrastructure():
    print("--- [ SOVEREIGN_NETWORK_AUDIT_START ] ---")
    
    if not os.path.exists(REPORT_DIR):
        os.makedirs(REPORT_DIR)

    # 1. Correlate Local Hardware with Known Exploits
    print("[+] Analyzing Threat Pool for Hardware Signatures...")
    high_priority_threats = []
    
    if os.path.exists(THREAT_POOL):
        with open(THREAT_POOL, 'r', encoding='utf-8') as f:
            threats = json.load(f)
            for t in threats:
                vendor = t.get('vendor', '').lower()
                if 'cisco' in vendor or 'sonicwall' in vendor:
                    high_priority_threats.append(t)
    
    print(f"[!] Found {len(high_priority_threats)} potential exploit vectors for Cisco/SonicWall.")

    # 2. Network Reachability Check
    devices_to_probe = [
        {"name": "Cisco Core Switch", "ip": "192.168.1.254"},
        {"name": "SonicWall TZ Firewall", "ip": "192.168.1.1"}
    ]
    
    probe_results = []

    for device in devices_to_probe:
        print(f"[*] Probing {device['name']} ({device['ip']})...")
        # In PowerShell/Windows 'ping' returns 0 on success
        res = subprocess.run(["ping", "-n", "1", device['ip']], capture_output=True)
        is_online = (res.returncode == 0)
        device_status = "ONLINE" if is_online else "OFFLINE/STEALTH"
        probe_results.append({
            "name": device['name'],
            "ip": device['ip'],
            "status": device_status
        })
        print(f"    Result: {device_status}")

    audit_results = {
        "timestamp": datetime.now().isoformat(),
        "status": "COMPLETED",
        "devices": probe_results,
        "high_priority_cves": high_priority_threats[:5] if len(high_priority_threats) >= 5 else high_priority_threats
    }

    # 3. Generate Forensic Shard
    report_file = os.path.join(REPORT_DIR, f"audit_{int(time.time())}.json")
    with open(report_file, 'w') as f:
        json.dump(audit_results, f, indent=4)
    
    print(f"--- [ AUDIT_COMPLETE ] ---")
    print(f"Report saved to: {report_file}")
    
    # Proactive Suggestion for ACL Deployment
    if len(high_priority_threats) > 0:
        print("\n[RECOMMENDATION] High-density exploit pool detected. Recommend deploying Sovereign ACLs via Dashboard.")

if __name__ == "__main__":
    audit_network_infrastructure()
