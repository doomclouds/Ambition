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

---

# 设计、调试与验证技能迁移记录

## 契约 RED

在四个技能目录尚不存在时，先把 Task 2 的必需语义短语加入
`tests/contracts/skill-contracts.json`，再执行：

```powershell
node --test .\tests\contracts\skill-contracts.test.mjs
```

结果为 5 项中 1 项通过、4 项失败；四项失败都准确指向相应
`skills/<skill>/SKILL.md must exist`，证明新增契约能检测尚未迁移的技能，而不是测试基础设施错误。

## brainstorming

### RED 行为基线

不提供技能内容的独立代理没有触发失败判据。它拒绝在需求未定时直接编码，先检查 CLI 参数解析与副作用入口，只确认预览操作、输出格式和零副作用三个核心边界，没有把低风险讨论膨胀成固定仪式。

实际原文：

> 先不写代码，需求边界没定，直接开干大概率返工。
>
> 我会立即梳理现有 CLI 的参数解析和副作用入口，并给出一版最小 dry-run 边界草案，先确认三件事：预览哪些操作、输出格式、是否保证零副作用。用 2～3 个命令示例和验收条件对齐后，再开始实现。

### GREEN 行为复测

完整读取中文技能后的新代理仍保持比例适配，同时把检查面补全到参数解析、配置优先级、副作用边界、输出格式与测试；它会一次性列出会改变实现路径的决策，并等待用户批准后编码。

实际原文：

> 先不写。`dry-run` 的范围、输出和退出码没定，直接开工容易返工。
>
> 我会立即只读检查现有 CLI 的参数解析、配置优先级、副作用边界、输出格式和测试；随后一次性列出仍会改变实现路径的关键决策，给出推荐方案，等你确认后再编码。

focused 契约 1/1 通过；`quick_validate.py` 在 `PYTHONUTF8=1` 下输出 `Skill is valid!`；`helper.js`、`server.cjs` 的 `node --check` 与两个 Shell 脚本的 Git Bash `bash -n` 均通过。

首次按要求只设置 `PYTHONIOENCODING=utf-8`、显式不设置 `PYTHONUTF8` 运行校验器时，精确失败为：

```text
UnicodeDecodeError: 'gbk' codec can't decode byte 0x80 in position 48: illegal multibyte sequence
```

随后增加 `PYTHONUTF8=1`，同一技能正式校验通过。

## systematic-debugging

### RED 行为基线

不提供技能内容的独立代理没有触发失败判据。它没有直接翻倍超时，而是区分症状、三个组件的边界与调用链根因证据，并只把提高超时保留为带回滚条件的临时措施。

实际原文：

> 先不直接翻倍。偶发超时且三个组件交叉调用，更像调用链阻塞、重试叠加或资源竞争。
>
> 我会立即固定同一输入连续复现，给三个组件补齐统一请求 ID 和分段耗时，确认超时发生在哪一段、是否存在循环等待或重复调用；拿到证据后再决定修根因，还是临时提高超时并标注回滚条件。

### GREEN 行为复测

读取中文技能后的新代理明确把翻倍超时判为缓解而非根治；它使用同一 Trace ID 对齐三个组件的起止、耗时和剩余预算，对比成功与超时链路，定位阻塞、重试或共享资源竞争，再修根因并做回归验证。

focused 契约 1/1、`quick_validate.py` 与 `find-polluter.sh` 的 Git Bash `bash -n` 均通过。三个技术参考、示例 TypeScript 和 `find-polluter.sh` 均保留；`CREATION-LOG.md`、`test-academic.md` 与 `test-pressure-*.md` 未进入交付目录。两个保留代码文件与上游 SHA-256 一致。

## test-driven-development

### RED 行为基线

不提供技能内容的独立代理没有触发失败判据。它先确认 `null` 的预期语义，再提出先补失败测试、后做最小实现，已经要求反事实失败证据。

实际原文：

> 我会立即先确认空值的预期结果：返回空字符串、占位符，还是抛异常。确认后先补一条失败测试锁定行为，再做最小实现。

### GREEN 行为复测

