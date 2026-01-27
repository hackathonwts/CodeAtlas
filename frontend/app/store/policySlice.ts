import { IPolicy } from '@/interfaces/policy.interface';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type PolicyState = {
    policies: IPolicy[];
    isLoading: boolean;
};

const initialState: PolicyState = {
    policies: [],
    isLoading: false,
};

const policySlice = createSlice({
    name: 'policy',
    initialState,
    reducers: {
        setPolicies: (state, action: PayloadAction<IPolicy[]>) => {
            state.policies = action.payload;
            state.isLoading = false;
        },
        clearPolicies: (state) => {
            state.policies = [];
            state.isLoading = false;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
    },
});

export const { setPolicies, clearPolicies, setLoading } = policySlice.actions;
export default policySlice.reducer;
