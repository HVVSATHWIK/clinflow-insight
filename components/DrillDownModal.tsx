import React, { useState } from 'react';
import { FlowNode, HealthStatus, UserRole } from '../types';
import { 
  X, Sparkles, User, Clock, AlertCircle, Table, BarChart2, CheckCircle2, 
  Download, Workflow, Database, BrainCircuit, MessageSquare, Eye, UserPlus, 
  FileBarChart, ChevronRight, Activity, ShieldAlert
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { generateNodeAnalysis } from '../services/geminiService';

interface DrillDownModalProps {
  node: FlowNode | null;
  onClose: () => void;
}

const MOCK_GRAPH_DATA = [
  { day: 'Mon', value: 82 },
  { day: 'Tue', value: 85 },
  { day: 'Wed', value: 78 },
  { day: 'Thu', value: 90 },
  { day: 'Fri', value: 88 },
  { day: 'Sat', value: 94 },
  { day: 'Sun', value: 92 },
];

export const DrillDownModal: React.FC<DrillDownModalProps> = ({ node, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'data'>('overview');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  
  const [interactionMode, setInteractionMode] = useState<'none' | 'flag' | 'assign'>('none');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.CRA);
  const [assignmentNote, setAssignmentNote] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  if (!node) return null;

  const handleAiAnalysis = async () => {
    setIsLoadingAi(true);
    const analysis = await generateNodeAnalysis(node);
    setAiAnalysis(analysis);
    setIsLoadingAi(false);
  };

  const handleSendAssignment = () => {
    if (!assignmentNote.trim()) return; 
    setShowSuccess(true);
    setTimeout(() => {
        setShowSuccess(false);
        setInteractionMode('none');
        setAssignmentNote('');
    }, 2000);
  };

  const getStatusConfig = (status: HealthStatus) => {
    switch(status) {
      case HealthStatus.CRITICAL:
        return { color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-100', icon: AlertCircle };
      case HealthStatus.WARNING:
        return { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100', icon: ShieldAlert };
      case HealthStatus.HEALTHY:
      default:
        return { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: CheckCircle2 };
    }
  };

  const statusConfig = getStatusConfig(node.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300" onClick={onClose}>
      <div 
        className="w-full max-w-4xl h-full bg-slate-50 shadow-2xl flex flex-col animate__animated animate__slideInRight border-l border-slate-200" 
        style={{ animationDuration: '300ms' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modern Header */}
        <div className="flex-shrink-0 bg-white border-b border-slate-200 px-8 py-6 z-20">
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                    <StatusIcon size={14} strokeWidth={2.5} />
                    {node.status}
                 </div>
                 <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase border border-slate-200 px-2 py-0.5 rounded bg-slate-50">{node.type}</span>
              </div>
              <div>
                 <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{node.label}</h2>
                 <p className="text-sm text-slate-500 mt-2 max-w-2xl leading-relaxed">{node.description}</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Integrated Tabs */}
          <div className="flex items-center gap-8 mt-8">
             {['overview', 'data'].map(tab => (
               <button
                 key={tab}
                 onClick={() => setActiveTab(tab as any)}
                 className={`
                   pb-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2
                   ${activeTab === tab 
                     ? 'border-blue-600 text-blue-700' 
                     : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}
                 `}
               >
                 {tab === 'overview' ? <Activity size={16} /> : <Table size={16} />}
                 <span className="capitalize">{tab === 'overview' ? 'Analysis & Traceability' : 'Data Preview'}</span>
               </button>
             ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          
          {activeTab === 'overview' && (
            <div className="animate__animated animate__fadeIn space-y-6">
              
              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Lineage Card */}
                <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Workflow size={80} className="text-slate-900" />
                  </div>
                  
                  <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Workflow size={18} /></div>
                    <h3 className="font-bold text-slate-800">Data Lineage & Logic</h3>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <Database size={12} /> Upstream Sources
                      </h4>
                      <div className="flex flex-wrap gap-2">
                         {node.inputs && node.inputs.length > 0 ? node.inputs.map((input, i) => (
                           <span key={i} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-600 flex items-center gap-1.5">
                             {input}
                           </span>
                         )) : <span className="text-xs text-slate-400 italic pl-1">Primary Source (No upstream dependencies)</span>}
                      </div>
                    </div>

                    <div className="pl-4 border-l-2 border-slate-100">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                        <BrainCircuit size={12} /> Processing Logic
                      </h4>
                      <p className="text-sm text-slate-700 font-medium leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                        {node.logic || 'Standard data extraction and aggregation.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Metadata Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
                   <div>
                     <h3 className="font-bold text-slate-800 mb-6">Metadata</h3>
                     <div className="space-y-4">
                       <div>
                         <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Data Owner</span>
                         <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"><User size={12} /></div>
                           <span className="text-sm font-semibold text-slate-700">{node.details?.responsible}</span>
                         </div>
                       </div>
                       <div>
                         <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Last Synchronization</span>
                         <div className="flex items-center gap-2">
                           <Clock size={14} className="text-slate-400" />
                           <span className="text-sm font-mono text-slate-600">{node.details?.lastUpdated}</span>
                         </div>
                       </div>
                     </div>
                   </div>
                   
                   {node.details?.issues && node.details.issues.length > 0 && (
                     <div className="mt-6 pt-6 border-t border-slate-100">
                       <span className="block text-[10px] font-bold text-rose-500 uppercase tracking-wide mb-2">Active Issues</span>
                       <ul className="space-y-1">
                         {node.details.issues.map((issue, i) => (
                           <li key={i} className="text-xs font-medium text-rose-600 flex items-start gap-1.5">
                             <span className="mt-1 w-1 h-1 rounded-full bg-rose-500 shrink-0"></span>
                             {issue}
                           </li>
                         ))}
                       </ul>
                     </div>
                   )}
                </div>
              </div>

              {/* Chart & AI Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Chart */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                   <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                         <div className="p-2 bg-violet-50 text-violet-600 rounded-lg"><FileBarChart size={18} /></div>
                         <h3 className="font-bold text-slate-800">Metric History</h3>
                      </div>
                      <select className="bg-slate-50 border-none text-xs font-bold text-slate-500 rounded px-2 py-1 focus:ring-0 cursor-pointer hover:bg-slate-100">
                         <option>Last 7 Days</option>
                         <option>Last 30 Days</option>
                      </select>
                   </div>
                   <div className="h-64">
                     <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={MOCK_GRAPH_DATA}>
                          <defs>
                             <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                               <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="day" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 11, fill: '#64748b', fontWeight: 500}} 
                            dy={10} 
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 11, fill: '#64748b', fontWeight: 500}} 
                          />
                          <Tooltip 
                             contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px'}} 
                             itemStyle={{color: '#1e293b', fontSize: '12px', fontWeight: 700}}
                             cursor={{stroke: '#cbd5e1', strokeDasharray: '4 4'}}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#8b5cf6" 
                            strokeWidth={3} 
                            fillOpacity={1} 
                            fill="url(#colorValue)" 
                          />
                       </AreaChart>
                     </ResponsiveContainer>
                   </div>
                </div>

                {/* AI Analysis */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-0 overflow-hidden flex flex-col">
                  <div className="p-6 bg-gradient-to-r from-indigo-50 to-white border-b border-indigo-50 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <div className="p-2 bg-white text-indigo-600 rounded-lg shadow-sm border border-indigo-50"><Sparkles size={18} /></div>
                        <div>
                           <h3 className="font-bold text-slate-800">AI Insights</h3>
                           <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wide">Pattern Detection</p>
                        </div>
                     </div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col justify-center">
                    {!aiAnalysis && !isLoadingAi && (
                      <div className="text-center py-4">
                        <p className="text-sm text-slate-500 mb-4 px-8">
                          Generate a heuristic analysis of this node's performance and data quality patterns.
                        </p>
                        <button 
                          onClick={handleAiAnalysis} 
                          className="mx-auto flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-md hover:bg-indigo-700 transition-all hover:shadow-lg active:scale-95"
                        >
                          <Sparkles size={14} /> Run Analysis
                        </button>
                      </div>
                    )}

                    {isLoadingAi && (
                       <div className="flex flex-col items-center gap-3 py-8">
                          <div className="relative">
                            <div className="w-8 h-8 border-2 border-indigo-100 rounded-full"></div>
                            <div className="absolute top-0 left-0 w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                          <span className="text-xs font-bold text-indigo-600 animate-pulse">Processing clinical metrics...</span>
                       </div>
                    )}

                    {aiAnalysis && (
                      <div className="animate__animated animate__fadeIn">
                         <div className="prose prose-sm prose-slate max-w-none">
                            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-lg border border-slate-100 font-medium">
                              {aiAnalysis}
                            </div>
                         </div>
                         <div className="mt-4 flex items-center gap-2 text-slate-400">
                            <Eye size={12} />
                            <span className="text-[10px] font-medium italic">Recommendation only. Verification required.</span>
                         </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'data' && (
             <div className="animate__animated animate__fadeIn">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                   <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <h3 className="font-bold text-slate-800 text-sm">Sample Data (Anonymized)</h3>
                      <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm">
                         <Download size={14} /> Export CSV
                      </button>
                   </div>
                   <div className="overflow-x-auto">
                      {node.sampleRows ? (
                        <table className="w-full text-sm text-left">
                           <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                              <tr>
                                {node.sampleColumns?.map((col, i) => (
                                  <th key={i} className="px-6 py-3 whitespace-nowrap border-b border-slate-200">{col}</th>
                                ))}
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                              {node.sampleRows.map((row, i) => (
                                <tr key={i} className="hover:bg-blue-50/50 transition-colors">
                                   {node.sampleColumns?.map((col, j) => (
                                     <td key={j} className="px-6 py-3 text-slate-700 whitespace-nowrap font-medium">
                                       {row[col]}
                                     </td>
                                   ))}
                                </tr>
                              ))}
                           </tbody>
                        </table>
                      ) : (
                        <div className="p-12 text-center text-slate-400">
                           <Database size={48} className="mx-auto mb-3 opacity-20" />
                           <p className="text-sm">No row-level data available for this node type.</p>
                        </div>
                      )}
                   </div>
                </div>
             </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="bg-white border-t border-slate-200 p-6 z-20">
           {showSuccess ? (
             <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center justify-center gap-3 animate__animated animate__fadeIn">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><CheckCircle2 size={18} /></div>
                <span className="text-sm font-bold text-emerald-800">Action recorded successfully. Traceability updated.</span>
             </div>
           ) : interactionMode !== 'none' ? (
             <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 shadow-inner animate__animated animate__fadeInUp">
                <div className="flex justify-between items-center mb-4">
                   <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                     {interactionMode === 'assign' ? <UserPlus size={16} className="text-blue-600" /> : <MessageSquare size={16} className="text-amber-500" />}
                     {interactionMode === 'assign' ? 'Assign Task' : 'Flag Issue'}
                   </h4>
                   <button onClick={() => setInteractionMode('none')} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
                </div>
                <div className="flex gap-3">
                   {interactionMode === 'assign' && (
                     <div className="w-1/3">
                       <select 
                         className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                         value={selectedRole}
                         onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                       >
                         {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
                       </select>
                     </div>
                   )}
                   <input 
                     type="text" 
                     className="flex-1 h-10 px-4 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none shadow-sm"
                     placeholder={interactionMode === 'assign' ? "Add instructions..." : "Describe the issue..."}
                     value={assignmentNote}
                     onChange={(e) => setAssignmentNote(e.target.value)}
                     autoFocus
                   />
                   <button 
                     onClick={handleSendAssignment}
                     disabled={!assignmentNote}
                     className="px-6 h-10 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all active:scale-95"
                   >
                     Confirm
                   </button>
                </div>
             </div>
           ) : (
             <div className="flex items-center justify-between">
                <div className="text-xs text-slate-400 font-medium italic">
                   System ID: {node.id}
                </div>
                <div className="flex gap-3">
                   <button 
                     onClick={() => setInteractionMode('assign')}
                     className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50 hover:border-slate-400 hover:text-slate-900 transition-all shadow-sm active:scale-95 flex items-center gap-2"
                   >
                     <UserPlus size={16} /> Assign
                   </button>
                   <button 
                     onClick={() => setInteractionMode('flag')}
                     className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50 hover:border-slate-400 hover:text-slate-900 transition-all shadow-sm active:scale-95 flex items-center gap-2"
                   >
                     <MessageSquare size={16} /> Flag
                   </button>
                   <button 
                     onClick={onClose}
                     className="px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-all shadow-md hover:shadow-lg active:scale-95"
                   >
                     Done
                   </button>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};