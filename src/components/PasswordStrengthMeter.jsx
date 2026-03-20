import React, { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';

const PasswordStrengthMeter = ({ password, onValidationChange }) => {
    const [strength, setStrength] = useState(0);

    const rules = [
        { id: 'length', label: 'At least 8 characters', regex: /.{8,}/ },
        { id: 'uppercase', label: 'Contains uppercase letter', regex: /[A-Z]/ },
        { id: 'number', label: 'Contains number', regex: /[0-9]/ },
        { id: 'special', label: 'Contains special character', regex: /[^A-Za-z0-9]/ }
    ];

    useEffect(() => {
        let passed = 0;
        rules.forEach(rule => {
            if (rule.regex.test(password)) passed++;
        });
        
        setStrength(passed);
        
        if (onValidationChange) {
            onValidationChange(passed === rules.length);
        }
    }, [password]);

    const getBarColor = (index) => {
        if (strength <= index) return 'bg-white/10';
        if (strength === 1) return 'bg-rose-500';
        if (strength === 2) return 'bg-amber-500';
        if (strength === 3) return 'bg-cyber-blue';
        return 'bg-emerald-neon shadow-[0_0_10px_rgba(16,185,129,0.5)]';
    };

    if (!password) return null;

    return (
        <div className="mt-3 animate-fade-in font-display">
            <div className="flex gap-1 mb-2">
                {[0, 1, 2, 3].map(index => (
                    <div 
                        key={index} 
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${getBarColor(index)}`}
                    ></div>
                ))}
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-3">
                {rules.map(rule => {
                    const isValid = rule.regex.test(password);
                    return (
                        <div key={rule.id} className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold transition-colors ${isValid ? 'text-emerald-neon' : 'text-slate-500'}`}>
                            {isValid ? <Check size={12} /> : <X size={12} />}
                            <span>{rule.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PasswordStrengthMeter;
