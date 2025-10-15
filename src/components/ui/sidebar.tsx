"use client";

import { useStore } from "@/stores/use-store";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { generateId } from "ai";

function Sidebar() {
  const {
    chatHistories,
    currentUser,
    deleteChatHistory,
    logout,
    isLoading
  } = useStore();

  const router = useRouter();

  const handleDeleteChat = async (id: string) => {
    if (confirm('Are you sure you want to delete this chat?')) {
      await deleteChatHistory(id);
      router.push('/chat');
    }
  };

  const handleNewChat = () => {
    if (currentUser) {
      const newId = generateId();
      router.push(`/chat/${newId}`);
    } else {
      router.push('/chat');
    }
  };

  const handleChatClick = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  const handleLogout = () => {
    logout();
    router.push('/chat');
  }

  return (
    <div className="w-64 h-screen bg-gray-100 border-r border-gray-200 flex flex-col">
      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        {currentUser ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{currentUser.name || currentUser.email}</p>
              <p className="text-sm text-gray-500">{currentUser.email}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700"
            >
              Logout
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-500 text-sm">Not signed in</p>
            <p className="text-xs text-gray-400">Chat history won't be saved</p>
          </div>
        )}
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <Button
          className="w-full"
          variant="outline"
          onClick={handleNewChat}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Chat Histories */}
      <div className="flex-1 overflow-y-auto">
        {currentUser ? (
          isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : chatHistories.length > 0 ? (
            <div className="space-y-1 p-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
                Recent Chats
              </h3>
              {chatHistories.map((chat) => (
                <div
                  key={chat.id}
                  className="group flex items-center justify-between p-2 rounded hover:bg-gray-200 cursor-pointer"
                  onClick={() => handleChatClick(chat.id)}
                >
                  <div className="flex items-center flex-1 min-w-0">
                    <MessageSquare className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {chat.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(chat.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChat(chat.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No chat histories yet</p>
              <p className="text-xs text-gray-400 mt-1">Start a new chat to see it here</p>
            </div>
          )
        ) : (
          <div className="p-4 text-center text-gray-500">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Sign in to save chat history</p>
            <p className="text-xs text-gray-400 mt-1">Your conversations will be saved here</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
