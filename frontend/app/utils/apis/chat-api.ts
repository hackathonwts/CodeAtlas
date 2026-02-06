import { post, get, del, patch } from '../axios/axios.helpers';
import { PaginatedResponse, PaginationParams } from '@/interfaces/pagination.interface';
import { IChat, IConversation } from '@/interfaces/chat.interface';

interface IChatListPayload extends PaginationParams { }
interface ICreateChatPayload {
    title?: string;
    project_id: string;
}
interface IConversationListPayload extends PaginationParams {
    chat_id: string;
}
interface ICreateConversationPayload {
    chat_id: string;
    message: string;
}

// Chats APIs
export const chatsListApi = async (params?: IChatListPayload) =>
    get<PaginatedResponse<IChat>>(`/chat`, { data: params ?? {} });
export const createChatApi = async (data: ICreateChatPayload) => post<IChat>('/chat', data);
export const deleteChatApi = async (chatId: string) => del<IChat>(`/chat/${chatId}`);
export const updateChatApi = async (chatId: string, data: Partial<ICreateChatPayload>) =>
    patch<IChat>(`/chat/${chatId}`, data);

// Conversations APIs
export const conversationsListApi = async (chat_id: string, params?: IConversationListPayload) =>
    get<PaginatedResponse<IConversation>>(`/chat/${chat_id}/conversation`, { data: params ?? {} });
export const createConversationApi = async (data: ICreateConversationPayload) =>
    post<IConversation>('/chat/conversation', data);

// Streaming Conversation API
export const streamConversationApi = async ({ chat_id, project_id, query }: { chat_id: string; project_id: string; query: string }) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;
    return fetch(`${API_URL}/api/${API_VERSION}/chat/llm-conversation`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: query,
            pid: project_id,
            cid: chat_id,
        })
    });
};
