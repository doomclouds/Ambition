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

---

# 计划、委派、评审与技能创作迁移记录

## 批次契约 RED

在 9 个目标技能目录尚不存在时，一次性把 Tasks 3～5 的全部必需短语写入
`tests/contracts/skill-contracts.json`，并把精确 14 技能清单写入
`tests/contracts/skill-contracts.test.mjs`。随后执行：

```powershell
$env:PYTHONIOENCODING='utf-8'
$env:PYTHONUTF8='1'
node --test .\tests\contracts\skill-contracts.test.mjs
```

结果：15 个测试中 5 个通过、10 个失败。9 个失败分别准确指出目标
`skills/<name>/SKILL.md must exist`，另 1 个失败显示实际目录只有既有 5 项、缺少批准清单中的
9 项。失败来自待迁移技能缺失，不是语法、编码或测试基础设施错误。

## 批量迁移边界

迁移并中文化这些技能：

1. `writing-plans`
2. `executing-plans`
3. `using-git-worktrees`
4. `finishing-a-development-branch`
5. `dispatching-parallel-agents`
6. `subagent-driven-development`
7. `requesting-code-review`
8. `receiving-code-review`
9. `writing-skills`

保留 `writing-plans/plan-document-reviewer-prompt.md`，`subagent-driven-development` 的两个提示词和
三个脚本，`requesting-code-review/code-reviewer.md`，以及 `writing-skills` 的三个辅助 Markdown、
`graphviz-conventions.dot` 和 `render-graphs.js`。未迁入上游未被运行面引用的
`writing-skills/examples/`。

所有技能描述均以 `Use when` 开头并含中文触发条件。代理称谓、调度方式和权限改为 Codex
语境；Git 示例使用独立跨平台 Git 命令，未加入 PowerShell `&&`；分支收尾没有自动 push。

## 精确 14 技能清单

- `brainstorming`
- `dispatching-parallel-agents`
- `executing-plans`
- `finishing-a-development-branch`
- `receiving-code-review`
- `requesting-code-review`
- `subagent-driven-development`
- `systematic-debugging`
- `test-driven-development`
- `using-git-worktrees`
- `using-superpowers`
- `verification-before-completion`
- `writing-plans`
- `writing-skills`

测试对实际技能目录排序后与该清单做深度相等比较；缺失或多余目录都会失败。

## 统一 GREEN

执行技能契约：

```powershell
node --test .\tests\contracts\skill-contracts.test.mjs
```

结果为 15/15 通过、0 失败：精确目录清单 1 项，14 个技能契约 14 项。

对全部 14 个技能使用显式目录数组执行 `quick_validate.py`，没有依赖
`Get-ChildItem` 多路径 `-Directory` 的枚举语义：

```powershell
$env:PYTHONIOENCODING='utf-8'
$env:PYTHONUTF8='1'
$skillDirs = @(
  '.\skills\brainstorming',
  '.\skills\dispatching-parallel-agents',
  '.\skills\executing-plans',
  '.\skills\finishing-a-development-branch',
  '.\skills\receiving-code-review',
  '.\skills\requesting-code-review',
  '.\skills\subagent-driven-development',
  '.\skills\systematic-debugging',
  '.\skills\test-driven-development',
  '.\skills\using-git-worktrees',
  '.\skills\using-superpowers',
  '.\skills\verification-before-completion',
  '.\skills\writing-plans',
  '.\skills\writing-skills'
)
foreach ($skillDir in $skillDirs) {
  python 'C:\Users\10062\.codex\skills\.system\skill-creator\scripts\quick_validate.py' $skillDir
  if ($LASTEXITCODE -ne 0) { throw "skill validation failed: $skillDir" }
}
```

结果：14 次均输出 `Skill is valid!`，循环退出码 0。

脚本验证：

- `render-graphs.js` 的 `node --check` 通过；仓库声明 `type: module`，因此脚本已从上游
  CommonJS 调整为原生 ESM。实跑进入依赖检测并用中文报告缺少 Graphviz `dot`；当前环境无法生成 SVG。
- 三份 SDD Bash 脚本经 Git Bash `bash -n` 全部通过。
- `sdd-workspace` 实跑正确解析当前 worktree 的 `.superpowers/sdd`。
- `task-brief` 从 Task 3 简报抽取 51 行，并验证标题匹配。
- `review-package HEAD HEAD` 生成 7 行只读评审包，并验证中文标题；临时工件随后删除。

