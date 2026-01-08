import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { DataFlowCanvas } from './components/DataFlowCanvas';
import { InsightPanel } from './components/InsightPanel';
import { DrillDownModal } from './components/DrillDownModal';
import { ConnectSourceModal } from './components/ConnectSourceModal';
import { ThreeBackground } from './components/ThreeBackground';
import { DATA_NODES, INITIAL_INSIGHTS } from './constants';
import { FlowNode, UserRole } from './types';

function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.EXECUTIVE);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Data State
  const [nodes, setNodes] = useState<FlowNode[]>(DATA_NODES);

  // Panel States
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isInsightPanelOpen, setIsInsightPanelOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  const selectedNode = selectedNodeId ? nodes.find(n => n.id === selectedNodeId) || null : null;

  const handleNodeSelect = (node: FlowNode) => {
    setSelectedNodeId(node.id);
  };

  const handleCloseModal = () => {
    setSelectedNodeId(null);
  };

  const handleAddNode = (newNode: FlowNode) => {
    setNodes(prev => [...prev, newNode]);
    setIsConnectModalOpen(false);
  };

  // Navigation State
  const [currentView, setCurrentView] = useState('data-flow');

  return (
    <div className="flex h-screen w-screen bg-slate-950 overflow-hidden text-slate-100 font-sans selection:bg-blue-500/30 relative">
      <ThreeBackground />

      {/* Ambient Background Glows */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse-ring"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse-ring" style={{ animationDelay: '1s' }}></div>
      </div>

      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        currentView={currentView}
        onNavigate={setCurrentView}
      />


      <div className="flex-1 flex flex-col h-full min-w-0 transition-all duration-300">
        <TopNav
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
          onConnectClick={() => setIsConnectModalOpen(true)}
        />

        <main className="flex-1 flex overflow-hidden relative">
          {currentView === 'data-flow' && (
            <DataFlowCanvas
              nodes={nodes}
              currentRole={currentRole}
              onNodeSelect={handleNodeSelect}
              selectedNodeId={selectedNodeId}
            />
          )}

          {currentView !== 'data-flow' && (
            <div className="flex-1 flex items-center justify-center relative z-10 p-12 text-center">
              <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-12 max-w-lg shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] animate__animated animate__fadeInUp">
                <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6 ring-1 ring-white/10 shadow-inner">
                  {currentView === 'data-sources' && <div className="text-blue-400 font-bold text-2xl">DS</div>}
                  {currentView === 'monitoring' && <div className="text-amber-400 font-bold text-2xl">MN</div>}
                  {currentView === 'safety' && <div className="text-rose-400 font-bold text-2xl">PV</div>}
                  {currentView === 'reports' && <div className="text-emerald-400 font-bold text-2xl">RP</div>}
                </div>
                <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">System Module Active</h2>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                  The <span className="font-bold text-white">{currentView.replace('-', ' ').toUpperCase()}</span> module is initialized and monitoring background services.
                </p>
                <button
                  onClick={() => setCurrentView('data-flow')}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 active:scale-95 flex items-center gap-2 mx-auto"
                >
                  Return to Data Flow
                </button>
              </div>
            </div>
          )}

          <InsightPanel
            insights={INITIAL_INSIGHTS}
            isOpen={isInsightPanelOpen}
            togglePanel={() => setIsInsightPanelOpen(!isInsightPanelOpen)}
          />
        </main>
      </div>

      <DrillDownModal
        node={selectedNode}
        onClose={handleCloseModal}
      />

      {
        isConnectModalOpen && (
          <ConnectSourceModal
            onClose={() => setIsConnectModalOpen(false)}
            onAddNode={handleAddNode}
          />
        )
      }
    </div >
  );
}

export default App;