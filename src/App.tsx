/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, ReactNode, ChangeEvent } from 'react';
import { 
  Play, 
  Square, 
  Terminal, 
  Settings, 
  Wrench, 
  Info, 
  Network, 
  Shield, 
  Globe, 
  Cpu, 
  Activity,
  ChevronRight,
  Menu,
  MoreVertical,
  ArrowLeft,
  Save,
  User,
  Lock,
  Server,
  ShieldCheck,
  Download,
  Upload,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'sonner';

type Tab = 'HOME' | 'LOG' | 'TOOLS' | 'SETTINGS';

interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'success' | 'warning';
}

interface SshConfig {
  host: string;
  port: string;
  user: string;
  pass: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('HOME');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [uptime, setUptime] = useState(0);
  const [showSshSettings, setShowSshSettings] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  const [sshConfig, setSshConfig] = useState<SshConfig>({
    host: '128.199.201.44',
    port: '443',
    user: 'fes_ethiopia',
    pass: 'fes2026'
  });

  // Mock network data
  const [networkInfo] = useState({
    ip: '197.156.102.45',
    isp: 'Ethio Telecom',
    country: 'Ethiopia',
    city: 'Addis Ababa',
    protocol: 'SSH -> SSL/TLS'
  });

  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => {
        setUptime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setUptime(0);
    }
  }, [isConnected]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour12: false }),
      message,
      type
    };
    setLogs(prev => [...prev, newLog]);
  };

  const handleToggle = async () => {
    if (isConnected) {
      setIsConnected(false);
      addLog('Stopping service...', 'warning');
      addLog('VPN Disconnected', 'error');
      toast.error('FES ETHIOPIA: Disconnected');
    } else {
      setIsConnecting(true);
      setActiveTab('LOG');
      setLogs([]);
      
      addLog('Starting service...', 'info');
      await delay(800);
      addLog('Initializing VPN engine...', 'info');
      await delay(1000);
      addLog(`Connecting to SSH server: ${sshConfig.host}:${sshConfig.port}`, 'info');
      await delay(1200);
      addLog('Handshake successful', 'success');
      await delay(800);
      addLog(`Authenticating user: ${sshConfig.user}`, 'info');
      await delay(1500);
      addLog('SSH connection established', 'success');
      await delay(500);
      addLog('Setting up tunnel...', 'info');
      await delay(1000);
      addLog('Connected successfully!', 'success');
      
      setIsConnecting(false);
      setIsConnected(true);
      toast.success('FES ETHIOPIA: Connected', {
        description: `Server: ${sshConfig.host}`,
        duration: 5000,
      });
    }
  };

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSshChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSshConfig(prev => ({ ...prev, [name]: value }));
  };

  const exportConfig = () => {
    try {
      const configData = {
        version: '1.0',
        ssh: sshConfig,
        protocol: networkInfo.protocol,
        timestamp: new Date().toISOString()
      };
      
      // Convert to Base64 to make it look like a real VPN config file
      const encodedData = btoa(JSON.stringify(configData));
      const blob = new Blob([encodedData], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `FES_ETHIOPIA_${new Date().getTime()}.fes`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Config exported successfully!', {
        description: 'Saved as .FES file'
      });
    } catch (error) {
      toast.error('Failed to export config');
      console.error(error);
    }
  };

  const importConfig = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.fes')) {
      toast.error('Invalid file format', {
        description: 'Please select a .FES file'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const decodedData = JSON.parse(atob(content));
        
        if (decodedData.ssh) {
          setSshConfig(decodedData.ssh);
          toast.success('Config imported successfully!', {
            description: `Host: ${decodedData.ssh.host}`
          });
        } else {
          throw new Error('Invalid config structure');
        }
      } catch (error) {
        toast.error('Failed to import config', {
          description: 'The file might be corrupted'
        });
        console.error(error);
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-[#0F1115] text-[#E0E0E0] font-sans selection:bg-[#F27D26] selection:text-white">
      <Toaster position="top-center" richColors theme="dark" />
      {/* Status Bar Simulation */}
      <div className="h-6 bg-black flex items-center justify-between px-4 text-[10px] font-mono text-gray-500">
        <div className="flex items-center gap-2">
          {isConnected && (
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              className="flex items-center gap-1 text-green-500"
            >
              <ShieldCheck size={10} />
              <span className="font-bold">VPN</span>
            </motion.div>
          )}
          <Activity size={10} />
          <span>CPU: 12%</span>
          <Cpu size={10} className="ml-2" />
          <span>RAM: 245MB</span>
        </div>
        <div className="flex items-center gap-2">
          <span>4G LTE</span>
          <Network size={10} />
          <span>18:31</span>
        </div>
      </div>

      {/* Header */}
      <header className="bg-[#1A1D23] border-b border-[#2A2E37] p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          {showSshSettings ? (
            <button 
              onClick={() => setShowSshSettings(false)}
              className="p-2 hover:bg-[#2A2E37] rounded-lg transition-colors text-[#F27D26]"
            >
              <ArrowLeft size={20} />
            </button>
          ) : (
            <div className="p-2 bg-[#F27D26] rounded-lg shadow-[0_0_15px_rgba(242,125,38,0.3)]">
              <Shield className="text-white" size={20} />
            </div>
          )}
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">
              {showSshSettings ? 'SSH Settings' : 'FES ETHIOPIA'}
            </h1>
            {!showSshSettings && (
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : isConnecting ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">
                  {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-[#2A2E37] rounded-full transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 max-w-md mx-auto h-[calc(100vh-160px)] overflow-y-auto">
        <AnimatePresence mode="wait">
          {showSshSettings ? (
            <motion.div
              key="ssh-settings"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500 ml-1">SSH Host</label>
                  <div className="relative">
                    <Server className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input 
                      type="text" 
                      name="host"
                      value={sshConfig.host}
                      onChange={handleSshChange}
                      className="w-full bg-[#1A1D23] border border-[#2A2E37] rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-[#F27D26] transition-colors"
                      placeholder="e.g. 128.199.201.44"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500 ml-1">SSH Port</label>
                  <div className="relative">
                    <Settings className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input 
                      type="text" 
                      name="port"
                      value={sshConfig.port}
                      onChange={handleSshChange}
                      className="w-full bg-[#1A1D23] border border-[#2A2E37] rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-[#F27D26] transition-colors"
                      placeholder="e.g. 443"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500 ml-1">Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input 
                      type="text" 
                      name="user"
                      value={sshConfig.user}
                      onChange={handleSshChange}
                      className="w-full bg-[#1A1D23] border border-[#2A2E37] rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-[#F27D26] transition-colors"
                      placeholder="SSH Username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500 ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input 
                      type="password" 
                      name="pass"
                      value={sshConfig.pass}
                      onChange={handleSshChange}
                      className="w-full bg-[#1A1D23] border border-[#2A2E37] rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-[#F27D26] transition-colors"
                      placeholder="SSH Password"
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowSshSettings(false)}
                className="w-full bg-[#F27D26] text-white py-4 rounded-xl font-black text-lg tracking-[0.2em] flex items-center justify-center gap-3 shadow-lg hover:bg-[#e06d1f] active:scale-[0.98] transition-all"
              >
                <Save size={20} />
                SAVE SETTINGS
              </button>
            </motion.div>
          ) : (
            <>
              {activeTab === 'HOME' && (
                <motion.div 
                  key="home"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Connection Status Card */}
                  <div className="bg-[#1A1D23] rounded-2xl p-6 border border-[#2A2E37] shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Globe size={80} />
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-widest text-[#F27D26] mb-1">Tunnel Type</p>
                          <h2 className="text-xl font-bold text-white">{networkInfo.protocol}</h2>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-1">Uptime</p>
                          <p className="text-xl font-mono font-bold text-white">{formatUptime(uptime)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-[#0F1115] p-3 rounded-xl border border-[#2A2E37]">
                          <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-1">Local IP</p>
                          <p className="text-sm font-mono text-white truncate">{networkInfo.ip}</p>
                        </div>
                        <div className="bg-[#0F1115] p-3 rounded-xl border border-[#2A2E37]">
                          <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-1">ISP</p>
                          <p className="text-sm font-bold text-white truncate">{networkInfo.isp}</p>
                        </div>
                      </div>

                      <button 
                        onClick={handleToggle}
                        disabled={isConnecting}
                        className={`w-full py-4 rounded-xl font-black text-lg tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-lg ${
                          isConnected 
                            ? 'bg-[#2A2E37] text-red-500 hover:bg-red-500/10 border border-red-500/20' 
                            : 'bg-[#F27D26] text-white hover:bg-[#e06d1f] active:scale-[0.98]'
                        }`}
                      >
                        {isConnecting ? (
                          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : isConnected ? (
                          <>
                            <Square size={20} fill="currentColor" />
                            STOP
                          </>
                        ) : (
                          <>
                            <Play size={20} fill="currentColor" />
                            START
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Quick Settings */}
                  <div className="grid grid-cols-1 gap-3">
                    {/* Config Management */}
                    <div className="bg-[#1A1D23] p-4 rounded-xl border border-[#2A2E37] flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-[#0F1115] rounded-lg text-purple-400">
                            <FileText size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">Config Management</p>
                            <p className="text-[10px] text-gray-500">Import/Export .FES files</p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => document.getElementById('config-import')?.click()}
                          className="flex items-center justify-center gap-2 py-2.5 bg-[#0F1115] border border-[#2A2E37] rounded-lg text-[11px] font-bold hover:border-[#F27D26]/50 transition-all"
                        >
                          <Upload size={14} className="text-[#F27D26]" />
                          IMPORT
                        </button>
                        <input 
                          id="config-import" 
                          type="file" 
                          accept=".fes" 
                          className="hidden" 
                          onChange={importConfig} 
                        />
                        <button 
                          onClick={exportConfig}
                          className="flex items-center justify-center gap-2 py-2.5 bg-[#0F1115] border border-[#2A2E37] rounded-lg text-[11px] font-bold hover:border-[#F27D26]/50 transition-all"
                        >
                          <Download size={14} className="text-[#F27D26]" />
                          EXPORT
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#1A1D23] p-4 rounded-xl border border-[#2A2E37] flex items-center justify-between group cursor-pointer hover:border-[#F27D26]/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#0F1115] rounded-lg text-[#F27D26]">
                          <Terminal size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">Payload Generator</p>
                          <p className="text-[10px] text-gray-500">Custom HTTP headers configuration</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-gray-600 group-hover:text-[#F27D26]" />
                    </div>

                    <div className="bg-[#1A1D23] p-4 rounded-xl border border-[#2A2E37] flex items-center justify-between group cursor-pointer hover:border-[#F27D26]/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#0F1115] rounded-lg text-blue-400">
                          <Globe size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">Server Selection</p>
                          <p className="text-[10px] text-gray-500">Current: SG-DO-Premium-01</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-gray-600 group-hover:text-blue-400" />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'LOG' && (
                <motion.div 
                  key="log"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xs font-black tracking-widest text-[#F27D26] uppercase">Connection Logs</h2>
                    <button 
                      onClick={() => setLogs([])}
                      className="text-[10px] font-bold text-gray-500 hover:text-white transition-colors"
                    >
                      CLEAR LOG
                    </button>
                  </div>
                  <div className="flex-1 bg-black/40 rounded-xl border border-[#2A2E37] p-4 font-mono text-[11px] overflow-y-auto custom-scrollbar">
                    {logs.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-gray-700 italic">
                        Waiting for connection...
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {logs.map(log => (
                          <div key={log.id} className="flex gap-2">
                            <span className="text-gray-600 shrink-0">[{log.timestamp}]</span>
                            <span className={`
                              ${log.type === 'info' ? 'text-blue-400' : ''}
                              ${log.type === 'success' ? 'text-green-400' : ''}
                              ${log.type === 'warning' ? 'text-yellow-400' : ''}
                              ${log.type === 'error' ? 'text-red-400' : ''}
                            `}>
                              {log.message}
                            </span>
                          </div>
                        ))}
                        <div ref={logEndRef} />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'TOOLS' && (
                <motion.div 
                  key="tools"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h2 className="text-xs font-black tracking-widest text-[#F27D26] uppercase mb-4">Network Tools</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: <Activity size={20} />, name: 'Speed Test' },
                      { icon: <Network size={20} />, name: 'IP Hunter' },
                      { icon: <Terminal size={20} />, name: 'Host Checker' },
                      { icon: <Globe size={20} />, name: 'DNS Changer' },
                      { icon: <Shield size={20} />, name: 'Tethering' },
                      { icon: <Wrench size={20} />, name: 'Hardware ID' },
                    ].map((tool, i) => (
                      <div key={i} className="bg-[#1A1D23] p-4 rounded-xl border border-[#2A2E37] flex flex-col items-center justify-center gap-2 hover:border-[#F27D26]/30 transition-all cursor-pointer group">
                        <div className="text-gray-500 group-hover:text-[#F27D26] transition-colors">
                          {tool.icon}
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 group-hover:text-white uppercase tracking-wider">{tool.name}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'SETTINGS' && (
                <motion.div 
                  key="settings"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-1"
                >
                  <h2 className="text-xs font-black tracking-widest text-[#F27D26] uppercase mb-4 px-2">App Settings</h2>
                  {[
                    { icon: <Shield size={18} />, title: 'SSH Settings', desc: 'Manage SSH accounts and ports', action: () => setShowSshSettings(true) },
                    { icon: <Settings size={18} />, title: 'Tunnel Settings', desc: 'Buffer size and timeout config' },
                    { icon: <Globe size={18} />, title: 'Proxy Settings', desc: 'Remote proxy and authentication' },
                    { icon: <Info size={18} />, title: 'About', desc: 'Version 5.9.3 (Build 120)' },
                  ].map((item, i) => (
                    <div 
                      key={i} 
                      onClick={item.action}
                      className="flex items-center gap-4 p-4 hover:bg-[#1A1D23] rounded-xl transition-colors cursor-pointer group"
                    >
                      <div className="text-gray-500 group-hover:text-[#F27D26]">
                        {item.icon}
                      </div>
                      <div className="flex-1 border-b border-[#2A2E37] pb-4 group-last:border-0">
                        <p className="text-sm font-bold text-white">{item.title}</p>
                        <p className="text-[10px] text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#1A1D23] border-t border-[#2A2E37] px-2 pb-6 pt-2 flex justify-around items-center">
        <NavButton 
          active={activeTab === 'HOME' && !showSshSettings} 
          onClick={() => { setActiveTab('HOME'); setShowSshSettings(false); }} 
          icon={<Play size={20} />} 
          label="Home" 
        />
        <NavButton 
          active={activeTab === 'LOG' && !showSshSettings} 
          onClick={() => { setActiveTab('LOG'); setShowSshSettings(false); }} 
          icon={<Terminal size={20} />} 
          label="Log" 
        />
        <NavButton 
          active={activeTab === 'TOOLS' && !showSshSettings} 
          onClick={() => { setActiveTab('TOOLS'); setShowSshSettings(false); }} 
          icon={<Wrench size={20} />} 
          label="Tools" 
        />
        <NavButton 
          active={activeTab === 'SETTINGS' || showSshSettings} 
          onClick={() => { setActiveTab('SETTINGS'); }} 
          icon={<Settings size={20} />} 
          label="Settings" 
        />
      </nav>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2A2E37;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #F27D26;
        }
      `}</style>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all ${active ? 'text-[#F27D26]' : 'text-gray-500 hover:text-gray-300'}`}
    >
      <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'scale-100'}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-widest transition-opacity ${active ? 'opacity-100' : 'opacity-60'}`}>
        {label}
      </span>
      {active && (
        <motion.div 
          layoutId="nav-indicator"
          className="w-1 h-1 bg-[#F27D26] rounded-full mt-0.5"
        />
      )}
    </button>
  );
}
