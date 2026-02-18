export interface ModelConfig {
  kind: string
  name: string
  temperature: number
  max_tokens: number | null
  top_p: number | null
  request_timeout: number
}

export interface ModelScores {
  knowledge: number
  correctness: number
  quality: number
  overall: number
}

export interface KnowledgeResult {
  test_id: string
  type: 'knowledge'
  answer: string
  correct: boolean
  score: number
}

export interface ExecutionResult {
  test_id: string
  type: 'execution'
  code: string
  correctness: number
  quality: number | null
}

export type TestResult = KnowledgeResult | ExecutionResult

export interface ModelData {
  config: ModelConfig
  scores: ModelScores
  results: TestResult[]
}

export interface Grader {
  kind: string
  image: string
  container_name: string
  url: string | null
  concurrency: number
  timeout_seconds: number
  wp_env_dir: string
}

export interface Dataset {
  source: string
  name: string
  revision: string | null
  split: string
  cache_dir: string | null
}

export interface Metadata {
  suite: string
  grader: Grader
  dataset: Dataset
}

export interface BenchmarkData {
  metadata: Metadata
  models: Record<string, ModelData>
}
