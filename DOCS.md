# 文档生成指南

## 本地生成和查看文档

### 生成文档

使用 `cargo doc` 命令生成文档：

```bash
# 生成文档（包括依赖）
cargo doc

# 只生成当前项目的文档（不包括依赖）
cargo doc --no-deps

# 生成文档并在浏览器中打开
cargo doc --open

# 生成文档但不打开浏览器
cargo doc --no-deps && echo "文档已生成到 target/doc/canyontest/index.html"
```

### 查看文档

文档生成后，可以在以下位置找到：
- HTML 文档：`target/doc/canyontest/index.html`
- 使用 `cargo doc --open` 会自动在浏览器中打开

## 文档注释语法

Rust 使用特殊的注释语法来生成文档：

### 函数文档

```rust
/// 这是函数的文档注释
/// 
/// # Arguments
/// 
/// * `param1` - 参数1的描述
/// * `param2` - 参数2的描述
/// 
/// # Returns
/// 
/// 返回值的描述
/// 
/// # Examples
/// 
/// ```
/// use canyontest::add;
/// assert_eq!(add(2, 3), 5);
/// ```
pub fn my_function(param1: i32, param2: i32) -> i32 {
    // 实现
}
```

### 库/模块文档

```rust
//! 这是库级别的文档注释
//! 使用 `//!` 而不是 `///`
//!
//! # 示例
//!
//! ```
//! use canyontest::add;
//! let result = add(1, 2);
//! ```
```

## 发布到 docs.rs

当你将包发布到 crates.io 后，**docs.rs 会自动构建和托管你的文档**！

1. **发布到 crates.io**：使用 GitHub Action 或手动运行 `cargo publish`
2. **等待构建**：docs.rs 通常在几分钟内自动构建文档
3. **访问文档**：文档会在 `https://docs.rs/canyontest/0.1.0/` 自动可用

### docs.rs 自动文档的特点

- ✅ 自动为每个版本生成文档
- ✅ 支持文档中的代码示例测试
- ✅ 自动链接到依赖的文档
- ✅ 支持搜索功能
- ✅ 版本化：每个版本都有独立的文档页面

### 确保文档构建成功

docs.rs 构建失败时，常见原因：
- 缺少必需的依赖
- 文档中的代码示例无法编译
- 需要特殊的构建配置

如果遇到问题，可以在 `Cargo.toml` 中添加：

```toml
[package.metadata.docs.rs]
# 启用所有特性（如果需要）
all-features = true
# 或者指定特定的特性
# features = ["feature1", "feature2"]
```

## 文档最佳实践

1. **为所有公共 API 添加文档**：使用 `///` 注释
2. **包含示例**：在 `# Examples` 部分添加使用示例
3. **解释参数和返回值**：使用 `# Arguments` 和 `# Returns`
4. **测试文档示例**：文档中的代码示例会在 `cargo test` 时自动测试
5. **使用 Markdown**：文档注释支持完整的 Markdown 语法

## 有用的命令

```bash
# 测试文档中的代码示例
cargo test --doc

# 只运行文档测试
cargo test --doc --lib

# 检查文档链接是否有效
cargo doc --no-deps --document-private-items
```
