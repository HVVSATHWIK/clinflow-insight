import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { DataFlowCanvas } from './components/DataFlowCanvas';
import { InsightPanel } from './components/InsightPanel';
import { DrillDownModal } from './components/DrillDownModal';
import { ConnectSourceModal } from './components/ConnectSourceModal';
import { DATA_NODES, INITIAL_INSIGHTS } from './constants';
import { FlowNode, UserRole } from './types';

function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.EXECUTIVE);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Data State
  const [nodes, setNodes] = useState<FlowNode[]>(DATA_NODES);

  // Panel States
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isInsightPanelOpen, setIsInsightPanelOpen] = useState(true);
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

  return (
    <div className="flex h-screen w-screen bg-slate-950 overflow-hidden text-slate-100 font-sans selection:bg-blue-500/30">
      {/* Ambient Background Glows */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse-ring"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse-ring" style={{ animationDelay: '1s' }}></div>
      </div>

      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />


      <div className="flex-1 flex flex-col h-full min-w-0 transition-all duration-300">
        <TopNav
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
          onConnectClick={() => setIsConnectModalOpen(true)}
        />

        <main className="flex-1 flex overflow-hidden relative">
          <DataFlowCanvas
            nodes={nodes}
            currentRole={currentRole}
            onNodeSelect={handleNodeSelect}
            selectedNodeId={selectedNodeId}
          />
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

      {isConnectModalOpen && (
        <ConnectSourceModal
          onClose={() => setIsConnectModalOpen(false)}
          onAddNode={handleAddNode}
        />
      )}
    </div>
  );
}

export default App;