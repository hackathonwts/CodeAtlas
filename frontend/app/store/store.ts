import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import chatReducer from './chatSlice';
import projectReducer from './projectSlice';
import policyReducer from './policySlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        chat: chatReducer,
        project: projectReducer,
        policy: policyReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
