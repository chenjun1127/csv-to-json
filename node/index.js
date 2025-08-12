const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const inputCsv = '../1.csv';
const outputDir = '../output';

console.time('程序执行时间');
console.log('🚀 开始读取 CSV 文件...');

const langData = {};
let headers = [];
let processedRows = 0;
let validRows = 0;

fs.createReadStream(inputCsv, { encoding: 'utf8' })
  .pipe(
    csv({
      skipEmptyLines: true, // 跳过空行
      skipLinesWithError: true, // 跳过有错误的行
      stripBomOnFirstLine: true // 移除BOM
    })
  )
  .on('headers', hdrs => {
    headers = hdrs;

    for (const field of headers) {
      const cleanField = field.trim();

      if (cleanField.toLowerCase() === 'key' || !cleanField) {
        continue;
      }

      const match = cleanField.match(/[\(（](.*?)[\)）]/);
      const code = match ? match[1] : cleanField;

      langData[code] = { column: cleanField, translations: {} };
    }

    console.log('🈶️ 检测到语言代码:', Object.keys(langData));
  })
  .on('data', row => {
    processedRows++;
    let key = '';
    // 如果前面都没有，尝试第一个字段
    const firstField = Object.keys(row)[0];
    if (firstField && row[firstField]) {
      key = row[firstField].trim();
    }

    if (!key) {
      return;
    }

    validRows++;

    for (const [_, info] of Object.entries(langData)) {
      const rawVal = row[info.column];
      const value = (rawVal || '').trim();

      if (value) {
        info.translations[key] = value;
      }
    }
  })
  .on('end', () => {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    console.log(`\n📊 处理统计: 总行数 ${processedRows}, 有效行数 ${validRows}`);
    for (const [code, info] of Object.entries(langData)) {
      const data = info.translations;

      if (Object.keys(data).length > 0) {
        const outputPath = path.join(outputDir, `${code}.json`);
        fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
        console.log(`✅ ${code}.json 写入成功，包含 ${Object.keys(data).length} 条翻译`);
      } else {
        console.log(`⚠️ 语言代码 ${code} 没有翻译数据，跳过生成文件`);
      }
    }
    console.log('🏁 处理完成');
    console.timeEnd('程序执行时间');
  })
  .on('error', err => {
    console.error('❌ 处理过程中出错:', err);
  });
