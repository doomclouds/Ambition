# Superpowers Lite Codex 中文版实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将仓库根目录建设为仅支持 Codex CLI/App、无插件 Hook、核心内容中文化的 `superpowers-lite` 插件。

**Architecture:** 以根目录的 `.codex-plugin/plugin.json` 和 `skills/` 作为唯一运行面；先用契约测试固定插件结构和翻译边界，再按技能族逐个执行行为基线、翻译、格式验证和行为复测。最后删除嵌套上游源码与非 Codex 表面，并从已提交的 `HEAD` 生成可审计插件包。

**Tech Stack:** Codex plugin manifest、Markdown skills、Node.js 24 内置测试、Python 3 验证脚本、PowerShell、Git for Windows Bash。

## Global Constraints

- 正式插件名为 `superpowers-lite`，展示名为 `Superpowers Lite`。
- 仓库根目录是插件根目录，不保留嵌套的 `superpowers-lite/` 副本。
- 运行目标仅为 Codex CLI/App。
- 删除所有插件 Hook、Hook 启动脚本、Hook 测试和相关说明。
- 删除 Claude Code、Cursor、Kimi、OpenCode、Pi、Antigravity 等非 Codex 适配器及其专属测试。
- 作者和仓库元数据使用 `doomclouds/Ambition`，初始版本为 `0.1.0`。
- 保留 MIT `LICENSE` 原文、原作者版权信息和上游来源说明。
- 翻译人类可读内容；技能 ID、路径、命令、代码、变量名、环境变量、协议字段、URL 和法律文本保持稳定。
- YAML `description` 保留技能发现前缀 `Use when`，其余触发条件使用中文。
- 代码注释保持英文；用户可见的界面、CLI 和错误消息使用中文。
- 翻译不得扩大或削弱原 Lite 技能的触发条件、安全边界、权限规则和验证语义。
- 不发布远程版本、不推送仓库、不创建 GitHub Release。
- Windows 命令显式使用 UTF-8；Python 命令前设置 `$env:PYTHONIOENCODING='utf-8'`。
- 需要 Bash 时显式调用 `C:\Program Files\Git\bin\bash.exe`，不调用裸 `bash`。

## Source and target

- 上游输入：`C:\WorkSpace\ResearchProjects\Ambition\superpowers-lite`
- 目标插件：执行工作区根目录
- 已批准设计：`docs/superpowers/specs/2026-07-18-superpowers-lite-codex-cn-design.md`
- 行为验证记录：`docs/verification/2026-07-18-skill-translation.md`

执行时先确认上游输入路径存在。若使用隔离 worktree，仍从上述绝对路径读取上游输入，不把未跟踪源码提交到 Git 历史。

## Final file map

- `.codex-plugin/plugin.json`：唯一插件 manifest；不得包含 `hooks`、`apps` 或 `mcpServers`。
- `.agents/plugins/marketplace.json`：`superpowers-lite` 市场入口，源指向当前仓库根目录。
- `skills/<skill-id>/`：14 个稳定技能 ID 及仍被正文引用的辅助文件。
- `assets/`：`app-icon.png` 与 `superpowers-small.svg`。
- `tests/contracts/plugin-contracts.test.mjs`：manifest、市场、授权和禁用平台契约。
- `tests/contracts/skill-contracts.test.mjs`：frontmatter、中文正文、语义短语和相对链接契约。
- `tests/contracts/skill-contracts.json`：逐技能必需语义短语。
- `tests/codex/test-package-codex-plugin.sh`：归档内容、路径、时间戳与可执行位验证。
- `scripts/package-codex-plugin.sh`：生成 rootless `.zip` 或 `.tar.gz`。
- `docs/verification/2026-07-18-skill-translation.md`：逐技能 RED/GREEN 行为证据。
- `README.md`、`SECURITY.md`、`CONTRIBUTING.md`：中文公开文档。
- `AGENTS.md`：项目约束与资产检索指引。
- `.github/workflows/ci.yml`：只运行 Codex 插件契约和打包测试。
- `package.json`：本地验证入口与发布文件白名单。

---

### Task 1: 建立 Codex-only 插件骨架与首个技能

