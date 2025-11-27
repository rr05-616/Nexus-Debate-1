export interface ModelResponses {
  openai: string;
  claude: string;
  gemini: string;
}

export interface DebateTimings {
  openai: number;
  claude: number;
  gemini: number;
  consensus: number;
  total: number;
}

export interface DebateResponse {
  question: string;
  models: ModelResponses;
  timings: DebateTimings;
  finalAnswer: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  fullMark: number;
}

export interface PerformanceMetric {
  subject: string;
  A: number;
  B: number;
  fullMark: number;
}

export enum DebateStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}