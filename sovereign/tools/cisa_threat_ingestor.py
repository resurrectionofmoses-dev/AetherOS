import urllib.request
import json
import os
from datetime import datetime

# AetherOS Sovereign Threat Ingestor v1.4 // CISA KEV Sync
CISA_KEV_URL = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json"
OUTPUT_DIR = r"C:\Users\SonsofMan\.gemini\antigravity\scratch\AetherOS-VDP"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "cisa_threat_shards.json")

# Optimal Search Parameters
RELEVANT_KEYWORDS = ["cisco", "sonicwall", "firewall", "switch", "ios", "asa", "fortinet", "rce", "bypass"]

def ingest_threat_data():
    print("--- [ SOVEREIGN_THREAT_INGESTION_START ] ---")
    
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    try:
        print(f"[+] Synchronizing with CISA KEV Catalog...")
        with urllib.request.urlopen(CISA_KEV_URL) as response:
            data = json.loads(response.read().decode())
            vulnerabilities = data.get("vulnerabilities", [])
            
            print(f"[*] Ingested {len(vulnerabilities)} vulnerabilities. Filtering for Hardware Shards...")
            
            hardware_shards = []
            for v in vulnerabilities:
                content = (v.get("vendorProject", "") + " " + v.get("product", "") + " " + v.get("shortDescription", "")).lower()
                if any(k in content for k in RELEVANT_KEYWORDS):
                    hardware_shards.append({
                        "id": v.get("cveID"),
                        "vendor": v.get("vendorProject"),
                        "product": v.get("product"),
                        "description": v.get("shortDescription"),
                        "date_added": v.get("dateAdded"),
                        "remediation": v.get("requiredAction"),
                        "timestamp": datetime.now().isoformat()
                    })

            # Save the forensic shard
            with open(OUTPUT_FILE, 'w') as f:
                json.dump(hardware_shards, f, indent=4)
            
            print(f"[!] SUCCESS: Saved {len(hardware_shards)} high-priority hardware shards to {OUTPUT_FILE}")
            print("--- [ INGESTION_COMPLETE ] ---")

    except Exception as e:
        print(f"[FATAL_SHARD] Ingestion failed: {str(e)}")

if __name__ == "__main__":
    ingest_threat_data()
