# Superpowers Lite Codex 中文版交付归档

- Date: `2026-07-18`
- Topic slug: `superpowers-lite-codex-cn`
- Status: `Archived`
- Scope: `Feature`
- Tags: `codex-plugin`, `superpowers-lite`, `chinese`, `codex-only`

## Summary

仓库使用 marketplace + `plugins/` 布局公开独立的 `superpowers-lite` Codex 插件：
保留 Lite 工作流的核心语义和 14 个稳定技能 ID，将公开人类可读内容中文化，并移除
Hook、嵌套源码和其他代理平台适配层。

## Delivered Scope

- 在 `plugins/superpowers-lite/` 建立自包含 manifest、图标、14 个中文技能、测试和打包链，
  由根 `.agents/plugins/marketplace.json` 使用 local source path 定位。
- 保留 MIT 原文以及 `BB-84C/superpowers-lite`、`obra/superpowers` 两级上游归属。
- 增加 Codex-only 契约、真实脚本安全测试、Node 24 CI 和确定性 ZIP/tar.gz 打包链。
- 删除主检出中的未跟踪上游导入副本，并用正式发布面扫描阻止 Hook 和非 Codex 适配残留。

## Out of Scope

- 不提供 Claude Code、Cursor、Kimi、OpenCode、Pi 等平台兼容层。
- 不新增会话 Hook、MCP、App、远程发布、GitHub Release 或自动 push。

## Verification Snapshot

- 迁入插件目录后 `npm test`：24/24 通过；`find-polluter.sh` 与 `stop-server.sh` 真实行为和路径安全测试通过。
- Codex 插件校验通过；14/14 技能通过 `quick_validate.py`。
- ZIP/tar.gz 白名单、时间戳、可执行位、SHA-256 和重复构建一致性测试通过。
- 最终只读代码审查关闭 4 个 Important 与 2 个 Minor，结论为 `Ready to merge: Yes`。
- 目录对齐后的 ZIP SHA-256：`e8ba53e188fc40c64fad252e029d4678e9a193942ed9d72a16be400f7edba47f`。

## Source Documents

- Spec: [Superpowers Lite Codex 中文版设计](../../specs/2026-07-18-superpowers-lite-codex-cn-design.md)
- Visual: None found for this topic.
- Plan: [Superpowers Lite Codex 中文版实施计划](../../plans/2026-07-18-superpowers-lite-codex-cn.md)
- Follow-up design: [Superpowers Lite 插件目录对齐设计](../../specs/2026-07-18-superpowers-lite-plugin-folder-alignment-design.md)
- Follow-up plan: [Superpowers Lite 插件目录对齐实施计划](../../plans/2026-07-18-superpowers-lite-plugin-folder-alignment.md)

## Related Problems

- [Windows 中文技能校验需要同时启用 Python UTF-8 模式](../../problems/2026-07/2026-07-18-quick-validate-windows-utf8-problem.md)

## Notes

- 用户批准将原计划的逐技能、逐任务评审合并为批次实施和一次最终统一审查。
- 后续结构对齐保持相同批量执行边界，并以参考仓库的 `plugins/<plugin-name>` 所有权模型收口。
