import sqlite3
import json

conn = sqlite3.connect('../data/lumina.db')
cursor = conn.cursor()
cursor.execute("SELECT topic_performance_json, detailed_review_json FROM gap_analyses ORDER BY generated_at DESC LIMIT 1;")
row = cursor.fetchone()

print("Topic Performance:")
print(json.dumps(json.loads(row[0]), indent=2))
print("Detailed Review:")
print(json.dumps(json.loads(row[1]), indent=2))
