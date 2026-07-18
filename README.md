# Ambition Codex Plugins

本仓库采用 Codex marketplace + `plugins/` 布局。

## 插件

- [Superpowers Lite](plugins/superpowers-lite/README.md)：仅面向 Codex CLI/App 的中文工程工作流技能集。

## 安装

```powershell
codex plugin marketplace add <仓库根目录>
codex plugin add superpowers-lite@superpowers-lite
```

marketplace 清单位于 `.agents/plugins/marketplace.json`，插件源码位于
`plugins/superpowers-lite/`。

## 验证

```powershell
npm --prefix .\plugins\superpowers-lite test
& 'C:\Program Files\Git\bin\bash.exe' .\plugins\superpowers-lite\tests\codex\test-runtime-scripts.sh
& 'C:\Program Files\Git\bin\bash.exe' .\plugins\superpowers-lite\tests\codex\test-package-codex-plugin.sh
```