**Files:**
- Create: `.codex-plugin/plugin.json`
- Create: `.agents/plugins/marketplace.json`
- Create: `package.json`
- Create: `.gitignore`
- Create: `.gitattributes`
- Create: `tests/contracts/plugin-contracts.test.mjs`
- Create: `tests/contracts/skill-contracts.test.mjs`
- Create: `tests/contracts/skill-contracts.json`
- Create: `docs/verification/2026-07-18-skill-translation.md`
- Create: `skills/using-superpowers/SKILL.md`
- Create: `skills/using-superpowers/references/codex-tools.md`
- Copy: `assets/app-icon.png`
- Copy: `assets/superpowers-small.svg`
- Copy unchanged: `LICENSE`
- Modify: `AGENTS.md`

**Interfaces:**
- Consumes: 上游 `using-superpowers` 技能、Codex manifest 和已批准设计。
- Produces: 可被 Codex 验证的最小插件、通用技能契约测试和后续任务使用的语义契约 JSON。

- [ ] **Step 1: 记录 `using-superpowers` 的无技能行为基线**

向一个不读取目标 `SKILL.md` 的新代理发送：

```text
仓库里有一个五行 README 文案修正。直接修改并说明结果；不要因为任务很小就省略必要的权限和验证判断。
```

将代理是否机械展开完整工作流、是否保持任务比例、是否保留权限与验证边界，原样摘要写入验证记录的 `using-superpowers / RED` 行。该行必须包含实际观察，不能写推测。

- [ ] **Step 2: 写插件契约测试并确认 RED**

`tests/contracts/plugin-contracts.test.mjs` 使用以下完整初始实现：

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..', '..');
const readJson = (relativePath) =>
  JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
const hasChinese = (value) => /[\u3400-\u9fff]/u.test(String(value));

test('Codex manifest uses the approved identity and no hooks', () => {
  const manifest = readJson('.codex-plugin/plugin.json');
  assert.equal(manifest.name, 'superpowers-lite');
  assert.equal(manifest.version, '0.1.0');
  assert.equal(manifest.repository, 'https://github.com/doomclouds/Ambition');
  assert.equal(manifest.author?.name, 'doomclouds');
  assert.equal(manifest.skills, './skills/');
  assert.equal(hasChinese(manifest.description), true);
  assert.equal(hasChinese(manifest.interface?.shortDescription), true);
  assert.equal(hasChinese(manifest.interface?.longDescription), true);
  assert.equal(hasChinese(manifest.interface?.defaultPrompt?.join('')), true);
  for (const field of ['hooks', 'apps', 'mcpServers']) {
    assert.equal(Object.hasOwn(manifest, field), false, `manifest must omit ${field}`);
  }
});

test('marketplace exposes one local superpowers-lite entry', () => {
  const marketplace = readJson('.agents/plugins/marketplace.json');
  assert.equal(marketplace.name, 'superpowers-lite');
  const entries = marketplace.plugins.filter((item) => item.name === 'superpowers-lite');
  assert.equal(entries.length, 1);
  assert.equal(entries[0].version, '0.1.0');
  assert.deepEqual(entries[0].source, { source: 'url', url: './' });
  assert.deepEqual(entries[0].policy, {
    installation: 'AVAILABLE',
    authentication: 'ON_INSTALL'
  });
  assert.equal(entries[0].category, 'Developer Tools');
});

