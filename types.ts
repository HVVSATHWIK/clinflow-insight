export enum NodeType {
  SOURCE = 'DATASET',
  PROCESS = 'ENGINE',
  INSIGHT = 'INSIGHT'
}

export enum HealthStatus {
  HEALTHY = 'HEALTHY',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL'
}

export enum UserRole {
  EXECUTIVE = 'Executive',
  DATA_MANAGER = 'Data Manager',
  CRA = 'CRA',
  SAFETY = 'Safety'
}

export interface FlowNode {
  id: string;
  label: string;
  type: NodeType;
  status: HealthStatus;
  description: string;
  roleRelevance: UserRole[];
  // Traceability Fields
  inputs?: string[]; // Names of upstream datasets consumed
  logic?: string;    // Explanation of the rule/threshold used
  metrics: {
    label: string;
    value: string | number;
    trend?: 'up' | 'down' | 'stable';
  }[];
  details?: {
    responsible: string;
    lastUpdated: string;
    issues: string[];
    rawFields: string[]; // Kept for reference
  };
  sampleColumns?: string[];
  sampleRows?: Record<string, string | number>[];
}

export interface InsightCard {
  id: string;
  title: string;
  description: string;
  confidence: number;
  relatedNodeId: string;
  type: 'risk' | 'anomaly' | 'performance';
  severity: HealthStatus;
  recommendation: string; // Changed from 'action' to 'recommendation'
}

export interface ChartDataPoint {
  name: string;
  value: number;
  target?: number;
}