# Superpowers Lite Codex 中文版设计

## 背景

当前仓库根目录仅包含项目说明，`superpowers-lite/` 子目录是一份待迁移的上游插件源码。该源码同时适配 Claude Code、Cursor、Kimi、OpenCode、Pi、Antigravity 和 Codex，并包含多套会话启动 Hook。

本次交付将仓库改造成独立的 `superpowers-lite` Codex 插件：插件直接位于仓库根目录，面向中文用户，仅支持 Codex CLI/App，不保留 Hook 或其他平台适配层。

## 已确认决策

- 正式插件名为 `superpowers-lite`，展示名为 `Superpowers Lite`。
- 仓库根目录是插件根目录，不保留嵌套的 `superpowers-lite/` 副本。
- 运行目标仅为 Codex CLI/App。
- 删除所有插件 Hook、Hook 启动脚本、Hook 测试和相关说明。
- 删除 Claude Code、Cursor、Kimi、OpenCode、Pi、Antigravity 等非 Codex 适配器及其专属测试。
- 作者和仓库元数据切换为 `doomclouds/Ambition`。
- 保留 MIT 许可证原文、原作者版权信息和上游来源说明。
- 初始版本使用 `0.1.0`。

## 目标结构

```text
Ambition/
├── .agents/plugins/marketplace.json
├── .codex-plugin/plugin.json
├── assets/
├── docs/
├── scripts/
├── skills/
├── tests/
├── AGENTS.md
├── LICENSE
├── README.md
├── SECURITY.md
└── package.json
```

各部分职责如下：

- `.codex-plugin/plugin.json`：Codex 插件清单、界面元数据和技能入口。
- `.agents/plugins/marketplace.json`：仓库内插件市场入口。
- `skills/`：翻译后的完整 Lite 技能库及其必要辅助资料。
- `assets/`：Codex 应用展示所需图标。
- `scripts/`：仅保留 Codex 校验、同步或打包需要的脚本。
- `tests/`：仅保留并补充 Codex 插件契约、技能格式和中文化验证。
- `docs/`：仅保留当前插件的中文设计、维护和使用资料；删除上游历史实施计划与其他平台文档。

## 中文化规则

中文化覆盖所有最终发布的人类可读内容：

- 技能正文和辅助提示词；
- README、维护说明、安全说明和保留的测试说明；
- 插件清单中的描述、默认提示和界面文案；
- 脚本或测试直接展示给用户的消息。

以下内容保持稳定，不做字面翻译：

- 技能 ID、目录名、文件名和 manifest 字段名；
- 命令、代码、变量名、环境变量、协议字段和 URL；
- 必须精确匹配的工具名与 Codex 平台术语；
- MIT `LICENSE` 法律文本；
- 代码注释，继续使用英文。

翻译必须保持原技能的触发条件、硬性安全边界、执行顺序和验证语义，不因中文改写而扩大或削弱行为约束。

## 清理范围

迁移时不进入目标插件的内容包括：

- `hooks/` 目录及其全部文件；
- manifest 中的 Hook 声明，包括空的 `hooks` 字段；
- `.claude-plugin/`、`.cursor-plugin/`、`.kimi-plugin/`、`.opencode/`、`.pi/`；
- 仅为非 Codex 平台服务的测试、脚本、文档和 CI 步骤；
- 上游旧版发布记录、过期设计稿和历史实施计划；
- 嵌套的源码目录本身。

删除 Hook 后，仓库中不得残留指向 Hook 文件或 Hook 测试的有效配置引用。技能正文中作为通用工程概念出现的 Git Hook、事件 Hook 或调试示例不属于插件启动 Hook，可按语义保留。

## 元数据与授权

插件清单、包元数据和市场入口统一使用：

- 插件名：`superpowers-lite`
- 版本：`0.1.0`
- 仓库与主页：`https://github.com/doomclouds/Ambition`
- 开发者：`doomclouds`
- 许可证：MIT

`LICENSE` 保持原文。README 增加中文来源说明，明确本项目派生自 `BB-84C/superpowers-lite`，后者派生自 `obra/superpowers`，并保留对应链接和版权归属。

## 验证设计

实施采用分层验证：

1. 插件结构校验：必需 manifest 存在，名称、版本、路径和界面字段有效。
2. 清理契约校验：不存在插件 Hook 目录、Hook manifest 字段和非 Codex 适配器。
3. 技能格式校验：每个 `SKILL.md` 具有合法 YAML frontmatter，技能 ID 与目录名保持一致。
4. 中文化校验：发布文档和 manifest 的核心用户文案为中文，命令与代码块保持可执行形态。
5. 行为校验：对关键流程技能执行无技能基线与有技能场景测试，确认翻译未改变核心约束。
6. 打包校验：生成 Codex 插件包并检查包内文件清单，确保不带入嵌套源码、Hook 或其他平台文件。
7. 语义复核：抽查关键技能、README、授权说明和安装路径，不能只以字符串扫描代替人工语义检查。

## 非目标

- 不为其他编程代理平台提供兼容层。
- 不新增会话启动 Hook 或自动注入机制。
- 不改变 Lite 技能的稳定 ID 和核心工作流语义。
- 不在本次迁移中扩展新的技能能力。
- 不发布远程版本、不推送仓库、不创建 GitHub Release。

## 完成标准

- 仓库根目录可被识别和验证为名为 `superpowers-lite` 的 Codex 插件。
- 所有保留的人类可读核心内容已完成中文化。
- 插件中不存在 Hook 和非 Codex 平台适配层。
- 作者、仓库地址、版本和授权信息一致且可追溯。
- 自动化验证、Codex 打包检查和关键内容语义复核全部通过。
