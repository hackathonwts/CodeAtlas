'use client';

import React, { useEffect, useState } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { ThemeProvider } from 'next-themes';
import { store } from '../store/store';
import { setUser, setLoading } from '../store/authSlice';
import type { RootState } from '../store/store';
import { meApi } from '../utils/apis/auth-api';
import ServerDownPage from '@/components/server-down';
import { createAbilityForUser, AppAbility } from '@/lib/ability';
import { AbilityContext } from './AbilityProvider';

function AuthInitializer({ children }: { children: React.ReactNode }) {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);

    const [isInitialized, setIsInitialized] = useState(false);
    const [serverDown, setServerDown] = useState(false);
    const [ability, setAbility] = useState<AppAbility | null>(null);

    useEffect(() => {
        const initAuth = async () => {
            if (!user) {
                try {
                    dispatch(setLoading(true));
                    const result = await meApi();
                    const abilities = createAbilityForUser(result.data);

                    setAbility(abilities);
                    dispatch(setUser(result.data));
                } catch (error: any) {
                    setServerDown(parseInt(error?.status) >= 500);
                } finally {
                    dispatch(setLoading(false));
                }
            }
            setIsInitialized(true);
        };
        initAuth();
    }, [dispatch, user]);

    if (serverDown) {
        return <ServerDownPage />;
    }

    if (!isInitialized) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <AbilityContext.Provider value={ability}>
            {children}
        </AbilityContext.Provider>
    );
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
