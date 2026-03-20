import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Terminal as TerminalIcon, 
  LogOut, 
  Settings, 
  Shield, 
  Cpu, 
  Menu, 
  X,
  Activity,
  ChevronRight,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import api from '../api';
import PasswordStrengthMeter from './PasswordStrengthMeter';

const Layout = () => {
    const { logout, user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [isPasswordValid, setIsPasswordValid] = useState(false);

    const navItems = [
        { path: '/', label: 'Fleet Overview', icon: LayoutDashboard },
        { path: '/terminal', label: 'Command Uplink', icon: TerminalIcon },
        { path: '/settings', label: 'Configuration', icon: Settings },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleForcePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordError('');
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('Security keys do not match.');
            return;
        }
        setPasswordLoading(true);
        try {
            await api.post('/auth/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            window.location.reload();
        } catch (err) {
            let errorMsg = 'Key rotation failed.';
            if (err.response?.data) {
                if (Array.isArray(err.response.data)) {
                    errorMsg = err.response.data.map(e => e.description || e).join(' ');
                } else if (typeof err.response.data === 'string') {
                    errorMsg = err.response.data;
                } else if (err.response.data.title || err.response.data.message) {
                    errorMsg = err.response.data.title || err.response.data.message;
                }
            }
            setPasswordError(errorMsg);
        } finally {
            setPasswordLoading(false);
        }
    };

    if (user?.requiresPasswordChange) {
        return (
            <div className="flex h-screen bg-midnight font-display text-slate-300 items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none opacity-20">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500/50 to-transparent"></div>
                </div>
                <div className="absolute top-1/4 -right-20 w-80 h-80 bg-rose-500/10 rounded-full blur-[100px] animate-pulse-slow"></div>

                <div className="premium-card p-10 max-w-md w-full relative z-10 text-center animate-fade-up">
                    <div className="scanline"></div>
                    <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-500 mb-6 animate-pulse">
                        <ShieldAlert size={32} />
                    </div>
                    <h1 className="text-2xl font-black text-rose-500 uppercase tracking-tight mb-2">Security Warning</h1>
                    <p className="text-sm font-mono text-slate-400 mb-8">Default authorization detected. You must select a new Master Key to proceed.</p>
                    
                    {passwordError && (
                        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-500 font-mono text-xs p-3 rounded-lg mb-6 text-left">
                            [SYSTEM_ERROR]: {passwordError}
                        </div>
                    )}

                    <form onSubmit={handleForcePasswordSubmit} className="space-y-4 text-left">
                        <div>
                            <label className="label-cyber">Current Key (Default)</label>
                            <input type="password" value={passwordData.currentPassword} onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})} className="cyber-input" required />
                        </div>
                        <div>
                            <label className="label-cyber">New Key</label>
                            <input type="password" value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} className="cyber-input" required />
                            <PasswordStrengthMeter password={passwordData.newPassword} onValidationChange={setIsPasswordValid} />
                        </div>
                        <div>
                            <label className="label-cyber">Confirm Key</label>
                            <input type="password" value={passwordData.confirmPassword} onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} className="cyber-input" required />
                        </div>
                        <button type="submit" disabled={passwordLoading || !isPasswordValid} className="cyber-button bg-rose-500/10 border border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white w-full flex items-center justify-center gap-2 mt-6 py-3">
                            {passwordLoading ? <Loader2 className="animate-spin" size={16} /> : <span>AUTHORIZE OVERRIDE</span>}
                        </button>
                    </form>
                    
                    <button onClick={handleLogout} className="text-slate-500 hover:text-white mt-6 text-xs font-bold uppercase tracking-widest transition-colors">
                        ABORT & LOGOUT
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-midnight font-display text-slate-300 overflow-hidden relative">
            <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-neon/50 to-transparent"></div>
            </div>

            {/* Sidebar - Desktop */}
            <aside className="hidden lg:flex flex-col w-72 h-full premium-glass border-r border-white/5 relative z-20">
                <div className="p-8 pb-12 flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/')}>
                    <div className="w-12 h-12 rounded-xl bg-emerald-neon/10 flex items-center justify-center p-[1px] border border-emerald-neon/20 group-hover:border-emerald-neon transition-all duration-500">
                        <Cpu className="text-emerald-neon group-hover:scale-110 transition-transform" size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tighter text-white leading-none">SERVER<span className="text-emerald-neon">PILOT</span></h1>
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mt-1 block">Level 1 Authentication</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-4">Operations Hub</p>
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group ${
                                location.pathname === item.path
                                    ? 'bg-emerald-neon/10 text-emerald-neon border-l-4 border-emerald-neon shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                                    : 'hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <item.icon size={20} className={location.pathname === item.path ? 'animate-pulse' : ''} />
                            <span className="font-bold tracking-tight text-sm">{item.label}</span>
                            {location.pathname === item.path && <ChevronRight size={14} className="ml-auto opacity-50" />}
                        </Link>
                    ))}
                </nav>

                <div className="p-6 mt-auto border-t border-white/5 bg-black/20">
                    <div className="flex items-center gap-3 mb-6 px-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyber-blue/40 to-emerald-neon/40 flex items-center justify-center border border-white/10 overflow-hidden shadow-inner">
                            <Shield size={20} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-white truncate break-all">{user?.email}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-neon animate-pulse"></div>
                                <span className="text-[9px] font-mono text-emerald-neon/80 uppercase tracking-widest">Operator Active</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all font-bold text-sm border border-transparent hover:border-rose-500/20"
                    >
                        <LogOut size={16} />
                        <span>TERMINATE SESSION</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <header className="h-16 flex items-center justify-between px-6 lg:px-10 premium-glass border-b border-white/5 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none shrink-0 relative z-30">
                    <div className="lg:hidden flex items-center gap-3">
                        <Cpu className="text-emerald-neon" size={24} />
                        <span className="text-white font-black tracking-tighter uppercase">SP</span>
                    </div>

                    <div className="hidden lg:flex items-center gap-6">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                            <Activity size={14} className="text-emerald-neon animate-pulse" />
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Telemetry Active</span>
                        </div>
                        <div className="h-4 w-[1px] bg-white/10"></div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em]">{new Date().toISOString().split('T')[0]} // SYS_READY</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="lg:hidden p-2 text-white" onClick={() => setIsMobileMenuOpen(true)}>
                            <Menu size={24} />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth custom-scrollbar">
                    <Outlet />
                </div>
            </main>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-midnight/90 backdrop-blur-xl animate-fade-in" onClick={() => setIsMobileMenuOpen(false)}></div>
                    <aside className="absolute right-0 top-0 bottom-0 w-80 bg-midnight border-l border-white/10 p-6 flex flex-col animate-fade-up">
                        <div className="flex justify-between items-center mb-10">
                            <span className="text-xl font-black text-white">MENU</span>
                            <button onClick={() => setIsMobileMenuOpen(false)}><X size={24} /></button>
                        </div>
                        <nav className="space-y-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-4 p-4 rounded-xl border ${
                                        location.pathname === item.path
                                            ? 'bg-emerald-neon/10 border-emerald-neon text-emerald-neon'
                                            : 'border-transparent text-slate-400'
                                    }`}
                                >
                                    <item.icon size={20} />
                                    <span className="font-bold">{item.label}</span>
                                </Link>
                            ))}
                        </nav>
                        <div className="mt-auto pt-6 border-t border-white/10">
                            <button onClick={handleLogout} className="w-full p-4 rounded-xl bg-rose-500/10 text-rose-500 font-bold border border-rose-500/20">LOGOUT</button>
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
};

export default Layout;
