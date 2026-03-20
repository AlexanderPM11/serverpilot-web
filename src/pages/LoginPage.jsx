import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import Modal from '../components/Modal';
import { Shield, Lock, Mail, Loader2, Cpu, ChevronRight } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', type: 'error' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.email, res.data.requiresPasswordChange);
      navigate('/');
    } catch (err) {
      setModalConfig({ isOpen: true, title: 'Authentication Failure', message: 'Login identification failed. Access denied.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      <Modal {...modalConfig} onClose={() => setModalConfig({ ...modalConfig, isOpen: false })} />
      {/* Decorative pulse background elements */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-emerald-neon/10 rounded-full blur-[100px] animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-cyber-blue/10 rounded-full blur-[100px] animate-pulse-slow"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10 animate-fade-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-neon to-cyber-blue p-[1px] mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            <div className="w-full h-full bg-midnight rounded-2xl flex items-center justify-center">
              <Cpu className="text-emerald-neon animate-float" size={32} />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-white mb-2">SERVER<span className="text-emerald-neon">PILOT</span></h1>
          <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.3em]">Secure Uplink Gateway / v1.0.0</p>
        </div>

        <div className="premium-card p-10 relative overflow-hidden group animate-fade-up delay-100">
          <div className="scanline"></div>
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div>
              <label className="label-cyber">Operator Identity</label>
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
              <label className="label-cyber">Security Key</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input autoCapitalize="none" autoCorrect="off" spellCheck="false"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="cyber-input pl-12"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="cyber-button-primary w-full flex items-center justify-center gap-3 py-4 group/btn"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>ESTABLISH CONNECTION</span>
                  <ChevronRight size={18} className="transition-transform group-hover/btn:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center relative z-10">
            <Link to="/forgot-password" className="text-slate-500 hover:text-white transition-all text-xs font-bold">
              Lost Master Key? <span className="text-rose-500 hover:text-rose-400">Initialize Recovery</span>
            </Link>
          </div>
        </div>

        {/* System footer */}
        <div className="mt-8 text-center text-[9px] font-mono text-slate-600 uppercase tracking-widest animate-fade-in delay-300">
          Encryption Active: 256-bit AES / RSA-4096 / TLS 1.3
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

