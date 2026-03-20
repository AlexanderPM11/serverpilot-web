import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import { Key, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    
    const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('Security keys do not match.');
            return;
        }

        if (!token || !email) {
            setError('Missing cryptographic token or identity parameters.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/reset-password', {
                email: email,
                token: token,
                newPassword: passwordData.newPassword
            });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            let errorMsg = 'Recovery token invalid or expired.';
            if (err.response?.data) {
                if (Array.isArray(err.response.data)) {
                    errorMsg = err.response.data.map(e => e.description || e).join(' ');
                } else if (typeof err.response.data === 'string') {
                    errorMsg = err.response.data;
                } else if (err.response.data.title || err.response.data.message) {
                    errorMsg = err.response.data.title || err.response.data.message;
                }
            }
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (!token || !email) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-midnight text-white font-display">
                <div className="premium-card p-10 text-center text-rose-500 max-w-md w-full">
                    <AlertCircle size={48} className="mx-auto mb-4" />
                    <h2 className="text-xl font-black uppercase mb-2">Invalid Access Parameter</h2>
                    <p className="text-sm text-rose-500/80 font-mono">Missing cryptographic token or email. Request a new link.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden font-display">
            <div className="absolute top-1/4 -right-20 w-80 h-80 bg-emerald-neon/10 rounded-full blur-[100px] animate-pulse-slow"></div>
            
            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-10 animate-fade-up">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/5 p-[1px] mb-6 border border-white/10">
                        <Key className="text-emerald-neon animate-pulse" size={32} />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tighter text-white mb-2 uppercase">Set New <span className="text-emerald-neon">Key</span></h1>
                    <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.3em]">Identity: {email}</p>
                </div>

                <div className="premium-card p-10 relative overflow-hidden group animate-fade-up delay-100">
                    <div className="scanline"></div>
                    
                    {error && (
                        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-500 font-mono text-xs p-3 rounded-lg mb-6 flex items-start gap-2 relative z-10">
                            <AlertCircle size={14} className="shrink-0 mt-0.5" />
                            <span>[SYSTEM_ERROR]: {error}</span>
                        </div>
                    )}

                    {success ? (
                        <div className="text-center relative z-10 space-y-6">
                            <div className="w-16 h-16 rounded-full bg-emerald-neon/10 border border-emerald-neon/30 flex items-center justify-center mx-auto text-emerald-neon">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Access Restored</h3>
                                <p className="text-sm text-slate-500">Your Master Key has been rotated. Redirecting to identification portal...</p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                            <div>
                                <label className="label-cyber">New Master Key</label>
                                <input autoCapitalize="none" autoCorrect="off" spellCheck="false"
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                    className="cyber-input"
                                    placeholder="••••••••"
                                    required
                                />
                                <PasswordStrengthMeter password={passwordData.newPassword} onValidationChange={setIsPasswordValid} />
                            </div>

                            <div>
                                <label className="label-cyber">Confirm Master Key</label>
                                <input autoCapitalize="none" autoCorrect="off" spellCheck="false"
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                    className="cyber-input"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !isPasswordValid}
                                className="cyber-button-primary w-full flex items-center justify-center gap-3 py-4"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : "AUTHORIZE NEW KEY"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;

