# Superpowers Lite 高风险最小护栏实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不恢复重流程的前提下，为分支收尾、评审处理和系统调试补回最小不可省略护栏。

**Architecture:** 继续使用现有中文 `SKILL.md` 作为唯一运行策略，以
`tests/contracts/skill-contracts.json` 固定新增语义。三个技能作为一个组合交付完成一次
RED/GREEN，随后统一运行插件、技能、运行脚本和确定性打包验证。

**Tech Stack:** Codex skills、Markdown、JSON、Node.js 24 `node:test`、Python 3
`quick_validate.py`、Git for Windows Bash。

## Global Constraints

- 插件名、目录名和 manifest 名称保持 `superpowers-lite`，版本保持 `0.1.0`。
- 技能集合保持现有 14 个稳定 ID，不新增、删除或重命名技能。
- 不恢复 hooks、apps、MCP、固定代理扇出、固定评审次数或其他平台适配器。
- 只补安全、仓库状态和修复质量相关硬护栏，保留按风险比例使用的 Lite 语义。
- Windows 中文校验同时设置 `PYTHONIOENCODING=utf-8` 和 `PYTHONUTF8=1`。
- Bash 命令显式使用 `C:\Program Files\Git\bin\bash.exe`。

---

### Task 1: 用一个 RED/GREEN 交付补齐三项硬护栏

**Files:**
- Modify: `plugins/superpowers-lite/tests/contracts/skill-contracts.json`
- Modify: `plugins/superpowers-lite/skills/finishing-a-development-branch/SKILL.md`
- Modify: `plugins/superpowers-lite/skills/receiving-code-review/SKILL.md`
- Modify: `plugins/superpowers-lite/skills/systematic-debugging/SKILL.md`

**Interfaces:**
- Consumes: 现有按技能 ID 查找必需中文短语的 Node 契约。
- Produces: 三个技能中可由契约检测的分支清理顺序、评审依赖边界和重复失败复盘点。

- [ ] **Step 1: 增加必需语义形成 RED**

把三个契约数组扩展为：

```json
"systematic-debugging": [
  "根因尚不明确",
  "单一假设",
  "跨越边界",
  "语义验证",
  "缓解措施不能冒充根治",
  "每次新修复必须由新证据",
  "第二次修复失败",
  "停止局部修补"
],
"finishing-a-development-branch": [
  "真实分支",
  "当前仓库策略",
  "明确确认",
  "未经授权的推送",
  "合并结果上重新验证",
  "只清理当前流程创建",
  "先移除工作树"
],
"receiving-code-review": [
  "先验证再实施",
  "意图",
  "耦合",
  "安全",
  "独立且明确",
  "未澄清前不得实施依赖它的反馈",
  "聚焦验证",
  "再次独立评审"
]
```

- [ ] **Step 2: 运行完整契约确认 RED**

Run:

```powershell
npm --prefix .\plugins\superpowers-lite test
```

Expected: 21 项通过，三个目标技能契约分别因新增短语缺失而失败；其他技能与插件契约不失败。

- [ ] **Step 3: 在分支收尾技能增加安全顺序**

在权限段之后、丢弃段之前加入：

```markdown
## 集成与清理顺序

集成前确认相关验证仍可信；合并后必须在**合并结果上重新验证**与完成声明相称的行为。
只有合并和合并后验证成功，才允许清理工作树或删除分支。

只清理当前流程创建、所有权明确且位于批准目录的工作树；Codex、宿主或外部工具管理的
工作区必须保留。删除已合并分支前，先移除工作树，再删除分支；不得在目标工作树内部
执行它自己的删除。
```

- [ ] **Step 4: 在评审技能增加依赖和复验边界**

在歧义段之后加入：

```markdown
如果未澄清事项会影响接口、数据状态、耦合、安全或整体意图，未澄清前不得实施依赖它的
反馈。真正独立且明确的事项仍可继续，但必须说明其不依赖当前阻塞。

修复后运行与发现对应的聚焦验证。只有修复改变语义、风险或集成置信度时才再次独立评审；
纯机械修正保留验证证据和无需复审的理由。
```

- [ ] **Step 5: 在调试技能增加重复失败复盘点**

在“升级与遏制”开头加入：

```markdown
每次新修复必须由新证据或可证伪的新假设支持；没有新增信息时不得原样重试或继续叠加
补丁。第二次修复失败、症状跨组件迁移，或共享状态证据增强时，必须停止局部修补，重新
检查根因、信任边界和架构假设。这个复盘点不自动证明架构错误，后续方向仍由证据决定。
```

- [ ] **Step 6: 运行 GREEN 与三个技能格式校验**

Run:

```powershell
$env:PYTHONIOENCODING='utf-8'
$env:PYTHONUTF8='1'
npm --prefix .\plugins\superpowers-lite test
$validator='C:\Users\10062\.codex\skills\.system\skill-creator\scripts\quick_validate.py'
foreach($id in @('finishing-a-development-branch','receiving-code-review','systematic-debugging')){
  python $validator ".\plugins\superpowers-lite\skills\$id"
  if($LASTEXITCODE -ne 0){throw "skill validation failed: $id"}
}
```

