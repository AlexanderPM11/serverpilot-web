import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Modal from '../components/Modal';
import { 
  Server, 
  Plus, 
  Trash2, 
  Terminal as TerminalIcon, 
  Activity, 
  Cpu, 
  Search, 
  AlertCircle,
  Loader2,
  Globe,
  Settings,
  MoreVertical,
  ChevronRight,
  ShieldCheck,
  X,
  Edit2
} from 'lucide-react';

const Dashboard = () => {
    const [servers, setServers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', type: 'error' });
    const [newServer, setNewServer] = useState({
        name: '', host: '', port: 22, username: '', password: '', authMethod: 0
    });
    const [editingServerId, setEditingServerId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchServers();
    }, []);

    const fetchServers = async () => {
        try {
            const res = await api.get('/servers');
            setServers(res.data);
        } catch (err) {
            console.error('Failed to sync with fleet registry.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddServer = async (e) => {
        e.preventDefault();
        try {
            if (editingServerId) {
                await api.put(`/servers/${editingServerId}`, newServer);
                setModalConfig({ isOpen: true, title: 'Node Edited', message: 'Node configuration updated successfully.', type: 'info' });
            } else {
                await api.post('/servers', newServer);
            }
            setIsModalOpen(false);
            fetchServers();
            setNewServer({ name: '', host: '', port: 22, username: '', password: '', authMethod: 0 });
            setEditingServerId(null);
        } catch (err) {
            setModalConfig({ isOpen: true, title: 'System Error', message: editingServerId ? 'Failed to update node.' : 'Failed to register new node.', type: 'error' });
        }
    };

    const handleEditClick = (server) => {
        setNewServer({ ...server });
        setEditingServerId(server.id);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Confirm permanent decommissioning of this node?')) {
            try {
                await api.delete(`/servers/${id}`);
                fetchServers();
            } catch (err) {
                setModalConfig({ isOpen: true, title: 'Network Failure', message: 'Failed to decommission the node.', type: 'error' });
            }
        }
    };

    return (
        <div className="space-y-10 animate-fade-in relative">
            <Modal {...modalConfig} onClose={() => setModalConfig({ ...modalConfig, isOpen: false })} />
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-1.5 h-6 bg-emerald-neon rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Fleet Registry</h2>
                    </div>
                    <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.3em]">Monitoring {servers.length} active edge nodes // Global Access</p>
                </div>
                
                <button 
                    onClick={() => { setNewServer({ name: '', host: '', port: 22, username: '', password: '', authMethod: 0 }); setEditingServerId(null); setIsModalOpen(true); }}
                    className="cyber-button-primary flex items-center gap-3 px-8 group self-start lg:self-auto"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                    <span>REGISTER NEW NODE</span>
                </button>
            </header>

            {loading ? (
                <div className="h-64 flex flex-col items-center justify-center gap-4 premium-card">
                    <Loader2 className="animate-spin text-emerald-neon" size={40} />
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Synchronizing Encrypted Registry...</span>
                </div>
            ) : servers.length === 0 ? (
                <div className="premium-card p-16 flex flex-col items-center justify-center text-center group border-dashed border-white/10 hover:border-emerald-neon/30 transition-colors">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Server size={40} className="text-slate-700" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Registry Empty</h3>
                    <p className="text-slate-500 max-w-sm font-display text-sm">No Linux servers have been authorized in this account. Start by adding your first mission-critical node.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {servers.map((server, idx) => (
                        <div key={server.id} className="premium-card group hover:-translate-y-1 overflow-hidden" style={{ animationDelay: `${idx * 0.1}s` }}>
                            <div className="p-1 h-1 bg-gradient-to-r from-emerald-neon/50 to-cyber-blue/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-emerald-neon border border-white/5 group-hover:bg-emerald-neon/10 group-hover:border-emerald-neon/20 transition-all">
                                        <Server size={24} />
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => handleDelete(server.id)} className="p-2 text-slate-600 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-500/5">
                                            <Trash2 size={16} />
                                        </button>
                                        <button onClick={() => handleEditClick(server)} className="p-2 text-slate-600 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                                            <Edit2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1 mb-6">
                                    <h3 className="text-lg font-black text-white tracking-tight truncate">{server.name}</h3>
                                    <div className="flex items-center gap-2 font-mono text-[10px] text-slate-500 uppercase tracking-widest">
                                        <Globe size={10} />
                                        <span>{server.host}:{server.port}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="bg-black/20 rounded-lg p-3 border border-white/5 relative overflow-hidden group/item">
                                        <div className="text-[9px] font-mono text-slate-600 uppercase mb-1">Identity</div>
                                        <div className="text-xs font-bold text-slate-300 truncate">{server.username}</div>
                                        <ShieldCheck size={32} className="absolute -right-2 -bottom-2 opacity-[0.03] group-hover/item:text-emerald-neon group-hover/item:opacity-10 transition-all" />
                                    </div>
                                    <div className="bg-black/20 rounded-lg p-3 border border-white/5 relative overflow-hidden group/item">
                                        <div className="text-[9px] font-mono text-slate-600 uppercase mb-1">Method</div>
                                        <div className="text-xs font-bold text-slate-300 uppercase">{server.authMethod === 0 ? 'Password' : 'SSH Key'}</div>
                                        <Settings size={32} className="absolute -right-2 -bottom-2 opacity-[0.03] group-hover/item:text-cyber-blue group-hover/item:opacity-10 transition-all" />
                                    </div>
                                </div>

                                <button 
                                    onClick={() => navigate(`/terminal/${server.id}`)}
                                    className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white/5 text-emerald-neon border border-emerald-neon/20 hover:bg-emerald-neon hover:text-midnight hover:border-emerald-neon font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0)] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                                >
                                    <TerminalIcon size={16} />
                                    <span>Establish Uplink</span>
                                    <ChevronRight size={14} className="ml-1 opacity-50" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Premium Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-midnight/80 backdrop-blur-xl animate-fade-in" onClick={() => { setIsModalOpen(false); setEditingServerId(null); }}></div>
                    <div className="w-full max-w-xl premium-card overflow-hidden animate-fade-up relative z-10 border-white/10">
                        <div className="bg-gradient-to-r from-emerald-neon/20 via-cyber-blue/20 to-transparent p-6 border-b border-white/10 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Plus className="text-emerald-neon" />
                                <h3 className="text-xl font-extrabold text-white tracking-tighter uppercase">{editingServerId ? 'Update Mission Node' : 'Register Mission-Critical Node'}</h3>
                            </div>
                            <button onClick={() => { setIsModalOpen(false); setEditingServerId(null); }} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleAddServer} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="label-cyber">Node Designation</label>
                                    <input autoCapitalize="none" autoCorrect="off" spellCheck="false"
                                        type="text"
                                        placeholder="Production Core-01"
                                        className="cyber-input"
                                        value={newServer.name}
                                        onChange={(e) => setNewServer({...newServer, name: e.target.value})}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="label-cyber">IPv4 / FQDN</label>
                                    <input autoCapitalize="none" autoCorrect="off" spellCheck="false"
                                        type="text"
                                        placeholder="192.168.1.100"
                                        className="cyber-input"
                                        value={newServer.host}
                                        onChange={(e) => setNewServer({...newServer, host: e.target.value})}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="label-cyber">Uplink Port</label>
                                    <input autoCapitalize="none" autoCorrect="off" spellCheck="false"
                                        type="number"
                                        className="cyber-input"
                                        value={newServer.port}
                                        onChange={(e) => setNewServer({...newServer, port: parseInt(e.target.value)})}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="label-cyber">SSH Username</label>
                                    <input autoCapitalize="none" autoCorrect="off" spellCheck="false"
                                        type="text"
                                        placeholder="root"
                                        className="cyber-input"
                                        value={newServer.username}
                                        onChange={(e) => setNewServer({...newServer, username: e.target.value})}
                                        autoCapitalize="none"
                                        autoCorrect="off"
                                        spellCheck="false"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="label-cyber">Auth Protocol</label>
                                    <select
                                        className="cyber-input appearance-none bg-midnight"
                                        value={newServer.authMethod}
                                        onChange={(e) => setNewServer({...newServer, authMethod: parseInt(e.target.value)})}
                                    >
                                        <option value={0}>Keyphrase</option>
                                        <option value={1}>RSA/ED25519</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="label-cyber">SSH Password / Key Passphrase</label>
                                    <input autoCapitalize="none" autoCorrect="off" spellCheck="false"
                                        type="password"
                                        placeholder="••••••••"
                                        className="cyber-input"
                                        value={newServer.password}
                                        onChange={(e) => setNewServer({...newServer, password: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-6">
                                <button type="submit" className="cyber-button-primary w-full py-4 text-sm tracking-[0.2em]">
                                    {editingServerId ? 'COMMIT CONFIGURATION CHANGES' : 'INITIALIZE NODE REGISTRATION'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;

