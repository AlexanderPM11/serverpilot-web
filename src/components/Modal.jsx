import React from 'react';
import { AlertTriangle, Info, CheckCircle, X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, message, type = 'error' }) => {
    if (!isOpen) return null;

    const icons = {
        error: <AlertTriangle className="text-rose-500" size={32} />,
        info: <Info className="text-cyber-blue" size={32} />,
        success: <CheckCircle className="text-emerald-neon" size={32} />
    };

    const borders = {
        error: 'border-rose-500/30',
        info: 'border-cyber-blue/30',
        success: 'border-emerald-neon/30'
    };

    const bgs = {
        error: 'bg-rose-500/10 text-rose-500',
        info: 'bg-cyber-blue/10 text-cyber-blue',
        success: 'bg-emerald-neon/10 text-emerald-neon'
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-display">
            <div className="absolute inset-0 bg-midnight/90 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>
            
            <div className={`relative w-full max-w-md premium-card p-6 border-t-2 ${borders[type]} animate-fade-up`}>
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex items-start gap-4">
                    <div className={`shrink-0 p-3 rounded-xl ${bgs[type]} ${borders[type]} border`}>
                        {icons[type]}
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-white uppercase tracking-tight mb-1">{title}</h3>
                        <p className="text-slate-400 font-display text-sm leading-relaxed">{message}</p>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="cyber-button bg-white/5 border border-white/10 hover:bg-white/10 text-white px-6 py-2"
                    >
                        ACKNOWLEDGE
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
