import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..', '..');
const readJson = (relativePath) =>
  JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
const hasChinese = (value) => /[\u3400-\u9fff]/u.test(String(value));
const readText = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), 'utf8');

test('Codex 清单使用批准的身份且不声明 hooks', () => {
  const manifest = readJson('.codex-plugin/plugin.json');
  assert.equal(manifest.name, 'superpowers-lite');
  assert.equal(manifest.version, '0.1.0');
  assert.equal(manifest.repository, 'https://github.com/doomclouds/Ambition');
  assert.equal(manifest.author?.name, 'doomclouds');
  assert.equal(manifest.skills, './skills/');
  assert.equal(hasChinese(manifest.description), true);
  assert.equal(hasChinese(manifest.interface?.shortDescription), true);
  assert.equal(hasChinese(manifest.interface?.longDescription), true);
  assert.equal(hasChinese(manifest.interface?.defaultPrompt?.join('')), true);
  for (const field of ['hooks', 'apps', 'mcpServers']) {
    assert.equal(Object.hasOwn(manifest, field), false, `清单不得包含 ${field}`);
  }
});

test('市场清单只公开一个本地 superpowers-lite 条目', () => {
  const marketplace = readJson('.agents/plugins/marketplace.json');
  assert.equal(marketplace.name, 'superpowers-lite');
  const entries = marketplace.plugins.filter((item) => item.name === 'superpowers-lite');
  assert.equal(entries.length, 1);
  assert.equal(entries[0].version, '0.1.0');
  assert.deepEqual(entries[0].source, { source: 'url', url: './' });
  assert.deepEqual(entries[0].policy, {
    installation: 'AVAILABLE',
    authentication: 'ON_INSTALL'
  });
  assert.equal(entries[0].category, 'Developer Tools');
});

test('许可证存在且仓库根层保持 Codex-only', () => {
  const license = readText('LICENSE');
  assert.match(license, /MIT License/);
  for (const relativePath of [
    'hooks', '.claude-plugin', '.cursor-plugin', '.kimi-plugin', '.opencode', '.pi'
  ]) {
    assert.equal(fs.existsSync(path.join(root, relativePath)), false, `${relativePath} 必须不存在`);
  }
});

test('中文公开文档保留安装边界和上游归属', () => {
  const readme = readText('README.md');
  for (const marker of [
    'MIT',
    'BB-84C/superpowers-lite',
    'obra/superpowers',
    'Codex CLI/App',
    '不能与原版 Superpowers 同时安装'
  ]) {
    assert.match(readme, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.equal(hasChinese(readme), true);
  assert.match(readme, /codex plugin marketplace add <仓库根目录>/);
  assert.match(readme, /codex plugin add superpowers-lite@superpowers-lite/);
  assert.match(readme, /不包含 `\.agents\/plugins\/marketplace\.json`/);
  assert.match(readme, /不能直接作为 marketplace 根目录/);

  const security = readText('SECURITY.md');
  assert.equal(hasChinese(security), true);
  assert.match(security, /本地数据/);
  assert.match(security, /https:\/\/github\.com\/doomclouds\/Ambition\/security\/advisories\/new/);

  const contributing = readText('CONTRIBUTING.md');
  assert.equal(hasChinese(contributing), true);
  for (const marker of ['英文代码注释', '技能 ID', 'RED', 'GREEN', 'Conventional Commits']) {
    assert.match(contributing, new RegExp(marker));
  }
});

test('发布白名单和 CI 保持 Codex-only', () => {
  const packageJson = readJson('package.json');
  assert.deepEqual(packageJson.files, [
    '.codex-plugin',
    'assets',
    'skills',
    'README.md',
    'LICENSE'
  ]);
  assert.equal(
    packageJson.scripts?.test,
    'node --test tests/contracts/plugin-contracts.test.mjs tests/contracts/skill-contracts.test.mjs'
  );

  const workflow = readText('.github/workflows/ci.yml');
  assert.match(workflow, /node-version:\s*24/);
  const npmTestIndex = workflow.indexOf('run: npm test');
  const packageTestIndex = workflow.indexOf('run: bash tests/codex/test-package-codex-plugin.sh');
  const runtimeTestIndex = workflow.indexOf('run: bash tests/codex/test-runtime-scripts.sh');
  assert.notEqual(npmTestIndex, -1);
  assert.notEqual(runtimeTestIndex, -1);
  assert.notEqual(packageTestIndex, -1);
  assert.ok(npmTestIndex < runtimeTestIndex, 'CI 必须先运行契约再验证运行脚本');
  assert.ok(runtimeTestIndex < packageTestIndex, 'CI 必须先验证运行脚本再验证打包');
  assert.doesNotMatch(workflow, /hooks|claude|cursor|kimi|opencode|\.pi|antigravity/i);

  const attributes = readText('.gitattributes');
  assert.match(attributes, /^\*\.sh text eol=lf$/m);
  assert.match(attributes, /^skills\/\*\*\/scripts\/\* text eol=lf$/m);
});
