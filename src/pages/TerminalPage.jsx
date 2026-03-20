import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import api from '../api';
import 'xterm/css/xterm.css';
import { 
  Terminal as TerminalIcon, 
  AlertCircle, 
  Loader2, 
  ChevronLeft, 
  Activity, 
  Zap,
  Maximize2
} from 'lucide-react';

const TerminalPage = () => {
    const { serverId } = useParams();
    const navigate = useNavigate();
    const terminalRef = useRef(null);
    const xtermRef = useRef(null);
    const fitAddonRef = useRef(null);
    const wsRef = useRef(null);
    const [status, setStatus] = useState('initializing');
    const [error, setError] = useState(null);
    const [serverName, setServerName] = useState('UNNAMED NODE');

    useEffect(() => {
        if (!serverId) {
            setStatus('standby');
            return;
        }

        const initTerminal = async () => {
            try {
                // 1. Fetch server info
                const serverRes = await api.get('/servers');
                const server = serverRes.data.find(s => s.id === serverId);
                if (!server) throw new Error('Server not found in fleet registry');
                setServerName(server.name);

                // 2. Initialize xterm.js
                const term = new XTerm({
                    cursorBlink: true,
                    cursorStyle: 'block',
                    theme: {
                        background: '#020617',
                        foreground: '#10b981',
                        cursor: '#10b981',
                        selectionBackground: 'rgba(16, 185, 129, 0.3)',
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
                    scrollback: 5000,
                });

                xtermRef.current = term;
                fitAddonRef.current = new FitAddon();
                term.loadAddon(fitAddonRef.current);
                term.open(terminalRef.current);
                fitAddonRef.current.fit();
                term.focus();
                term.write('\x1b[32m[SERVERPILOT] Establishing SSH uplink...\x1b[0m\r\n');

                setStatus('connecting');

                // 3. Open raw WebSocket to the dedicated WS controller
                // Pass credentials as query params (connection is secure via JWT in header)
                const token = localStorage.getItem('token');
                const password = server.password ?? '';
                // Convert the API HTTP URL to a WebSocket URL (http→ws, https→wss)
                const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
                const wsUrl = apiUrl
                    .replace(/^https:/, 'wss:')
                    .replace(/^http:/, 'ws:')
                    + `/api/terminalwebsocket/connect/${serverId}?host=${encodeURIComponent(server.host)}&port=${server.port}&username=${encodeURIComponent(server.username)}&password=${encodeURIComponent(password)}&token=${encodeURIComponent(token)}`;

                const ws = new WebSocket(wsUrl);
                wsRef.current = ws;

                ws.onopen = () => {
                    setStatus('connected');
                    term.write('\r\x1b[32m[SERVERPILOT] Uplink established.\x1b[0m\r\n');
                };

                ws.onmessage = (event) => {
                    term.write(event.data);
                };

                ws.onerror = () => {
                    setStatus('error');
                    setError('WebSocket connection failed');
                };

                ws.onclose = (event) => {
                    if (event.code !== 1000) {
                        term.write(`\r\n\x1b[31m[CONNECTION CLOSED: code=${event.code}]\x1b[0m\r\n`);
                        setStatus('error');
                        setError(`Connection closed unexpectedly (code ${event.code})`);
                    } else {
                        term.write('\r\n\x1b[33m[SESSION TERMINATED]\x1b[0m\r\n');
                        setStatus('standby');
                    }
                };

                // 4. Wire xterm.js keyboard input → WebSocket
                term.onData((data) => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(data);
                    }
                });

                // 5. Handle resize
                const onResize = () => fitAddonRef.current?.fit();
                window.addEventListener('resize', onResize);

                return () => {
                    window.removeEventListener('resize', onResize);
                };

            } catch (err) {
                console.error(err);
                setStatus('error');
                setError(err.response?.data || err.message || 'Failed to establish encrypted uplink');
            }
        };

        const timer = setTimeout(initTerminal, 300);

        return () => {
            clearTimeout(timer);
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.close(1000, 'Component unmounted');
            }
            xtermRef.current?.dispose();
        };
    }, [serverId]);

    const showOverlay = status !== 'connected' && status !== 'connecting';

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col animate-fade-up relative">

            {/* Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/')} 
                        className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors group"
                    >
                        <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                        <span className="text-xs font-bold uppercase tracking-widest">Exit Shell</span>
                    </button>
                    <div className="w-px h-6 bg-white/10" />
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-4 bg-emerald-neon rounded-full" />
                            <h2 className="font-black text-2xl tracking-tighter text-white uppercase">{serverName}</h2>
                        </div>
                        <div className="flex items-center gap-4 mt-1 ml-3">
                            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest leading-none">TTY: /dev/pts/1</span>
                            <span className="text-slate-700">|</span>
                            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest leading-none">SSH-RSA-256</span>
                        </div>
                    </div>
                </div>

                {/* Status Badge */}
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-widest transition-all ${
                    status === 'connected' ? 'bg-emerald-neon/10 border-emerald-neon/30 text-emerald-neon' :
                    status === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
                    status === 'standby' ? 'bg-cyber-blue/10 border-cyber-blue/30 text-cyber-blue' :
                    'bg-amber-500/10 border-amber-500/30 text-amber-400'
                }`}>
                    <Zap size={12} className={status === 'connected' ? 'animate-pulse' : ''} />
                    <span>{status}</span>
                </div>
            </div>

            {/* Terminal Container */}
            <div className="flex-1 premium-card overflow-hidden relative group min-h-0">

                {/* Status Overlay — only shown when not connected */}
                {showOverlay && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-midnight/90 backdrop-blur-sm">
                        {status === 'standby' ? (
                            <div className="animate-fade-up text-center">
                                <div className="w-20 h-20 rounded-full bg-cyber-blue/10 border border-cyber-blue/20 flex items-center justify-center mb-6 mx-auto">
                                    <TerminalIcon size={40} className="text-cyber-blue" />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tighter">Terminal Standby</h3>
                                <p className="text-slate-500 font-mono text-sm max-w-sm mx-auto mb-8">
                                    No node targeted. Return to Fleet Overview to select a server.
                                </p>
                                <button onClick={() => navigate('/')} className="cyber-button-primary px-8 py-3 flex items-center justify-center gap-3 mx-auto">
                                    <Activity size={16} />
                                    <span>VIEW FLEET REGISTRY</span>
                                </button>
                            </div>
                        ) : status === 'error' ? (
                            <div className="animate-fade-up text-center">
                                <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-6 mx-auto">
                                    <AlertCircle size={40} className="text-rose-500" />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tighter">Uplink Interrupted</h3>
                                <div className="bg-rose-500/5 border border-rose-500/10 p-4 rounded-xl mb-8 font-mono text-xs text-rose-500/80 max-w-sm">
                                    [SYSTEM_ERROR]: {error}
                                </div>
                                <button onClick={() => window.location.reload()} className="cyber-button bg-white/5 border border-white/10 text-white hover:bg-white/10 px-8 flex items-center gap-3 mx-auto">
                                    <Activity size={16} />
                                    <span>RETRY SYNCHRONIZATION</span>
                                </button>
                            </div>
                        ) : null}
                    </div>
                )}

                {/* xterm.js mounts here — always rendered so the DOM node is ready */}
                <div className="h-full w-full p-4 relative">
                    <div ref={terminalRef} className="h-full w-full custom-xterm-container" />
                </div>

                {/* Decorative edge glow */}
                <div className="absolute inset-0 pointer-events-none border border-emerald-neon/10 group-hover:border-emerald-neon/20 transition-colors duration-700" />
            </div>

            {/* Footer status bar */}
            <div className="flex items-center justify-between mt-2 px-2">
                <span className="text-[9px] font-mono text-emerald-neon/40 uppercase tracking-widest">UTF-8 // XTERM-256COLOR</span>
                <button onClick={() => fitAddonRef.current?.fit()} className="text-slate-600 hover:text-white transition-colors">
                    <Maximize2 size={12} />
                </button>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-xterm-container .xterm-viewport::-webkit-scrollbar { width: 4px; }
                .custom-xterm-container .xterm-viewport::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.2); }
                .xterm-cursor-block { mix-blend-mode: screen; }
            `}} />
        </div>
    );
};

export default TerminalPage;