test('license and Codex-only root surface are present', () => {
  const license = fs.readFileSync(path.join(root, 'LICENSE'), 'utf8');
  assert.match(license, /MIT License/);
  for (const relativePath of [
    'hooks', '.claude-plugin', '.cursor-plugin', '.kimi-plugin', '.opencode', '.pi'
  ]) {
    assert.equal(fs.existsSync(path.join(root, relativePath)), false, `${relativePath} must be absent`);
  }
});
```

测试还必须断言 manifest 不含 `hooks`、`apps`、`mcpServers`，描述与默认提示包含中文，市场条目唯一，`LICENSE` 包含 `MIT License`，目标根目录不存在上述非 Codex 路径。首次运行：

```powershell
node --test .\tests\contracts\plugin-contracts.test.mjs
```

预期：FAIL，原因是目标根目录尚无 `.codex-plugin/plugin.json`。

- [ ] **Step 3: 写技能契约测试与首个语义契约**

`tests/contracts/skill-contracts.test.mjs` 使用以下完整初始实现，逐项断言目录名、frontmatter、中文正文、必需语义短语和 Markdown 相对链接：

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..', '..');
const skillsRoot = path.join(root, 'skills');
const contracts = JSON.parse(
  fs.readFileSync(path.join(import.meta.dirname, 'skill-contracts.json'), 'utf8')
);
const normalize = (value) => value.replace(/\s+/gu, ' ').trim();
const withoutCodeFences = (value) => value.replace(/```[\s\S]*?```/gu, '');

for (const [skillId, requiredPhrases] of Object.entries(contracts)) {
  test(`${skillId} has valid Chinese skill contracts`, () => {
    const skillDir = path.join(skillsRoot, skillId);
    const skillFile = path.join(skillDir, 'SKILL.md');
    assert.equal(fs.existsSync(skillFile), true, `${skillId}/SKILL.md must exist`);
    const content = fs.readFileSync(skillFile, 'utf8');
    const name = content.match(/^name:\s*['\"]?([^'\"\r\n]+)['\"]?\s*$/mu)?.[1];
    const description = content.match(/^description:\s*['\"]?([^\r\n]+?)['\"]?\s*$/mu)?.[1];
    assert.equal(name, skillId);
    assert.match(description ?? '', /^Use when\s+/u);
    assert.match(description ?? '', /[\u3400-\u9fff]/u);
    assert.match(withoutCodeFences(content), /[\u3400-\u9fff]/u);
    for (const phrase of requiredPhrases) {
      assert.equal(normalize(content).includes(normalize(phrase)), true, `missing phrase: ${phrase}`);
    }

    const markdownFiles = fs.readdirSync(skillDir, { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
      .map((entry) => path.join(entry.parentPath, entry.name));
    for (const markdownFile of markdownFiles) {
      const markdown = withoutCodeFences(fs.readFileSync(markdownFile, 'utf8'));
      assert.match(markdown, /[\u3400-\u9fff]/u, `${markdownFile} must contain Chinese prose`);
      for (const match of markdown.matchAll(/!?\[[^\]]*\]\((?!https?:|mailto:|#)([^)#]+)(?:#[^)]+)?\)/gu)) {
        const target = path.resolve(path.dirname(markdownFile), decodeURIComponent(match[1]));
        assert.equal(fs.existsSync(target), true, `broken link in ${markdownFile}: ${match[1]}`);
      }
    }
  });
}
```

首个 `skill-contracts.json` 契约为：

```json
{
  "using-superpowers": [
    "任务专用操作手册",
    "实质性工作",
    "只加载一个主要工作流技能",
    "权限、安全和验证边界",
    "低风险机械修改"
  ]
}
```

首次运行预期因 `skills/using-superpowers/SKILL.md` 不存在而 FAIL。

- [ ] **Step 4: 创建精确插件元数据**

`.codex-plugin/plugin.json` 使用以下关键值：

```json
{
  "name": "superpowers-lite",
  "version": "0.1.0",
  "description": "面向 Codex 的风险适配型工程工作流技能集。",
  "author": {
    "name": "doomclouds",
    "url": "https://github.com/doomclouds"
  },
  "homepage": "https://github.com/doomclouds/Ambition",
  "repository": "https://github.com/doomclouds/Ambition",
  "license": "MIT",
  "skills": "./skills/",
  "interface": {
    "displayName": "Superpowers Lite",
    "shortDescription": "适配任务风险与规模的 Codex 工程技能",
    "longDescription": "为设计、调试、实施、评审和验证提供按需加载的中文操作手册。",
    "developerName": "doomclouds",
    "category": "Developer Tools",
    "capabilities": ["Interactive", "Read", "Write"],
    "defaultPrompt": ["我有一个想要实现的功能。", "请为这个项目添加一个功能。"],
    "websiteURL": "https://github.com/doomclouds/Ambition",
    "brandColor": "#F59E0B",
    "composerIcon": "./assets/superpowers-small.svg",
    "logo": "./assets/app-icon.png",
    "screenshots": []
  }
}
```

市场条目保持 `policy.installation = AVAILABLE`、`policy.authentication = ON_INSTALL`、`category = Developer Tools`，源使用 `{"source":"url","url":"./"}`。`package.json` 只发布 `.codex-plugin`、`assets`、`skills`、`README.md` 和 `LICENSE`。

