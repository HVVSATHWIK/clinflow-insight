import React, { useState, useEffect } from 'react';
import { X, UploadCloud, Database, FileSpreadsheet, CheckCircle2, Loader2, AlertTriangle, ArrowRight, ShieldCheck, Info } from 'lucide-react';
import { FlowNode, NodeType, HealthStatus, UserRole } from '../types';

interface ConnectSourceModalProps {
  onClose: () => void;
  onAddNode: (node: FlowNode) => void;
}

export const ConnectSourceModal: React.FC<ConnectSourceModalProps> = ({ onClose, onAddNode }) => {
  const [step, setStep] = useState<'upload' | 'validating' | 'success'>('upload');
  const [sourceName, setSourceName] = useState('');
  const [sourceType, setSourceType] = useState('lab');
  const [progress, setProgress] = useState(0);

  // Simulation of System Activity: Visualization of Ingestion States
  useEffect(() => {
    if (step === 'validating') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setStep('success');
            return 100;
          }
          // Non-linear progress simulation for realistic visual effect
          return prev + Math.random() * 15; 
        });
      }, 300);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleUpload = () => {
    if (!sourceName) return;
    setStep('validating');
    setProgress(0);
  };

  const handleFinalize = () => {
    const newNode: FlowNode = {
      id: `src-snap-${Date.now()}`,
      label: sourceName,
      type: NodeType.SOURCE,
      status: HealthStatus.HEALTHY,
      description: `Snapshot Data: ${sourceType === 'lab' ? 'Laboratory' : 'External DB'} import. Conceptual onboarding for lineage tracing.`,
      roleRelevance: [UserRole.DATA_MANAGER, UserRole.CRA],
      metrics: [{ label: 'Records Mapped', value: 'N/A (Snapshot)', trend: 'stable' }],
      details: {
        responsible: 'Data Operations',
        lastUpdated: new Date().toLocaleTimeString(),
        issues: [],
        rawFields: ['Conceptual_Field_1', 'Conceptual_Field_2', 'Mapped_ID']
      },
      sampleColumns: ['Subject', 'Date', 'Test', 'Result', 'Flag'],
      sampleRows: [
         { 'Subject': '1099', 'Date': '2024-05-20', 'Test': 'WBC', 'Result': '5.5', 'Flag': 'None'},
         { 'Subject': '1100', 'Date': '2024-05-21', 'Test': 'RBC', 'Result': '4.2', 'Flag': 'Low'},
      ]
    };
    onAddNode(newNode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate__animated animate__zoomIn" style={{animationDuration: '300ms'}}>
        
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <div>
             <h3 className="font-bold text-slate-800 text-lg">Onboard Data Snapshot</h3>
             <p className="text-xs text-slate-500">Conceptual dataset integration</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X size={18} /></button>
        </div>

        {/* Disclaimer Banner */}
        <div className="bg-blue-50/50 px-6 py-2 border-b border-blue-100 flex items-start gap-3">
             <Info size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
             <p className="text-[10px] text-blue-700 font-medium leading-tight">
               This workflow demonstrates <strong>conceptual onboarding</strong> of new datasets for insight generation. It does not process live PII or execute real ETL.
             </p>
        </div>

        {/* Body */}
        <div className="p-8">
          
          {step === 'upload' && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Snapshot Name</label>
                <input 
                  type="text" 
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  placeholder="e.g., Q3 Lab Snapshot (Conceptual)"
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Source Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setSourceType('lab')}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${sourceType === 'lab' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                  >
                    <FileSpreadsheet size={16} /> Lab File (Sample)
                  </button>
                  <button 
                    onClick={() => setSourceType('db')}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${sourceType === 'db' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                  >
                    <Database size={16} /> Ext. DB (Config)
                  </button>
                </div>
              </div>

              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-blue-400 hover:bg-blue-50/10 transition-colors cursor-pointer group">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <UploadCloud size={24} className="text-slate-400 group-hover:text-blue-500" />
                </div>
                <p className="text-sm font-semibold text-slate-700">Select Sample / Snapshot File</p>
                <p className="text-xs text-slate-400 mt-1">.CSV, .XML (Structure Only)</p>
              </div>
            </div>
          )}

          {step === 'validating' && (
            <div className="py-12 flex flex-col items-center text-center">
               <div className="relative w-16 h-16 mb-6">
                 <svg className="w-full h-full" viewBox="0 0 100 100">
                   <circle className="text-slate-100 stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent"></circle>
                   <circle className="text-blue-600 progress-ring__circle stroke-current transition-all duration-300 ease-out" strokeWidth="8" strokeLinecap="round" cx="50" cy="50" r="40" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * progress) / 100}></circle>
                 </svg>
                 <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-blue-700">
                   {Math.round(progress)}%
                 </div>
               </div>
               
               <h4 className="text-lg font-bold text-slate-800 mb-2">System Observability Status</h4>
               <div className="text-sm text-slate-500 space-y-1">
                 <p className={progress > 20 ? 'text-emerald-600 font-medium flex items-center justify-center gap-2' : 'opacity-50'}>
                    {progress > 20 && <CheckCircle2 size={12} />} Visualizing Data Stream...
                 </p>
                 <p className={progress > 50 ? 'text-emerald-600 font-medium flex items-center justify-center gap-2' : 'opacity-50'}>
                    {progress > 50 && <CheckCircle2 size={12} />} Verifying Schema Match...
                 </p>
                 <p className={progress > 80 ? 'text-emerald-600 font-medium flex items-center justify-center gap-2' : 'opacity-50'}>
                    {progress > 80 && <CheckCircle2 size={12} />} Calculating Quality Metrics...
                 </p>
               </div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-8 flex flex-col items-center text-center animate__animated animate__fadeIn">
               <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 text-emerald-600">
                 <ShieldCheck size={32} />
               </div>
               <h4 className="text-xl font-bold text-slate-800 mb-2">Snapshot Integrated</h4>
               <p className="text-slate-500 text-sm mb-6 max-w-xs">
                 The conceptual dataset has been mapped to the data flow for lineage tracing.
               </p>
               
               <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 w-full mb-6">
                 <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Traceability Score:</span>
                    <span className="font-bold text-emerald-600">100/100</span>
                 </div>
                 <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Schema Mapped:</span>
                    <span className="font-bold text-slate-700">Yes</span>
                 </div>
               </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
           {step === 'upload' && (
             <>
                <button onClick={onClose} className="px-4 py-2 text-slate-600 font-bold text-sm hover:bg-slate-200 rounded-lg">Cancel</button>
                <button 
                  onClick={handleUpload} 
                  disabled={!sourceName}
                  className="px-6 py-2 bg-slate-900 text-white font-bold text-sm rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Simulate Onboarding <ArrowRight size={14} />
                </button>
             </>
           )}
           
           {step === 'validating' && (
              <button disabled className="px-6 py-2 bg-slate-100 text-slate-400 font-bold text-sm rounded-lg cursor-wait flex items-center gap-2">
                 <Loader2 size={14} className="animate-spin" /> System Processing...
              </button>
           )}

           {step === 'success' && (
              <button onClick={handleFinalize} className="px-6 py-2 bg-emerald-600 text-white font-bold text-sm rounded-lg hover:bg-emerald-700 flex items-center gap-2">
                 Add to Canvas <CheckCircle2 size={16} />
              </button>
           )}
        </div>

      </div>
    </div>
  );
};