## 人工语义筛选

按简报 9 个场景逐项检查正文和模板：

| 技能 | 观察结论 |
|---|---|
| `writing-plans` | 计划模板包含精确路径、接口、命令/实现要点、语义验收、恢复状态和开放决策；上下文压缩后可交接。 |
| `executing-plans` | 先核对现状并调整陈旧步骤；高影响阻塞或权限歧义才暂停，不擅自扩权。 |
| `using-git-worktrees` | 先用 Git 命令检测现有隔离，再优先 Codex 原生 worktree 能力；隔离无净收益时不强制创建。 |
| `finishing-a-development-branch` | 先确认真实分支、仓库策略和权限；合并、PR、保留、丢弃及 push 均不自动执行。 |
| `dispatching-parallel-agents` | 共享同一文件时先评估独立性、协调成本和净收益；无安全所有权切分则不并行写入。 |
| `subagent-driven-development` | 委派契约显式传递工作区、简报、验收、报告和 `commit_authority`；没有权限时只报告工作区差异。 |
| `requesting-code-review` | 低风险机械工作不机械升级为独立评审；安全、数据完整性、跨模块和实质整体修改按风险评审。 |
| `receiving-code-review` | 评审意见先与代码、意图、耦合、安全和证据核对；独立明确事项可单独推进。 |
| `writing-skills` | 单仓库机械路径规则优先进入仓库指令或自动化；指导形式匹配失败类型，并要求比例适配的反事实证据。 |

全文筛查未发现其他平台专属代理工具、固定评审扇出、自动 push 或未授权发布语义。

## 自审与关注点

- 只修改 Tasks 3～5 指定的 9 个技能、契约、精确清单和统一验证记录；未进入 Tasks 6～7。
- 上游 `superpowers-lite` 只读使用，没有写入、删除或生成文件。
- Markdown 保留文件均含中文正文且相对链接由契约测试验证；代码和代码注释保持英文，脚本用户输出中文。
- `writing-skills/examples/` 未进入交付面；其余简报指定辅助文件全部保留。
- 唯一环境限制是本机缺少 Graphviz `dot`，因此 `render-graphs.js` 只能验证 ESM 运行入口、依赖检测和中文错误输出，不能生成 SVG。

## 提交

提交主题：`feat(skills): translate remaining Codex workflows`。提交哈希在交接时从 Git 历史读取，避免验证记录写入会因 amend 失效的自引用哈希。

---

# 最终清理与完整验收

## 导入副本清理

删除前使用 `Resolve-Path` 取得主检出导入副本的真实路径，并以
`StringComparer.OrdinalIgnoreCase` 与批准路径
`C:\WorkSpace\ResearchProjects\Ambition\superpowers-lite` 精确比较；同时确认其父目录就是
主检出根目录。目标包含 202 个文件和 68 个子目录。删除后
`Test-Path -LiteralPath 'C:\WorkSpace\ResearchProjects\Ambition\superpowers-lite'` 返回
`False`。

该目录是用户明确批准删除的未跟踪导入副本。Git 只能恢复已经迁入当前插件并提交的内容；
未迁入的上游冗余文件无法从本仓库历史恢复。

## 禁止表面扫描

仓库根层不存在 `hooks`、`.claude-plugin`、`.cursor-plugin`、`.kimi-plugin`、`.opencode`、
`.pi` 或嵌套 `superpowers-lite` 目录。对设计和计划历史说明以外的文件扫描
`CLAUDE_PLUGIN_ROOT`、`CURSOR_PLUGIN_ROOT`、`KIMI`、`OPENCODE`、`session-start` 和
`hooks/hooks` 时只有两类否定性命中：README 明确说明未包含其他平台适配层，契约测试列出
禁止路径并断言 CI 不得引用这些平台；插件清单、技能、脚本和 CI 运行面没有残留引用。

## 完整验证矩阵

在 UTF-8 Python 模式下执行最终批次验证：