Expected: Node 契约 24/24；三个技能分别输出 `Skill is valid!`。

- [ ] **Step 7: 提交技能交付**

```powershell
git add plugins/superpowers-lite/tests/contracts/skill-contracts.json `
  plugins/superpowers-lite/skills/finishing-a-development-branch/SKILL.md `
  plugins/superpowers-lite/skills/receiving-code-review/SKILL.md `
  plugins/superpowers-lite/skills/systematic-debugging/SKILL.md
git diff --cached --check
git commit -m "fix(skills): restore critical Lite guardrails"
```

---

### Task 2: 完整验证并更新既有交付资产

**Files:**
- Modify: `docs/verification/2026-07-18-skill-translation.md`
- Modify: `docs/superpowers/archives/2026-07/2026-07-18-superpowers-lite-codex-cn-archives.md`

**Interfaces:**
- Consumes: Task 1 已提交的三个技能和语义契约。
- Produces: 可检索的 follow-up 记录、完整验证证据和仍为 Codex-only 的正式包。

- [ ] **Step 1: 运行完整验证矩阵**

```powershell
$env:PYTHONIOENCODING='utf-8'
$env:PYTHONUTF8='1'
npm --prefix .\plugins\superpowers-lite test
& 'C:\Program Files\Git\bin\bash.exe' .\plugins\superpowers-lite\tests\codex\test-runtime-scripts.sh
& 'C:\Program Files\Git\bin\bash.exe' .\plugins\superpowers-lite\tests\codex\test-package-codex-plugin.sh
python 'C:\Users\10062\.codex\skills\.system\plugin-creator\scripts\validate_plugin.py' .\plugins\superpowers-lite
```

随后对 14 个固定技能目录逐一运行 `quick_validate.py`。Expected: 所有命令退出码为 0，
Node 契约 24/24，技能校验 14/14。

- [ ] **Step 2: 从干净提交生成正式 ZIP**

```powershell
& 'C:\Program Files\Git\bin\bash.exe' .\plugins\superpowers-lite\scripts\package-codex-plugin.sh --format zip
```

Expected: 版本 `0.1.0`、技能 `14`，输出仓库外 ZIP 和 SHA-256；根层白名单不变。

- [ ] **Step 3: 记录 RED/GREEN 与 follow-up**

在验证记录末尾增加“高风险最小护栏优化验证”，记录三个 RED、24/24 GREEN、3/3 聚焦
校验、14/14 完整校验、运行脚本、归档测试和正式包 SHA-256。

在既有 archive 中增加：

```markdown
- Follow-up design: [Superpowers Lite 高风险最小护栏设计](../../specs/2026-07-18-superpowers-lite-hard-guardrails-design.md)
- Follow-up plan: [Superpowers Lite 高风险最小护栏实施计划](../../plans/2026-07-18-superpowers-lite-hard-guardrails.md)
```

并说明三个高风险技能补回最小顺序，没有恢复重型工作流。

- [ ] **Step 4: 运行资产校验并提交**

```powershell
$assetRoot='C:\Users\10062\.codex\plugins\cache\codex-plugin\superpowers-asset-compounding\0.5.0\skills'
python "$assetRoot\archive-superpowers-feature\scripts\validate_archive_asset.py" .\docs\superpowers\archives\2026-07\2026-07-18-superpowers-lite-codex-cn-archives.md
python "$assetRoot\compound-development-asset\scripts\check_indexes.py" .
python "$assetRoot\compound-development-asset\scripts\check_completion_gate.py" . --completed-topic 'superpowers-lite-codex-cn' --json
git add docs
git diff --cached --check
git commit -m "docs: record Lite guardrail verification"
```

---

### Task 3: 一次统一审查与合并收口

**Files:**
- Review: `HEAD` 相对本计划开始前提交的完整差异
- Verify: `plugins/superpowers-lite/`

**Interfaces:**
- Consumes: Tasks 1-2 的完整提交范围和验证证据。
- Produces: 一次组合审查、`main` 合并节点和合并后新鲜验证。

- [ ] **Step 1: 执行一次只读组合审查**

审查三个护栏是否可执行、没有相互矛盾、没有恢复固定流程，同时核对契约是否真正覆盖
新增语义。修复所有 Critical/Important；Minor 只有影响真实行为时才处理。

- [ ] **Step 2: 从最终提交重跑完整验证**

重复 Task 2 Step 1-2，确认修复未使证据陈旧。

- [ ] **Step 3: 使用 `--no-ff` 合并到 `main`**

```powershell
git merge --no-ff codex/superpowers-lite-hard-guardrails -m "merge: strengthen superpowers-lite guardrails"
```

- [ ] **Step 4: 在合并结果上再次运行完整验证并清理自有工作树**

只有合并后验证全部通过，才移除 `.worktrees/superpowers-lite-hard-guardrails`、执行
`git worktree prune` 并删除已合并功能分支。不得 push。
