# Superpowers Lite Codex 中文版交付归档

- Date: `2026-07-18`
- Topic slug: `superpowers-lite-codex-cn`
- Status: `Archived`
- Scope: `Feature`
- Tags: `codex-plugin`, `superpowers-lite`, `chinese`, `codex-only`

## Summary

仓库使用名为 `Ambition` 的 marketplace + `plugins/` 布局公开独立的 `superpowers-lite` Codex 插件：
保留 Lite 工作流的核心语义和 13 个稳定技能 ID，将公开人类可读内容中文化，并移除
Hook、嵌套源码和其他代理平台适配层。

## Delivered Scope

- 在 `plugins/superpowers-lite/` 建立自包含 manifest、图标、13 个中文技能、测试和打包链，
  由根 `.agents/plugins/marketplace.json` 以 `Ambition` 为商城名并使用 local source path 定位。
- 保留 MIT 原文以及 `BB-84C/superpowers-lite`、`obra/superpowers` 两级上游归属。
- 增加 Codex-only 契约、真实脚本安全测试、Node 24 CI 和确定性 ZIP/tar.gz 打包链。
- 删除主检出中的未跟踪上游导入副本，并用正式发布面扫描阻止 Hook 和非 Codex 适配残留。
- 为分支收尾、评审反馈和系统调试补回最小高风险护栏，同时保留 Lite 的比例化触发、
  批量执行和一次最终统一审查边界。

## Out of Scope

- 不提供 Claude Code、Cursor、Kimi、OpenCode、Pi 等平台兼容层。
- 不新增会话 Hook、MCP、App、远程发布、GitHub Release 或自动 push。

## Verification Snapshot

- 迁入插件目录后 `npm test`：24/24 通过；`find-polluter.sh` 与 `stop-server.sh` 真实行为和路径安全测试通过。
- Codex 插件校验通过；14/14 技能通过 `quick_validate.py`。
- ZIP/tar.gz 白名单、时间戳、可执行位、SHA-256 和重复构建一致性测试通过。
- 最终只读代码审查关闭 4 个 Important 与 2 个 Minor，结论为 `Ready to merge: Yes`。
- 目录对齐后的 ZIP SHA-256：`e8ba53e188fc40c64fad252e029d4678e9a193942ed9d72a16be400f7edba47f`。
- 高风险最小护栏优化后，Node 契约 24/24、目标技能 3/3、完整技能 14/14、真实运行脚本
  和确定性打包全部通过；统一审查关闭 3 个 Important；ZIP SHA-256：
  `36078417298bccba1369045ecc9ab8b681841f2d5c0bcc82a3ef5f6ed3200a4f`。
- `0.1.1` 移除 `writing-skills` 后，Node 契约 26/26、剩余技能 13/13、运行脚本、
  Codex-only 打包测试和插件校验全部通过；58 条目 ZIP SHA-256：
  `6df88af55304d5de0359fa62e4b04900dcf13229c5857e1d930d05abda0d610e`。
- `0.1.2` 将 marketplace 机器名和展示名统一为仓库名 `Ambition`，安装入口改为
  `superpowers-lite@Ambition`；完整验证通过，58 条目 ZIP SHA-256：
  `ebd522bb8839f828a884590e2c560527af1f60b818aa7c1d6e00c0b67a6e1ccc`。

## Source Documents

- Spec: [Superpowers Lite Codex 中文版设计](../../specs/2026-07-18-superpowers-lite-codex-cn-design.md)
- Visual: None found for this topic.
- Plan: [Superpowers Lite Codex 中文版实施计划](../../plans/2026-07-18-superpowers-lite-codex-cn.md)
- Follow-up design: [Superpowers Lite 插件目录对齐设计](../../specs/2026-07-18-superpowers-lite-plugin-folder-alignment-design.md)
- Follow-up plan: [Superpowers Lite 插件目录对齐实施计划](../../plans/2026-07-18-superpowers-lite-plugin-folder-alignment.md)
- Follow-up design: [Superpowers Lite 高风险最小护栏设计](../../specs/2026-07-18-superpowers-lite-hard-guardrails-design.md)
- Follow-up plan: [Superpowers Lite 高风险最小护栏实施计划](../../plans/2026-07-18-superpowers-lite-hard-guardrails.md)

## Related Problems

- [Windows 中文技能校验需要同时启用 Python UTF-8 模式](../../problems/2026-07/2026-07-18-quick-validate-windows-utf8-problem.md)

## Notes

- 用户批准将原计划的逐技能、逐任务评审合并为批次实施和一次最终统一审查。
- 后续结构对齐保持相同批量执行边界，并以参考仓库的 `plugins/<plugin-name>` 所有权模型收口。
- 护栏优化只恢复安全顺序、依赖边界和重复失败复盘点，没有回填原版长篇说明或固定阶段。
- `0.1.1` 按用户要求删除不再需要的 `writing-skills`，发布面由 14 个技能收敛为 13 个。
- `0.1.2` 按用户要求让 marketplace 名称与仓库名保持一致，插件 ID 本身仍为 `superpowers-lite`。
