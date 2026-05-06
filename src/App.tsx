/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Settings, 
  Layout, 
  UserCircle, 
  Moon, 
  Plus, 
  Clock,
  Menu,
  CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CardConfig, UserData } from './types';
import IDCard from './components/IDCard';
import TemplateEditor from './components/TemplateEditor';
import DataEntry from './components/DataEntry';
import ActivityBoard from './components/ActivityBoard';

const DEFAULT_PALETTE = { 
  name: 'Midnight', 
  primary: '#3B82F6', 
  secondary: '#1E293B', 
  text: '#FFFFFF', 
  accent: '#60A5FA' 
};

const INITIAL_CONFIG: CardConfig = {
  font: 'font-sans',
  colors: DEFAULT_PALETTE,
  elements: {
    avatar: { x: 24, y: 24, size: 80, rounded: 12 },
    title: { x: 120, y: 24, size: 24, weight: 'black' },
    subtitle: { x: 120, y: 52, size: 12, weight: 'medium' },
    badge: { x: 120, y: 74, size: 10, weight: 'bold' }
  }
};

const INITIAL_USER_DATA: UserData = {
  fullName: 'Alexandru Sterling',
  role: 'Systems Architect',
  idNumber: 'STX-99420-G',
  imageUrl: null,
  issueDate: new Date().toISOString().split('T')[0]
};

type AppTab = 'identity' | 'template' | 'activity';

export default function App() {
  const [config, setConfig] = useState<CardConfig>(INITIAL_CONFIG);
  const [userData, setUserData] = useState<UserData>(INITIAL_USER_DATA);
  const [activeTab, setActiveTab] = useState<AppTab>('identity');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const resetConfig = () => setConfig(INITIAL_CONFIG);

  const NavigationItems = [
    { id: 'identity', label: 'Identity Profile', icon: <UserCircle size={18} />, color: 'blue' },
    { id: 'template', label: 'Template Engine', icon: <Settings size={18} />, color: 'purple' },
    { id: 'activity', label: 'Activity Journal', icon: <Layout size={18} />, color: 'emerald' },
  ];

  return (
    <div className="flex bg-[#0F172A] font-sans text-slate-200 h-screen overflow-hidden">
      {/* Sidebar Navigation */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 240 : 80 }}
        className="bg-[#1E293B] border-r border-slate-700 flex flex-col shrink-0 z-[60] transition-all relative shadow-2xl"
      >
        <div className="p-6 flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-900/40 shrink-0">
              BD
            </div>
            {isSidebarOpen && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-black text-lg tracking-tight"
              >
                BentoDash
              </motion.span>
            )}
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 hover:bg-slate-700 rounded text-slate-400 lg:hidden"
          >
            <Menu size={16} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {NavigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as AppTab)}
              className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all group relative ${
                activeTab === item.id 
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-inner shadow-blue-900/10' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
              }`}
            >
              <div className={`shrink-0 transition-transform group-active:scale-90 ${activeTab === item.id ? 'text-blue-400' : 'text-slate-500'}`}>
                {item.icon}
              </div>
              {isSidebarOpen && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs font-black uppercase tracking-widest whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
              {activeTab === item.id && (
                <div className="absolute right-0 w-1.5 h-6 bg-blue-500 rounded-l-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-slate-700/50">
          <button className={`w-full flex items-center gap-4 px-3 py-3 text-slate-500 hover:text-white transition-all`}>
            <Moon size={18} />
            {isSidebarOpen && <span className="text-xs font-bold uppercase tracking-wider">DarkMode</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0F172A] relative">
        {/* Dynamic Header */}
        <header className="h-16 border-b border-slate-700/50 flex items-center justify-between px-8 bg-[#0F172A]/80 backdrop-blur sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-600/10 rounded-lg text-blue-400">
              <CreditCard size={18} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-black uppercase tracking-widest text-slate-400">Workspace</h1>
              <p className="text-[11px] text-slate-600 font-mono">BentoDash v2.5.0-ALPHA-MODULAR</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] text-green-400 font-bold uppercase tracking-widest">Active</span>
              </div>
              <button className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest rounded-lg shadow-lg shadow-blue-900/40 transition-all active:scale-95">
                <Plus size={14} />
                <span>Deploy Template</span>
              </button>
          </div>
        </header>

        {/* Dynamic Body */}
        <div className="flex-1 flex flex-col lg:flex-row p-6 gap-6 min-h-0">
          {/* Left Panel: Tab Content */}
          <section className="w-full lg:w-[380px] shrink-0 bg-[#1E293B] rounded-2xl border border-slate-700 p-5 flex flex-col shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-50"></div>
             <AnimatePresence mode="wait">
                {activeTab === 'identity' && (
                  <motion.div key="identity" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="h-full">
                    <DataEntry data={userData} onChange={setUserData} />
                  </motion.div>
                )}
                {activeTab === 'template' && (
                  <motion.div key="template" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="h-full">
                    <TemplateEditor config={config} onChange={setConfig} onReset={resetConfig} />
                  </motion.div>
                )}
                {activeTab === 'activity' && (
                  <motion.div key="activity" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="h-full">
                    <ActivityBoard />
                  </motion.div>
                )}
             </AnimatePresence>
          </section>

          {/* Right Panel: Live Visualization */}
          <section className="flex-1 min-w-0 bg-[#1E293B] rounded-2xl border border-slate-700 flex flex-col shadow-2xl relative overflow-hidden">
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              <span className="bg-blue-600/20 text-blue-400 border border-blue-600/30 text-[9px] px-2 py-1 rounded font-black uppercase tracking-widest">
                System Visualization
              </span>
              <span className="text-slate-500 text-[10px] uppercase font-bold flex items-center gap-1">
                <Clock size={12} /> Live Sync
              </span>
            </div>
            
            <div className="flex-1 flex items-center justify-center bg-[#0B111E] overflow-hidden p-4">
              <IDCard config={config} data={userData} />
            </div>

            <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex flex-wrap justify-between items-center gap-4">
              <div className="flex gap-6 text-[10px] text-slate-500 font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="text-blue-400 font-bold whitespace-nowrap">VIEWPORT_X:</span> 1920px
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-blue-400 font-bold whitespace-nowrap">OBJECT_ID:</span> {userData.idNumber}
                </span>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-[9px] font-black uppercase tracking-widest text-slate-300 rounded-lg border border-slate-700 transition-all active:scale-95">
                  Raw Metadata
                </button>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-[9px] font-black uppercase tracking-widest text-white rounded-lg shadow-lg shadow-blue-900/20 transition-all active:scale-95">
                  Push To Mainframe
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Status Bar */}
        <footer className="h-10 border-t border-slate-700/50 bg-[#1E293B] flex items-center justify-between px-8 text-[10px] text-slate-500 shrink-0">
          <div className="flex gap-6">
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              LocalStorage: <strong className="text-slate-300">Enabled</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              Engine Status: <strong className="text-slate-300">Optimal</strong>
            </span>
          </div>
          <div className="font-mono opacity-50 uppercase tracking-widest">
            {new Date().toLocaleTimeString()} || AIS_NODE_0X72
          </div>
        </footer>
      </main>

      {/* Global Component Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
        input[type="range"] {
          background: #1e293b;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          background: #3b82f6;
          cursor: pointer;
          border-radius: 50%;
          border: 2px solid #1e293b;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.4);
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(0.5);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
