# Superpowers Lite 全技能深度审计与补强实施计划

**目标：** 审计全部 13 个技能，选择性补回真实工程压力场景所需的领域深度，同时保留自主执行和最终统一审查。

**稳定引用：** `docs/superpowers/specs/2026-07-18-superpowers-lite-skill-depth-audit-design.md`、根 `AGENTS.md`、原版 Superpowers `d884ae04edebef577e82ff7c4e143debd0bbec99`、当前 Codex-only 契约。

**仓库操作：** 直接在当前 `main` 修改；用户要求每个完成任务或独立交付立即形成一次 Git 提交。
不创建额外 worktree；未授权 push 或 PR。正式归档属于本地发布验证，可在干净已提交 HEAD 上执行。

**恢复状态：** 先读本计划、设计规格、`plugins/superpowers-lite/tests/contracts/` 和 `git status`；只有当前命令输出可以支持完成声明。当前基线为 `0.1.2`、13 个技能、工作树干净。

## 交付 1：审计规格与执行边界

**交付结果：** 13 个技能都有审计结论，补强范围、非目标、逐任务提交规则和最终验收可独立恢复。

**提交边界：** 回读规格与计划、运行 `git diff --check`，只提交两个新文档；提交成功后才进入 RED。

## 交付 2：全技能深度契约 RED

**交付结果：** 静态契约和压力场景能够识别所有已批准补强点，且不会要求机械扩写已足够的技能。

**硬约束与依赖：** 13 个技能 ID 不变；不恢复 `writing-skills`；场景必须覆盖每个技能，不能把
场景目录宣称为真实模型评测结果。

**候选路径：** 更新 `skill-contracts.json` 和提示模板契约；新增
`tests/evals/workflow-pressure-scenarios.json` 及 Node 形状/覆盖测试；先更新 `0.1.3` 版本期望。

**连续性证据：** `npm --prefix .\plugins\superpowers-lite test` 因缺少新正文、参考或旧版本得到
可解释 RED，既有无关契约继续通过。

**恢复检查点：** 记录精确失败项；若契约因语法、编码或路径错误失败，先修复测试基础设施，不能
把这种错误冒充行为 RED。

**提交边界：** 只提交契约、压力场景测试入口和 RED 记录；预期行为失败不是提交失败。提交成功后
才开始正文补强。

## 交付 3：工程工作流选择性补强

**交付结果：** 脑暴、并行、计划执行、分支收尾和评审接收在复杂但常见场景下提供足够判断依据。

**硬约束与依赖：** 不恢复固定问答轮次、固定方案数量、固定四选项、自动 push 或逐任务完整审查；
外部状态变化仍依赖用户授权。

**候选路径：** 修改 `brainstorming`、`dispatching-parallel-agents`、`executing-plans`、
`finishing-a-development-branch`、`receiving-code-review`；扩展最终 `code-reviewer.md`。对当前已经
足够的 `using-superpowers` 与 `using-git-worktrees` 保持不动；`writing-plans`、`executing-plans`
和 SDD 增加逐任务提交边界。

**连续性证据：** 目标技能静态契约 GREEN；场景目录中的期望决定能在正文或模板找到依据。

**恢复检查点：** 记录每个未修改技能的“保持理由”，避免后续执行者按文件数量补写。

**提交边界：** 本组契约与技能验证通过后，只提交规划、执行、委派、分支和评审接收相关文件；
提交成功后才进入质量技能补强。

## 交付 4：调试与 TDD 深化

**交付结果：** 模型能根据故障边界和行为风险选择根因实验、测试层级与完成证据。

**硬约束与依赖：** RED 必须因目标行为缺失或损坏而失败；基础设施错误不是 RED；缓解措施不能
冒充根治；支持信号不能替代语义验收。

**候选路径：** 深化 `systematic-debugging`、`root-cause-tracing.md`、`defense-in-depth.md`、
`test-driven-development`；新增 `test-selection-patterns.md`。保留现有详细
`testing-anti-patterns.md` 与 `condition-based-waiting.md`。

**连续性证据：** 目标静态契约与引用链接校验 GREEN；压力场景覆盖错误 RED、测试替身、持久化、
间歇故障、错误 RED、测试替身和持久化等风险。

**恢复检查点：** 主技能保持决策入口，长模式仅放一层参考；不在多个文件重复同一规则。

**提交边界：** 调试与 TDD 的契约、链接和技能校验通过后，只提交本组文件。

## 交付 5：完成证据、最终审查与压力场景

**交付结果：** 完成声明有可审计的证据映射，最终统一审查覆盖高风险边界，13 个技能都有压力
场景保护，版本一致升至 `0.1.3`。

**硬约束与依赖：** 不恢复逐任务完整审查；场景目录只表达行为契约；版本三处一致。

**候选路径：** 深化 `verification-before-completion`、新增 `evidence-matrix.md`、扩展最终
`code-reviewer.md`、新增压力场景 JSON，更新 manifest、package、marketplace 和 npm 测试入口。

**连续性证据：** `npm --prefix .\plugins\superpowers-lite test` 全部 GREEN，目标技能校验通过。

**提交边界：** 只提交本组技能、场景和版本文件；提交成功后才运行干净 HEAD 的正式归档验证。

## 交付 6：统一验证与资产收尾

**交付结果：** `0.1.3` 工作树具备可验证的 Codex-only 插件状态和完整审计记录。

**硬约束与依赖：** source path 保持 `./plugins/superpowers-lite`；正式发布包只能从干净已提交
`HEAD` 生成；验证文档和归档写入后必须再形成独立文档提交。

**候选路径：** 更新三处版本和验证记录；依次运行 Node 契约、13 个技能校验、插件校验、真实
Git Bash 运行测试、打包行为测试、禁止路径扫描和 `git diff --check`；对组合差异执行一次最终
统一审查。

**连续性证据：** Node 契约 31/31、13 个技能校验、插件校验、真实 Bash 运行测试、确定性打包
行为和 Codex-only 扫描均通过。正式 `0.1.3` ZIP 已从干净提交 `5dacecb` 生成：60 个条目、
13 个技能，SHA-256 `3140faec9a4af84d4ebcf39365842b007987ac481ba5232bf28a6c9b10239c6e`。
统一审查发现的 SDD 无权限交接冲突必须在收尾提交中关闭后再复验。

**恢复检查点：** 更新验证记录与项目归档后形成最后一个本地提交；确认工作树干净、所有交付均有
独立提交且 `main` 只领先远端，不 push。

**提交边界：** 验证与资产文档单独提交；提交后复跑与完成声明相称的聚焦验证并检查工作树干净。
