# Windows 中文技能校验需要同时启用 Python UTF-8 模式

- Date: `2026-07-18`
- Topic slug: `quick-validate-windows-utf8`
- Status: `Captured`
- Scope: `Environment`
- Tags: `windows`, `python`, `utf-8`, `quick-validate`

## Symptom

有效的 UTF-8 中文 `SKILL.md` 在 Windows 中文区域设置下被 `quick_validate.py` 读取失败，
而同一文件在启用 Python UTF-8 模式后立即通过。

## Trigger / Context

- Windows 的 Python 默认文本编码为 GBK，并校验包含中文的 UTF-8 技能文件。
- 只设置 `PYTHONIOENCODING=utf-8`，控制台输出正常，但文件读取编码没有改变。

## Root Cause

当前 `quick_validate.py` 使用 `Path.read_text()` 且没有传入 `encoding`，因此文件读取沿用
Python 进程默认编码。`PYTHONIOENCODING` 只控制标准输入输出，不控制 `Path.read_text()`。

## Fix

- 本地验证同时设置 `PYTHONIOENCODING=utf-8` 和 `PYTHONUTF8=1`。
- 长期修复应由校验器对 Markdown/YAML 源文件显式使用 `encoding="utf-8"`。

## Why This Fix

为每个中文技能转码会污染仓库内容，只设置输出编码又不覆盖文件读取；启用 Python UTF-8
模式能在不改源文件的前提下统一 CLI 输出和默认文本读取，显式 `encoding` 则是上游最窄的根治。

## Recognition Clues

- 异常来自 `quick_validate.py` 的 `Path.read_text()`，并出现 GBK 解码错误。
- 同一提交、同一技能在增加 `PYTHONUTF8=1` 后通过，且该现象会跨多个中文技能重复。
- 控制台没有乱码并不能证明 Python 读取文件时正在使用 UTF-8。

## Applicability / Non-Applicability

### Applies When

- Windows 默认代码页不是 UTF-8，Python 校验器读取 UTF-8 中文文本且未显式声明编码。
- 任务同时需要稳定的中文控制台输出和 UTF-8 文件读取。

### Does Not Apply When

- 校验器已对文本文件显式使用 `encoding="utf-8"`。
- Python 已通过系统配置、`-X utf8` 或等价机制启用 UTF-8 模式。
- 失败属于 YAML/frontmatter 内容错误，而不是文本解码错误。

## Related Artifacts

- Spec: [Superpowers Lite Codex 中文版设计](../../specs/2026-07-18-superpowers-lite-codex-cn-design.md)
- Plan: [Superpowers Lite Codex 中文版实施计划](../../plans/2026-07-18-superpowers-lite-codex-cn.md)
- Archive: [Superpowers Lite Codex 中文版交付归档](../../archives/2026-07/2026-07-18-superpowers-lite-codex-cn-archives.md)
- Related Problems: `None yet.`
- Code or Test:
  - 校验器：`C:\Users\10062\.codex\skills\.system\skill-creator\scripts\quick_validate.py`
  - [中文技能迁移验证记录](../../../verification/2026-07-18-skill-translation.md)
