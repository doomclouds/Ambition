import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..', '..');
const readJson = (relativePath) =>
  JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
const hasChinese = (value) => /[\u3400-\u9fff]/u.test(String(value));

test('Codex manifest uses the approved identity and no hooks', () => {
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
    assert.equal(Object.hasOwn(manifest, field), false, `manifest must omit ${field}`);
  }
});

test('marketplace exposes one local superpowers-lite entry', () => {
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

test('license and Codex-only root surface are present', () => {
  const license = fs.readFileSync(path.join(root, 'LICENSE'), 'utf8');
  assert.match(license, /MIT License/);
  for (const relativePath of [
    'hooks', '.claude-plugin', '.cursor-plugin', '.kimi-plugin', '.opencode', '.pi'
  ]) {
    assert.equal(fs.existsSync(path.join(root, relativePath)), false, `${relativePath} must be absent`);
  }
});
