# Superpowers Lite ImageGen 视觉伴侣实施计划

**目标：** 用 Codex/ChatGPT 内置 ImageGen 取代 `brainstorming` 的 HTML 视觉伴侣，删除所有
视觉伴侣本地运行代码与回退路径，并发布 `0.1.4`。

**稳定引用：** `docs/superpowers/specs/2026-07-18-superpowers-lite-imagegen-visual-companion-design.md`、
根 `AGENTS.md`、当前 Codex `imagegen` 能力约束与插件现有契约。

**仓库操作：** 直接在当前 `main` 修改；每个完成交付独立提交。用户未授权 push 或 PR。

**恢复状态：** 先检查本计划、设计规格、`git status`、`skills/brainstorming/` 与相关契约。基线
为 `0.1.3`、工作树干净、`main` 领先 `origin/main` 7 个提交。

## 交付 1：设计与执行边界

明确 ImageGen-only、精确文字旁路、比较变量、预览/项目资产边界、失败语义、删除范围和验收。
回读文档并运行 `git diff --check`，只提交规格与计划。

## 交付 2：行为契约 RED

更新 `skill-contracts.json`、`skill-contracts.test.mjs`、压力场景和运行脚本测试契约：要求
ImageGen 内联展示，禁止 `brainstorming/scripts/`、HTML 服务与 CLI/API 回退，并新增可比性压力
场景。运行 Node 契约取得因旧实现仍存在、正文缺少新语义而产生的有效 RED；只提交测试差异。

## 交付 3：ImageGen-only 实现与版本

重写 `brainstorming/SKILL.md` 和 `visual-companion.md`，删除旧 HTML、JavaScript、Node 与 Shell
脚本，更新 manifest、package、marketplace 至 `0.1.4`。运行 Node 契约、brainstorming 技能校验、
插件校验和运行脚本测试转绿后，提交本交付。

## 交付 4：统一验证、发布包与归档

在已提交且干净的实现 `HEAD` 上运行 Node 契约、13 个技能校验、插件校验、Git Bash 运行测试、
打包行为测试、Codex-only 扫描和 `git diff --check`。生成正式 `0.1.4` ZIP 并记录条目数与
SHA-256；写入归档和索引后单独提交。最后在文档提交上复跑与完成声明相称的验证，保持工作树
干净，不推送。
