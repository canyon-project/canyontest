# canyon

一个简单的 Rust 库，提供了一个 `add` 函数。

## 功能

- `add(a, b)`: 将两个数字相加

## 使用方法

在你的 `Cargo.toml` 中添加：

```toml
[dependencies]
canyon = "0.1.0"
```

然后在代码中使用：

```rust
use canyon::add;

fn main() {
    let result = add(2, 3);
    println!("2 + 3 = {}", result); // 输出: 2 + 3 = 5
}
```

## 文档

### 本地生成文档

```bash
# 生成文档并在浏览器中打开
cargo doc --open

# 或者只生成文档
cargo doc --no-deps
```

文档会生成在 `target/doc/canyon/index.html`

### 在线文档

发布到 crates.io 后，文档会自动在 docs.rs 上可用：
- 文档地址：https://docs.rs/canyon

## 发布到 crates.io

1. 在 crates.io 上获取 API token
2. 在 GitHub 仓库的 Settings > Secrets 中添加 `CARGO_REGISTRY_TOKEN`
3. 推送到 main 分支，GitHub Action 会自动发布到 crates.io
4. 发布后，docs.rs 会在几分钟内自动构建并托管文档

5. 
