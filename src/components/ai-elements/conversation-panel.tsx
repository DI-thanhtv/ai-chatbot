'use client';

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation"
import { Message, MessageContent } from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
  PromptInputMessage,
} from '@/components/ai-elements/prompt-input';
import { MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { Response } from '@/components/ai-elements/response';
import { DefaultChatTransport } from "ai";
import { useChatHistory } from '@/hooks/use-chat-history';
import AuthModal from '@/components/auth/auth-modal';
import { useStore } from '@/stores/use-store';
import { Button } from "@/components/ui/button";
import { Weather, WeatherProps } from "../ui/weather";
import { ListTable } from "../ui/table";

interface ConversationPanelProps {
  chatId?: string;
}

const ConversationPanel = ({ chatId }: ConversationPanelProps) => {
  const [input, setInput] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);

  const {
    currentUser,
    loadChat,
    saveChat: _,
    createNewChat
  } = useChatHistory();

  const get = useStore.getState;
  const { token, loadChatHistories } = useStore();

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: {
        chatId: chatId
      },
      headers: token ? {
        'Authorization': `Bearer ${token}`
      } : {}
    }),
    //initialMessages: initialMessages,
    onFinish: async () => {
      if (currentUser) {
        await loadChatHistories();
      }
    },
  });

  useEffect(() => {
    const loadInitialMessages = async () => {
      if (chatId && currentUser) {
        const previousMessages = await loadChat(chatId);
        //setInitialMessages(previousMessages);
        setMessages(previousMessages);
      } else {
        //setInitialMessages([]);
        setMessages([]);
      }

      if (currentUser && !chatId) {
        createNewChat();
      }
    };

    loadInitialMessages();
  }, [chatId, currentUser]);

  const handleSubmit = (message: PromptInputMessage, e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ text: input });
      setInput('');
    }
  };

  const handleNewChat = () => {
    if (currentUser) {
      createNewChat();
    } else {
      setShowAuthModal(true);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);

    setTimeout(() => {
      get().loadChatHistories();
    }, 100);

    if (chatId) {
      loadChat(chatId).then(messages => {
        setMessages(messages);
      });
    }
  };

  return (
    <>
      <div className="size-full rounded-lg border h-[600px]">
        <div className="flex flex-col h-full">
          <Conversation>
            <ConversationContent>
              {messages.length === 0 ? (
                <ConversationEmptyState
                  icon={<MessageSquare className="size-12" />}
                  title="Start a conversation"
                  description={
                    currentUser
                      ? "Type a message below to begin chatting"
                      : "Sign in to save your chat history, or continue without account"
                  }
                />
              ) : (
                messages.map((message) => {
                  return (
                    <Message from={message.role} key={message.id}>
                      <MessageContent>
                        {message?.parts?.map((part, i) => {

                          switch (part.type) {
                            case 'text':
                              return (
                                <Response key={`${message.id}-${i}`}>
                                  {part.text}
                                </Response>
                              );
                            case 'tool-displayWeather':
                              switch (part.state) {
                                case 'input-available':
                                  return <div key={i}>Loading weather...</div>;
                                case 'output-available':
                                  return (
                                    <div key={i}>
                                      <Weather {...part.output as WeatherProps} />
                                    </div>
                                  );
                                case 'output-error':
                                  return <div key={i}>Error: {part.errorText}</div>;
                                default:
                                  return null;
                              }
                            case 'tool-textToSql':
                              switch (part.state) {
                                case 'input-available':
                                  return <div key={i}>Loading CSDL...</div>;
                                case 'output-available':
                                  try {
                                    const outputData = typeof part.output === 'string' ? JSON.parse(part.output) : part.output;
                                    if (outputData.type === "table" && outputData.data && outputData.data.columns) {
                                      return (
                                        <ListTable key={i} data={outputData.data} />
                                      );
                                    }

                                    if (outputData.type === "raw") {
                                      return null;
                                    }
                                  } catch (error) {
                                    console.error("Error parsing tool output:", error);
                                    return <div key={i}>Error parsing data: {String(part.output)}</div>;
                                  }
                                case 'output-error':
                                  return <div key={i}>Error: {part.errorText}</div>;
                                default:
                                  return null;
                              }
                            default:
                              return null;
                          }
                        })}
                      </MessageContent>
                    </Message>
                  )
                })
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          <PromptInput
            onSubmit={handleSubmit}
            className="my-4 w-full max-w-3xl mx-auto relative"
          >
            <PromptInputTextarea
              value={input}
              placeholder="Say something..."
              onChange={(e) => setInput(e.currentTarget.value)}
              className="pr-12"
            />
            <PromptInputSubmit
              status={status === 'streaming' ? 'streaming' : 'ready'}
              disabled={!input.trim()}
              className="absolute bottom-1 right-1"
            />
          </PromptInput>
        </div>
      </div>

      {/* button to new chat or authen */}
      <div className="mt-4 flex justify-center">
        <Button onClick={handleNewChat} variant="default">
          {currentUser ? 'New Chat' : 'Sign in to history chat'}
        </Button>
      </div>

      {/* authen modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default ConversationPanel;
