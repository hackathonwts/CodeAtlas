import { IUser } from '@/interfaces/user.interface';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type AuthState = {
    user: IUser | null;
    isLoading: boolean;
};

const initialState: AuthState = {
    user: null,
    isLoading: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<IUser>) => {
            state.user = action.payload;
            state.isLoading = false;
        },
        clearUser: (state) => {
            state.user = null;
            state.isLoading = false;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
    },
});

export const { setUser, clearUser, setLoading } = authSlice.actions;
export default authSlice.reducer;
