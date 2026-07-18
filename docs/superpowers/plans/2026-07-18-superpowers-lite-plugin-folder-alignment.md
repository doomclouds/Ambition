# Superpowers Lite Plugin Folder Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将根插件迁入 `plugins/superpowers-lite/`，使仓库采用与 `CodexPlugin` 一致的 marketplace + plugins 多插件布局，同时保持 Codex-only 中文运行面和确定性发布包不变。

**Architecture:** 仓库根只保留 marketplace、CI、项目资产和导航；插件 manifest、技能、测试、脚本和公开文档组成自包含的 `plugins/superpowers-lite` 单元。测试同时显式区分 `repoRoot` 与 `pluginRoot`，打包脚本从 Git `HEAD` 的插件子树生成 rootless 归档。

**Tech Stack:** Codex plugin manifest、Node.js 24 `node:test`、PowerShell、Git for Windows Bash、Python 3 插件/技能校验器、Git archive。

## Global Constraints

- 插件目录和 manifest 名称保持 `superpowers-lite`；不得使用 `superpowers-lite-cn` 作为运行时名称。
- marketplace 源必须是 `{"source":"local","path":"./plugins/superpowers-lite"}`。
- 14 个技能 ID、中文内容、版本 `0.1.0` 和 MIT/上游归属保持不变。
- 不新增或恢复 hooks、apps、MCP 或其他代理平台适配器。
- 根目录保留 `docs/superpowers/`、`docs/verification/`、`.agents/`、`.github/`、`AGENTS.md`、`README.md` 和仓库级 `LICENSE`。
- 插件目录保留独立 `LICENSE`，确保 rootless 归档携带法律文本。
- 代码注释使用英文，用户可见文案和文档使用简体中文。
- Windows Python 验证同时设置 `PYTHONIOENCODING=utf-8` 和 `PYTHONUTF8=1`。
- Bash 命令显式调用 `C:\Program Files\Git\bin\bash.exe`；PowerShell 不使用 `&&`。
- 用户要求批量实施并最终统一筛选，不执行逐任务代理评审。
- 不 push、不发布、不创建 PR 或 GitHub Release。

---

### Task 1: 用契约锁定多插件目录并迁移文件

**Files:**
- Modify then move: `tests/contracts/plugin-contracts.test.mjs` -> `plugins/superpowers-lite/tests/contracts/plugin-contracts.test.mjs`
- Move: `.codex-plugin/` -> `plugins/superpowers-lite/.codex-plugin/`
- Move: `assets/` -> `plugins/superpowers-lite/assets/`
- Move: `skills/` -> `plugins/superpowers-lite/skills/`
- Move: `scripts/` -> `plugins/superpowers-lite/scripts/`
- Move: `tests/` -> `plugins/superpowers-lite/tests/`
- Move: `package.json` -> `plugins/superpowers-lite/package.json`
- Move: `README.md` -> `plugins/superpowers-lite/README.md`
- Move: `SECURITY.md` -> `plugins/superpowers-lite/SECURITY.md`
- Move: `CONTRIBUTING.md` -> `plugins/superpowers-lite/CONTRIBUTING.md`
- Copy unchanged: `LICENSE` -> `plugins/superpowers-lite/LICENSE`
- Modify: `.agents/plugins/marketplace.json`
- Modify: `.gitattributes`

**Interfaces:**
- Consumes: 当前根插件和已批准结构设计。
- Produces: `pluginRoot = <repo>/plugins/superpowers-lite`、`repoRoot = <repo>` 两个稳定路径边界。

- [ ] **Step 1: 先写目录契约 RED**

在当前 `tests/contracts/plugin-contracts.test.mjs` 顶部将根路径拆成：

```javascript
const pluginRoot = path.resolve(import.meta.dirname, '..', '..');
const repoRoot = path.resolve(pluginRoot, '..', '..');
```

新增第一个测试，确保旧根布局必然失败：

