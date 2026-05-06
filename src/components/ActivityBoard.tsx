/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Layout, FileText, Download, CheckCircle2, ChevronRight, Clock, Trash2, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ActivityBoard() {
  const [activeTab, setActiveTab] = useState<'batch' | 'logs'>('batch');

  return (
    <div className="flex flex-col h-full bg-[#1E293B] rounded-xl border border-slate-700 overflow-hidden shadow-xl">
      <div className="flex gap-1 p-1 bg-slate-950 border-b border-slate-700">
        <button 
          onClick={() => setActiveTab('batch')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-wider rounded-t-md transition-all ${activeTab === 'batch' ? 'bg-[#1E293B] text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Layout size={12} />
          Batch Processor
        </button>
        <button 
          onClick={() => setActiveTab('logs')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase tracking-wider rounded-t-md transition-all ${activeTab === 'logs' ? 'bg-[#1E293B] text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <FileText size={12} />
          Audit Journal
        </button>
      </div>

      <div className="flex-1 overflow-hidden p-4">
        <AnimatePresence mode="wait">
          {activeTab === 'batch' ? (
            <motion.div 
              key="batch"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full flex flex-col space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Export PDF', desc: 'High Quality', icon: <FileText size={14} />, color: 'blue' },
                  { label: 'Export PNG', desc: 'Raw Asset', icon: <Download size={14} />, color: 'purple' },
                  { label: 'Sync DB', desc: 'Local Cache', icon: <Database size={14} />, color: 'pink' },
                ].map((item, idx) => (
                  <button key={idx} className="flex flex-col items-center justify-center p-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all group active:scale-95">
                    <span className={`text-${item.color}-400 mb-2 group-hover:scale-110 transition-transform`}>{item.icon}</span>
                    <span className="text-[10px] font-black uppercase text-white">{item.label}</span>
                    <span className="text-[8px] text-slate-500 mt-0.5">{item.desc}</span>
                  </button>
                ))}
              </div>

              <div className="flex-1 bg-slate-900/50 rounded-xl border border-slate-800 p-4 relative overflow-hidden flex flex-col">
                <div className="absolute top-0 left-0 h-1 bg-blue-500 animate-[loading-bar_2s_infinite]"></div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Jobs</h3>
                  <span className="text-[9px] bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded border border-blue-600/30 font-black">2 RUNNING</span>
                </div>
                
                <div className="space-y-3">
                  {[
                    { name: 'Batch Export #120', progress: 85, status: 'Processing' },
                    { name: 'Asset Pre-compilation', progress: 42, status: 'Queued' }
                  ].map((job, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-300 font-bold">{job.name}</span>
                        <span className="text-blue-400 font-mono">{job.progress}%</span>
                      </div>
                      <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${job.progress}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="logs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full flex flex-col"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-[9px] text-slate-500 font-mono">BUFFER: 4.2MB</span>
                <button className="flex items-center gap-1 text-[9px] text-red-400 hover:text-red-300 transition-colors uppercase font-black">
                  <Trash2 size={10} /> Clear Cache
                </button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-[#1E293B] sticky top-0">
                    <tr className="text-slate-500 font-bold uppercase tracking-widest border-b border-slate-800">
                      <th className="py-2 px-2">Timestamp</th>
                      <th className="py-2 px-2">Operation</th>
                      <th className="py-2 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {[
                      { time: '09:42:01', op: 'UI_RECALIBRATED', status: 'SUCCESS' },
                      { time: '09:41:55', op: 'ASSET_PUSH:IMG_01', status: 'SUCCESS' },
                      { time: '09:41:40', op: 'CONFIG_SYNC', status: 'PENDING' },
                      { time: '09:40:22', op: 'AUTH_CHALLENGE', status: 'FAILED' },
                      { time: '09:40:01', op: 'SYS_BOOTSTRAP', status: 'SUCCESS' },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-2 px-2 text-slate-500 font-mono">{row.time}</td>
                        <td className="py-2 px-2 text-slate-300 font-bold">{row.op}</td>
                        <td className="py-2 px-2">
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${
                            row.status === 'SUCCESS' ? 'text-green-500 bg-green-500/10' :
                            row.status === 'FAILED' ? 'text-red-500 bg-red-500/10' : 'text-yellow-500 bg-yellow-500/10'
                          }`}>{row.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); width: 20%; }
          50% { transform: translateX(200%); width: 50%; }
          100% { transform: translateX(500%); width: 10%; }
        }
      `}</style>
    </div>
  );
}
