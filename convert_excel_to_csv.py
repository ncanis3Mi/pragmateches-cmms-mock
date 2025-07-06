#!/usr/bin/env python3
import subprocess
import sys

# Try to import required libraries
try:
    import pandas as pd
except ImportError:
    print("pandas not installed, trying to install...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "--user", "--break-system-packages", "pandas", "openpyxl"])
    import pandas as pd

# Convert Excel files to CSV
excel_files = [
    "肉厚測定データ_デモ.csv",
    "設備別リスク評価_非許容比率調整済.csv"
]

for file in excel_files:
    try:
        # Read Excel file
        df = pd.read_excel(file, engine='openpyxl')
        
        # Create CSV filename
        csv_filename = file.replace('.csv', '_converted.csv')
        
        # Save as CSV
        df.to_csv(csv_filename, index=False, encoding='utf-8')
        print(f"Converted {file} to {csv_filename}")
        
        # Display first few rows
        print(f"\nFirst 5 rows of {csv_filename}:")
        print(df.head())
        print("\n" + "-"*50 + "\n")
        
    except Exception as e:
        print(f"Error converting {file}: {e}")