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

for (const [skillId, requiredPhrases] of Object.entries(contracts)) {
  test(`${skillId} has valid Chinese skill contracts`, () => {
    const skillDir = path.join(skillsRoot, skillId);
    const skillFile = path.join(skillDir, 'SKILL.md');
    assert.equal(fs.existsSync(skillFile), true, `${skillId}/SKILL.md must exist`);
    const content = fs.readFileSync(skillFile, 'utf8');
    const name = content.match(/^name:\s*["']?([^"'\r\n]+)["']?\s*$/mu)?.[1];
    const description = content.match(/^description:\s*["']?([^\r\n]+?)["']?\s*$/mu)?.[1];
    assert.equal(name, skillId);
    assert.match(description ?? '', /^Use when\s+/u);
    assert.match(description ?? '', /[\u3400-\u9fff]/u);
    assert.match(withoutCodeFences(content), /[\u3400-\u9fff]/u);
    for (const phrase of requiredPhrases) {
      assert.equal(normalize(content).includes(normalize(phrase)), true, `missing phrase: ${phrase}`);
    }

    const markdownFiles = fs.readdirSync(skillDir, { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
      .map((entry) => path.join(entry.parentPath, entry.name));
    for (const markdownFile of markdownFiles) {
      const markdown = withoutCodeFences(fs.readFileSync(markdownFile, 'utf8'));
      assert.match(markdown, /[\u3400-\u9fff]/u, `${markdownFile} must contain Chinese prose`);
      for (const match of markdown.matchAll(/!?\[[^\]]*\]\((?!https?:|mailto:|#)([^)#]+)(?:#[^)]+)?\)/gu)) {
        const target = path.resolve(path.dirname(markdownFile), decodeURIComponent(match[1]));
        assert.equal(fs.existsSync(target), true, `broken link in ${markdownFile}: ${match[1]}`);
      }
    }
  });
}
