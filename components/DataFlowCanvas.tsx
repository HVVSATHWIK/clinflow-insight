import React, { useState, useEffect, useRef } from 'react';
import { FlowNode, NodeType, HealthStatus, UserRole } from '../types';
import { 
  Activity, Database, FileBarChart, AlertTriangle, CheckCircle, 
  AlertOctagon, Layers, ZoomIn, ZoomOut, RotateCcw, ArrowRight, 
  Radio, Info, Server, Cpu, LineChart
} from 'lucide-react';
import { ThreeBackground } from './ThreeBackground';

interface DataFlowCanvasProps {
  nodes: FlowNode[];
  currentRole: UserRole;
  onNodeSelect: (node: FlowNode) => void;
  selectedNodeId: string | null;
}

const getStatusColor = (status: HealthStatus) => {
  switch (status) {
    case HealthStatus.HEALTHY: return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    case HealthStatus.WARNING: return 'text-amber-600 bg-amber-50 border-amber-100';
    case HealthStatus.CRITICAL: return 'text-rose-600 bg-rose-50 border-rose-100';
    default: return 'text-slate-400 bg-slate-50 border-slate-100';
  }
};

const getTypeConfig = (type: NodeType) => {
  switch(type) {
    case NodeType.SOURCE: return { icon: Server, label: 'Dataset', color: 'text-slate-600', bg: 'bg-slate-100' };
    case NodeType.PROCESS: return { icon: Cpu, label: 'Engine', color: 'text-blue-600', bg: 'bg-blue-50' };
    case NodeType.INSIGHT: return { icon: LineChart, label: 'Insight', color: 'text-violet-600', bg: 'bg-violet-50' };
    default: return { icon: Database, label: 'Node', color: 'text-slate-600', bg: 'bg-slate-50' };
  }
};

interface NodeCardProps {
  node: FlowNode;
  selectedNodeId: string | null;
  currentRole: UserRole;
  onNodeSelect: (node: FlowNode) => void;
}

