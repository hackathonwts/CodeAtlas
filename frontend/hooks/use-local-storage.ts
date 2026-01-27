import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadChats } from '@/app/store/chatSlice';
import { RootState } from '@/app/store/store';
import { IChat } from '@/interfaces/chat.interface';

const STORAGE_KEY = 'code-atlas-chats';

export const useLocalStorage = () => {
  // const dispatch = useDispatch();
  const chats = useSelector((state: RootState) => state.chat.chats);

  // // Load from localStorage on mount
  // useEffect(() => {
  //   const storedChats = localStorage.getItem(STORAGE_KEY);
  //   if (storedChats) {
  //     try {
  //       const parsed = JSON.parse(storedChats) as IChat[];
  //       dispatch(loadChats(parsed));
  //     } catch (error) {
  //       console.error('Failed to parse stored chats:', error);
  //     }
  //   }
  // }, [dispatch]);

  // Save to localStorage whenever chats change
  useEffect(() => {
    if (chats.length > 0 || localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    }
  }, [chats]);

  return { chats };
};
