// Converts a wp-bench results JSON file into the slim dataset the dashboard bundles.
//
// wp-bench result files include every raw completion and grader transcript, which
// makes them far too large to ship to the browser. This keeps run metadata, the
// per-model scores, a usage summary, and the per-test fields the dashboard shows.
//
// Usage: node scripts/prepare-data.mjs <wp-bench results.json> [output.json]

import { readFileSync, writeFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'

const [input, output = resolve(import.meta.dirname, '../../results/data.json')] = process.argv.slice(2)

if (!input) {
  console.error('Usage: node scripts/prepare-data.mjs <wp-bench results.json> [output.json]')
  process.exit(1)
}

const MAX_FAILURES = 5
const MAX_MESSAGE_LENGTH = 300

const raw = JSON.parse(readFileSync(input, 'utf8'))

function truncate(text) {
  if (typeof text !== 'string') return null
  return text.length > MAX_MESSAGE_LENGTH ? `${text.slice(0, MAX_MESSAGE_LENGTH)}…` : text
}

// Nearest-rank percentile, matching wp-bench's UsageAggregator.
function percentile(values, fraction) {
  const ordered = [...values].sort((a, b) => a - b)
  const index = Math.min(ordered.length - 1, Math.max(0, Math.round(fraction * (ordered.length - 1))))
  return ordered[index]
}

function round(value, places) {
  const factor = 10 ** places
  return Math.round(value * factor) / factor
}

function summarizeUsage(results) {
  const summary = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
  let cost = 0
  let hasCost = false
  const latencies = []
  for (const { usage } of results) {
    if (!usage) continue
    for (const field of Object.keys(summary)) {
      if (typeof usage[field] === 'number') summary[field] += usage[field]
    }
    if (typeof usage.cost_usd === 'number') {
      cost += usage.cost_usd
      hasCost = true
    }
    if (typeof usage.latency_ms === 'number') latencies.push(usage.latency_ms)
  }
  return {
    ...summary,
    estimated_cost_usd: hasCost ? round(cost, 6) : null,
    median_latency_ms: latencies.length ? round(percentile(latencies, 0.5), 1) : null,
    p95_latency_ms: latencies.length ? round(percentile(latencies, 0.95), 1) : null,
  }
}

function collectFailures(result) {
  const graderRaw = result.grader?.raw ?? {}
  const failures = []
  if (result.error) failures.push(truncate(String(result.error)))
  if (result.grader?.timeout) failures.push('Timed out')
  if (graderRaw.fatal_error) failures.push(truncate(String(graderRaw.fatal_error.message ?? graderRaw.fatal_error)))
  if (graderRaw.artifact_error) failures.push(truncate(String(graderRaw.artifact_error.message ?? graderRaw.artifact_error)))
  for (const assertion of graderRaw.assertions ?? []) {
    if (!assertion.passed) failures.push(truncate(assertion.description ?? assertion.type))
  }
  for (const check of graderRaw.static?.details?.forbidden ?? []) {
    if (check.found) failures.push(truncate(`Forbidden: ${check.description ?? check.pattern}`))
  }
  return failures.filter(Boolean).slice(0, MAX_FAILURES)
}

function slimResult(result) {
  return {
    test_id: result.test_id,
    category: result.category ?? 'uncategorized',
    execution_pass: Boolean(result.scores?.execution_pass),
    runtime: result.scores?.runtime ?? null,
    static: result.scores?.static ?? null,
    static_policy_pass: result.scores?.static_policy_pass ?? null,
    total_tokens: result.usage?.total_tokens ?? null,
    cost_usd: result.usage?.cost_usd ?? null,
    latency_ms: result.usage?.latency_ms ?? null,
    failures: collectFailures(result),
  }
}

const models = Object.fromEntries(
  Object.entries(raw.models).map(([name, model]) => [
    name,
    {
      base_model: model.base_model ?? name,
      variant: model.variant?.key ?? 'baseline',
      config: {
        kind: model.config.kind,
        name: model.config.name,
        temperature: model.config.temperature,
      },
      scores: model.scores,
      usage: model.usage ?? summarizeUsage(model.results),
      results: model.results.map(slimResult),
    },
  ]),
)

// wp-bench names result files results_YYYYMMDD_HHMMSS.json; use that as the run date.
const timestamp = basename(input).match(/(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/)
const firstResult = Object.values(raw.models)[0]?.results?.[0]

const { metadata } = raw
const data = {
  metadata: {
    suite: metadata.suite,
    run_at: timestamp
      ? `${timestamp[1]}-${timestamp[2]}-${timestamp[3]}T${timestamp[4]}:${timestamp[5]}:${timestamp[6]}`
      : null,
    result_schema_version: metadata.result_schema_version ?? null,
    scoring_version: metadata.scoring_version ?? null,
    wp_version: firstResult?.metadata?.suite_metadata?.wp_version ?? null,
    grader: {
      kind: metadata.grader.kind,
      database: metadata.grader.database ?? null,
      timeout_seconds: metadata.grader.timeout_seconds,
    },
    dataset: {
      source: metadata.dataset.source,
      name: metadata.dataset.name,
      split: metadata.dataset.split,
    },
    execution_concurrency: metadata.execution_concurrency ?? null,
    runtime_isolation: metadata.runtime_isolation ?? null,
    skills_enabled: Boolean(metadata.skills?.enabled),
  },
  models,
}

writeFileSync(output, `${JSON.stringify(data, null, 2)}\n`)
console.log(`Wrote ${Object.keys(models).length} models to ${output}`)
