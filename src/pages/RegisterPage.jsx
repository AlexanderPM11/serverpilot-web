import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, Loader2, Cpu, ArrowLeft } from 'lucide-react';
import Modal from '../components/Modal';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';

const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', type: 'error' });
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await register(email, password);
            navigate('/login');
        } catch (err) {
            setModalConfig({ isOpen: true, title: 'Registration Error', message: 'Registration failed. Identity already exists or system error.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden font-display">
            <Modal {...modalConfig} onClose={() => setModalConfig({ ...modalConfig, isOpen: false })} />
            <div className="absolute top-1/4 -right-20 w-80 h-80 bg-cyber-blue/10 rounded-full blur-[100px] animate-pulse-slow"></div>
            <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-emerald-neon/10 rounded-full blur-[100px] animate-pulse-slow"></div>

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-10 animate-fade-up">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/5 p-[1px] mb-6 border border-white/10">
                        <UserPlus className="text-emerald-neon animate-pulse" size={32} />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tighter text-white mb-2 uppercase">Create <span className="text-emerald-neon">Identity</span></h1>
                    <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.3em]">Initialize Security Clearance</p>
                </div>

                <div className="premium-card p-10 relative overflow-hidden group animate-fade-up delay-100">
                    <div className="scanline"></div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <div>
                            <label className="label-cyber">Designated Email</label>
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

                        <div>
                            <label className="label-cyber">Master Security Key</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input autoCapitalize="none" autoCorrect="off" spellCheck="false"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="cyber-input pl-12"
                                    placeholder="Min. 8 chars, uppercase, number, symbol"
                                    required
                                />
                                <PasswordStrengthMeter password={password} onValidationChange={setIsPasswordValid} />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !isPasswordValid}
                            className="cyber-button-primary w-full flex items-center justify-center gap-3 py-4"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "AUTHORIZE NEW USER"}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center relative z-10">
                        <Link to="/login" className="text-slate-500 hover:text-white transition-all flex items-center justify-center gap-2 text-sm font-bold">
                            <ArrowLeft size={16} /> Return to Identification
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;

