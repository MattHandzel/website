#!/usr/bin/env python3

import subprocess
import sys
from pathlib import Path

def run_command(cmd, cwd=None):
    """Run a command and return success status"""
    print(f"Running: {' '.join(cmd)}")
    try:
        result = subprocess.run(cmd, cwd=cwd, check=True, capture_output=True, text=True)
        print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {e}")
        print(f"stdout: {e.stdout}")
        print(f"stderr: {e.stderr}")
        return False

def main():
    """Complete build process: markdown → database → static files → website"""
    print("Starting complete build process...")
    
    base_dir = Path(__file__).parent
    data_processing_dir = base_dir / "data-processing"
    website_dir = base_dir / "website"
    
    print("\n=== Step 1: Processing markdown files to database ===")
    if not run_command([sys.executable, "main.py"], cwd=data_processing_dir):
        print("Failed to process markdown files")
        sys.exit(1)
    
    print("\n=== Step 2: Exporting database to static JSON files ===")
    if not run_command([sys.executable, "export_static_data.py"], cwd=data_processing_dir):
        print("Failed to export static data")
        sys.exit(1)
    
    print("\n=== Step 3: Building Next.js static site ===")
    if not run_command(["npm", "run", "build"], cwd=website_dir):
        print("Failed to build Next.js site")
        sys.exit(1)
    
    print("\n🎉 Build complete! Static website ready for deployment.")
    print(f"Static files available in: {website_dir / 'out'}")

if __name__ == "__main__":
    main()