```javascript
test('插件发布面位于批准的 plugins 子目录', () => {
  assert.equal(path.basename(pluginRoot), 'superpowers-lite');
  assert.equal(path.basename(path.dirname(pluginRoot)), 'plugins');
  assert.equal(fs.existsSync(path.join(repoRoot, '.codex-plugin')), false);
  assert.equal(fs.existsSync(path.join(repoRoot, 'skills')), false);
});
```

- [ ] **Step 2: 运行 RED**

```powershell
node --test .\tests\contracts\plugin-contracts.test.mjs
```

预期：FAIL，`path.basename(pluginRoot)` 实际为 `Ambition`。

- [ ] **Step 3: 使用 Git 移动插件所有文件**

```powershell
New-Item -ItemType Directory -Force .\plugins\superpowers-lite | Out-Null
git mv .codex-plugin assets skills scripts tests package.json README.md SECURITY.md CONTRIBUTING.md .\plugins\superpowers-lite\
Copy-Item -LiteralPath .\LICENSE -Destination .\plugins\superpowers-lite\LICENSE
```

确认根插件运行面已消失：

```powershell
$oldRoots = @('.codex-plugin','assets','skills','scripts','tests','package.json')
foreach ($oldRoot in $oldRoots) {
  if (Test-Path -LiteralPath $oldRoot) { throw "旧根插件路径仍存在: $oldRoot" }
}
```

- [ ] **Step 4: 修改 marketplace 和可执行位规则**

`.agents/plugins/marketplace.json` 的唯一条目改为：

```json
"source": {
  "source": "local",
  "path": "./plugins/superpowers-lite"
}
```

`.gitattributes` 将技能脚本专用规则改为：

```gitattributes
plugins/superpowers-lite/skills/**/scripts/* text eol=lf
```

- [ ] **Step 5: 暂存结构变更并检查重命名**

```powershell
git add .agents .gitattributes plugins
git diff --cached --check
git status --short
```

预期：插件文件显示为重命名或新增，根路径显示删除；无行尾错误。

---

### Task 2: 适配嵌套路径、CI、打包和文档

**Files:**
- Modify: `plugins/superpowers-lite/.codex-plugin/plugin.json`
- Modify: `plugins/superpowers-lite/tests/contracts/plugin-contracts.test.mjs`
- Modify: `plugins/superpowers-lite/tests/contracts/skill-contracts.test.mjs`
- Modify: `plugins/superpowers-lite/scripts/package-codex-plugin.sh`
- Modify: `plugins/superpowers-lite/tests/codex/test-package-codex-plugin.sh`
- Modify: `plugins/superpowers-lite/tests/codex/test-runtime-scripts.sh`
- Modify: `plugins/superpowers-lite/README.md`
- Create: `README.md`
- Modify: `.github/workflows/ci.yml`
- Modify: `AGENTS.md`
- Modify: `docs/verification/2026-07-18-skill-translation.md`

**Interfaces:**
- Consumes: Task 1 的 `repoRoot` / `pluginRoot` 边界。
- Produces: 从仓库 marketplace 安装、在插件目录验证、从 Git 子树打包的完整链路。

- [ ] **Step 1: 修正插件与仓库读取器**

`plugin-contracts.test.mjs` 使用分离读取器：

```javascript
const pluginRoot = path.resolve(import.meta.dirname, '..', '..');
const repoRoot = path.resolve(pluginRoot, '..', '..');
const readPluginJson = (relativePath) =>
  JSON.parse(fs.readFileSync(path.join(pluginRoot, relativePath), 'utf8'));
const readPluginText = (relativePath) =>
  fs.readFileSync(path.join(pluginRoot, relativePath), 'utf8');
const readRepoJson = (relativePath) =>
  JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
const readRepoText = (relativePath) =>
  fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
```

契约必须断言：

```javascript
assert.deepEqual(entries[0].source, {
  source: 'local',
  path: './plugins/superpowers-lite'
});
assert.equal(fs.existsSync(path.join(repoRoot, '.codex-plugin')), false);
assert.equal(fs.existsSync(path.join(pluginRoot, '.codex-plugin', 'plugin.json')), true);
```

