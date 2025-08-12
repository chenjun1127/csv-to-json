import csv
import json
import re
import os
import time

start_time = time.time()  # 记录开始时间

input_csv = "../1.csv"
output_dir = "../output"

print("🚀 开始读取 CSV 文件...")

with open(input_csv, newline='', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)

    # 找到所有语言列，提取语言代码
    lang_data = {}
    for field in reader.fieldnames:
        if field == "key" or not field.strip():
            continue

        match = re.search(r"[（(](.*?)[)）]", field)
        if match:
            code = match.group(1)  # 提取括号内的语言代码，如 zh_CN, en_US
            lang_data[code] = {"column": field, "translations": {}}
        else:
            # 如果没括号，用字段名本身做代码（可选）
            lang_data[field] = {"column": field, "translations": {}}

    print(f"🈶️ 检测到语言代码: {list(lang_data.keys())}")

    # 读取数据
    count = 0
    for row in reader:
        key = row["key"].strip()
        if not key:
            continue
        count += 1

        for code, info in lang_data.items():
            value = row.get(info["column"], "").strip()
            if value:
                info["translations"][key] = value

print(f"📝 共处理 {count} 个有效key")
os.makedirs(output_dir, exist_ok=True)
# 写文件
for code, info in lang_data.items():
    data = info["translations"]
    if data:
        output_path = os.path.join(output_dir, f"{code}.json")
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"✅ 写入 {output_path} 成功，包含 {len(data)} 条翻译")
    else:
        print(f"⚠️ 语言代码 {code} 没有翻译数据，跳过生成文件")

end_time = time.time()  # 记录结束时间
print(f"🏁 处理完成，耗时 {end_time - start_time:.4f} 秒")