- `npm test`：23/23 通过，覆盖 5 项插件/发布契约、精确 14 技能清单、契约键集合、Codex-only 文案边界、发布脚本文案和 14 项中文语义契约。
- `tests/codex/test-runtime-scripts.sh`：真实 Bash 行为测试全部通过，覆盖污染测试零匹配、启动前已污染、定位污染者、全清洁、NUL 安全文件名，以及临时会话符号链接和 `..` 路径拒绝。
- `validate_plugin.py .`：输出 `Plugin validation passed`。
- 对显式列出的 14 个技能逐一运行 `quick_validate.py`：14/14 输出 `Skill is valid!`。
- `tests/codex/test-package-codex-plugin.sh`：ZIP 与 tar.gz 的根层白名单、身份、固定元数据、可执行位、校验和输出和重复构建一致性全部通过。
- `git diff --check`：通过。

## 人工回读与归档

人工完整回读 `README.md`、两个清单、`package.json` 和 14 个 `SKILL.md`。公开说明与技能正文
使用自然中文；技能描述均保留 `Use when` 发现契约；权限、验证、比例适配、Codex 工具语境和
禁止自动 push 等关键约束完整。技能契约遍历每个技能目录下的 Markdown 文件并解析相对链接，
当前全部链接目标存在。

从已提交 `HEAD` 生成 rootless ZIP：

- 路径：`../_tmp/superpowers-lite-packaging/superpowers-lite-0.1.0.zip`
- 根层：仅 `.codex-plugin/`、`assets/`、`skills/`、`README.md` 和 `LICENSE`
- 条目：65
- 技能：14
- SHA-256：该值在最终总审查修复改变发布面后重新生成，见下节最终提交验证。

归档不包含验证文档。提交本节后从新 `HEAD` 复跑打包，实际校验和保持不变，证明产物只读取
提交中的发布白名单内容，而不受验证记录提交影响。

---

# 最终总审查集中修复

## 审查核对与根因

最终总审查指出的四项 Important 均通过源码和真实执行确认：

1. `visual-companion.md` 仍保留其他平台名称和专属后台工具语义，根因是翻译时保留了上游适配器示例；现只保留 Codex 启动方式和平台无关降级。
2. `find-polluter.sh` 使用换行文本加未引用 `for` 循环收集文件，既没有补齐 `find .` 所需的 `./`，也会拆坏空格或换行文件名；零匹配被计为 1，启动前污染只跳过，最终还会错误报告全清洁。
3. 初次迁移主要中文化 Markdown，遗漏了 Shell/JavaScript 的用户可见错误和测试断言输出。
4. `stop-server.sh` 只用 `/tmp/*` 字符串前缀决定 `rm -rf`，没有拒绝符号链接、`..` 或确认规范路径的父目录和 basename。

## 聚合 RED

先一次性增加契约和真实 Bash 行为测试，再修改实现：

- `npm test`：23 项中 19 项通过、4 项按预期失败，分别锁定 README 安装流程、CI 行为测试、非 Codex 平台术语和英文脚本输出。
- `tests/codex/test-runtime-scripts.sh`：13 项按预期失败，准确复现零匹配成功退出、启动前污染继续执行、找不到带空格的污染者、错误全清洁结论、非 NUL 安全收集，以及符号链接和 `..` 路径未被拒绝。

## 修复边界

- `find-polluter.sh` 规范化相对模式，使用 `find -print0`、`sort -z` 和引用数组收集文件；零匹配与启动前污染明确失败，找到污染者以非零退出，全 CLI 输出中文。
- `stop-server.sh` 在任何进程操作前拒绝不安全临时路径，并在删除前再次校验；只有规范 `/tmp` 的直接子目录、basename 以 `brainstorm-` 开头且不是符号链接时才允许删除。
- `server.cjs` 的帧校验、WebSocket 解析、文件监视、生命周期与端口绑定错误已中文化；协议键、命令和代码标识保持兼容。
- 技能与 README 的正式发布树增加 Codex-only 术语契约；契约 JSON 键集合必须与精确 14 技能集合一致。README 改为仓库 marketplace 两步安装，并明确 rootless 归档不含 marketplace 清单。
- CI 在契约与打包测试之间运行真实 Bash 行为测试；Shell 测试断言输出全部使用中文。

## 最终提交验证

- `npm test`：23/23 通过。
- `tests/codex/test-runtime-scripts.sh`：全部通过。
- `validate_plugin.py .`：`Plugin validation passed`。
- 显式 14 技能 `quick_validate.py`：14/14 输出 `Skill is valid!`。
- Node/Shell 语法检查与 `git diff --check`：通过。
- `tests/codex/test-package-codex-plugin.sh`：提交后验证结果与最终 SHA-256 记录在 `.superpowers/sdd/final-review-fixes-report.md`，归档仍只读取发布白名单。

