import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import * as signalR from '@microsoft/signalr';
import api from '../api';
import 'xterm/css/xterm.css';
import { 
  Terminal as TerminalIcon, 
  AlertCircle, 
  Loader2, 
  ChevronLeft, 
  Activity, 
  Shield, 
  Cpu, 
  Zap,
  Maximize2
} from 'lucide-react';

const TerminalPage = () => {
    const { serverId } = useParams();
    const navigate = useNavigate();
    const terminalRef = useRef(null);
    const xtermRef = useRef(null);
    const fitAddonRef = useRef(null);
    const hubRef = useRef(null);
    const [status, setStatus] = useState('initializing'); // initializing, connecting, connected, error
    const [error, setError] = useState(null);
    const [serverName, setServerName] = useState('UNNAMED NODE');

    useEffect(() => {
        if (!serverId) {
            setStatus('standby');
            return;
        }

        const initTerminal = async () => {
            try {
                // 1. Fetch server credentials
                const serverRes = await api.get(`/servers`);
                const server = serverRes.data.find(s => s.id === serverId);
                if (!server) throw new Error('Server not found in fleet registry');
                setServerName(server.name);

                // 2. Initialize xterm
                xtermRef.current = new XTerm({
                    cursorBlink: true,
                    cursorStyle: 'block',
                    theme: {
                        background: '#020617',
                        foreground: '#10b981',
                        cursor: '#10b981',
                        selection: 'rgba(16, 185, 129, 0.3)',
                        black: '#020617',
                        red: '#f43f5e',
                        green: '#10b981',
                        yellow: '#f59e0b',
                        blue: '#3b82f6',
                        magenta: '#a855f7',
                        cyan: '#34d399',
                        white: '#f8fafc',
                    },
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 14,
                    allowTransparency: true,
                    lineHeight: 1.1,
                });

                fitAddonRef.current = new FitAddon();
                xtermRef.current.loadAddon(fitAddonRef.current);
                xtermRef.current.open(terminalRef.current);
                fitAddonRef.current.fit();

                // 3. Connect to Hub
                const connection = new signalR.HubConnectionBuilder()
                    .withUrl('/ws/terminal', {
                        accessTokenFactory: () => localStorage.getItem('token')
                    })
                    .withAutomaticReconnect()
                    .build();

                hubRef.current = connection;

                connection.on('TerminalData', (data) => {
                    xtermRef.current.write(data);
                });

                await connection.start();
                setStatus('connecting');

                // 4. Connect SSH via API
                await api.post('/ssh/connect', {
                    connectionId: connection.connectionId,
                    host: server.host,
                    port: server.port,
                    username: server.username,
                    password: server.password,
                    privateKey: server.privateKey,
                    authMethod: server.authMethod
                });

                // 5. Start Terminal Session in Hub
                await connection.invoke('StartTerminal');
                
                setStatus('connected');

                xtermRef.current.onData((data) => {
                    connection.invoke('SendCommand', data);
                });

                window.addEventListener('resize', () => fitAddonRef.current?.fit());

            } catch (err) {
                console.error(err);
                setStatus('error');
                setError(err.message || 'Failed to establish encrypted uplink');
            }
        };

        const timer = setTimeout(initTerminal, 300); // Slight delay for entrance animation

        return () => {
            clearTimeout(timer);
            hubRef.current?.stop();
            xtermRef.current?.dispose();
            window.removeEventListener('resize', () => fitAddonRef.current?.fit());
        };
    }, [serverId]);

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col animate-fade-up relative">
            {/* Header / Toolbar */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => navigate('/')} 
                        className="group flex items-center gap-2 p-2 hover:bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all border border-transparent hover:border-white/10"
                    >
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Exit Shell</span>
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-1.5 h-8 bg-cyber-blue rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                        <div>
                            <h2 className="font-black text-2xl tracking-tighter text-white uppercase">{serverName}</h2>
                            <div className="flex items-center gap-3 mt-1">
                                <div className="flex items-center gap-1.5">
                                    <Activity size={10} className="text-emerald-neon animate-pulse" />
                                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest leading-none">TTY: /dev/pts/1</span>
                                </div>
                                <div className="w-[1px] h-2 bg-white/10"></div>
                                <div className="flex items-center gap-1.5">
                                    <Shield size={10} className="text-cyber-blue" />
                                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest leading-none">SSH-RSA-256</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all duration-500 ${
                        status === 'connected' ? 'bg-emerald-neon/5 border-emerald-neon/30 text-emerald-neon shadow-[0_0_20px_rgba(16,185,129,0.1)]' :
                        status === 'error' ? 'bg-rose-500/5 border-rose-500/30 text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.1)]' :
                        status === 'standby' ? 'bg-cyber-blue/5 border-cyber-blue/30 text-cyber-blue shadow-[0_0_20px_rgba(59,130,246,0.1)]' :
                        'bg-amber-500/5 border-amber-500/30 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.1)]'
                    }`}>
                        <Zap size={14} className={status === 'connected' ? 'animate-pulse' : ''} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{status}</span>
                    </div>
                </div>
            </div>

            {/* Terminal Container */}
            <div className="flex-1 premium-card bg-midnight border-white/10 overflow-hidden relative group">
                {/* Visual Overlays */}
                <div className="absolute inset-0 pointer-events-none z-30">
                    <div className="scanline"></div>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-neon/20 to-transparent"></div>
                    <div className="absolute bottom-4 right-6 flex items-center gap-4">
                         <div className="text-[9px] font-mono text-emerald-neon/40 uppercase tracking-widest">UTF-8 // XTERM-256COLOR</div>
                         <Maximize2 size={12} className="text-emerald-neon/40 hover:text-emerald-neon cursor-pointer pointer-events-auto" />
                    </div>
                </div>

                {/* Status Overlays */}
                {status !== 'connected' && (
                    <div className="absolute inset-0 z-40 bg-midnight/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                        {status === 'standby' ? (
                            <div className="animate-fade-up">
                                <div className="w-20 h-20 rounded-full bg-cyber-blue/10 border border-cyber-blue/20 flex items-center justify-center mb-6 mx-auto">
                                    <TerminalIcon size={40} className="text-cyber-blue" />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tighter">Terminal Standby</h3>
                                <p className="text-slate-500 font-mono text-sm max-w-sm mx-auto mb-8">
                                    No node targeted for uplink. Please return to the Fleet Overview and select a server to establish an encrypted shell session.
                                </p>
                                <button 
                                    onClick={() => navigate('/')} 
                                    className="cyber-button-primary px-8 py-3 flex items-center justify-center gap-3 mx-auto"
                                >
                                    <Activity size={16} />
                                    <span>VIEW FLEET REGISTRY</span>
                                </button>
                            </div>
                        ) : status === 'error' ? (
                            <div className="animate-fade-up">
                                <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-6 mx-auto">
                                    <AlertCircle size={40} className="text-rose-500" />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tighter">Uplink Interrupted</h3>
                                <div className="bg-rose-500/5 border border-rose-500/10 p-4 rounded-xl mb-8 font-mono text-xs text-rose-500/80 max-w-sm">
                                    [SYSTEM_ERROR]: {error}
                                </div>
                                <button 
                                    onClick={() => window.location.reload()} 
                                    className="cyber-button bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 px-8 flex items-center gap-3 mx-auto"
                                >
                                    <Activity size={16} />
                                    <span>RETRY SYNCHRONIZATION</span>
                                </button>
                            </div>
                        ) : (
                            <div className="animate-fade-up flex flex-col items-center">
                                <div className="relative mb-10">
                                    <div className="absolute inset-[-15px] bg-emerald-neon/10 rounded-full blur-2xl animate-pulse"></div>
                                    <div className="w-24 h-24 rounded-2xl bg-midnight border border-emerald-neon/30 flex items-center justify-center relative z-10 overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                                        <Loader2 size={48} className="text-emerald-neon animate-spin" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-neon/5 to-transparent"></div>
                                    </div>
                                </div>
                                <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter italic">Establishing Pulse</h3>
                                <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.4em] animate-pulse">Synchronizing Cryptographic Handshake</p>
                                
                                <div className="mt-12 grid grid-cols-4 gap-2 w-48">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className={`h-1 rounded-full ${status === 'connecting' ? 'bg-emerald-neon/40 animate-pulse' : 'bg-white/5'}`} style={{animationDelay: `${i * 0.15}s`}}></div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* The Terminal Screen */}
                <div className="h-full w-full p-6 relative">
                    <div ref={terminalRef} className="h-full w-full custom-xterm-container" />
                </div>

                {/* Edge Glow */}
                <div className="absolute inset-0 pointer-events-none border border-emerald-neon/10 group-hover:border-emerald-neon/20 transition-colors duration-700"></div>
            </div>

            {/* Terminal Styling Addon */}
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-xterm-container .xterm-viewport::-webkit-scrollbar { width: 4px; }
                .custom-xterm-container .xterm-viewport::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.2); }
                .custom-xterm-container .xterm-viewport::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.4); }
                .xterm-cursor-block { mix-blend-mode: screen; }
                .xterm-char-measure-element { display: none; }
            `}} />
        </div>
    );
};

export default TerminalPage;