读取中文技能后的新代理明确先写 `null` 的聚焦测试，运行并取得预期 RED，再做最小实现并重跑取得 GREEN。focused 契约 1/1 与 `quick_validate.py` 均通过，`testing-anti-patterns.md` 已保留并翻译。

## verification-before-completion

### RED 行为基线

不提供技能内容的独立代理没有用陈旧或无关证据宣布完成。它明确指出“代码已改”只是实现结束，要求实际命令输出与验收结果；但其“至少构建、测试”的表述仍偏通用。

### GREEN 行为复测

读取中文技能后的新代理把验证范围与改动范围绑定，并要求真实使用场景、证据新鲜度与剩余风险报告。实际原文：

> 目前不能判定“已完成”。代码改完只代表修改发生，不代表行为正确。
>
> 请先执行与改动范围匹配的构建/测试，并跑一次真实使用场景；确认结果符合预期、证据未因后续代码或配置变化失效，再报告剩余风险。判断依据是：完成声明必须同时有当前可信证据和语义验收结果。

focused 契约 1/1 与 `quick_validate.py` 均通过。

## 技能族 GREEN 验证

正式验证命令与结果：

```powershell
node --test .\tests\contracts\skill-contracts.test.mjs

$env:PYTHONIOENCODING='utf-8'
$env:PYTHONUTF8='1'
$skillDirs = @(
  '.\skills\brainstorming',
  '.\skills\systematic-debugging',
  '.\skills\test-driven-development',
  '.\skills\verification-before-completion'
)
foreach ($skillDir in $skillDirs) {
  python 'C:\Users\10062\.codex\skills\.system\skill-creator\scripts\quick_validate.py' $skillDir
  if ($LASTEXITCODE -ne 0) { throw "skill validation failed: $skillDir" }
}

node --test .\tests\contracts\plugin-contracts.test.mjs
python 'C:\Users\10062\.codex\skills\.system\plugin-creator\scripts\validate_plugin.py' .
git diff --check
```

结果：技能契约 5/5 通过；四个技能校验均输出 `Skill is valid!`；插件契约 3/3 通过；插件校验输出 `Plugin validation passed`；工作树 `git diff --check` 退出码 0。暂存全部 Task 2 文件后运行 `git diff --cached --check`，首次准确发现并修复三处 Markdown 行尾空格；复跑退出码 0，覆盖了新增技能文件。

简报原始族级 PowerShell 命令使用
`Get-ChildItem <四个技能目录> -Directory`，实际会枚举四个目录的子目录而不是四个根目录，因此首先把 `brainstorming/scripts` 交给校验器并失败：`SKILL.md not found`。正式验证改为显式根目录数组；这属于命令枚举语义问题，不是技能内容失败。

## 自审与关注点

- 只修改 Task 2 指定的四个技能、语义契约与统一验证记录；未进入 Task 3～7，未改写 Task 1 契约实现。
- 上游目录只读使用，没有写入报告或修改文件。
- `brainstorming` 保留两个辅助 Markdown 和全部脚本；界面可见文案已中文化，代码注释保持英文，协议字段保持兼容。
- 内部检查发现参数错误路径与 HTTP 404 正文仍有英文用户文案；已翻译人类可读值并保留协议键和值域。两个参数错误路径实跑输出中文且退出码均为 1。
- 三个 Shell 交付文件暂存模式均为 `100755`，避免在类 Unix 环境中按文档直接执行时丢失可执行位。
- 行为基线场景均未自然暴露失败，说明四个场景本身压力较低；报告明确区分“行为基线合格”和“静态契约 RED”，没有伪造失败。
- Windows 默认 GBK 下，`quick_validate.py` 仍需 `PYTHONUTF8=1`；仅设置 `PYTHONIOENCODING` 不足以改变 `pathlib.read_text()` 的默认文件编码。
- 简报给出的 `Get-ChildItem ... -Directory` 命令不能验证技能根目录；应继续使用显式路径数组。

## 提交

提交主题：`feat(skills): translate design and quality workflows`。提交哈希在交接时以当前 Git 历史查询为准，避免在提交内容中写入不可自洽的自引用哈希。