const NodeCard: React.FC<NodeCardProps> = ({ node, selectedNodeId, currentRole, onNodeSelect }) => {
  const isSelected = selectedNodeId === node.id;
  const isRelevant = node.roleRelevance.includes(currentRole);
  const isProcessing = node.type === NodeType.PROCESS;
  
  const statusClass = getStatusColor(node.status);
  const typeConfig = getTypeConfig(node.type);
  const TypeIcon = typeConfig.icon;
  
  return (
    <div 
      onClick={() => onNodeSelect(node)}
      className={`
        group relative w-80 bg-white rounded-xl transition-all duration-300 cursor-pointer overflow-hidden
        border-[1.5px]
        ${isSelected 
          ? 'border-blue-500 shadow-xl shadow-blue-500/10 scale-[1.02]' 
          : 'border-slate-200 hover:border-blue-300 hover:shadow-lg hover:-translate-y-1'
        }
        ${!isRelevant ? 'opacity-60 grayscale-[0.4]' : 'opacity-100'}
      `}
    >
      {/* Relevance Badge */}
      {isRelevant && (
        <div className="absolute top-0 right-0 z-10">
          <div className="bg-blue-600 text-white text-[9px] font-bold px-3 py-1 rounded-bl-xl shadow-sm">
            RELEVANT
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-50 flex items-start gap-4">
        <div className={`p-3 rounded-xl ${typeConfig.bg} ${typeConfig.color} flex-shrink-0`}>
          <TypeIcon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1 pr-12">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{typeConfig.label}</span>
          </div>
          <h3 className="font-bold text-slate-800 text-sm leading-snug truncate pr-2">{node.label}</h3>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 min-h-[2.5em]">
          {node.description}
        </p>
      </div>

      {/* Metrics Footer */}
      <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
         {/* Status Pill */}
         <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${statusClass}`}>
            {node.status === HealthStatus.CRITICAL && <AlertOctagon size={12} />}
            {node.status === HealthStatus.WARNING && <AlertTriangle size={12} />}
            {node.status === HealthStatus.HEALTHY && <CheckCircle size={12} />}
            <span className="text-[10px] font-bold uppercase">{node.status}</span>
         </div>

         {/* Primary Metric */}
         {node.metrics[0] && (
           <div className="text-right">
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">{node.metrics[0].label}</span>
              <span className="block text-sm font-bold text-slate-700 font-mono">{node.metrics[0].value}</span>
           </div>
         )}
      </div>

      {/* Processing Animation Overlay */}
      {isProcessing && (
         <div className="absolute inset-0 border-2 border-blue-100 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
      )}
    </div>
  );
};

const Lane = ({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) => (
  <div className="flex flex-col gap-6 p-6 rounded-3xl bg-slate-100/50 border border-slate-200/60 min-w-[360px]">
    <div className="flex items-center gap-3 pb-4 border-b border-slate-200/50 mb-2">
      <div className="p-2 bg-white rounded-lg shadow-sm text-slate-500 border border-slate-100">
        <Icon size={16} />
      </div>
      <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">{title}</h2>
    </div>
    <div className="flex flex-col gap-6">
      {children}
    </div>
  </div>
);

const Connector = () => (
  <div className="hidden md:flex flex-col justify-center items-center px-4 opacity-40">
     <ArrowRight size={24} className="text-slate-400" />
  </div>
);

export const DataFlowCanvas: React.FC<DataFlowCanvasProps> = ({ nodes, currentRole, onNodeSelect, selectedNodeId }) => {
  const [zoom, setZoom] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const sources = nodes.filter(n => n.type === NodeType.SOURCE);
  const processes = nodes.filter(n => n.type === NodeType.PROCESS);
  const insights = nodes.filter(n => n.type === NodeType.INSIGHT);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 1.3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.7));
  const handleResetZoom = () => setZoom(1);

  // Wheel zoom logic
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const zoomSensitivity = 0.002;
        const delta = -e.deltaY * zoomSensitivity;
        setZoom(prev => Math.min(Math.max(prev + delta, 0.5), 1.5));
      }
    };
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <div className="flex-1 relative overflow-hidden flex flex-col bg-slate-50 group">
      <ThreeBackground />

      {/* Header Overlay */}
      <div className="absolute top-6 left-8 z-10 pointer-events-none">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Layers className="text-blue-600" size={20} />
          Data Observability
        </h2>
        <p className="text-xs text-slate-500 mt-1 font-medium max-w-lg">
          Real-time visualization of data flowing from source systems to insight engines.
        </p>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-hidden relative z-0">
        <div 
          ref={scrollContainerRef}
          className="w-full h-full overflow-auto flex items-start justify-center p-12 pt-28"
        >
           <div 
             className="flex items-start gap-2 transition-transform duration-200 ease-out origin-top-center pb-32"
             style={{ transform: `scale(${zoom})` }}
           >
            
            {/* Stage 1: Sources */}
            <Lane title="Data Sources" icon={Database}>
              {sources.map(node => (
                <NodeCard 
                  key={node.id} 
                  node={node} 
                  selectedNodeId={selectedNodeId}
                  currentRole={currentRole}
                  onNodeSelect={onNodeSelect}
                />
              ))}
            </Lane>

            <Connector />

            {/* Stage 2: Engines */}
            <Lane title="Processing Engines" icon={Cpu}>
              {processes.map(node => (
                <NodeCard 
                  key={node.id} 
                  node={node} 
                  selectedNodeId={selectedNodeId}
                  currentRole={currentRole}
                  onNodeSelect={onNodeSelect}
                />
              ))}
            </Lane>

            <Connector />

            {/* Stage 3: Insights */}
            <Lane title="Actionable Insights" icon={LineChart}>
              {insights.map(node => (
                <NodeCard 
                  key={node.id} 
                  node={node} 
                  selectedNodeId={selectedNodeId}
                  currentRole={currentRole}
                  onNodeSelect={onNodeSelect}
                />
              ))}
            </Lane>

           </div>
        </div>
      </div>

      {/* Floating Zoom Controls (Visible on Hover) */}
      <div className="absolute bottom-20 right-8 z-30 transition-all duration-300 transform opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0">
         <div className="bg-white/90 backdrop-blur-md rounded-full shadow-xl border border-slate-200 p-1.5 flex items-center ring-1 ring-black/5">
           <button 
             onClick={handleZoomOut} 
             className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors active:scale-95" 
             title="Zoom Out"
           >
             <ZoomOut size={18} />
           </button>
           
           <div className="w-px h-5 bg-slate-200 mx-1"></div>
           
           <button 
             onClick={handleResetZoom} 
             className="px-4 py-2 text-xs font-bold font-mono text-slate-600 bg-slate-50 border border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all min-w-[70px] flex items-center justify-center gap-2 group/reset mx-1" 
             title="Reset to 100%"
           >
             <span>{Math.round(zoom * 100)}%</span>
             <RotateCcw size={12} className="opacity-0 group-hover/reset:opacity-100 transition-opacity absolute right-2" />
           </button>
           
           <div className="w-px h-5 bg-slate-200 mx-1"></div>

           <button 
             onClick={handleZoomIn} 
             className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors active:scale-95" 
             title="Zoom In"
           >
             <ZoomIn size={18} />
           </button>
         </div>
      </div>

      {/* Footer Legend */}
      <div className="px-8 py-3 bg-white border-t border-slate-200 flex justify-between text-xs text-slate-500 z-20 shadow-sm">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Healthy</span>
          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Warning</span>
          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Critical</span>
          <div className="h-4 w-px bg-slate-200 mx-2"></div>
          <span className="flex items-center gap-2 ml-2" title="Visualization of engine availability (Not autonomous execution)">
            <Radio size={14} className="text-blue-500 animate-pulse" /> 
            <span className="font-medium text-slate-600">System Activity Indicators</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
           <Info size={12} />
           <span>Data movement visualization only</span>
        </div>
      </div>
    </div>
  );
};