`skill-contracts.test.mjs` 中 `root` 保持指向插件根；skills、README 和 scripts 均从插件根读取。

- [ ] **Step 2: 让 manifest 和公开链接指向插件目录**

manifest 使用：

```json
"homepage": "https://github.com/doomclouds/Ambition/tree/main/plugins/superpowers-lite",
"repository": "https://github.com/doomclouds/Ambition",
"websiteURL": "https://github.com/doomclouds/Ambition/tree/main/plugins/superpowers-lite"
```

插件 README 中贡献和安全链接改为：

```markdown
[CONTRIBUTING.md](https://github.com/doomclouds/Ambition/blob/main/plugins/superpowers-lite/CONTRIBUTING.md)
[SECURITY.md](https://github.com/doomclouds/Ambition/blob/main/plugins/superpowers-lite/SECURITY.md)
```

- [ ] **Step 3: 让打包脚本从插件 Git 子树读取**

`package-codex-plugin.sh` 使用：

```bash
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PLUGIN_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(git -C "$PLUGIN_ROOT" rev-parse --show-toplevel)"
PLUGIN_PATH="plugins/superpowers-lite"
```

归档和模式读取改为：

```bash
git -C "$REPO_ROOT" archive --format=tar "$REF:$PLUGIN_PATH" -- \
  .codex-plugin LICENSE README.md assets skills |
  tar -xf - -C "$STAGE"

git -C "$REPO_ROOT" ls-tree -r "$REF:$PLUGIN_PATH" -- \
  .codex-plugin LICENSE README.md assets skills |
  awk -F '\t' '{ split($1, fields, " "); print fields[1], $2 }' >"$GIT_MODE_MAP"
```

默认输出保持仓库外：

```bash
OUTPUT="$REPO_ROOT/../_tmp/superpowers-lite-packaging/superpowers-lite-$VERSION.zip"
```

- [ ] **Step 4: 调整 CI 和根导航**

`.github/workflows/ci.yml` 在 job 中增加：

```yaml
defaults:
  run:
    working-directory: plugins/superpowers-lite
```

根 `README.md` 使用以下最小职责：

```markdown
# Ambition Codex Plugins

本仓库使用 Codex marketplace + `plugins/` 布局。

## 插件

- [Superpowers Lite](plugins/superpowers-lite/README.md)：仅面向 Codex CLI/App 的中文工程工作流技能集。

## 安装

```powershell
codex plugin marketplace add <仓库根目录>
codex plugin add superpowers-lite@superpowers-lite
```
```

`AGENTS.md` 的验证命令改为：

```powershell
npm --prefix .\plugins\superpowers-lite test
& 'C:\Program Files\Git\bin\bash.exe' .\plugins\superpowers-lite\tests\codex\test-runtime-scripts.sh
& 'C:\Program Files\Git\bin\bash.exe' .\plugins\superpowers-lite\tests\codex\test-package-codex-plugin.sh
```

- [ ] **Step 5: 运行迁移 GREEN**

```powershell
npm --prefix .\plugins\superpowers-lite test
& 'C:\Program Files\Git\bin\bash.exe' .\plugins\superpowers-lite\tests\codex\test-runtime-scripts.sh
& 'C:\Program Files\Git\bin\bash.exe' .\plugins\superpowers-lite\tests\codex\test-package-codex-plugin.sh
```

预期：契约 23/23、运行脚本测试和 ZIP/tar.gz 确定性测试全部通过。

- [ ] **Step 6: 提交目录迁移**

```powershell
git add --all
git diff --cached --check
git commit -m "refactor(plugin): align marketplace folder structure"
```

---

### Task 3: 完整验证并更新完成资产

