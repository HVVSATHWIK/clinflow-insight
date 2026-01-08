import React, { useState, useEffect, useRef } from 'react';
import { FlowNode, NodeType, HealthStatus, UserRole } from '../types';
import {
  Activity, Database, FileBarChart, AlertTriangle, CheckCircle,
  AlertOctagon, Layers, ZoomIn, ZoomOut, RotateCcw, ArrowRight,
  Radio, Info, Server, Cpu, LineChart, Grab, Move
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
    case HealthStatus.HEALTHY: return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    case HealthStatus.WARNING: return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    case HealthStatus.CRITICAL: return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    default: return 'text-slate-400 bg-slate-800/50 border-slate-700/50';
  }
};

const getTypeConfig = (type: NodeType) => {
  switch (type) {
    case NodeType.SOURCE: return { icon: Server, label: 'Dataset', color: 'text-slate-300', bg: 'bg-slate-800' };
    case NodeType.PROCESS: return { icon: Cpu, label: 'Engine', color: 'text-blue-400', bg: 'bg-blue-900/40' };
    case NodeType.INSIGHT: return { icon: LineChart, label: 'Insight', color: 'text-violet-400', bg: 'bg-violet-900/40' };
    default: return { icon: Database, label: 'Node', color: 'text-slate-400', bg: 'bg-slate-800' };
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
      onClick={(e) => {
        e.stopPropagation(); // Prevent drag start when clicking card
        onNodeSelect(node);
      }}
      className={`
        group relative w-80 rounded-xl cursor-pointer overflow-hidden
        glass-card
        ${isSelected
          ? 'border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.2)] bg-slate-800/80 scale-[1.02]'
          : 'border-white/5'
        }
        ${!isRelevant ? 'opacity-50 grayscale-[0.6] hover:opacity-100 hover:grayscale-0' : 'opacity-100'}
      `}
    >
      {/* Relevance Badge */}
      {isRelevant && (
        <div className="absolute top-0 right-0 z-10 pointer-events-none">
          <div className="bg-blue-600 text-white text-[9px] font-bold px-3 py-1 rounded-bl-xl shadow-lg shadow-blue-900/20">
            RELEVANT
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-5 py-4 border-b border-white/5 flex items-start gap-4 transition-colors group-hover:border-white/10">
        <div className={`p-3 rounded-xl ${typeConfig.bg} ${typeConfig.color} flex-shrink-0 ring-1 ring-white/10 shadow-inner`}>
          <TypeIcon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1 pr-12">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-400 transition-colors">{typeConfig.label}</span>
          </div>
          <h3 className="font-bold text-slate-100 text-sm leading-snug truncate pr-2 group-hover:text-blue-300 transition-colors drop-shadow-sm">{node.label}</h3>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 min-h-[2.5em] group-hover:text-slate-300 transition-colors">
          {node.description}
        </p>
      </div>

      {/* Metrics Footer */}
      <div className="px-5 py-3 bg-slate-950/20 border-t border-white/5 flex items-center justify-between group-hover:bg-slate-950/40 transition-colors">
        {/* Status Pill */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider ${statusClass} shadow-sm`}>
          {node.status === HealthStatus.CRITICAL && <AlertOctagon size={12} />}
          {node.status === HealthStatus.WARNING && <AlertTriangle size={12} />}
          {node.status === HealthStatus.HEALTHY && <CheckCircle size={12} />}
          <span>{node.status}</span>
        </div>

        {/* Primary Metric */}
        {node.metrics[0] && (
          <div className="text-right">
            <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide group-hover:text-slate-400 transition-colors">{node.metrics[0].label}</span>
            <span className="block text-sm font-bold text-slate-200 font-mono tracking-tight group-hover:text-white group-hover:glow-text transition-all">{node.metrics[0].value}</span>
          </div>
        )}
      </div>

      {/* Processing Animation Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 border border-blue-400/20 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity animate-pulse shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]"></div>
      )}
    </div>
  );
};

const Lane = ({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) => (
  <div className="flex flex-col gap-6 p-6 rounded-[2rem] bg-slate-900/10 border border-white/5 min-w-[360px] backdrop-blur-[2px] hover:bg-slate-900/20 hover:border-white/10 transition-all duration-500">
    <div className="flex items-center gap-3 pb-4 border-b border-white/5 mb-2 px-2">
      <div className="p-2 bg-slate-800/50 rounded-lg shadow-sm text-slate-400 ring-1 ring-white/5 backdrop-blur-md">
        <Icon size={16} />
      </div>
      <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest">{title}</h2>
    </div>
    <div className="flex flex-col gap-6">
      {children}
    </div>
  </div>
);

const Connector = () => (
  <div className="hidden md:flex flex-col justify-center items-center px-4 opacity-20">
    <ArrowRight size={24} className="text-slate-400" />
  </div>
);

export const DataFlowCanvas: React.FC<DataFlowCanvasProps> = ({ nodes, currentRole, onNodeSelect, selectedNodeId }) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const sources = nodes.filter(n => n.type === NodeType.SOURCE);
  const processes = nodes.filter(n => n.type === NodeType.PROCESS);
  const insights = nodes.filter(n => n.type === NodeType.INSIGHT);

  // Initial Centering
  useEffect(() => {
    if (containerRef.current && contentRef.current) {
      const cw = containerRef.current.clientWidth;
      const ch = containerRef.current.clientHeight;
      const contentW = 1200; // Approx content width (3 lanes + gaps)
      const contentH = 600;  // Approx content height

      const initialX = (cw - contentW) / 2;
      const initialY = (ch - contentH) / 2;

      setPan({ x: initialX > 0 ? initialX : 50, y: initialY > 0 ? initialY : 50 });
    }
  }, []);

  const handleZoomIn = () => {
    // Zoom to center of container
    if (!containerRef.current) return;
    const cw = containerRef.current.clientWidth;
    const ch = containerRef.current.clientHeight;
    const newZoom = Math.min(zoom + 0.2, 2.0);

    // Simple center zoom approx
    const zoomFactor = newZoom / zoom;
    const centerX = cw / 2;
    const centerY = ch / 2;

    setPan(prev => ({
      x: centerX - (centerX - prev.x) * zoomFactor,
      y: centerY - (centerY - prev.y) * zoomFactor
    }));
    setZoom(newZoom);
  };

  const handleZoomOut = () => {
    if (!containerRef.current) return;
    const cw = containerRef.current.clientWidth;
    const ch = containerRef.current.clientHeight;
    const newZoom = Math.max(zoom - 0.2, 0.4);

    const zoomFactor = newZoom / zoom;
    const centerX = cw / 2;
    const centerY = ch / 2;

    setPan(prev => ({
      x: centerX - (centerX - prev.x) * zoomFactor,
      y: centerY - (centerY - prev.y) * zoomFactor
    }));
    setZoom(newZoom);
  };

  const handleReset = () => {
    if (!containerRef.current) return;
    const cw = containerRef.current.clientWidth;
    const ch = containerRef.current.clientHeight;
    const contentW = 1200;
    const contentH = 600;
    const initialX = (cw - contentW) / 2;
    const initialY = (ch - contentH) / 2;
    setZoom(1);
    setPan({ x: initialX > 0 ? initialX : 50, y: initialY > 0 ? initialY : 50 });
  };

  // Pan Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left click
      setIsDragging(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;

    setPan(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Wheel zoom logic (Zoom to Mouse Point)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Prevent browser zoom
      if (e.ctrlKey || e.metaKey) e.preventDefault();

      // If we want detailed zoom:
      // Standardize wheel check (some pads scroll, some zoom)
      if (e.ctrlKey || Math.abs(e.deltaY) < 100) {
        e.preventDefault();
        const zoomSensitivity = 0.0015;
        const delta = -e.deltaY * zoomSensitivity;
        const newZoom = Math.min(Math.max(zoom + delta, 0.3), 3.0);

        // Calculate mouse position relative to container
        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Math: newPan = mouse - (mouse - oldPan) * (newZoom/oldZoom)
        const zoomFactor = newZoom / zoom;

        setPan(prev => ({
          x: mouseX - (mouseX - prev.x) * zoomFactor,
          y: mouseY - (mouseY - prev.y) * zoomFactor
        }));

        setZoom(newZoom);
      } else {
        // Standard Panning with wheel (optional, many users expect this on vertical scroll)
        // setPan(prev => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
      }
    };

    // Add passive: false to allow preventDefault
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [zoom]); // Re-bind when zoom changes to have latest state

  return (
    <div className="flex-1 relative overflow-hidden flex flex-col bg-slate-950/0 group select-none">
      <ThreeBackground />

      {/* Header Overlay - Restyled for better visibility */}
      <div className="absolute top-6 left-8 z-10 pointer-events-none">
        <div className="bg-slate-900/40 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/5 shadow-2xl">
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3 drop-shadow-md">
            <Layers className="text-blue-500" size={24} />
            Data Observability
          </h2>
          <p className="text-sm text-slate-400 mt-1 font-medium max-w-lg drop-shadow-sm">
            Real-time visualization of data flows, processing engines, and insights.
          </p>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div
        ref={containerRef}
        className={`flex-1 overflow-hidden relative z-0 w-full h-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          ref={contentRef}
          className="absolute top-0 left-0 transition-transform duration-75 ease-out origin-top-left pb-32 pr-32"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            width: 'fit-content',
            height: 'fit-content'
          }}
        >
          <div className="flex items-start gap-12 p-12">
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

      {/* Floating Zoom Controls */}
      <div className="absolute bottom-16 right-8 z-30 transition-all duration-300 transform">
        <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 p-2 flex flex-col items-center gap-2 ring-1 ring-black/40">
          <button
            onClick={handleZoomIn}
            className="p-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors active:scale-95"
            title="Zoom In"
          >
            <ZoomIn size={20} />
          </button>

          <div className="w-8 h-px bg-white/10"></div>

          <button
            onClick={handleReset}
            className="p-2 text-xs font-bold font-mono text-blue-400 hover:text-blue-300 transition-colors"
            title="Reset View"
          >
            {Math.round(zoom * 100)}%
          </button>

          <div className="w-8 h-px bg-white/10"></div>

          <button
            onClick={handleZoomOut}
            className="p-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors active:scale-95"
            title="Zoom Out"
          >
            <ZoomOut size={20} />
          </button>
        </div>
      </div>

      {/* Footer Legend */}
      <div className="absolute bottom-0 left-0 right-0 px-8 py-3 bg-slate-950/90 backdrop-blur-xl border-t border-white/5 flex justify-between text-xs text-slate-400 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
        <div className="flex items-center gap-8">
          <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span> Healthy</span>
          <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span> Warning</span>
          <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></span> Critical</span>
          <div className="h-4 w-px bg-slate-800"></div>
          <span className="flex items-center gap-2" title="Visualization of engine availability">
            <Radio size={14} className="text-blue-500/80 animate-pulse" />
            <span className="font-medium text-slate-300">Live Stream <span className="text-emerald-500">●</span></span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-600 font-mono">
          <Info size={12} />
          <span>CANVAS: {Math.round(pan.x)},{Math.round(pan.y)} @ {zoom.toFixed(2)}x</span>
        </div>
      </div>
    </div>
  );
};