---

# 插件目录结构对齐验证

## 结构 RED

在迁移前增加“插件发布面必须位于 `plugins/superpowers-lite`”契约。旧根布局运行
`node --test .\tests\contracts\plugin-contracts.test.mjs` 时 6 项中 5 项通过、1 项按预期失败，
实际根目录名为 worktree 名而不是 `superpowers-lite`，证明契约能识别根插件布局。

## 迁移 GREEN

- marketplace source 改为 `local` + `./plugins/superpowers-lite`。
- `.codex-plugin`、assets、skills、scripts、tests、package 和插件公开文档已归入
  `plugins/superpowers-lite/`；仓库根只保留 marketplace、CI、项目资产和导航。
- `npm --prefix .\plugins\superpowers-lite test`：24/24 通过。
- `plugins/superpowers-lite/tests/codex/test-runtime-scripts.sh`：全部通过。
- `validate_plugin.py .\plugins\superpowers-lite`：`Plugin validation passed`。
- 显式 14 技能 `quick_validate.py`：14/14 输出 `Skill is valid!`。
- `plugins/superpowers-lite/tests/codex/test-package-codex-plugin.sh`：ZIP/tar.gz 白名单、
  固定元数据、可执行位、SHA-256 和重复构建一致性全部通过。
- 正式 rootless ZIP：65 个条目、14 个技能，SHA-256
  `e8ba53e188fc40c64fad252e029d4678e9a193942ed9d72a16be400f7edba47f`。

---

# 高风险最小护栏优化验证

## 组合 RED

在修改技能正文前，先为 `finishing-a-development-branch`、`receiving-code-review` 和
`systematic-debugging` 增加最小硬护栏语义契约。`npm --prefix .\plugins\superpowers-lite test`
得到 24 项中 21 项通过、3 项按预期失败；失败分别是缺少“合并结果上重新验证”、
“未澄清前不得实施依赖它的反馈”和“每次新修复必须由新证据”，其他契约没有失败。

## 组合 GREEN

- 分支收尾增加合并后复验、仅清理当前流程所有的工作树、先移除工作树再删除分支；没有
  恢复固定四选项或自动 push。
- 评审处理增加耦合事项未澄清前不得修改依赖项、修复后聚焦验证，以及只在语义或风险
  变化时再次独立评审。
- 系统调试增加新修复必须由新证据支持，以及第二次失败、症状迁移或共享状态增强时停止
  局部修补并重新检查根因、边界和架构假设。
- 三个目标技能仍保持短小：分别为 21、20、30 行。

## 完整验证

- 最终统一审查发现并关闭 3 个 Important：区分“第二次失败触发复盘”和“架构处置由证据
  决定”，将合并后清理条件限定到合并路径，并用完整主语—动作谓词加强契约。
- 审查修复先得到 23/24、再得到 22/24 的预期 RED；正文修复后恢复 24/24 GREEN。
- `npm --prefix .\plugins\superpowers-lite test`：24/24 通过。
- 三个目标技能及完整 14 技能 `quick_validate.py`：3/3、14/14 通过。
- 插件校验：`Plugin validation passed`；Codex-only 禁止路径扫描通过。
- `test-runtime-scripts.sh`：全部真实 Bash 行为与路径安全测试通过。
- `test-package-codex-plugin.sh`：ZIP/tar.gz 白名单、固定元数据、可执行位、SHA-256 和重复
  构建一致性全部通过。
- 正式 rootless ZIP：65 个条目、14 个技能，SHA-256
  `36078417298bccba1369045ecc9ab8b681841f2d5c0bcc82a3ef5f6ed3200a4f`。

---

# 自主子代理开发与统一审查验证

## 组合 RED / GREEN

- 先为 `writing-plans`、`executing-plans`、`subagent-driven-development` 和
  `requesting-code-review` 增加自主执行语义契约，现有 24 项中 20 项通过、4 项按预期失败。
- 技能正文和提示模板完成后恢复 24/24 GREEN；最终统一审查发现 3 个 Important：高风险门禁
  发生过晚、风险对象触发范围过宽、三个提示模板未受文件级契约保护。
- 审查修复先得到 27 项中 23 项通过、4 项按预期失败，再增加派发前风险分类、前置授权与
  恢复门禁、边界变更或可信高影响限定，以及模板 required/forbidden 断言。
