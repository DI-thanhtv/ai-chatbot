import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { convertToModelMessages, streamText, UIMessage } from 'ai';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/middleware';
import { NextRequest } from 'next/server';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const chatModelName = process.env.OPENROUTER_CHAT_MODEL ?? "";

// Chat models (recommended)
const chatModel = openrouter.chat(chatModelName);


export async function POST(req: NextRequest) {
  const { messages, chatId }: { messages: UIMessage[], chatId?: string } = await req.json();

  try {
    const result = streamText({
      model: chatModel,
      prompt: convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      onFinish: async ({ messages }) => {
        console.log("🚀 ~ onFinish ~ messages:", messages);

        // Save chat history if user is authenticated and chatId is provided
        if (chatId) {
          try {
            const user = getAuthUser(req);
            if (user) {
              const existChatHistory = await prisma.chatHistory.findUnique({
                where: {
                  id: chatId
                }
              });

              let chatHistory;

              if (existChatHistory) {
                chatHistory = await prisma.chatHistory.update({
                  where: {
                    id: chatId,
                    userId: user.id
                  },
                  data: {
                    messages: JSON.parse(JSON.stringify(messages))
                  }
                });
              } else {
                chatHistory = await prisma.chatHistory.create({
                  data: {
                    title: `${messages[0]?.parts[0]?.type === 'text' ? messages[0].parts[0].text.slice(0, 20) : 'Chat' + new Date().toLocaleDateString()}...`,
                    id: chatId,
                    userId: user.id,
                    messages: JSON.parse(JSON.stringify(messages))
                  }
                })
              }

              console.log("🚀 ~ POST ~ Chat history upserted:", chatHistory.id);
            }
          } catch (error) {
            console.error('Failed to save chat history:', error);
          }
        }
      },
    });
  } catch (e: unknown) {
    console.log("lỗi: ", e instanceof Error ? e.message : 'Unknown error')
  }
}