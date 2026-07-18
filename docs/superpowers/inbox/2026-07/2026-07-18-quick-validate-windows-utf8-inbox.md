# Windows 中文技能校验需要显式 UTF-8 模式

- Date: `2026-07-18`
- Topic slug: `quick-validate-windows-utf8`
- Status: `Inbox`
- Lifecycle: `Promoted`
- Revisit trigger: `后续中文技能再次运行 quick_validate.py，或校验脚本改为显式 UTF-8 读取时`
- Scope: `Environment`
- Confidence: `Medium`
- Route candidate: `new-problem`

## Signal

在中文 Windows 默认 GBK 文件解码环境中，`quick_validate.py` 首次读取 UTF-8 中文
`SKILL.md` 时失败；设置 `PYTHONUTF8=1` 后，同一技能与同一校验脚本通过。

## Why It Might Matter

本项目后续还要验证 13 个中文技能。如果只设置 `PYTHONIOENCODING=utf-8`，控制台输出可以
正常，但 Python 默认文本读取仍可能使用 GBK，导致把有效技能误判为校验失败。

## What Is Missing

- 已在多个中文技能上重复，并定位到 `quick_validate.py` 未指定编码的 `Path.read_text()`。
- 当前信号已完整提升为正式问题，没有遗留的未决证据。

## Likely Next Route

已提升到正式问题资产。后续技能验证统一同时设置 `PYTHONIOENCODING=utf-8` 与
`PYTHONUTF8=1`；若上游校验器改为显式 UTF-8 读取，再更新问题资产的恢复边界。

## Related Assets

- Spec: [Superpowers Lite Codex 中文版设计](../../specs/2026-07-18-superpowers-lite-codex-cn-design.md)
- Plan: [Superpowers Lite Codex 中文版实施计划](../../plans/2026-07-18-superpowers-lite-codex-cn.md)
- Archive: [Superpowers Lite Codex 中文版交付归档](../../archives/2026-07/2026-07-18-superpowers-lite-codex-cn-archives.md)
- Problems: [Windows 中文技能校验需要同时启用 Python UTF-8 模式](../../problems/2026-07/2026-07-18-quick-validate-windows-utf8-problem.md)
