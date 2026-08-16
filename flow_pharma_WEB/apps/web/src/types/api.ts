export interface Stat {
  label: string;
  value: number;
  delta?: number;
  hint?: string;
}

export interface SeriesPoint {
  label: string;
  value: number;
  [key: string]: string | number;
}

export interface ChartData {
  series: SeriesPoint[];
  keys: string[];
  colors?: string[];
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface DashboardSummary {
  stats: Stat[];
  charts: Record<string, ChartData>;
  alerts: { title: string; detail: string; severity: "info" | "warning" | "critical" }[];
}
