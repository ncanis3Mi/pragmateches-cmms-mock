#!/usr/bin/env python3
import pandas as pd
import os

# Process thickness measurement data
thickness_file = "肉厚測定データ_デモ_converted.csv"
risk_file = "設備別リスク評価_非許容比率調整済.csv"

# Read thickness measurement data
df_thickness = pd.read_csv(thickness_file)
print(f"Processing {len(df_thickness)} thickness measurement records...")

# Generate SQL for thickness measurements
sql_thickness = "-- 肉厚測定データ\n"
for index, row in df_thickness.iterrows():
    sql_thickness += f"""INSERT INTO thickness_measurement ("機器ID", "測定点ID", "検査日", "設計肉厚(mm)", "最小許容肉厚(mm)", "測定値(mm)", "判定結果") VALUES (
    '{row['機器ID']}', '{row['測定点ID']}', '{row['検査日']}', {row['設計肉厚(mm)']}, {row['最小許容肉厚(mm)']}, {row['測定値(mm)']}, '{row['判定結果']}'
);\n"""

# Read risk assessment data
df_risk = pd.read_csv(risk_file)
print(f"Processing {len(df_risk)} risk assessment records...")

# Generate SQL for risk assessments
sql_risk = "\n-- 設備別リスク評価\n"
for index, row in df_risk.iterrows():
    sql_risk += f"""INSERT INTO equipment_risk_assessment ("機器ID", "評価年", "リスクシナリオ", "評価タイミング", "緩和策", "信頼性ランク（5段階）", "影響度ランク（5段階）", "リスクスコア（再計算）", "リスクレベル（5段階）", "リスク許容性") VALUES (
    '{row['機器ID']}', '{row['評価年']}', '{row['リスクシナリオ']}', '{row['評価タイミング']}', '{row['緩和策']}', '{row['信頼性ランク（5段階）']}', '{row['影響度ランク（5段階）']}', {row['リスクスコア（再計算）']}, '{row['リスクレベル（5段階）']}', '{row['リスク許容性']}'
);\n"""

# Combine all SQL
complete_sql = sql_thickness + sql_risk

# Write to file
output_file = "supabase/migrations/20250704_insert_thickness_and_risk_data.sql"
with open(output_file, 'w', encoding='utf-8') as f:
    f.write(complete_sql)

print(f"\nSQL file created: {output_file}")
print(f"Total records: {len(df_thickness) + len(df_risk)}")