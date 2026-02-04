#!/bin/bash

# 获取当前时间作为 commit message
COMMIT_MSG=$(date '+%Y-%m-%d %H:%M:%S')

# 执行 git add .
git add .

# 执行 git commit，使用当前时间作为 commit message
git commit -m "$COMMIT_MSG"

echo "✅ 已提交: $COMMIT_MSG"
