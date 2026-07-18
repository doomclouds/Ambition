import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const pluginRoot = path.resolve(import.meta.dirname, '..', '..');
const contracts = JSON.parse(
  fs.readFileSync(path.join(import.meta.dirname, 'skill-contracts.json'), 'utf8')
);
const scenarioFile = path.join(pluginRoot, 'tests', 'evals', 'workflow-pressure-scenarios.json');
const requiredScenarioIds = [
  'brainstorming-open-decision-with-migration',
  'brainstorming-imagegen-comparable-options',
  'parallel-shared-file-and-database',
  'executing-plan-drift-after-compaction',
  'finishing-detached-uncommitted',
  'receiving-reviewer-proposes-unused-abstraction',
  'requesting-review-migration-and-concurrency',
  'sdd-cross-task-conflict',
  'debugging-intermittent-multicomponent',
  'debugging-third-fix-no-new-evidence',
  'tdd-red-is-test-error',
  'tdd-test-passes-before-fix',
  'tdd-mock-tests-itself',
  'tdd-persistence-restart',
  'worktree-existing-host-owned',
  'using-superpowers-low-risk-copy-change',
  'verification-stale-partial-run',
  'verification-agent-report-only',
  'verification-consumer-boundary',
  'writing-plan-implementation-method-changes'
];

test('工作流压力场景覆盖全部批准技能与关键失败模式', () => {
  assert.equal(fs.existsSync(scenarioFile), true, `${scenarioFile} 必须存在`);
  const scenarios = JSON.parse(fs.readFileSync(scenarioFile, 'utf8'));
  assert.equal(Array.isArray(scenarios), true);
  assert.deepEqual(
    scenarios.map((scenario) => scenario.id).sort(),
    [...requiredScenarioIds].sort()
  );

  const ids = new Set();
  const approvedSkills = new Set(Object.keys(contracts));
  for (const scenario of scenarios) {
    assert.match(scenario.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/u);
    assert.equal(ids.has(scenario.id), false, `场景 ID 重复：${scenario.id}`);
    ids.add(scenario.id);
    assert.equal(approvedSkills.has(scenario.skill), true, `未知技能：${scenario.skill}`);
    assert.match(scenario.pressure, /[\u3400-\u9fff]/u);
    for (const field of ['expected_decisions', 'forbidden_decisions', 'required_evidence']) {
      assert.equal(Array.isArray(scenario[field]), true, `${scenario.id}.${field} 必须是数组`);
      assert.ok(scenario[field].length > 0, `${scenario.id}.${field} 不得为空`);
      for (const value of scenario[field]) {
        assert.equal(typeof value, 'string');
        assert.match(value, /[\u3400-\u9fff]/u);
      }
    }
  }

  assert.deepEqual(
    [...new Set(scenarios.map((scenario) => scenario.skill))].sort(),
    [...approvedSkills].sort()
  );
});