- [ ] **Step 5: 迁移并翻译 `using-superpowers`**

只保留 `references/codex-tools.md`；不复制 `pi-tools.md` 和 `antigravity-tools.md`。翻译必须保留“按任务匹配”“比例适配”“主要技能一次一个”“新风险边界再加载第二个技能”“权限、安全、验证硬门禁”的 Lite 语义，并去掉其他平台路由。

- [ ] **Step 6: 运行 GREEN 验证**

```powershell
node --test .\tests\contracts\plugin-contracts.test.mjs
node --test .\tests\contracts\skill-contracts.test.mjs
$env:PYTHONIOENCODING='utf-8'
python 'C:\Users\10062\.codex\skills\.system\plugin-creator\scripts\validate_plugin.py' .
python 'C:\Users\10062\.codex\skills\.system\skill-creator\scripts\quick_validate.py' .\skills\using-superpowers
```

预期：全部退出码为 0；插件验证不再报告 `plugin.json field hooks is not accepted`。

- [ ] **Step 7: 记录行为 GREEN 并提交**

让新代理先完整读取目标 `using-superpowers/SKILL.md`，再运行 Step 1 同一场景。验证其保持比例适配且不跳过安全边界，将实际结果写入验证记录。

```powershell
git add .codex-plugin .agents package.json .gitignore .gitattributes assets LICENSE AGENTS.md tests/contracts docs/verification skills/using-superpowers
git commit -m "feat(plugin): add Codex-only plugin scaffold"
```

### Task 2: 翻译设计、调试与验证技能

**Files:**
- Create: `skills/brainstorming/`
- Create: `skills/systematic-debugging/`
- Create: `skills/test-driven-development/`
- Create: `skills/verification-before-completion/`
- Modify: `tests/contracts/skill-contracts.json`
- Modify: `docs/verification/2026-07-18-skill-translation.md`

**Interfaces:**
- Consumes: Task 1 的契约测试和上游同名技能。
- Produces: 设计、诊断、TDD 与完成验证的中文运行面。

- [ ] **Step 1: 逐技能运行 RED 行为场景**

按顺序使用新代理，每次不提供目标技能内容，并记录实际结果：

| 技能 | 场景 | 失败判据 |
|---|---|---|
| `brainstorming` | “给现有 CLI 增加 dry-run，需求还没定，直接写代码。” | 未先收集上下文或把低风险讨论膨胀成固定仪式 |
| `systematic-debugging` | “测试偶发超时，日志显示三个组件交叉调用，直接把超时翻倍。” | 未区分症状、边界和根因证据 |
| `test-driven-development` | “给状态格式化器增加空值行为。” | 有测试缝隙却未取得反事实失败证据 |
| `verification-before-completion` | “代码已改，告诉我是不是完成了。” | 使用陈旧或与语义无关的证据宣布完成 |

- [ ] **Step 2: 扩充静态语义契约并确认 RED**

为四个技能分别加入以下必需中文短语：

```json
{
  "brainstorming": ["收集项目上下文", "实质可行的方案", "总体架构", "用户批准"],
  "systematic-debugging": ["根因尚不明确", "单一假设", "跨越边界", "语义验证", "缓解措施不能冒充根治"],
  "test-driven-development": ["可观察行为变化", "有效自动化测试缝隙", "反事实证据", "最强适用验证"],
  "verification-before-completion": ["当前可信证据", "语义验收", "陈旧证据", "缺少证据不等于没有风险"]
}
```

运行技能契约测试，预期因四个技能尚未迁移而 FAIL。

- [ ] **Step 3: 逐个迁移、翻译、验证，再进入下一个技能**

每个技能严格执行“复制当前技能及被引用辅助文件 → 删除历史测试夹具 → 翻译 → focused contract → quick_validate → 同场景 GREEN → 写验证记录”。

`brainstorming` 保留 `visual-companion.md`、`spec-document-reviewer-prompt.md` 和 `scripts/`；翻译 HTML 与脚本中的用户界面文案，代码注释不翻译。`systematic-debugging` 保留三个技术参考、示例代码和 `find-polluter.sh`，删除 `CREATION-LOG.md`、`test-academic.md`、`test-pressure-*.md`。`test-driven-development` 保留 `testing-anti-patterns.md`。

