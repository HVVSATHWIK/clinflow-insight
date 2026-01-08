import React, { useState, useEffect, useRef } from 'react';
import { FlowNode, NodeType, HealthStatus, UserRole } from '../types';
import {
  Activity, Database, FileBarChart, AlertTriangle, CheckCircle,
  AlertOctagon, Layers, ZoomIn, ZoomOut, RotateCcw, ArrowRight,
  Radio, Info, Server, Cpu, LineChart, Grab, Move
} from 'lucide-react';

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

// SVG Connection Pipe Component
const ConnectionPipe = ({ active = false }) => (
  <div className="hidden md:flex flex-col justify-center items-center w-24 relative opacity-100">
    <svg className="w-full h-32 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="pipeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(59, 130, 246, 0.2)" />
          <stop offset="50%" stopColor="rgba(59, 130, 246, 0.8)" />
          <stop offset="100%" stopColor="rgba(59, 130, 246, 0.2)" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Main Pipe Paths */}
      <path
        d="M 0,50 C 30,50 30,20 50,20 C 70,20 70,50 100,50"
        fill="none"
        stroke="url(#pipeGradient)"
        strokeWidth="3"
        className="animate-pulse"
      />
      <path
        d="M 0,50 C 30,50 30,80 50,80 C 70,80 70,50 100,50"
        fill="none"
        stroke="url(#pipeGradient)"
        strokeWidth="3"
        className="animate-pulse"
        style={{ animationDelay: '1s' }}
      />

      {/* Moving Particles */}
      <circle r="4" fill="#60A5FA" filter="url(#glow)">
        <animateMotion
          dur="2s"
          repeatCount="indefinite"
          path="M 0,50 C 30,50 30,20 50,20 C 70,20 70,50 100,50"
        />
      </circle>
      <circle r="4" fill="#60A5FA" filter="url(#glow)">
        <animateMotion
          dur="3s"
          repeatCount="indefinite"
          begin="0.5s"
          path="M 0,50 C 30,50 30,80 50,80 C 70,80 70,50 100,50"
        />
      </circle>
    </svg>
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

  // Constants for Limits
  const MIN_ZOOM = 0.4;
  const MAX_ZOOM = 2.5;
  const BOUNDS_PADDING = 200; // Keep at least this much of the content visible

  // Helper to clamp pan values based on current zoom and container size
  const clampPan = (x: number, y: number, currentZoom: number) => {
    if (!containerRef.current) return { x, y };
    const cw = containerRef.current.clientWidth;
    const ch = containerRef.current.clientHeight;
    // contentW/H are approx 1200/600 based on standard layout
    const contentW = 1500;
    const contentH = 800;

    // Calculate max allowed offsets
    // We want to prevent driving the content completely off screen.
    // Left boundary: The right edge of content shouldn't go too far left
    // Right boundary: The left edge of content shouldn't go too far right

    // minX: Left edge of content is at x. Right edge is at x + (contentW * zoom).
    // We want x + (contentW * zoom) > BOUNDS_PADDING
    const minX = BOUNDS_PADDING - (contentW * currentZoom);

    // maxX: We want x < cw - BOUNDS_PADDING
    const maxX = cw - BOUNDS_PADDING;

    // minY: Top edge at y. Bottom edge at y + (contentH * zoom)
    // We want y + (contentH * zoom) > BOUNDS_PADDING
    const minY = BOUNDS_PADDING - (contentH * currentZoom);
    const maxY = ch - BOUNDS_PADDING;

    return {
      x: Math.min(Math.max(x, minX), maxX),
      y: Math.min(Math.max(y, minY), maxY)
    };
  };

  const handleZoomIn = () => {
    if (!containerRef.current) return;
    const cw = containerRef.current.clientWidth;
    const ch = containerRef.current.clientHeight;
    // Use smaller steps for finer control? No, 0.2 is okay. Limits are good.
    const newZoom = Math.min(zoom + 0.2, MAX_ZOOM);

    const zoomFactor = newZoom / zoom;
    const centerX = cw / 2;
    const centerY = ch / 2;

    const rawX = centerX - (centerX - pan.x) * zoomFactor;
    const rawY = centerY - (centerY - pan.y) * zoomFactor;

    setPan(clampPan(rawX, rawY, newZoom));
    setZoom(newZoom);
  };

  const handleZoomOut = () => {
    if (!containerRef.current) return;
    const cw = containerRef.current.clientWidth;
    const ch = containerRef.current.clientHeight;
    const newZoom = Math.max(zoom - 0.2, MIN_ZOOM);

    const zoomFactor = newZoom / zoom;
    const centerX = cw / 2;
    const centerY = ch / 2;

    const rawX = centerX - (centerX - pan.x) * zoomFactor;
    const rawY = centerY - (centerY - pan.y) * zoomFactor;

    setPan(clampPan(rawX, rawY, newZoom));
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
    // No clamping needed for centered reset, but good practice
    setZoom(1);
    setPan({ x: initialX > 0 ? initialX : 50, y: initialY > 0 ? initialY : 50 });
  };

  // Pan Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;

    const newX = pan.x + deltaX;
    const newY = pan.y + deltaY;

    setPan(clampPan(newX, newY, zoom));
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
      e.preventDefault();
      e.stopImmediatePropagation();

      const isPinch = e.ctrlKey;
      const zoomSensitivity = isPinch ? 0.005 : 0.001;

      const delta = -(e.deltaY) * zoomSensitivity;
      const newZoom = Math.min(Math.max(zoom + delta, MIN_ZOOM), MAX_ZOOM);

      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (Math.abs(zoom - newZoom) > 0.0001) {
        const zoomFactor = newZoom / zoom;
        const rawX = mouseX - (mouseX - pan.x) * zoomFactor;
        const rawY = mouseY - (mouseY - pan.y) * zoomFactor;

        setPan(clampPan(rawX, rawY, newZoom));
        setZoom(newZoom);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [zoom, pan]); // Add pan as dependency for clampPan if needed, but clampPan uses refs mostly. 
  // Actually, clampPan is defined in render scope, so it closes over refs. Safe.
  // BUT: We need to use 'pan' state inside handleWheel if we don't use functional updates.
  // The existing handleWheel used 'pan' from closure. We must include 'pan' in dependency array OR use functional update carefully.
  // The clampPan needs current zoom and container dims.
  // Let's rely on the dependency array [zoom, pan] to refresh the event listener with fresh state clojures.

  return (
    <div className="flex-1 relative overflow-hidden flex flex-col bg-transparent group select-none">

      {/* Header Overlay - Restyled for better visibility */}
      <div className="absolute top-6 left-8 z-10 pointer-events-none">
        <div className="bg-slate-900/40 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/5 shadow-2xl">
          <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2 drop-shadow-md">
            <Layers className="text-blue-500" size={16} />
            Data Observability
          </h2>
          <p className="text-[10px] text-slate-400 mt-0.5 font-medium max-w-xs drop-shadow-sm">
            Real-time visualization of data flows & engines.
          </p>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div
        ref={containerRef}
        className={`flex-1 overflow-hidden relative z-0 w-full h-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ touchAction: 'none' }} // Critical for preventing browser gestures
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          ref={contentRef}
          className="absolute top-0 left-0 origin-top-left pb-32 pr-32"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            width: 'fit-content',
            height: 'fit-content',
            // Use hardware acceleration for smoother rendering
            willChange: 'transform',
          }}
        >
          <div className="flex items-center gap-4 p-12">
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

            <ConnectionPipe />

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

            <ConnectionPipe />

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