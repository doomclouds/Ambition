# Superpowers Lite 自适应头脑风暴归档

- Date: `2026-07-18`
- Topic slug: `superpowers-lite-adaptive-brainstorming`
- Status: `Archived`
- Scope: `Feature`
- Tags: `superpowers-lite`, `brainstorming`, `decision`, `approval`, `codex`

## Summary

`brainstorming` 已补回主动探索候选方向、推荐优先和用户确认闭环，同时保留 Lite 的风险比例
适配。GPT-5.6 可以自主决定探索维度和展开深度，但不能在承重方向仍开放时替用户拍板或静默实施。

## Delivered Scope

- 主动扫描会产生不同产品、架构或实施后果的候选空间，通常向用户展示 2～4 个实质方案。
- 明确 2～4 只是默认呈现宽度而非思考上限，允许分组或继续展开，禁止用弱方案凑数。
- 推荐方向优先说明适用条件、代价和可逆性，并在开放决定上等待用户选择或授权。
- 将方案编号、“按推荐来”“可以”“ok”等清楚短回复识别为有效批准，避免重复形式确认。
- 新增过早收敛压力场景和静态契约，版本从 `0.1.4` 升至 `0.1.5`。

## Out of Scope

- 未恢复原版固定问答轮次、固定方案上限、逐节批准或所有小改强制写规格的流程。
- 未运行真实模型质量基准；本次验证对象是技能语义、契约、结构、脚本和发布包。
- 未添加 hooks、apps、MCP 或其他代理平台适配器。

## Verification Snapshot

- 新契约在旧实现上得到 28/32 GREEN、4 项目标行为 RED；实现后恢复 32/32 GREEN。
- 13/13 技能校验、插件校验、真实 Git Bash 运行脚本测试和确定性打包测试通过。
- Codex-only 禁止路径扫描、三处版本一致性检查和 `git diff --check` 通过。
- 正式 ZIP 从干净实现提交 `e8db12ab55d6e5a6b04097952f7207927bfd0e02` 生成：54 个条目、
  13 个技能，SHA-256 `eb0637e200e4a30026f61d832f3118d78eb823b074b7883711200afb2fc322d8`。

## Source Documents

- Spec: [Superpowers Lite 自适应头脑风暴设计](../../specs/2026-07-18-superpowers-lite-adaptive-brainstorming-design.md)
- Visual: None found for this topic.
- Plan: [Superpowers Lite 自适应头脑风暴实施计划](../../plans/2026-07-18-superpowers-lite-adaptive-brainstorming.md)

## Related Problems

- None found for this topic.

## Notes

- 规格、RED 契约和实现分别形成独立提交；本归档与验证记录作为最后一个文档交付提交。
- 聚焦 GREEN 首跑发现既有契约短语少了一个“的”，在实现提交前补回并复验；没有形成独立、
  可复用的故障模式，因此未创建 problem 或 inbox 资产。
