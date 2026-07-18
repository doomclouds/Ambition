# Superpowers Lite 自主子代理开发与统一审查实施计划

**目标：** 将子代理开发默认路径改为模型自主连续执行、高风险例外中途审查、全部任务完成后统一严格审查。

**稳定引用：** `docs/superpowers/specs/2026-07-18-superpowers-lite-autonomous-sdd-review-design.md`、根 `AGENTS.md`、现有 Codex-only 插件契约。

**仓库操作：** 用户授权直接在当前 `main` 实施并提交；不创建工作树，不推送。当前分支本身就是集成目标，不额外制造空 merge。

**恢复状态：** 先检查 `git status`、本计划、设计规格和 `plugins/superpowers-lite/tests/contracts/skill-contracts.json`；只有当前可信测试输出可作为完成证据。

## 全局约束

- 计划固定目标、硬约束、真实依赖、最终验收和恢复信息，不固定例行施工步骤。
- 主模型可以调整任务顺序、任务边界和实现路径，但不能扩大范围、权限或外部操作授权。
- 中途独立审查只用于不可逆操作、安全/权限/数据、跨模块兼容和会污染后续任务的风险。
- 子任务默认只做实现者自检、聚焦验证和主代理基本验收；最终进行一次严格组合审查。
- 保留 14 个技能、现有辅助脚本和模板能力；不增加 hooks、apps、MCP 或其他平台适配。
- 不改变插件名、版本、marketplace 路径和发布白名单。

## 交付 1：自主执行语义契约 RED

**涉及文件：**

- 修改：`plugins/superpowers-lite/tests/contracts/skill-contracts.json`
- 验证：`plugins/superpowers-lite/tests/contracts/skill-contracts.test.mjs`

**契约边界：**

- `writing-plans` 锁定“意图契约”“实现步骤可调整”“最终验收”。
- `executing-plans` 锁定自主调整任务顺序或边界、重大偏离记录，以及只有硬边界变化才暂停。
- `subagent-driven-development` 锁定默认不逐任务独立审查、高风险例外和最终统一审查。
- `requesting-code-review` 锁定组合结果审查、计划偏差必须证明实际影响、集中修复与组合复验。

先只增加契约并运行：

```powershell
npm --prefix .\plugins\superpowers-lite test
```

预期目标技能因缺少新语义失败，其他契约继续通过。RED 必须证明缺失的是行为语义，不以删除
现有正文或制造语法错误伪造失败。

## 交付 2：工作流正文与提示模板 GREEN

**涉及文件：**

- 修改：`plugins/superpowers-lite/skills/writing-plans/SKILL.md`
- 修改：`plugins/superpowers-lite/skills/executing-plans/SKILL.md`
- 修改：`plugins/superpowers-lite/skills/subagent-driven-development/SKILL.md`
- 修改：`plugins/superpowers-lite/skills/subagent-driven-development/implementer-prompt.md`
- 修改：`plugins/superpowers-lite/skills/subagent-driven-development/task-reviewer-prompt.md`
- 修改：`plugins/superpowers-lite/skills/requesting-code-review/SKILL.md`
- 修改：`plugins/superpowers-lite/skills/requesting-code-review/code-reviewer.md`

**行为结果：**

- 计划正文明确区分不可推断的硬信息与可调整的实现建议。
- 执行技能授权主模型根据代码和证据调整顺序、拆分、合并和方法，并记录实质偏离。
- 子代理默认循环不再包含逐任务规格/质量审查；主代理只检查下游连续性和真实证据。
- 执行代理报告计划偏离、遗留风险和下游影响，不机械复述逐步完成情况。
- 任务评审模板明确是高风险例外，只审命名风险，不扩成完整双审。
- 最终评审按用户意图、硬约束、设计、真实契约与证据、计划建议步骤的优先级判断偏差。
- Critical/Important 按依赖集中修复，组合复验后只在语义或风险再次变化时收口复审。

实现后运行完整 Node 契约和受影响技能校验，要求全部通过。若实际检查表明某个模板已经满足
设计，则保持不动并在验证记录中说明，不为了凑变更文件而改写。

## 交付 3：统一审查、完整验证和资产收口

**涉及文件：**

- 更新：`docs/verification/2026-07-18-skill-translation.md`
- 更新：`docs/superpowers/archives/2026-07/2026-07-18-superpowers-lite-codex-cn-archives.md`

**验证顺序：**

1. 运行 Node 契约，确认全部通过。
2. 对受影响技能以及完整 14 技能运行 `quick_validate.py`。
3. 运行 Codex-only 禁止路径扫描、插件校验和 `git diff --check`。
4. 使用明确 Git Bash 路径运行真实脚本和确定性打包测试。
5. 从干净且已提交的 `HEAD` 生成正式 ZIP，记录条目、技能数和 SHA-256。
6. 对全部变更执行一次只读统一审查；集中修复 Critical/Important，再组合复验。
7. 更新现有交付归档和验证记录，不新建重复归档。
8. 提交最终文档，确认 `main` 干净；不推送。

**完成证据：**

- Node 契约无失败；14 个技能全部有效。
- 真实 Bash 运行测试、确定性 ZIP/tar.gz 测试和插件校验通过。
- 发布包根层仍严格符合 Codex-only 白名单，正式 ZIP 哈希与文档一致。
- 最终统一审查无未关闭 Critical/Important。
- 资产索引和完成门禁通过。