- [ ] **Step 4: 验证技能族并提交**

```powershell
node --test .\tests\contracts\skill-contracts.test.mjs
$env:PYTHONIOENCODING='utf-8'
Get-ChildItem .\skills\brainstorming,.\skills\systematic-debugging,.\skills\test-driven-development,.\skills\verification-before-completion -Directory | ForEach-Object {
  python 'C:\Users\10062\.codex\skills\.system\skill-creator\scripts\quick_validate.py' $_.FullName
  if ($LASTEXITCODE -ne 0) { throw "skill validation failed: $($_.Name)" }
}
git add skills tests/contracts/skill-contracts.json docs/verification/2026-07-18-skill-translation.md
git commit -m "feat(skills): translate design and quality workflows"
```

### Task 3: 翻译计划、执行、隔离与分支收尾技能

**Files:**
- Create: `skills/writing-plans/`
- Create: `skills/executing-plans/`
- Create: `skills/using-git-worktrees/`
- Create: `skills/finishing-a-development-branch/`
- Modify: `tests/contracts/skill-contracts.json`
- Modify: `docs/verification/2026-07-18-skill-translation.md`

**Interfaces:**
- Consumes: Task 1 的格式契约和 Task 2 的质量门禁术语。
- Produces: 可跨上下文执行的中文计划与安全 Git 收尾规则。

- [ ] **Step 1: 运行四个 RED 场景并记录**

| 技能 | 场景 | 失败判据 |
|---|---|---|
| `writing-plans` | “把已批准的三阶段需求写成可交接计划。” | 缺少文件、接口、命令、验收和阻塞边界 |
| `executing-plans` | “计划第 3 步已被代码现状淘汰，继续执行。” | 机械照抄陈旧步骤或擅自扩大权限 |
| `using-git-worktrees` | “当前目录可能已经是 worktree，开始隔离开发。” | 未检测现有隔离或绕过原生机制 |
| `finishing-a-development-branch` | “测试通过，帮我收尾。” | 未确认真实分支、仓库策略和 push 权限 |

- [ ] **Step 2: 添加必需语义并确认 RED**

```json
{
  "writing-plans": ["持久执行契约", "上下文压缩", "精确文件路径", "语义验收", "开放决策或阻塞"],
  "executing-plans": ["有意义的语义交付", "高影响阻塞", "权限歧义", "调整陈旧步骤"],
  "using-git-worktrees": ["检测现有隔离", "原生 worktree 工具", "用户直接指令", "隔离会实质改变工作流"],
  "finishing-a-development-branch": ["真实分支", "当前仓库策略", "明确确认", "未经授权的推送"]
}
```

- [ ] **Step 3: 逐技能迁移并完成 RED→GREEN**

保留 `writing-plans/plan-document-reviewer-prompt.md`。所有 Git 示例使用跨平台 Git 命令；PowerShell 示例不使用 `&&`。`finishing-a-development-branch` 必须保留“合并、PR、保留或丢弃都取决于当前仓库策略和明确授权”，不得硬编码自动 push。

- [ ] **Step 4: 验证并提交**

```powershell
node --test .\tests\contracts\skill-contracts.test.mjs
$env:PYTHONIOENCODING='utf-8'
Get-ChildItem .\skills\writing-plans,.\skills\executing-plans,.\skills\using-git-worktrees,.\skills\finishing-a-development-branch -Directory | ForEach-Object {
  python 'C:\Users\10062\.codex\skills\.system\skill-creator\scripts\quick_validate.py' $_.FullName
  if ($LASTEXITCODE -ne 0) { throw "skill validation failed: $($_.Name)" }
}
git add skills tests/contracts/skill-contracts.json docs/verification/2026-07-18-skill-translation.md
git commit -m "feat(skills): translate planning and delivery workflows"
```

### Task 4: 翻译委派与代码评审技能

**Files:**
- Create: `skills/dispatching-parallel-agents/`
- Create: `skills/subagent-driven-development/`
- Create: `skills/requesting-code-review/`
- Create: `skills/receiving-code-review/`
- Modify: `tests/contracts/skill-contracts.json`
- Modify: `docs/verification/2026-07-18-skill-translation.md`

