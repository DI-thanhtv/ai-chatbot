"use client";

import { useStore } from '@/src/stores/use-store';
import { useParams, useRouter } from 'next/navigation';
import { generateId } from 'ai';

export function useChatHistory() {
  const {
    currentUser,
    chatHistories,
    saveChatHistory,
    loadChatHistories,
    deleteChatHistory,
    isLoading
  } = useStore();

  const params = useParams();
  const router = useRouter();
  const chatId = params?.id as string;

  const loadChat = async (id: string) => {
    if (!currentUser) return [];

    const chatHistory = chatHistories.find(chat => chat.id === id);
    return chatHistory?.messages || [];
  };

  const saveChat = async (chatId: string, messages: any[], title?: string) => {
    if (!currentUser) return;

    const chatTitle = title || `Chat ${new Date().toLocaleDateString()}`;
    await saveChatHistory(chatTitle, messages);
  };

  const createNewChat = () => {
    if (currentUser) {
      const newId = generateId();
      router.push(`/chat/${newId}`);
    } else {
      router.push('/chat');
    }
  };

  const loadSpecificChat = async (id: string) => {
    if (!currentUser) return [];

    await loadChatHistories();

    return await loadChat(id);
  };

  const handleDeleteChat = async (id: string) => {
    if (confirm('Are you sure you want to delete this chat?')) {
      const success = await deleteChatHistory(id);
      if (success && chatId === id) {
        router.push('/chat');
        // => đoạn chat mới
      }
    }
  };

  return {
    currentUser,
    chatHistories,
    chatId,
    isLoading,
    loadChat,
    saveChat,
    createNewChat,
    loadSpecificChat,
    handleDeleteChat,
    loadChatHistories
  };
}

