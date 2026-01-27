import { IChat, IConversation } from '@/interfaces/chat.interface';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ChatState = {
    chats: IChat[];
    selectedChat: IChat | null;
    conversations: IConversation[];
    isLoadingChats: boolean;
    isLoadingConversations: boolean;
    isStreaming: boolean;
};

const initialState: ChatState = {
    chats: [],
    selectedChat: null,
    conversations: [],
    isLoadingChats: false,
    isLoadingConversations: false,
    isStreaming: false,
};

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setChats: (state, action: PayloadAction<IChat[]>) => {
            state.chats = action.payload;
        },
        addChat: (state, action: PayloadAction<IChat>) => {
            state.chats = [action.payload, ...state.chats];
        },
        updateChat: (state, action: PayloadAction<{ chatId: string; updates: Partial<IChat> }>) => {
            const { chatId, updates } = action.payload;
            const index = state.chats.findIndex((chat) => chat._id === chatId);
            if (index !== -1) {
                state.chats[index] = { ...state.chats[index], ...updates };
            }
            if (state.selectedChat?._id === chatId) {
                state.selectedChat = { ...state.selectedChat, ...updates };
            }
        },
        removeChat: (state, action: PayloadAction<string>) => {
            state.chats = state.chats.filter((chat) => chat._id !== action.payload);
            if (state.selectedChat?._id === action.payload) {
                state.selectedChat = null;
                state.conversations = [];
            }
        },
        setCurrentChat: (state, action: PayloadAction<IChat | null>) => {
            state.selectedChat = action.payload;
        },
        setConversations: (state, action: PayloadAction<IConversation[]>) => {
            state.conversations = action.payload;
        },
        addConversation: (state, action: PayloadAction<IConversation>) => {
            state.conversations.push(action.payload);
        },
        updateLastConversation: (state, action: PayloadAction<Partial<IConversation>>) => {
            const lastIndex = state.conversations.length - 1;
            if (lastIndex >= 0) {
                state.conversations[lastIndex] = {
                    ...state.conversations[lastIndex],
                    ...action.payload,
                };
            }
        },
        clearConversations: (state) => {
            state.conversations = [];
        },
        setLoadingChats: (state, action: PayloadAction<boolean>) => {
            state.isLoadingChats = action.payload;
        },
        setLoadingConversations: (state, action: PayloadAction<boolean>) => {
            state.isLoadingConversations = action.payload;
        },
        setStreaming: (state, action: PayloadAction<boolean>) => {
            state.isStreaming = action.payload;
        },
    },
});

export const {
    setChats,
    addChat,
    updateChat,
    removeChat,
    setCurrentChat,
    setConversations,
    addConversation,
    updateLastConversation,
    clearConversations,
    setLoadingChats,
    setLoadingConversations,
    setStreaming,
} = chatSlice.actions;

export default chatSlice.reducer;