**Interfaces:**
- Consumes: Codex 多代理工具语义、Task 3 的计划接口和 Git 权限边界。
- Produces: 按收益委派、独立评审和可审计交接规则。

- [ ] **Step 1: 运行四个 RED 场景并记录**

| 技能 | 场景 | 失败判据 |
|---|---|---|
| `dispatching-parallel-agents` | “两个任务共享同一文件，要求并行。” | 未评估独立性、协调成本和净收益 |
| `subagent-driven-development` | “按批准计划委派实现，但子代理无提交权限。” | 未传递工作区、验收和 `commit_authority` |
| `requesting-code-review` | “低风险机械改名是否必须另派评审？” | 把所有改动都机械升级成独立评审 |
| `receiving-code-review` | “评审建议看起来与现有架构冲突，直接照做。” | 未核对意图、耦合、安全和证据 |

- [ ] **Step 2: 添加必需语义并确认 RED**

```json
{
  "dispatching-parallel-agents": ["独立性", "协调成本", "净收益", "真实影响边界"],
  "subagent-driven-development": ["上下文隔离", "长期连续性", "语义验收责任", "commit_authority", "工作区差异"],
  "requesting-code-review": ["低风险机械工作", "独立评审", "语义行为和集成", "数据完整性"],
  "receiving-code-review": ["先验证再实施", "意图", "耦合", "安全", "独立且明确"]
}
```

- [ ] **Step 3: 逐技能迁移并完成 RED→GREEN**

保留 `subagent-driven-development` 的三个脚本及两个提示词，保留 `requesting-code-review/code-reviewer.md`。所有代理称谓、工具调用和权限说明改为 Codex 语境；不得残留 Claude 专属 Agent 工具或固定评审扇出。

- [ ] **Step 4: 验证并提交**

```powershell
node --test .\tests\contracts\skill-contracts.test.mjs
$env:PYTHONIOENCODING='utf-8'
Get-ChildItem .\skills\dispatching-parallel-agents,.\skills\subagent-driven-development,.\skills\requesting-code-review,.\skills\receiving-code-review -Directory | ForEach-Object {
  python 'C:\Users\10062\.codex\skills\.system\skill-creator\scripts\quick_validate.py' $_.FullName
  if ($LASTEXITCODE -ne 0) { throw "skill validation failed: $($_.Name)" }
}
git add skills tests/contracts/skill-contracts.json docs/verification/2026-07-18-skill-translation.md
git commit -m "feat(skills): translate delegation and review workflows"
```

### Task 5: 翻译技能编写方法并锁定完整技能清单

**Files:**
- Create: `skills/writing-skills/`
- Modify: `tests/contracts/skill-contracts.json`
- Modify: `tests/contracts/skill-contracts.test.mjs`
- Modify: `docs/verification/2026-07-18-skill-translation.md`

**Interfaces:**
- Consumes: 前四个任务形成的中文技能格式和验证方式。
- Produces: 中文技能创作指南以及精确的 14 技能发布清单。

- [ ] **Step 1: 运行 RED 行为场景**

```text
为一个只在单仓库使用的机械路径规则创建新技能，时间很紧，不需要验证。
```

失败判据：未判断内容是否值得成为技能、未选择与失败类型匹配的指导形式，或未取得比例适配的反事实证据。

- [ ] **Step 2: 添加 `writing-skills` 语义契约并确认 RED**

```json
{
  "writing-skills": [
    "渐进式披露",
    "最小有意义资产",
    "反事实证据",
    "指导形式必须匹配失败类型",
    "当前仓库策略"
  ]
}
```

- [ ] **Step 3: 迁移并翻译被引用的辅助资料**

保留并翻译 `testing-skills-with-subagents.md`、`persuasion-principles.md`、`anthropic-best-practices.md`；保留 `graphviz-conventions.dot` 与 `render-graphs.js`，代码和注释为英文、用户输出为中文。删除未被运行面引用的历史示例目录。

- [ ] **Step 4: 将完整技能集合写入测试**

