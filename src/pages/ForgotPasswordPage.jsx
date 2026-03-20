import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import Modal from '../components/Modal';
import { Mail, Loader2, ArrowLeft, ShieldAlert } from 'lucide-react';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', type: 'error' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            setSuccess(true);
        } catch (err) {
            setModalConfig({ isOpen: true, title: 'Protocol Failure', message: err.response?.data || 'Failed to initialize recovery protocol.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden font-display">
            <Modal {...modalConfig} onClose={() => setModalConfig({ ...modalConfig, isOpen: false })} />
            <div className="absolute top-1/4 -right-20 w-80 h-80 bg-rose-500/10 rounded-full blur-[100px] animate-pulse-slow"></div>
            
            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-10 animate-fade-up">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/5 p-[1px] mb-6 border border-white/10">
                        <ShieldAlert className="text-rose-500 animate-pulse" size={32} />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tighter text-white mb-2 uppercase">Emergency <span className="text-rose-500">Recovery</span></h1>
                    <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.3em]">Initialize Telegram Override Protocol</p>
                </div>

                <div className="premium-card p-10 relative overflow-hidden group animate-fade-up delay-100">
                    <div className="scanline"></div>
                    
                    {success ? (
                        <div className="text-center relative z-10 space-y-6">
                            <div className="w-16 h-16 rounded-full bg-emerald-neon/10 border border-emerald-neon/30 flex items-center justify-center mx-auto text-emerald-neon animate-pulse">
                                <Mail size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Protocol Deployed</h3>
                                <p className="text-sm text-slate-500">If the identity exists and Telegram is configured, a recovery transmission has been dispatched to your secure chat.</p>
                            </div>
                            <Link to="/login" className="cyber-button bg-white/5 border border-white/10 text-white w-full block hover:bg-white/10 mt-8">RETURN TO LOGIN</Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                            <div>
                                <label className="label-cyber">Registered Identity</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input autoCapitalize="none" autoCorrect="off" spellCheck="false"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="cyber-input pl-12"
                                        placeholder="name@domain.com"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="cyber-button bg-rose-500/10 border border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white w-full flex items-center justify-center gap-3 py-4 transition-all"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : "DISPATCH RECOVERY LINK"}
                            </button>
                        </form>
                    )}

                    <div className="mt-8 pt-6 border-t border-white/5 text-center relative z-10">
                        <Link to="/login" className="text-slate-500 hover:text-white transition-all flex items-center justify-center gap-2 text-sm font-bold">
                            <ArrowLeft size={16} /> Abort Recovery
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;

