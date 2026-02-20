import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [couple, setCouple] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            console.log("[Auth] Checking session...");

            // 1. Check for active Supabase Session
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                console.log("[Auth] Session found:", session.user.id);
                // Prioritize the couple matching our local code if we have one
                const storedCode = localStorage.getItem('love_jar_code');
                let query = supabase.from('couples').select('*');

                if (storedCode) {
                    query = query.eq('secret_code', storedCode);
                }

                const { data, error } = await query.order('created_at', { ascending: false }).maybeSingle();

                if (data && !error) {
                    console.log("[Auth] Restored session for couple:", data.id);
                    setCouple(data);
                    setLoading(false);
                    return;
                }
            }

            // 2. Legacy/Link Flow: Check valid code in LocalStorage or URL
            const urlParams = new URLSearchParams(window.location.search);
            const secretCode = urlParams.get('code') || localStorage.getItem('love_jar_code');

            if (secretCode) {
                console.log("[Auth] Found legacy/invite code. Attempting to link...");
                // We reuse the login logic which now handles anon linking
                const success = await login(secretCode);
                if (success) {
                    // Clean URL
                    if (urlParams.get('code')) {
                        window.history.replaceState({}, document.title, "/");
                    }
                } else {
                    localStorage.removeItem('love_jar_code');
                }
            }

            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (code) => {
        console.log("[Auth] Secure Login with:", code);

        // 1. Ensure Anonymous Session
        const { data: sessionData, error: authError } = await supabase.auth.signInAnonymously();
        if (authError) {
            console.error("[Auth] Anon Sign-in failed:", authError);
            return false;
        }

        // 2. call RPC to link user to couple
        const { data, error } = await supabase.rpc('join_couple', { secret_code_input: code });

        if (!error && data?.success) {
            console.log("[Auth] Link Success!", data.couple);
            setCouple(data.couple);
            localStorage.setItem('love_jar_code', code); // Keep for UI reference/sharing
            return true;
        } else {
            console.error("[Auth] RPC Link Failed:", error || data?.message);
            // Ignore error if it's just "already linked" (which shouldn't happen with RLS logic but safety first)
            // Actually, if join fails, we fail.
            return false;
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setCouple(null);
        localStorage.removeItem('love_jar_code');
        window.location.reload();
    };

    const createCouple = async () => {
        console.log("Creating couple...");

        // 1. Ensure Anonymous Session
        const { error: authError } = await supabase.auth.signInAnonymously();
        if (authError) {
            console.error("[Auth] Anon Sign-in failed:", authError);
            return { success: false, error: authError };
        }

        // Generate 4-char code
        const code = Math.random().toString(36).substring(2, 6).toUpperCase();

        // 2. Call RPC to create and link
        const { data, error } = await supabase.rpc('create_new_couple', { secret_code_input: code });

        if (error || !data?.success) {
            console.error("Creation failed", error);
            return { success: false, error: error || new Error("RPC Failed") };
        }

        console.log("Couple created!", data.couple);
        setCouple(data.couple);
        localStorage.setItem('love_jar_code', code);
        return { success: true, data: data.couple };
    };

    const updateCouple = (updates) => {
        setCouple(prev => ({ ...prev, ...updates }));
    };

    return (
        <AuthContext.Provider value={{ couple, loading, login, logout, createCouple, updateCouple }}>
            {children}
        </AuthContext.Provider>
    );
};