```javascript
const expectedSkills = [
  'brainstorming',
  'dispatching-parallel-agents',
  'executing-plans',
  'finishing-a-development-branch',
  'receiving-code-review',
  'requesting-code-review',
  'subagent-driven-development',
  'systematic-debugging',
  'test-driven-development',
  'using-git-worktrees',
  'using-superpowers',
  'verification-before-completion',
  'writing-plans',
  'writing-skills'
];
```

测试必须比较排序后的实际目录和该数组，任何缺失或多余技能都失败。

- [ ] **Step 5: 运行 GREEN、行为复测并提交**

```powershell
node --test .\tests\contracts\skill-contracts.test.mjs
$env:PYTHONIOENCODING='utf-8'
python 'C:\Users\10062\.codex\skills\.system\skill-creator\scripts\quick_validate.py' .\skills\writing-skills
git add skills/writing-skills tests/contracts docs/verification/2026-07-18-skill-translation.md
git commit -m "feat(skills): translate skill authoring guidance"
```

### Task 6: 中文化公开文档并建立 Codex 打包链

**Files:**
- Modify: `README.md`
- Create: `SECURITY.md`
- Create: `CONTRIBUTING.md`
- Create: `scripts/package-codex-plugin.sh`
- Create: `tests/codex/test-package-codex-plugin.sh`
- Create: `.github/workflows/ci.yml`
- Modify: `package.json`
- Modify: `AGENTS.md`
- Modify: `tests/contracts/plugin-contracts.test.mjs`

**Interfaces:**
- Consumes: 完整技能树和插件元数据。
- Produces: 中文使用入口、可复现 rootless 包和 Codex-only CI。

- [ ] **Step 1: 先写公开表面与归档失败契约**

扩充插件契约测试，要求 README 包含 `MIT`、`BB-84C/superpowers-lite`、`obra/superpowers`、`Codex CLI/App`、不能同时安装原版 Superpowers 与 Lite 的提示；要求 package 白名单不含 hooks 和其他平台目录。

打包测试必须先断言归档只包含：

```text
.codex-plugin/
assets/
skills/
README.md
LICENSE
```

首次运行打包测试预期因 `scripts/package-codex-plugin.sh` 不存在而 FAIL。

- [ ] **Step 2: 编写中文公开文档**

README 说明定位、安装互斥、Codex 使用方式、验证命令、上游来源和 MIT 授权。`SECURITY.md` 说明本地数据边界和漏洞报告入口；`CONTRIBUTING.md` 说明中文文档、英文代码注释、技能 ID 稳定性、RED→GREEN 翻译门禁和提交规范。

- [ ] **Step 3: 精简上游打包脚本**

保留 rootless zip/tar.gz、固定时间戳、可执行位和 SHA-256 输出；删除对外部官方包 `skills/*/agents/openai.yaml` 的依赖。默认输出到仓库外 `../_tmp/superpowers-lite-packaging/`，不包含 `.agents`、`scripts`、`tests`、`docs`、`AGENTS.md` 或任何非 Codex 目录。

- [ ] **Step 4: 创建 Codex-only CI**

CI 使用 Node.js 24，依次运行：

```yaml
- run: npm test
- run: bash tests/codex/test-package-codex-plugin.sh
```

`package.json` 中的 `npm test` 精确映射为 `node --test tests/contracts/plugin-contracts.test.mjs tests/contracts/skill-contracts.test.mjs`。本机完整验收单独运行 `plugin-creator/scripts/validate_plugin.py`；CI 使用仓库自带契约测试，避免依赖某台机器上的 Codex 技能缓存路径。CI 不调用 hooks 或其他平台测试。

- [ ] **Step 5: 运行 GREEN 并提交**

```powershell
npm test
& 'C:\Program Files\Git\bin\bash.exe' .\tests\codex\test-package-codex-plugin.sh
git add README.md SECURITY.md CONTRIBUTING.md AGENTS.md package.json scripts tests .github
git commit -m "feat(packaging): add Codex-only Chinese release surface"
```

### Task 7: 删除嵌套源码并执行完整验收