**Files:**
- Modify: `docs/superpowers/archives/2026-07/2026-07-18-superpowers-lite-codex-cn-archives.md`
- Modify: `docs/superpowers/archives/INDEX.md`
- Verify: `plugins/superpowers-lite/`
- Verify: repository root and generated archive

**Interfaces:**
- Consumes: Task 2 的已提交嵌套插件。
- Produces: 合并前完整证据和可检索的结构跟进记录。

- [ ] **Step 1: 运行 Codex 与技能验证**

```powershell
$env:PYTHONIOENCODING='utf-8'
$env:PYTHONUTF8='1'
$pluginRoot='.\plugins\superpowers-lite'
python 'C:\Users\10062\.codex\skills\.system\plugin-creator\scripts\validate_plugin.py' $pluginRoot
$skillDirs=@(
  'brainstorming','dispatching-parallel-agents','executing-plans',
  'finishing-a-development-branch','receiving-code-review','requesting-code-review',
  'subagent-driven-development','systematic-debugging','test-driven-development',
  'using-git-worktrees','using-superpowers','verification-before-completion',
  'writing-plans','writing-skills'
)
foreach($skillId in $skillDirs){
  python 'C:\Users\10062\.codex\skills\.system\skill-creator\scripts\quick_validate.py' "$pluginRoot\skills\$skillId"
  if($LASTEXITCODE -ne 0){throw "skill validation failed: $skillId"}
}
```

预期：插件通过，14/14 技能输出 `Skill is valid!`。

- [ ] **Step 2: 扫描旧根与禁止表面**

```powershell
$oldRoots=@('.codex-plugin','assets','skills','scripts','tests','package.json')
foreach($oldRoot in $oldRoots){if(Test-Path -LiteralPath $oldRoot){throw "旧根仍存在: $oldRoot"}}
$forbidden=@('hooks','.claude-plugin','.cursor-plugin','.kimi-plugin','.opencode','.pi')
foreach($path in $forbidden){if(Test-Path -LiteralPath ".\plugins\superpowers-lite\$path"){throw "禁止路径仍存在: $path"}}
```

- [ ] **Step 3: 从已提交 HEAD 生成正式包**

```powershell
& 'C:\Program Files\Git\bin\bash.exe' .\plugins\superpowers-lite\scripts\package-codex-plugin.sh
```

预期：输出仓库外 ZIP 路径、版本 `0.1.0`、技能数 `14` 和 SHA-256。

- [ ] **Step 4: 更新交付 archive**

在既有 archive 中增加：

```markdown
- Follow-up design: [Superpowers Lite 插件目录对齐设计](../../specs/2026-07-18-superpowers-lite-plugin-folder-alignment-design.md)
- Follow-up plan: [Superpowers Lite 插件目录对齐实施计划](../../plans/2026-07-18-superpowers-lite-plugin-folder-alignment.md)
```

并将交付范围明确为 `plugins/superpowers-lite` 自包含插件和根 marketplace 导航；不新建重复 archive。

- [ ] **Step 5: 验证资产和提交**

```powershell
$assetRoot='C:\Users\10062\.codex\plugins\cache\codex-plugin\superpowers-asset-compounding\0.5.0\skills'
python "$assetRoot\archive-superpowers-feature\scripts\validate_archive_asset.py" .\docs\superpowers\archives\2026-07\2026-07-18-superpowers-lite-codex-cn-archives.md
python "$assetRoot\compound-development-asset\scripts\check_indexes.py" .
python "$assetRoot\compound-development-asset\scripts\check_completion_gate.py" . --completed-topic 'superpowers-lite-codex-cn' --json
git add docs
git diff --cached --check
git commit -m "docs: update plugin layout archive"
```

- [ ] **Step 6: 最终统一筛选**

从本计划开始前提交到当前 `HEAD` 做一次统一只读审查，重点检查：目录边界、marketplace 路径、CI working directory、rootless 打包、许可证、禁止平台残留和文档链接。修复所有 Critical/Important 后，从最终 `HEAD` 重跑 Tasks 2-3 的完整验证矩阵。
