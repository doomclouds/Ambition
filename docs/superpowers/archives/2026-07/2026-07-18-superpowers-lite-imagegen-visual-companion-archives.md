# Superpowers Lite ImageGen 视觉伴侣归档

- Date: `2026-07-18`
- Topic slug: `superpowers-lite-imagegen-visual-companion`
- Status: `Archived`
- Scope: `Feature`
- Tags: `superpowers-lite`, `brainstorming`, `imagegen`, `visual-companion`, `codex`

## Summary

`brainstorming` 的视觉伴侣已从本地页面与服务运行面切换为 Codex/ChatGPT 内置 ImageGen。
视觉决策现在通过高保真图片在对话中直接展示，同时以文字保存精确内容与最终批准。

## Delivered Scope

- 建立 ImageGen-only 生成、编辑、内联展示和失败语义，不提供外部生成或模型切换路径。
- 固化 A/B/C 可比性：统一画布、视口、内容与保真度，一轮只改变一个主要变量。
- 明确精确文字旁路以及预览图片与项目资产的保存边界。
- 删除 `brainstorming` 下 5 个页面、客户端、服务与启停脚本，版本升至 `0.1.4`。
- 新增静态契约和压力场景，阻止旧运行面、混杂变量比较和位图承载唯一精确规格。

## Out of Scope

- 未生成示例视觉稿，也未把模型输出质量当作本次插件契约的验收内容。
- 未修改 Codex 自带 `imagegen` 技能或内置图像工具。
- 未添加 hooks、apps、MCP 或其他代理平台适配器。
- 未推送远端，也未创建 PR。

## Verification Snapshot

- 新契约在旧实现上得到 27/32 GREEN、5 项目标行为 RED；实现后恢复 32/32 GREEN。
- 13/13 技能 `quick_validate.py`、插件校验、真实 Git Bash 运行测试和确定性打包测试通过。
- Codex-only 发布树扫描、`git diff --check` 和正式 ZIP 根层白名单检查通过。
- 正式 ZIP：54 个条目、13 个技能，旧视觉脚本条目为 0，SHA-256
  `fe0161e662e84a400748d546821a8d61b6da0fda1146d05bf8952904cf80daa2`。

## Source Documents

- Spec: [Superpowers Lite ImageGen 视觉伴侣设计](../../specs/2026-07-18-superpowers-lite-imagegen-visual-companion-design.md)
- Visual: None found for this topic.
- Plan: [Superpowers Lite ImageGen 视觉伴侣实施计划](../../plans/2026-07-18-superpowers-lite-imagegen-visual-companion.md)

## Related Problems

- None found for this topic.

## Notes

- 设计、RED 契约和实现分别形成独立本地提交；本归档与验证记录作为最后一个文档交付提交。
- 内置 ImageGen 不可用时，技能明确保留文字决策并停止出图，不偷偷切换其他生成路径。
