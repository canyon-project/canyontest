# canyontest

一个简单的 Rust 库，提供了一个 `add` 函数。

## 功能

- `add(a, b)`: 将两个数字相加

## 使用方法

在你的 `Cargo.toml` 中添加：

```toml
[dependencies]
canyontest = "0.1.0"
```

然后在代码中使用：

```rust
use canyontest::add;

fn main() {
    let result = add(2, 3);
    println!("2 + 3 = {}", result); // 输出: 2 + 3 = 5
}
```

## 发布到 crates.io

1. 在 crates.io 上获取 API token
2. 在 GitHub 仓库的 Settings > Secrets 中添加 `CARGO_REGISTRY_TOKEN`
3. 创建并发布一个 release，GitHub Action 会自动发布到 crates.io
