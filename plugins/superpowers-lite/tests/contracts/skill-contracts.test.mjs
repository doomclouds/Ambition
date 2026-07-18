import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..', '..');
const skillsRoot = path.join(root, 'skills');
const contracts = JSON.parse(
  fs.readFileSync(path.join(import.meta.dirname, 'skill-contracts.json'), 'utf8')
);
const normalize = (value) => value.replace(/\s+/gu, ' ').trim();
const withoutCodeFences = (value) => value.replace(/```[\s\S]*?```/gu, '');
const expectedSkills = [
  'brainstorming',
  'dispatching-parallel-agents',
  'executing-plans',
  'finishing-a-development-branch',
  'receiving-code-review',
  'requesting-code-review',
  'subagent-driven-development',
  'systematic-debugging',
  'test-driven-development',
  'using-git-worktrees',
  'using-superpowers',
  'verification-before-completion',
  'writing-plans'
];

const promptContracts = [
  {
    file: path.join(skillsRoot, 'subagent-driven-development', 'implementer-prompt.md'),
    required: [
      '风险分类',
      '高风险前置决定',
      '未满足前置门禁时不得开始执行',
      '普通任务不需要自行创建独立评审流程'
    ],
    forbidden: ['每个任务都必须独立评审']
  },
  {
    file: path.join(skillsRoot, 'subagent-driven-development', 'task-reviewer-prompt.md'),
    required: [
      '高风险例外',
      '只审该风险，不进行完整规格审查与质量审查',
      '评审阶段',
      '操作方案、授权和回滚或恢复路径',
      '不能替代全部任务完成后的最终统一审查'
    ],
    forbidden: ['检查全部需求']
  },
  {
    file: path.join(skillsRoot, 'requesting-code-review', 'code-reviewer.md'),
    required: [
      '需求、跨任务一致性',
      '兼容、失败路径、回归和遗留风险',
      '不能仅因实现没有逐字遵循计划',
      '按依赖集中修复',
      '组合复验'
    ],
    forbidden: ['只检查单个任务']
  }
];

const collectFiles = (directory) => fs.readdirSync(directory, { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => path.join(entry.parentPath, entry.name));

test('只发布批准的精确技能集合', () => {
  const actualSkills = fs.readdirSync(skillsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  assert.deepEqual(actualSkills, [...expectedSkills].sort());
});

test('技能契约键集合与批准技能精确一致', () => {
  assert.deepEqual(Object.keys(contracts).sort(), [...expectedSkills].sort());
});

test('正式发布技能树不包含其他平台适配术语', () => {
  const forbiddenTerms = /Claude Code|Copilot CLI|Cursor|Kimi|OpenCode|Antigravity|run_in_background|read_bash|stop_bash/iu;
  const markdownFiles = [
    ...collectFiles(skillsRoot).filter((file) => file.endsWith('.md')),
    path.join(root, 'README.md')
  ];
  for (const file of markdownFiles) {
    assert.doesNotMatch(fs.readFileSync(file, 'utf8'), forbiddenTerms, `${file} 存在非 Codex 平台适配残留`);
  }
});

test('正式发布脚本的已知用户可见错误均已中文化', () => {
  const findPolluter = fs.readFileSync(path.join(skillsRoot, 'systematic-debugging', 'find-polluter.sh'), 'utf8');
  assert.doesNotMatch(findPolluter, /Usage:|Example:|Searching for|Test pattern:|Found \$?\w* test files|Pollution|No polluter|To investigate:/u);
  assert.match(findPolluter, /用法/u);
  assert.match(findPolluter, /未找到匹配的测试文件/u);

  const server = fs.readFileSync(path.join(skillsRoot, 'brainstorming', 'scripts', 'server.cjs'), 'utf8');
  for (const englishOutput of [
    'Client frames must be masked',
    'WebSocket frame payload exceeds maximum allowed size',
    'Failed to parse WebSocket message',
    'fs.watch error',
    'Server failed to bind',
    'preferred port is in use',
    'dead at startup',
    'owner process exited',
    'idle timeout'
  ]) {
    assert.equal(server.includes(englishOutput), false, `server.cjs 仍输出英文：${englishOutput}`);
  }

  const packageScript = fs.readFileSync(path.join(root, 'scripts', 'package-codex-plugin.sh'), 'utf8');
  assert.doesNotMatch(packageScript, /unsupported archive format|Usage:|Error:|Archive:|Format:|Version:|Entries:|Skills:/u);
  for (const marker of ['用法：', '错误：', '归档：', '格式：', '版本：', '条目：', '技能：']) {
    assert.equal(packageScript.includes(marker), true, `打包脚本缺少中文用户文案：${marker}`);
  }
});

for (const contract of promptContracts) {
  test(`${path.relative(root, contract.file)} 提示模板契约有效`, () => {
    const content = normalize(fs.readFileSync(contract.file, 'utf8'));
    for (const phrase of contract.required) {
      assert.equal(content.includes(normalize(phrase)), true, `缺少短语：${phrase}`);
    }
    for (const phrase of contract.forbidden) {
      assert.equal(content.includes(normalize(phrase)), false, `禁止短语：${phrase}`);
    }
  });
}

for (const [skillId, requiredPhrases] of Object.entries(contracts)) {
  test(`${skillId} 中文技能契约有效`, () => {
    const skillDir = path.join(skillsRoot, skillId);
    const skillFile = path.join(skillDir, 'SKILL.md');
    assert.equal(fs.existsSync(skillFile), true, `${skillId}/SKILL.md 必须存在`);
    const content = fs.readFileSync(skillFile, 'utf8');
    const name = content.match(/^name:\s*["']?([^"'\r\n]+)["']?\s*$/mu)?.[1];
    const description = content.match(/^description:\s*["']?([^\r\n]+?)["']?\s*$/mu)?.[1];
    assert.equal(name, skillId);
    assert.match(description ?? '', /^Use when\s+/u);
    assert.match(description ?? '', /[\u3400-\u9fff]/u);
    assert.match(withoutCodeFences(content), /[\u3400-\u9fff]/u);
    for (const phrase of requiredPhrases) {
      assert.equal(normalize(content).includes(normalize(phrase)), true, `缺少短语：${phrase}`);
    }

    const markdownFiles = fs.readdirSync(skillDir, { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
      .map((entry) => path.join(entry.parentPath, entry.name));
    for (const markdownFile of markdownFiles) {
      const markdown = withoutCodeFences(fs.readFileSync(markdownFile, 'utf8'));
      assert.match(markdown, /[\u3400-\u9fff]/u, `${markdownFile} 必须包含中文正文`);
      for (const match of markdown.matchAll(/!?\[[^\]]*\]\((?!https?:|mailto:|#)([^)#]+)(?:#[^)]+)?\)/gu)) {
        const target = path.resolve(path.dirname(markdownFile), decodeURIComponent(match[1]));
        assert.equal(fs.existsSync(target), true, `${markdownFile} 中的链接失效：${match[1]}`);
      }
    }
  });
}
