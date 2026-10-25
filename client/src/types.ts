export interface ModelConfig {
  kind: string
  name: string
  temperature: number
}

export interface ModelScores {
  correctness: number | null
  execution_pass_rate: number | null
  runtime: number | null
  static_policy_pass_rate: number | null
  overall: number
}

export interface ModelUsage {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
  estimated_cost_usd: number | null
  median_latency_ms: number | null
  p95_latency_ms: number | null
}

export interface TestResult {
  test_id: string
  category: string
  execution_pass: boolean
  runtime: number | null
  static: number | null
  static_policy_pass: boolean | null
  total_tokens: number | null
  cost_usd: number | null
  latency_ms: number | null
  failures: string[]
}

export interface ModelData {
  base_model: string
  variant: string
  config: ModelConfig
  scores: ModelScores
  usage: ModelUsage
  results: TestResult[]
}

export interface Grader {
  kind: string
  database: string | null
  timeout_seconds: number
}

export interface Dataset {
  source: string
  name: string
  split: string
}

export interface Metadata {
  suite: string
  run_at: string | null
  result_schema_version: string | null
  scoring_version: string | null
  wp_version: string | null
  grader: Grader
  dataset: Dataset
  execution_concurrency: number | null
  runtime_isolation: string | null
  skills_enabled: boolean
}

export interface BenchmarkData {
  metadata: Metadata
  models: Record<string, ModelData>
}
