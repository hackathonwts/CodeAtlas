'use client';

import React, { useEffect, useState } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { ThemeProvider } from 'next-themes';
import { store } from '../store/store';
import { setUser, setLoading } from '../store/authSlice';
import type { RootState } from '../store/store';
import { toast } from 'sonner';
import { meApi } from '../utils/apis/auth-api';

function AuthInitializer({ children }: { children: React.ReactNode }) {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const initAuth = async () => {
            if (!user) {
                try {
                    dispatch(setLoading(true));
                    const result = await meApi();
                    dispatch(setUser(result.data));
                } catch (error: any) {
                    toast.error('Session expired. Please log in again.');
                } finally {
                    dispatch(setLoading(false));
                }
            }
            setIsInitialized(true);
        };
        initAuth();
    }, [dispatch, user]);

    if (!isInitialized) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return <>{children}</>;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Provider store={store}>
                <AuthInitializer>{children}</AuthInitializer>
            </Provider>
        </ThemeProvider>
    );
}
