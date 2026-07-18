# Superpowers Lite Codex 中文版交付归档

- Date: `2026-07-18`
- Topic slug: `superpowers-lite-codex-cn`
- Status: `Archived`
- Scope: `Feature`
- Tags: `codex-plugin`, `superpowers-lite`, `chinese`, `codex-only`

## Summary

仓库根目录已成为独立的 `superpowers-lite` Codex 插件：保留 Lite 工作流的核心语义和
14 个稳定技能 ID，将公开人类可读内容中文化，并移除 Hook、嵌套源码和其他代理平台适配层。

## Delivered Scope

- 建立 `.codex-plugin/plugin.json`、仓库 marketplace、图标和 14 个中文技能运行面。
- 保留 MIT 原文以及 `BB-84C/superpowers-lite`、`obra/superpowers` 两级上游归属。
- 增加 Codex-only 契约、真实脚本安全测试、Node 24 CI 和确定性 ZIP/tar.gz 打包链。
- 删除主检出中的未跟踪上游导入副本，并用正式发布面扫描阻止 Hook 和非 Codex 适配残留。

## Out of Scope

- 不提供 Claude Code、Cursor、Kimi、OpenCode、Pi 等平台兼容层。
- 不新增会话 Hook、MCP、App、远程发布、GitHub Release 或自动 push。

## Verification Snapshot

- `npm test`：23/23 通过；`find-polluter.sh` 与 `stop-server.sh` 真实行为和路径安全测试通过。
- Codex 插件校验通过；14/14 技能通过 `quick_validate.py`。
- ZIP/tar.gz 白名单、时间戳、可执行位、SHA-256 和重复构建一致性测试通过。
- 最终只读代码审查关闭 4 个 Important 与 2 个 Minor，结论为 `Ready to merge: Yes`。
- 最终 ZIP SHA-256：`d9bd197d43fa05faf22fc37791108cc1cb1dc25621a3f175a0555c848042032f`。

## Source Documents

- Spec: [Superpowers Lite Codex 中文版设计](../../specs/2026-07-18-superpowers-lite-codex-cn-design.md)
- Visual: None found for this topic.
- Plan: [Superpowers Lite Codex 中文版实施计划](../../plans/2026-07-18-superpowers-lite-codex-cn.md)

## Related Problems

- [Windows 中文技能校验需要同时启用 Python UTF-8 模式](../../problems/2026-07/2026-07-18-quick-validate-windows-utf8-problem.md)

## Notes

- 用户批准将原计划的逐技能、逐任务评审合并为批次实施和一次最终统一审查。
