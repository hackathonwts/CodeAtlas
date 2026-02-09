'use client';

import { useEffect } from 'react';
import { ChatSidebar } from './chat-sidebar';
import { ChatConversation } from './chat-main';
import { IChat } from '@/interfaces/chat.interface';
import { useAppSelector, useAppDispatch } from '@/app/store/hooks';
import { setChats, setCurrentChat, setConversations, removeChat, updateChat, addChat, setLoadingChats, setLoadingConversations, addConversation, } from '@/app/store/chatSlice';
import { chatsListApi, conversationsListApi, deleteChatApi, updateChatApi, streamConversationApi, } from '@/app/utils/apis/chat-api';
import { showErrorToast } from '@/app/utils/error-handler';

export default function ChatPage() {
    const dispatch = useAppDispatch();
    const { chats, selectedChat, conversations } = useAppSelector((s) => s.chat);
    const { user } = useAppSelector((s) => s.auth);

    const fetchChats = async () => {
        try {
            dispatch(setLoadingChats(true));
            const { data } = await chatsListApi();
            dispatch(setChats(data));
        } catch (error) {
            showErrorToast(error);
        } finally {
            dispatch(setLoadingChats(false));
        }
    };

    const fetchConversations = async (chatId: string) => {
        try {
            dispatch(setLoadingConversations(true));
            const { data } = await conversationsListApi(chatId);
            dispatch(setConversations(data));
        } catch (error) {
            showErrorToast(error);
        } finally {
            dispatch(setLoadingConversations(false));
        }
    };

    const handleSelectChat = (chat: IChat) => {
        dispatch(setCurrentChat(chat));
        fetchConversations(chat._id);
    };

    const handleDeleteChat = async (chatId: string) => {
        try {
            await deleteChatApi(chatId);
            dispatch(removeChat(chatId));
        } catch (error) {
            showErrorToast(error);
        }
    };

    const handleUpdateChatTitle = async (chatId: string, newTitle: string) => {
        try {
            await updateChatApi(chatId, { title: newTitle });
            dispatch(updateChat({ chatId, updates: { title: newTitle } }));
        } catch (error) {
            showErrorToast(error);
        }
    };

    const handleCreateChat = (newChat: IChat) => {
        dispatch(addChat(newChat));
        dispatch(setCurrentChat(newChat));
        fetchConversations(newChat._id);
    };

    const handleSendMessage = async (message: string, onStreamUpdate?: (content: string) => void): Promise<void> => {
        if (!selectedChat || !message.trim()) return;

        const userMessage = {
            _id: 'temp-user-' + Date.now(),
            chat_id: selectedChat._id,
            user_id: {
                _id: user?._id || Date.now().toString(),
                full_name: user?.full_name || 'Guest',
                email: user?.email || '',
            },
            content: message,
            type: 'text' as const,
            role: 'user' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        dispatch(addConversation(userMessage));

        try {
            const response = await streamConversationApi({ query: message, chat_id: selectedChat._id, project_id: selectedChat?.project_id?._id });
            if (!response.ok) throw new Error(response.statusText || 'Server error! Failed to send message.');

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let fullContent = '';
            let hasError = false;

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n').filter(line => line.trim());

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6);
                            if (data === '[DONE]') break;

                            try {
                                const jsonData = JSON.parse(data);
                                if (jsonData.delta?.content) {
                                    fullContent += jsonData.delta.content;
                                    if (onStreamUpdate) {
                                        onStreamUpdate(fullContent);
                                    }
                                }
                                if (jsonData.finish_reason === 'error') {
                                    hasError = true;
                                    throw new Error(jsonData.delta?.content || 'An error occurred');
                                }
                                if (jsonData.finish_reason === 'stop') {
                                    break;
                                }
                            } catch (parseError) {
                                if (parseError instanceof SyntaxError) {
                                    console.warn('Failed to parse chunk:', data);
                                } else {
                                    throw parseError;
                                }
                            }
                        }
                    }
                }
            }

            if (!hasError && fullContent) {
                dispatch(
                    addConversation({
                        _id: 'temp-assistant-' + Date.now(),
                        chat_id: selectedChat._id,
                        user_id: { _id: 'assistant', full_name: 'CodeAtlas', email: '' },
                        content: fullContent,
                        type: 'text' as const,
                        role: 'assistant' as const,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    }),
                );
            }
        } catch (error) {
            showErrorToast(error);
        }
    };

    useEffect(() => {
        fetchChats();
    }, []);

    return (
        <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden">
            {/* Desktop Sidebar */}
            <div className="w-80 border-r bg-background shrink-0">
                <ChatSidebar
                    chats={chats}
                    selectedChat={selectedChat}
                    onSelectChat={handleSelectChat}
                    onDeleteChat={handleDeleteChat}
                    onUpdateChatTitle={handleUpdateChatTitle}
                    onCreateChat={handleCreateChat}
                />
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {selectedChat ? (
                    <ChatConversation
                        selectedChat={selectedChat}
                        conversations={conversations}
                        onSendMessage={handleSendMessage}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                            <h3 className="text-lg font-semibold mb-2">Welcome to Code Atlas Chat</h3>
                            <p>Select a chat from the sidebar to start the conversation</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
