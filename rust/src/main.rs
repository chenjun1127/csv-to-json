use regex::Regex;
use std::collections::HashMap;
use std::env;
use std::error::Error;
use std::fs::{self, File};
use std::io::Write;
use std::time::Instant;

type MyResult<T> = Result<T, Box<dyn Error>>;

fn main() -> MyResult<()> {
    let start = Instant::now();

    // 获取命令行参数
    let args: Vec<String> = env::args().collect();
    if args.len() != 3 {
        eprintln!("用法: {} <csv文件路径> <输出目录>", args[0]);
        std::process::exit(1);
    }

    let file_path = &args[1];
    let output_dir = &args[2];

    // 如果输出目录不存在，创建它
    fs::create_dir_all(output_dir)?;

    let lang_maps = csv_to_json_map(file_path)?;

    // 按语言写入独立 JSON 文件
    for (lang, map) in lang_maps {
        let json_data = serde_json::to_string_pretty(&map)?;
        let filename = format!("{}/{}.json", output_dir, lang);
        let mut file = File::create(&filename)?;
        file.write_all(json_data.as_bytes())?;
        println!("{} 已生成", filename);
    }

    let duration = start.elapsed();
    println!("程序总执行时间: {:.2?}", duration);
    Ok(())
}

fn csv_to_json_map(file_path: &str) -> MyResult<HashMap<String, HashMap<String, String>>> {
    let mut rdr = csv::Reader::from_path(file_path)?;
    let headers = rdr.headers()?.clone();

    let re = Regex::new(r"[\(（]([^）)]+)[\)）]").unwrap();

    let mut lang_maps: HashMap<String, HashMap<String, String>> = HashMap::new();

    for record_result in rdr.records() {
        let record = record_result?;
        let key = record.get(0).unwrap_or("").trim();
        if key.is_empty() {
            continue;
        }

        for i in 1..headers.len() {
            let header_raw = headers.get(i).unwrap_or("").trim();
            if header_raw.is_empty() {
                continue;
            }

            let lang = if let Some(caps) = re.captures(header_raw) {
                caps.get(1)
                    .map_or(header_raw.to_string(), |m| m.as_str().to_string())
            } else {
                header_raw.to_string()
            };

            let value = record.get(i).unwrap_or("").trim().to_string();
            lang_maps
                .entry(lang)
                .or_insert_with(HashMap::new)
                .insert(key.to_string(), value);
        }
    }

    Ok(lang_maps)
}