- 最终契约 27/27 GREEN；同一审查者复核 3 个 Important 全部关闭，结论为
  `Ready to merge: Yes`。

## 交付行为

- 计划成为目标、硬约束、真实依赖、最终验收和恢复状态的意图契约；实现步骤、实验和测试
  顺序默认可调整。
- 主模型可以根据代码和证据调整任务顺序、合并或拆分任务，并记录实质偏离，不逐项请示。
- 普通子任务默认只做实现者自检、聚焦验证和主代理基本验收，不再执行完整规格与质量双审。
- 不可逆、安全、权限和数据风险在派发前检查操作方案、授权及回滚或恢复路径；跨模块、兼容
  和共享状态只在边界发生变更或存在可信高影响风险时触发中途聚焦审查。
- 所有任务完成后对组合结果进行一次严格统一审查，Critical/Important 集中修复并组合复验。

## 完整验证

- `npm --prefix .\plugins\superpowers-lite test`：27/27 通过。
- 显式完整 14 技能 `quick_validate.py`：14/14 通过。
- Codex-only 禁止路径扫描、插件校验和 `git diff --check` 通过。
- `test-runtime-scripts.sh`：全部真实 Bash 行为与路径安全测试通过。
- `test-package-codex-plugin.sh`：ZIP/tar.gz 白名单、固定元数据、可执行位、SHA-256 和重复
  构建一致性全部通过。
- 正式 rootless ZIP：65 个条目、14 个技能，SHA-256
  `b6b2ca8006fb3d46eef4f92e67f42066bc94164909b520085d192a08b8408ef6`。

---

# `writing-skills` 删除与 `0.1.1` 发布验证

## 契约 RED / GREEN

- 先把 manifest、marketplace 版本期望更新为 `0.1.1`，并从精确技能清单和语义契约中
  删除 `writing-skills`。首次运行得到 26 项中 23 项通过、3 项按预期失败：两项旧版本
  `0.1.0`，一项目录集合仍包含 `writing-skills`。
- 更新三处发布版本并删除 `skills/writing-skills/` 的 6 个文件后，契约恢复 26/26 GREEN。

## 完整验证

- `npm --prefix .\plugins\superpowers-lite test`：26/26 通过。
- 显式完整 13 技能 `quick_validate.py`：13/13 输出 `Skill is valid!`。
- `validate_plugin.py .\plugins\superpowers-lite`：`Plugin validation passed`。
- `test-runtime-scripts.sh`：全部真实 Bash 行为与路径安全测试通过。
- `test-package-codex-plugin.sh`：ZIP/tar.gz 白名单、固定元数据、可执行位、SHA-256 和重复
  构建一致性全部通过。
- 正式归档从已提交的 `f2d5857` 生成：`superpowers-lite-0.1.1.zip`，58 个条目、
  13 个技能，SHA-256 `6df88af55304d5de0359fa62e4b04900dcf13229c5857e1d930d05abda0d610e`。

---

# marketplace 更名与 `0.1.2` 发布验证

## 契约 RED / GREEN

- 先把 marketplace 名称期望改为仓库原名 `Ambition`，把三处发布版本期望改为 `0.1.2`，
  并要求仓库与插件 README 使用 `superpowers-lite@Ambition`。首次运行得到 26 项中 23 项
  通过、3 项按预期失败：旧 manifest 版本、旧商城名和旧安装命令分别被命中。
- marketplace 机器名与展示名改为 `Ambition`，manifest、package 和商城条目升至 `0.1.2`，
  两份安装文档同步后恢复 26/26 GREEN；插件 ID 与 source path 保持不变。

## 完整验证

- `npm --prefix .\plugins\superpowers-lite test`：26/26 通过。
- `read_marketplace_name.py --marketplace-path .\.agents\plugins\marketplace.json`：输出 `Ambition`。
- 显式完整 13 技能 `quick_validate.py`：13/13 输出 `Skill is valid!`。
- `validate_plugin.py .\plugins\superpowers-lite`：`Plugin validation passed`。
- `test-runtime-scripts.sh` 与 `test-package-codex-plugin.sh`：全部通过。
- 正式归档从已提交的 `abea9de` 生成：`superpowers-lite-0.1.2.zip`，58 个条目、
  13 个技能，SHA-256 `ebd522bb8839f828a884590e2c560527af1f60b818aa7c1d6e00c0b67a6e1ccc`。
