import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            const email = localStorage.getItem('email');
            
            if (token && email) {
                try {
                    const res = await api.get('/auth/profile');
                    setUser({ token, email, requiresPasswordChange: res.data.requiresPasswordChange });
                } catch (e) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('email');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = (token, email, requiresPasswordChange) => {
        localStorage.setItem('token', token);
        localStorage.setItem('email', email);
        setUser({ token, email, requiresPasswordChange });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
