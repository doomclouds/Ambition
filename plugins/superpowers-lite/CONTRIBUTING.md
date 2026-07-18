# 贡献指南

感谢你改进 Superpowers Lite。这个仓库只维护 Codex 中文版，提交前请守住以下边界。

## 内容规则

- 面向用户的文档、技能正文、提示词和错误消息使用简体中文。
- 使用英文代码注释；命令、API、变量、路径和协议字段保持原样。
- 技能 ID、目录名和 `SKILL.md` frontmatter 中的 `name` 必须稳定且一致。
- 不引入 hooks、MCP、apps 或其他代理平台适配目录。
- 保留 MIT 许可证、上游版权和来源说明。

## 翻译门禁

技能迁移或语义修改必须遵循 **RED → GREEN**：先在契约中写出必须保留的触发条件、
安全边界和执行顺序，观察测试因缺失行为而失败，再完成翻译并运行完整契约。字符串
扫描只是底线，提交前还要人工回读中文语义和相对链接。

## 验证

先切换到本文件所在的插件目录，再运行完整验证：

```powershell
$env:PYTHONIOENCODING = 'utf-8'
$env:PYTHONUTF8 = '1'
npm test
& 'C:\Program Files\Git\bin\bash.exe' .\tests\codex\test-runtime-scripts.sh
& 'C:\Program Files\Git\bin\bash.exe' .\tests\codex\test-package-codex-plugin.sh
```

打包脚本只从 Git 提交引用生成归档。需要验证尚未提交的脚本改动时，可以在测试中
显式使用 `--allow-dirty`，但正式产物必须从干净且已提交的 `HEAD` 生成。

## 提交

提交信息使用英文并遵循 **Conventional Commits**，例如：

```text
feat(skills): translate planning workflow
fix(packaging): preserve executable modes
docs: clarify Codex installation boundary
```

一个提交只解决一个清晰问题。提交前检查 `git diff --check`，不要顺手带入无关文件。
