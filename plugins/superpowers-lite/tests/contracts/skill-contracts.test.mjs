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
      '普通任务不需要自行创建独立评审流程',
      '任务验证通过后必须形成独立 Git 提交',
      '提交失败时返回 BLOCKED'
    ],
    forbidden: ['每个任务都必须独立评审', 'absent 时附差异引用']
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
      '数据迁移与回滚',
      '并发与共享状态',
      '错误处理、失败传播与恢复',
      '测试是否验证真实行为',
      '文件与行号',
      '按依赖集中修复',
      '组合复验',
      'Ready to merge: Yes | With fixes | No'
    ],
    forbidden: ['只检查单个任务']
  }
];

const referenceContracts = [
  {
    file: path.join(skillsRoot, 'using-superpowers', 'references', 'codex-tools.md'),
    required: ['update_plan', '会话内进度', '恰好一个', '不能替代持久计划']
  },
  {
    file: path.join(skillsRoot, 'test-driven-development', 'test-selection-patterns.md'),
    required: [
      '纯逻辑与不变量',
      '状态、持久化与重启',
      '并发、时间与随机性',
      '迁移、兼容与回滚',
      '测试替身'
    ]
  },
  {
    file: path.join(skillsRoot, 'verification-before-completion', 'evidence-matrix.md'),
    required: [
      '声明—证据矩阵',
      '完整命令',
      '原始症状',
      '代表性消费者',
      '代理报告'
    ]
  },
  {
    file: path.join(skillsRoot, 'systematic-debugging', 'root-cause-tracing.md'),
    required: ['边界表', '值或状态', '调用链', '证据断点', '停止条件']
  },
  {
    file: path.join(skillsRoot, 'systematic-debugging', 'defense-in-depth.md'),
    required: ['独立故障模式', '信任边界', '不变量', '恢复边界', '逐层验证']
  }
];

const visualCompanionFile = path.join(skillsRoot, 'brainstorming', 'visual-companion.md');
const visualCompanionScripts = path.join(skillsRoot, 'brainstorming', 'scripts');

const skillForbiddenPhrases = {
  'subagent-driven-development': [
    '未获准时的工作区差异',
    '没有提交权限时使用'
  ]
};

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

  const packageScript = fs.readFileSync(path.join(root, 'scripts', 'package-codex-plugin.sh'), 'utf8');
  assert.doesNotMatch(packageScript, /unsupported archive format|Usage:|Error:|Archive:|Format:|Version:|Entries:|Skills:/u);
  for (const marker of ['用法：', '错误：', '归档：', '格式：', '版本：', '条目：', '技能：']) {
    assert.equal(packageScript.includes(marker), true, `打包脚本缺少中文用户文案：${marker}`);
  }
});

test('brainstorming 视觉伴侣只使用内置 ImageGen', () => {
  assert.equal(fs.existsSync(visualCompanionFile), true, '视觉伴侣指南必须存在');
  assert.equal(fs.existsSync(visualCompanionScripts), false, '视觉伴侣不得保留本地运行脚本');
  const content = normalize(fs.readFileSync(visualCompanionFile, 'utf8'));
  for (const phrase of [
    '内置 ImageGen',
    '直接内联展示',
    '2～4 个',
    '相同的画布',
    '一次只改变一个主要变量',
    '精确文字',
    '项目资产',
    '生成失败'
  ]) {
    assert.equal(content.includes(normalize(phrase)), true, `视觉伴侣缺少短语：${phrase}`);
  }
  assert.doesNotMatch(
    content,
    /HTML|浏览器|WebSocket|CLI|OPENAI_API_KEY|API Key|模型降级|回退路径/iu,
    '视觉伴侣不得包含本地页面或外部回退流程'
  );
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

for (const contract of referenceContracts) {
  test(`${path.relative(root, contract.file)} 深度参考契约有效`, () => {
    assert.equal(fs.existsSync(contract.file), true, `${contract.file} 必须存在`);
    const content = normalize(fs.readFileSync(contract.file, 'utf8'));
    for (const phrase of contract.required) {
      assert.equal(content.includes(normalize(phrase)), true, `缺少短语：${phrase}`);
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
    for (const phrase of skillForbiddenPhrases[skillId] ?? []) {
      assert.equal(normalize(content).includes(normalize(phrase)), false, `禁止短语：${phrase}`);
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
