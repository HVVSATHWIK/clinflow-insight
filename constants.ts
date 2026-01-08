import { FlowNode, NodeType, HealthStatus, UserRole, InsightCard } from './types';

export const DATA_NODES: FlowNode[] = [
  // --- Stage 1: Data Sources (Explicit Datasets) ---
  {
    id: 'src-1',
    label: 'CPID_EDC_Metrics',
    type: NodeType.SOURCE,
    status: HealthStatus.HEALTHY,
    description: 'Raw Electronic Data Capture (EDC) logs: Visit status, Query status, and CRF verification timestamps.',
    roleRelevance: [UserRole.DATA_MANAGER, UserRole.CRA],
    metrics: [
      { label: '% Clean CRFs', value: '94%', trend: 'stable' },
      { label: 'Uncoded Terms', value: 12, trend: 'down' }
    ],
    details: { 
      responsible: 'Data Management', 
      lastUpdated: 'Real-time', 
      issues: ['Site 001: High open queries'], 
      rawFields: ['Site ID', 'Subject ID', 'Missing Page', 'Queries status'] 
    },
    sampleColumns: ['Site ID', 'Subject ID', 'Visit Status', 'Missing Page', 'Queries Status', '# CRFs Locked'],
    sampleRows: [
      { 'Site ID': 'US-01', 'Subject ID': '1001', 'Visit Status': 'Completed', 'Missing Page': 0, 'Queries Status': 'Closed', '# CRFs Locked': 15 },
      { 'Site ID': 'US-01', 'Subject ID': '1002', 'Visit Status': 'Pending', 'Missing Page': 1, 'Queries Status': 'Open', '# CRFs Locked': 10 },
      { 'Site ID': 'EU-04', 'Subject ID': '2005', 'Visit Status': 'Missed', 'Missing Page': 3, 'Queries Status': 'Open', '# CRFs Locked': 5 },
    ]
  },
  {
    id: 'src-2',
    label: 'Visit Projection Tracker',
    type: NodeType.SOURCE,
    status: HealthStatus.WARNING,
    description: 'CTMS export tracking projected vs actual visit dates.',
    roleRelevance: [UserRole.CRA],
    metrics: [{ label: 'Overdue Visits', value: 23, trend: 'up' }],
    details: { 
      responsible: 'Clinical Ops', 
      lastUpdated: '4 hrs ago', 
      issues: ['Cycle 3 delays in Region EU'], 
      rawFields: ['Projected Date', '# Days Outstanding'] 
    },
    sampleColumns: ['Site', 'Subject', 'Visit', 'Projected Date', '# Days Outstanding'],
    sampleRows: [
      { 'Site': 'US-03', 'Subject': '1045', 'Visit': 'Cycle12Week1', 'Projected Date': '2024-05-10', '# Days Outstanding': 5 },
      { 'Site': 'US-03', 'Subject': '1048', 'Visit': 'Cycle12Week1', 'Projected Date': '2024-05-12', '# Days Outstanding': 3 },
    ]
  },
  {
    id: 'src-3',
    label: 'Lab Data (Central/Local)',
    type: NodeType.SOURCE,
    status: HealthStatus.CRITICAL,
    description: 'Inbound laboratory results. Critical tracking of Missing Lab Names and Ranges.',
    roleRelevance: [UserRole.DATA_MANAGER, UserRole.SAFETY],
    metrics: [{ label: 'Missing Ranges', value: 156, trend: 'up' }],
    details: { 
      responsible: 'Vendor Mgmt', 
      lastUpdated: 'Daily', 
      issues: ['Local Lab Normal Ranges missing for 3 sites'], 
      rawFields: ['Lab Name', 'Test Name', 'Issue'] 
    },
    sampleColumns: ['Site number', 'Lab category', 'Test Name', 'Issue', 'Comments'],
    sampleRows: [
      { 'Site number': 'IN-07', 'Lab category': 'HEMATOLOGY', 'Test Name': 'HGB', 'Issue': 'Ranges/Units not entered', 'Comments': 'Action for Site' },
      { 'Site number': 'IN-07', 'Lab category': 'CHEMISTRY', 'Test Name': 'ALT', 'Issue': 'Missing Lab name', 'Comments': 'Action for CRA' },
    ]
  },
  {
    id: 'src-4',
    label: 'SAE Report Repository',
    type: NodeType.SOURCE,
    status: HealthStatus.WARNING,
    description: 'Safety database exports tracking SAE discrepancies and review statuses.',
    roleRelevance: [UserRole.SAFETY, UserRole.EXECUTIVE],
    metrics: [{ label: 'Pending Safety Rev.', value: 4, trend: 'stable' }],
    details: { 
      responsible: 'Safety Team', 
      lastUpdated: '1 hr ago', 
      issues: ['Reconciliation backlog'], 
      rawFields: ['Discrepancy ID', 'Review Status'] 
    },
    sampleColumns: ['Discrepancy ID', 'Patient ID', 'Form Name', 'Review Status (DM)', 'Review Status (Safety)'],
    sampleRows: [
      { 'Discrepancy ID': 'D-901', 'Patient ID': '3001', 'Form Name': 'AE', 'Review Status (DM)': 'Complete', 'Review Status (Safety)': 'Pending' },
      { 'Discrepancy ID': 'D-904', 'Patient ID': '3005', 'Form Name': 'ConMeds', 'Review Status (DM)': 'Pending', 'Review Status (Safety)': 'Pending' },
    ]
  },
  {
    id: 'src-5',
    label: 'Coding Dictionaries',
    type: NodeType.SOURCE,
    status: HealthStatus.HEALTHY,
    description: 'MedDRA and WHODRA coding dictionary references.',
    roleRelevance: [UserRole.DATA_MANAGER],
    metrics: [{ label: 'Req. Coding', value: 45, trend: 'down' }],
    details: { 
      responsible: 'Coding Specialist', 
      lastUpdated: 'Weekly', 
      issues: [], 
      rawFields: ['Verbatim Term', 'Dictionary', 'Coding Status'] 
    },
    sampleColumns: ['Dictionary', 'Subject', 'Verbatim Term', 'Coding Status', 'Require Coding'],
    sampleRows: [
      { 'Dictionary': 'MedDRA', 'Subject': '1011', 'Verbatim Term': 'Headache', 'Coding Status': 'Coded', 'Require Coding': 'No' },
      { 'Dictionary': 'WHODrug', 'Subject': '1012', 'Verbatim Term': 'Unknown Pill', 'Coding Status': 'UnCoded', 'Require Coding': 'Yes' },
    ]
  },

  // --- Stage 2: Processing Engines (Explicit Consumption Logic) ---
  {
    id: 'proc-1',
    label: 'Data Quality Engine',
    type: NodeType.PROCESS,
    status: HealthStatus.WARNING,
    description: 'Validates completeness and conformance of EDC data.',
    roleRelevance: [UserRole.DATA_MANAGER],
    inputs: ['CPID_EDC_Metrics', 'Inactivated Forms'],
    logic: 'Flags pages where status="Incomplete" AND age > 5 days. Flags inactivated pages with data.',
    metrics: [{ label: 'Non-Conformant Pg', value: 14, trend: 'up' }],
    details: { responsible: 'System', lastUpdated: 'Continuous', issues: ['Protocol Deviations High'], rawFields: [] }
  },
  {
    id: 'proc-2',
    label: 'Visit Compliance Engine',
    type: NodeType.PROCESS,
    status: HealthStatus.HEALTHY,
    description: 'Correlates projected visits against actual EDC entry dates.',
    roleRelevance: [UserRole.CRA],
    inputs: ['Visit Projection Tracker', 'Global_Missing_Pages'],
    logic: 'Alert if (CurrentDate - ProjectedDate) > 7 days AND VisitStatus != "Completed".',
    metrics: [{ label: 'Missing Visits', value: 23, trend: 'up' }],
    details: { responsible: 'System', lastUpdated: 'Daily', issues: [], rawFields: [] }
  },
  {
    id: 'proc-3',
    label: 'Safety Reconciliation Engine',
    type: NodeType.PROCESS,
    status: HealthStatus.WARNING,
    description: 'Cross-references Safety Database AE terms with Clinical DB AE forms.',
    roleRelevance: [UserRole.SAFETY],
    inputs: ['SAE Report Repository', 'Compiled_EDRR'],
    logic: 'Match on SubjectID + OnsetDate + Term. Flag mismatches > 24 hours.',
    metrics: [{ label: 'EDRR Open Issues', value: 8, trend: 'down' }],
    details: { responsible: 'System', lastUpdated: 'Daily', issues: ['Unresolved EDRR Items'], rawFields: [] }
  },

  // --- Stage 3: Insights (Derived Logic) ---
  {
    id: 'out-1',
    label: 'Data Quality Index (DQI)',
    type: NodeType.INSIGHT,
    status: HealthStatus.HEALTHY,
    description: 'Composite score indicating overall study health.',
    roleRelevance: [UserRole.EXECUTIVE, UserRole.DATA_MANAGER],
    inputs: ['Data Quality Engine', 'Query Metrics'],
    logic: 'DQI = 100 - (WeightedQueryCount + MissingPagePenalty). Threshold: < 85 is Critical.',
    metrics: [{ label: 'Current DQI', value: 88, trend: 'up' }],
    details: { responsible: 'All', lastUpdated: 'Real-time', issues: [], rawFields: [] }
  },
  {
    id: 'out-2',
    label: 'High-Risk Sites',
    type: NodeType.INSIGHT,
    status: HealthStatus.CRITICAL,
    description: 'Identification of sites requiring immediate intervention.',
    roleRelevance: [UserRole.CRA, UserRole.EXECUTIVE],
    inputs: ['Visit Compliance Engine', 'Lab Data'],
    logic: 'Site flagged if: MissingVisits > 10% OR MissingLabRanges > 5.',
    metrics: [{ label: 'Flagged Sites', value: 2, trend: 'stable' }],
    details: { responsible: 'Clinical Ops Lead', lastUpdated: 'Real-time', issues: ['Site IN-07', 'Site US-03'], rawFields: [] }
  },
  {
    id: 'out-3',
    label: 'Clean Data Milestones',
    type: NodeType.INSIGHT,
    status: HealthStatus.WARNING,
    description: 'Forecast for database lock readiness.',
    roleRelevance: [UserRole.EXECUTIVE],
    inputs: ['DQI', 'CRF Signatures'],
    logic: 'Ready if: DQI > 95 AND UnsignedCRF < 1%.',
    metrics: [{ label: '% Clean Patients', value: '42%', trend: 'up' }],
    details: { responsible: 'Study Lead', lastUpdated: 'Daily', issues: ['Below target for Lock'], rawFields: [] }
  }
];

export const INITIAL_INSIGHTS: InsightCard[] = [
  {
    id: 'ins-1',
    title: 'Site IN-07 Compliance Risk',
    description: 'Site IN-07 exceeds risk threshold: 12 "Missing Lab Ranges" & 5 "Overdue Visits".',
    confidence: 0.95,
    relatedNodeId: 'out-2',
    type: 'risk',
    severity: HealthStatus.CRITICAL,
    recommendation: 'Prioritize Site Audit / Retraining'
  },
  {
    id: 'ins-2',
    title: 'Safety Reconciliation Lag',
    description: '4 SAE Discrepancies have "Review Status (Safety): Pending" for > 48 hours.',
    confidence: 0.89,
    relatedNodeId: 'src-4',
    type: 'performance',
    severity: HealthStatus.WARNING,
    recommendation: 'Escalate to Safety Lead'
  },
  {
    id: 'ins-3',
    title: 'Uncoded MedDRA Terms',
    description: 'Spike in "Uncoded Terms" in CPID_EDC_Metrics for new concomitant medications.',
    confidence: 0.82,
    relatedNodeId: 'src-5',
    type: 'anomaly',
    severity: HealthStatus.WARNING,
    recommendation: 'Allocate Coding Resources'
  }
];