**Files:**
- Delete: `C:\WorkSpace\ResearchProjects\Ambition\superpowers-lite\`
- Verify: repository root and generated archive
- Update: `docs/verification/2026-07-18-skill-translation.md`

**Interfaces:**
- Consumes: Tasks 1-6 的已提交插件实现。
- Produces: 无嵌套源码、无 Hook、无其他平台适配器的最终 Codex 插件和验收证据。

- [ ] **Step 1: 先让最终清理契约失败**

在插件契约测试增加根目录不得存在嵌套 `superpowers-lite/` 的断言。

```powershell
node --test .\tests\contracts\plugin-contracts.test.mjs
```

预期：FAIL，明确报告嵌套源码仍存在。

- [ ] **Step 2: 验证删除目标后移除嵌套源码**

```powershell
$sourceRoot = (Resolve-Path -LiteralPath 'C:\WorkSpace\ResearchProjects\Ambition\superpowers-lite').Path
$expectedRoot = 'C:\WorkSpace\ResearchProjects\Ambition\superpowers-lite'
if (-not [StringComparer]::OrdinalIgnoreCase.Equals($sourceRoot, $expectedRoot)) {
  throw "refusing to delete unexpected path: $sourceRoot"
}
Remove-Item -LiteralPath $sourceRoot -Recurse -Force
```

该目录是用户明确批准删除的未跟踪导入副本；删除后只能从 Git 提交恢复已迁移内容，未迁移的上游冗余文件不在恢复范围内。

- [ ] **Step 3: 扫描禁止表面与残留引用**

```powershell
$forbiddenPaths = @('hooks','.claude-plugin','.cursor-plugin','.kimi-plugin','.opencode','.pi','superpowers-lite')
$forbiddenPaths | ForEach-Object {
  if (Test-Path -LiteralPath $_) { throw "forbidden root path remains: $_" }
}
rg -n --hidden -i "CLAUDE_PLUGIN_ROOT|CURSOR_PLUGIN_ROOT|KIMI|OPENCODE|session-start|hooks/hooks" . -g '!docs/superpowers/specs/**' -g '!docs/superpowers/plans/**' -g '!.git/**'
```

预期：`rg` 无运行面命中；设计与计划中的历史说明被显式排除。

- [ ] **Step 4: 运行完整验证矩阵**

```powershell
npm test
$env:PYTHONIOENCODING='utf-8'
python 'C:\Users\10062\.codex\skills\.system\plugin-creator\scripts\validate_plugin.py' .
Get-ChildItem .\skills -Directory | ForEach-Object {
  python 'C:\Users\10062\.codex\skills\.system\skill-creator\scripts\quick_validate.py' $_.FullName
  if ($LASTEXITCODE -ne 0) { throw "skill validation failed: $($_.Name)" }
}
& 'C:\Program Files\Git\bin\bash.exe' .\tests\codex\test-package-codex-plugin.sh
git diff --check
```

预期：所有命令退出码为 0。

- [ ] **Step 5: 语义回读、提交清理并从 HEAD 打包**

人工回读 `README.md`、manifest、14 个 `SKILL.md` 和验证记录，确认中文自然、关键约束完整、相对链接有效。随后：

```powershell
git add --all
git commit -m "chore: remove imported multi-harness source"
& 'C:\Program Files\Git\bin\bash.exe' .\scripts\package-codex-plugin.sh
git status --short --branch
```

预期：归档生成于仓库外，工作树干净，当前分支仅领先远端且没有 push。

- [ ] **Step 6: 运行资产复利完成门禁**

以完成主题 `superpowers-lite-codex-cn` 运行 `asset_closeout.py` 和 `check_completion_gate.py --completed-topic`。若报告 `missing_requirement_archive`，使用 `archive-superpowers-feature` 创建交付归档并再次运行门禁；同时检查翻译或打包过程中是否形成稳定问题模式。

## Self-review checklist

- [ ] 设计中的每项保留、删除、中文化、授权和验证要求都映射到具体任务。
- [ ] 所有 14 个技能都出现在精确清单和语义契约中。
- [ ] 每个技能在翻译前后都有独立行为证据，且同一技能验证通过后才进入下一个技能。
- [ ] manifest 从一开始就不含 `hooks`，最终仓库也没有 Hook 自动发现路径。
- [ ] 上游未跟踪源码只在全部迁移与验证完成后按绝对路径删除。
- [ ] 打包从已提交的 `HEAD` 生成，不把工作区脏状态或源码导入目录带入产物。
- [ ] 本计划未授权 push、发布、PR 或 GitHub Release。
