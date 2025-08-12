# CSV to JSON Converter

这是一个用 Rust 编写的简单工具，用于将带语言列的 CSV 文件转换成多个 JSON 文件。  
每个 JSON 文件对应一种语言，保存该语言下所有 key 的翻译内容。

---

## 功能特点

- 自动识别 CSV 头部包含语言代码（如 `(zh_CN)`、`(en_US)`）的列名  
- 支持多语言同时转换，分别生成对应 JSON 文件  
- 支持自定义输入 CSV 文件路径和输出目录  
- 跨平台支持 Windows、macOS 和 Linux  
- Windows 平台下双击运行时自动等待，避免窗口闪退  

---

## 使用说明

### 编译

确保安装了 Rust 开发环境，然后执行：

```bash
cargo build --release
```
编译后生成的可执行文件在：
```bash
target/release/csv_to_json(.exe)
...
```

## 运行
### 命令行运行
```bash
# 语法
csv_to_json <csv文件路径> <输出目录>

# 示例（Windows PowerShell）
.\csv_to_json.exe ..\..\1.csv ..\..\output

# 示例（Linux/macOS 终端）
./csv_to_json ../../1.csv ../../output

```
* <csv文件路径>：待转换的 CSV 文件路径
* <输出目录>：生成的 JSON 文件保存目录，程序会自动创建

### 开发调试（使用 cargo run）
```bash
cargo run -- ../1.csv ../output
```
## 注意事项
* Windows 平台双击运行 exe，会在程序结束后等待按回车，避免窗口一闪而过。
* Linux/macOS 终端无需额外操作，运行后终端保持输出。
* 输入 CSV 文件应包含 key 列作为翻译键，语言列名格式建议带括号，如 Name(zh_CN)。