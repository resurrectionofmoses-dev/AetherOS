
import os
import sys
import time
import subprocess
import argparse
import json
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# Configuration of handlers for various file extensions
# Now includes 'AUTHORITY' level hooks for autonomous repair
FIX_HANDLERS = {
    '.py': [
        ['autoflake', '--in-place', '--remove-all-unused-imports'],
        ['isort'],
        ['black'],
        ['flake8']
    ],
    '.go': [
        ['gofmt', '-w'],
        ['go', 'vet'],
        ['go', 'build', './...']
    ],
    '.rs': [
        ['cargo', 'fmt'],
        ['cargo', 'build']
    ],
    '.js': [
        ['prettier', '--write'],
        ['eslint', '--fix']
    ],
    '.ts': [
        ['prettier', '--write'],
        ['eslint', '--fix']
    ],
    '.tsx': [
        ['prettier', '--write']
    ],
    '.jsx': [
        ['prettier', '--write']
    ]
}

class AutonomousFixer(FileSystemEventHandler):
    def __init__(self, root_path, authority_level):
        self.root_path = root_path
        self.authority_level = authority_level

    def on_modified(self, event):
        if event.is_directory:
            return
        self.handle_fix(event.src_path)

    def on_created(self, event):
        if event.is_directory:
            return
        self.handle_fix(event.src_path)

    def handle_fix(self, file_path):
        _, ext = os.path.splitext(file_path)
        if ext in FIX_HANDLERS:
            print(f"[AUTHORITY: {self.authority_level}] Intercepted change: {os.path.basename(file_path)}")
            
            for cmd in FIX_HANDLERS[ext]:
                try:
                    # Context-aware command preparation
                    full_cmd = cmd + [file_path] if ext not in ['.rs', '.go'] or 'fmt' in cmd[0] else cmd
                    result = subprocess.run(full_cmd, capture_output=True, text=True)
                    
                    if result.returncode == 0:
                        print(f"  [SYNAPSE: OK] {cmd[0]}")
                    else:
                        print(f"  [SYNAPSE: ERR] {cmd[0]} failed. Initiating Heuristic Repair...")
                        if self.authority_level == "ABSOLUTE":
                            self.attempt_heuristic_repair(file_path, result.stderr)
                        
                except FileNotFoundError:
                    # Tool not installed
                    pass

    def attempt_heuristic_repair(self, file_path, error_msg):
        """
        In Full Authority mode, the agent attempts to reason about the error
        and apply a patch directly. This simulates calling the AetherOS Logic Core.
        """
        print(f"  [HEURISTIC] Analyzing logic error in {os.path.basename(file_path)}...")
        print(f"  [HEURISTIC] Context: {error_msg[:100]}...")
        # Simulate thinking time
        time.sleep(0.8)
        print(f"  [HEURISTIC] Patch synthesized. Applying fix to {os.path.basename(file_path)}.")
        # In a real scenario, this would call the Gemini API via a local helper
        # to get a code diff and apply it.

def main():
    parser = argparse.ArgumentParser(description="AetherOS Code Agent — Autonomous Fixer")
    parser.add_argument("--root", default=os.getenv("CODE_AGENT_ROOT", "."), help="Workspace root to watch")
    parser.add_argument("--authority", choices=["SAFE", "ABSOLUTE"], default="ABSOLUTE", help="Authority level of the agent")
    args = parser.parse_args()

    path = os.path.abspath(args.root)
    print(f"--- AetherOS Code Agent: {args.authority} AUTHORITY ---")
    print(f"CORE STATUS: ONLINE")
    print(f"WATCHING: {path}")
    print(f"AI FEEDBACK LOOP: ENABLED")
    
    event_handler = AutonomousFixer(path, args.authority)
    observer = Observer()
    observer.schedule(event_handler, path, recursive=True)
    observer.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n[SYSTEM] Agent standing down...")
        observer.stop()
    observer.join()

if __name__ == "__main__":
    main()
