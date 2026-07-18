# using-superpowers 技能迁移验证记录

日期：2026-07-18

## using-superpowers / RED

未读取目标技能的独立代理在五行 README 文案修正场景中，没有机械展开完整工作流，
保持了任务比例：确认用户已授权本地修改、检查工作目录与未提交改动、只改指定文案，
再用 `git diff` 和回读验证。它明确保留了权限与验证边界：不涉及网络、发布、删除或
外部系统；README 纯文案通常不运行构建，但会说明原因。

实际选择原文：`本地受控编辑；先核对目标与脏改动，最小修改后用 diff 和回读验证。`

## 契约 RED

执行 `node --test .\\tests\\contracts\\plugin-contracts.test.mjs` 时，三个插件契约均因
目标文件缺失失败：`.codex-plugin/plugin.json`、`.agents/plugins/marketplace.json` 和
`LICENSE` 均不存在。执行技能契约测试时，在 Node.js 24 中先发现简报给出的 Unicode
正则含无效的 `\\"` 转义；将字符类改成等价的 `["']` 后复跑，测试按预期因
`skills/using-superpowers/SKILL.md` 不存在失败。

## using-superpowers / GREEN

完整读取目标技能后的独立代理仍保持比例适配，而没有因技能存在而扩展为完整工程流程：
它确认用户只授权 README 五行修改，先核对目标与脏改动，只改指定五行，随后用 `git diff`
和 UTF-8 回读验证；明确不运行构建或测试、不提交、不推送，也不做外部操作。

实际选择原文：

> 这是用户已授权的 README 五行文案修正。我会先确认目标文件和现有未提交改动，仅修改指定五行；随后用 `git diff` 与 UTF-8 回读核对。该改动不影响运行行为，因此不运行构建或测试，也不会提交、推送或执行任何外部操作。

## GREEN 验证

执行命令：

```powershell
node --test .\tests\contracts\plugin-contracts.test.mjs
node --test .\tests\contracts\skill-contracts.test.mjs
$env:PYTHONIOENCODING='utf-8'
python 'C:\Users\10062\.codex\skills\.system\plugin-creator\scripts\validate_plugin.py' .
$env:PYTHONUTF8='1'
python 'C:\Users\10062\.codex\skills\.system\skill-creator\scripts\quick_validate.py' .\skills\using-superpowers
```

完整结果摘要：

- `plugin-contracts.test.mjs`：3/3 通过，退出码 0；确认批准身份、无 `hooks/apps/mcpServers`、唯一市场条目、MIT 许可证以及无非 Codex 根目录适配器。
- `skill-contracts.test.mjs`：1/1 通过，退出码 0；确认 frontmatter、中文正文、五个语义短语和 Markdown 相对链接。
- `validate_plugin.py .`：退出码 0，输出 `Plugin validation passed`；未报告 `plugin.json field hooks is not accepted`。
- `quick_validate.py .\skills\using-superpowers`：在 `PYTHONUTF8=1` 下退出码 0，输出 `Skill is valid!`。

首次按简报命令运行 `quick_validate.py` 在当前 Windows 默认 GBK 文件解码下失败；这是校验脚本未显式 UTF-8 读取技能文件造成的环境编码问题，设置 `PYTHONUTF8=1` 后同一脚本通过。

## 自审

- 交付面仅含 Codex manifest、市场条目、资源、技能、契约测试和验证记录；未引入 hooks、apps、MCP 或其他平台目录。
- `using-superpowers` 仅保留 Codex 工具参考，正文包含任务比例、单主工作流、二次加载条件，以及权限、安全、验证硬门禁。
- 两个资源和 LICENSE 均与上游 SHA-256 一致；只读上游目录未被修改。
- `git diff --check` 通过。

## 提交

交付提交主题：`feat(plugin): add Codex-only plugin scaffold`。

提交哈希属于 Git 历史元数据，交接时以 `git log --oneline` 或当前 `HEAD` 查询为准；验证
记录不嵌入会因后续 amend 而失效的自引用哈希。

## 关注点

- `quick_validate.py` 在此 Windows 环境需要 `PYTHONUTF8=1` 才能正确读取 UTF-8 中文技能；这不影响插件或技能内容，但后续验证应保留该环境变量。
- 简报中的 skill-contracts 正则在当前 Node.js 24 中含不兼容的 Unicode 转义；已改为等价字符类 `["']`，使测试能够真正检查缺失技能与后续契约。
