# 安全说明

## 本地数据边界

Superpowers Lite 仅提供 Codex 技能文本和本地辅助脚本，不声明 hooks、MCP servers
或 apps，也不会自行启动常驻进程或上传本地数据。技能执行期间能够访问什么，仍由
Codex 当前会话、工作区权限和用户批准决定。

安装前请审阅 `.codex-plugin/plugin.json` 与目标技能。涉及写文件、执行命令、Git
提交或外部系统操作时，应继续遵守项目自身的授权边界；插件不会替用户扩大权限。

## 报告漏洞

安全问题请不要先公开到普通 Issue。请通过 GitHub 的
[私密安全报告](https://github.com/doomclouds/Ambition/security/advisories/new) 提交，
并附上受影响版本、复现步骤、实际影响和可行的缓解方式。

普通缺陷和文档问题可提交到
[项目 Issues](https://github.com/doomclouds/Ambition/issues)。
