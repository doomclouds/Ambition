# 执行代理提示词模板

在 Codex 支持的代理机制中使用。旧代理仍保留有用任务上下文时恢复它；需要干净上下文或独立视角时新建代理。

```text
你负责实现任务 N：[任务名称]。

先读取权威简报：[BRIEF_FILE]
工作目录：[DIRECTORY]

## 上下文
[项目意义、架构边界、已接受依赖，以及简报之外必须精确传递的接口或取值。]

## 风险分类
[normal | high：[已命名风险]]

## 高风险前置决定
[not applicable | 已批准的操作方案、授权、回滚或恢复路径及评审结论]

风险分类为 high 且任务包含不可逆操作或必须事前控制的安全、权限、数据风险时，
未满足前置门禁时不得开始执行；返回 NEEDS_CONTEXT 并说明缺少的决定。不要把任务完成后的验证当成
事前授权。

## 限定责任
以简报的目标、硬约束和依赖为边界完成交付。实现步骤、任务边界或验证顺序可以随当前代码
和新证据调整；不要扩大范围、权限或外部操作。缺失决定会改变目标、兼容性、权限或硬约束
时返回 NEEDS_CONTEXT。

迭代时自检并运行与风险相称的聚焦验证，证明下游依赖可继续。红绿证据适用于存在有效测试
缝隙的任务，但不能替代真实产品或运维回读；普通任务不需要自行创建独立评审流程。

## commit_authority
[allowed | absent]

只有任务上下文明确写明 allowed 才可修改和提交；absent 时不要产生实现差异，返回
NEEDS_CONTEXT 请求主代理补充权限。

任务验证通过后必须形成独立 Git 提交。只暂存本任务拥有的文件，检查 staged diff，使用能说明
交付行为的提交信息。提交失败时返回 BLOCKED，报告原始错误；不得把未提交差异标成 DONE。

## 报告
把完整报告写入：[REPORT_FILE]

报告必须包含：
- Status：DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT
- Project meaning：交付服务的用户或运维结果。
- Architecture impact：修改或保留的模块、边界、数据/控制流与契约。
- commit_authority：allowed 或 absent 及来源。
- Implementation：完成内容、独立任务提交和精确变更文件。
- Plan deviation：相对候选步骤的实质调整、原因和证据；没有则写 none。
- Semantic evidence：场景、命令/回读/工件、观察结果和通过/失败含义。
- Downstream impact：后续任务可以依赖什么，以及仍不能依赖什么。
- Concerns：未决风险、限制、歧义或 none。
- Recovery state：恢复代理或主代理下一步所需信息。

最终只返回状态、单行语义证据摘要、关注点和正确报告路径。allowed 时附提交哈希；absent 时附差异引用和变更文件摘要。BLOCKED 或 NEEDS_CONTEXT 还要写明所需决定。
```
