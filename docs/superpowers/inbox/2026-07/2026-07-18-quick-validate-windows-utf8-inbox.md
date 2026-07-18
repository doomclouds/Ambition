# Windows 中文技能校验需要显式 UTF-8 模式

- Date: `2026-07-18`
- Topic slug: `quick-validate-windows-utf8`
- Status: `Inbox`
- Lifecycle: `Open`
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

- 尚未在第二个中文技能上重复该现象。
- 尚未核对 `quick_validate.py` 的具体文件打开位置及上游是否已有显式 UTF-8 修复。
- 尚未确认该现象是否只出现在当前 Python/区域设置组合中。

## Likely Next Route

后续技能验证统一同时设置 `PYTHONIOENCODING=utf-8` 与 `PYTHONUTF8=1`。若该现象在第二个
技能上复现，再提升为正式问题资产，并记录确切异常文本、脚本读取点和适用边界；若上游
脚本修复或无法复现，则关闭本条信号。

## Related Assets

- Spec: [Superpowers Lite Codex 中文版设计](../../specs/2026-07-18-superpowers-lite-codex-cn-design.md)
- Plan: [Superpowers Lite Codex 中文版实施计划](../../plans/2026-07-18-superpowers-lite-codex-cn.md)
- Archive: `None yet.`
- Problems: `None yet.`
