# Superpowers Lite 插件目录对齐设计

## 背景

当前 `Ambition` 仓库根目录本身就是 `superpowers-lite` 插件根，`.codex-plugin/`、
`skills/`、`scripts/`、`tests/` 和插件公开文档均散布在仓库根。参考仓库
`C:\WorkSpace\ResearchProjects\CodexPlugin` 使用多插件布局：仓库根负责 marketplace、
CI 和项目资产，每个插件在 `plugins/<plugin-name>/` 下拥有自己的 manifest、技能和测试。

本次调整只对齐目录所有权和路径，不改变 14 个技能的内容、插件 ID、版本或 Codex-only
边界。正式插件名和目录名继续使用 `superpowers-lite`；`superpowers-lite-cn` 仅是需求主题，
不是运行时名称。

## 目标结构

```text
Ambition/
├── .agents/plugins/marketplace.json
├── .github/workflows/ci.yml
├── docs/
│   ├── superpowers/
│   └── verification/
├── plugins/
│   └── superpowers-lite/
│       ├── .codex-plugin/plugin.json
│       ├── assets/
│       ├── skills/
│       ├── scripts/
│       ├── tests/
│       ├── package.json
│       ├── README.md
│       ├── LICENSE
│       ├── SECURITY.md
│       └── CONTRIBUTING.md
├── .gitattributes
├── .gitignore
├── AGENTS.md
├── LICENSE
└── README.md
```

## 所有权边界

### 仓库根

- `.agents/plugins/marketplace.json`：公开仓库中的插件目录，源路径改为
  `./plugins/superpowers-lite`。
- `.github/workflows/ci.yml`：仓库级 CI，在插件目录下运行契约和打包测试。
- `docs/superpowers/`、`docs/verification/`：需求历史、完成归档、问题资产和迁移证据。
- `AGENTS.md`：仓库导航、插件位置和从仓库根执行的验证命令。
- `README.md`：说明仓库 marketplace 结构，并链接插件 README。
- `LICENSE`：保留仓库级 MIT 许可。

### `plugins/superpowers-lite`

- 拥有插件运行面：manifest、assets、14 个技能及其辅助脚本。
- 拥有插件维护面：契约测试、真实 Bash 行为测试、打包脚本和 `package.json`。
- 拥有插件公开文档：使用说明、贡献规则、安全边界和一份与仓库根相同的 MIT
  `LICENSE`，确保 rootless 发布归档仍能独立携带许可证及上游版权声明。

## 路径与元数据调整

- marketplace 条目使用：

  ```json
  {
    "source": "local",
    "path": "./plugins/superpowers-lite"
  }
  ```

- `.codex-plugin/plugin.json` 的 `name` 保持 `superpowers-lite`，版本保持 `0.1.0`；
  `homepage` 和界面网站地址指向仓库中的 `plugins/superpowers-lite`。
- 插件 manifest 内的 `skills`、图标和其他相对路径仍以插件目录为基准。
- 根 `.gitattributes` 更新为嵌套脚本路径，继续保留 Bash 可执行位。
- 历史 spec、plan 和 archive 不机械重写；本设计作为后续结构决策来源，完成后更新现有
  交付 archive 的相关说明和验证快照。

## 测试与打包

- 插件目录内的 Node 契约以 `plugins/superpowers-lite` 为插件根，同时显式定位两级以上的
  仓库 marketplace；测试必须锁定 marketplace 源路径和正式发布白名单。
- CI 使用 `working-directory: plugins/superpowers-lite`，运行：

  ```text
  npm test
  bash tests/codex/test-runtime-scripts.sh
  bash tests/codex/test-package-codex-plugin.sh
  ```

- 打包脚本从 Git `HEAD` 的 `plugins/superpowers-lite` 子树读取内容，归档根层仍只有：

  ```text
  .codex-plugin/
  assets/
  skills/
  README.md
  LICENSE
  ```

- 默认产物继续写到仓库外，不允许在 `plugins/` 内生成 `_tmp` 或发布归档。
- 本地最终验证从仓库根执行嵌套插件校验、14 个技能校验、运行脚本测试、确定性打包测试
  和禁止 Hook/非 Codex 路径扫描。

## 迁移策略

1. 先扩充契约，使其要求新 marketplace 路径和嵌套插件根，并确认旧结构失败。
2. 使用 Git 移动保留文件历史，将插件运行面和维护面迁入 `plugins/superpowers-lite/`。
3. 调整脚本、CI、README、AGENTS 和验证记录中的活动路径。
4. 确认仓库根不再存在 `.codex-plugin/`、`assets/`、`skills/`、`scripts/`、`tests/`
   和根 `package.json`。
5. 从最终提交的 `HEAD` 重新生成并检查 rootless 归档。

若迁移失败，回退本次结构提交即可恢复原有根插件布局；不删除技能内容，也不更改插件 ID。

## 非目标

- 不新增或恢复 Hook、MCP、App 和其他代理平台适配。
- 不改写 14 个技能的工作流语义或中文文案。
- 不改变插件名、技能 ID、版本或上游授权关系。
- 不把 `Ambition` 合并进参考仓库，也不复制参考仓库中的其他插件。
- 不推送、不发布、不创建 GitHub Release。

## 完成标准

- 仓库 marketplace 能通过 `./plugins/superpowers-lite` 定位唯一插件。
- `plugins/superpowers-lite/.codex-plugin/plugin.json` 通过 Codex 插件校验。
- 仓库根不再被误识别为插件根，插件文件全部归入明确的插件目录。
- 23 项契约、运行脚本行为测试、14 个技能校验和确定性打包测试在新路径下通过。
- 发布归档继续保持 Codex-only、无 Hook、无其他平台适配器并携带 MIT 许可。
