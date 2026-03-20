import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import { Shield, Key, MessageSquare, Loader2, Save, Send } from 'lucide-react';

const SettingsPage = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [savingTelegram, setSavingTelegram] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    const [telegramConfig, setTelegramConfig] = useState({ botToken: '', chatId: '' });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isPasswordValid, setIsPasswordValid] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/auth/profile');
            setTelegramConfig({
                botToken: res.data.telegramBotToken || '',
                chatId: res.data.telegramChatId || ''
            });
        } catch (err) {
            showMessage('error', 'Failed to load profile parameters.');
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    const handleTelegramSubmit = async (e) => {
        e.preventDefault();
        setSavingTelegram(true);
        try {
            await api.put('/auth/profile/telegram', telegramConfig);
            showMessage('success', 'Telegram recovery channel activated.');
        } catch (err) {
            showMessage('error', 'Failed to update protocol endpoints.');
        } finally {
            setSavingTelegram(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showMessage('error', 'Security keys do not match.');
            return;
        }

        setSavingPassword(true);
        try {
            await api.post('/auth/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            showMessage('success', 'Master security key rotated successfully.');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
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
            showMessage('error', errorMsg);
        } finally {
            setSavingPassword(false);
        }
    };

    return (
        <div className="space-y-10 animate-fade-in relative max-w-4xl mx-auto">
            <header className="mb-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-1.5 h-6 bg-cyber-blue rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Operator Settings</h2>
                </div>
                <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.3em]">Identity: {user?.email} // Access Level 1</p>
            </header>

            {message.text && (
                <div className={`p-4 rounded-xl font-mono text-sm border flex items-center gap-3 animate-fade-up ${
                    message.type === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' : 'bg-emerald-neon/10 border-emerald-neon/30 text-emerald-neon'
                }`}>
                    <Shield size={16} /> [SYSTEM_NOTICE]: {message.text}
                </div>
            )}

            {loading ? (
                <div className="h-64 flex flex-col items-center justify-center gap-4 premium-card">
                    <Loader2 className="animate-spin text-cyber-blue" size={40} />
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Decrypting Profile Data...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Telegram Config Panel */}
                    <div className="premium-card p-8 group overflow-hidden relative">
                        <div className="scanline"></div>
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <MessageSquare size={100} />
                        </div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-cyber-blue/10 rounded-lg border border-cyber-blue/20 text-cyber-blue">
                                    <Send size={20} />
                                </div>
                                <h3 className="text-xl font-bold text-white uppercase tracking-tight">Telegram Recovery</h3>
                            </div>
                            <p className="text-sm text-slate-500 font-display mb-8">
                                Configure your Telegram Bot to receive emergency recovery links if you lose access to your Master Key.
                            </p>

                            <form onSubmit={handleTelegramSubmit} className="space-y-6">
                                <div>
                                    <label className="label-cyber">Bot Token</label>
                                    <input autoCapitalize="none" autoCorrect="off" spellCheck="false"
                                        type="password"
                                        value={telegramConfig.botToken}
                                        onChange={(e) => setTelegramConfig({...telegramConfig, botToken: e.target.value})}
                                        className="cyber-input"
                                        placeholder="123456789:ABCdefGHIjklMNO..."
                                    />
                                </div>
                                <div>
                                    <label className="label-cyber">Chat ID</label>
                                    <input autoCapitalize="none" autoCorrect="off" spellCheck="false"
                                        type="text"
                                        value={telegramConfig.chatId}
                                        onChange={(e) => setTelegramConfig({...telegramConfig, chatId: e.target.value})}
                                        className="cyber-input"
                                        placeholder="Your personal Chat ID"
                                    />
                                </div>
                                <button type="submit" disabled={savingTelegram} className="cyber-button bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/30 hover:bg-cyber-blue hover:text-white w-full flex items-center justify-center gap-2 mt-4">
                                    {savingTelegram ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                    <span>UPDATE PROTOCOL</span>
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Password Rotation Panel */}
                    <div className="premium-card p-8 group overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Key size={100} />
                        </div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-rose-500/10 rounded-lg border border-rose-500/20 text-rose-500">
                                    <Key size={20} />
                                </div>
                                <h3 className="text-xl font-bold text-white uppercase tracking-tight">Key Rotation</h3>
                            </div>
                            <p className="text-sm text-slate-500 font-display mb-8">
                                Rotate your Master Security Key. Requires current verification.
                            </p>

                            <form onSubmit={handlePasswordSubmit} className="space-y-6">
                                <div>
                                    <label className="label-cyber">Current Key</label>
                                    <input autoCapitalize="none" autoCorrect="off" spellCheck="false"
                                        type="password"
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                        className="cyber-input"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label-cyber">New Key</label>
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
                                        <label className="label-cyber">Confirm Key</label>
                                        <input autoCapitalize="none" autoCorrect="off" spellCheck="false"
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                            className="cyber-input"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>
                                <button type="submit" disabled={savingPassword || !isPasswordValid} className="cyber-button bg-rose-500/10 text-rose-500 border border-rose-500/30 hover:bg-rose-500 hover:text-white w-full flex items-center justify-center gap-2 mt-4">
                                    {savingPassword ? <Loader2 className="animate-spin" size={16} /> : <Shield size={16} />}
                                    <span>AUTHORIZE ROTATION</span>
                                </button>
                            </form>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default SettingsPage;

