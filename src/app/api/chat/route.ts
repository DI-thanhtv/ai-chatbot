import { convertToModelMessages, stepCountIs, streamText, UIMessage } from 'ai';
import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/middleware';
import { NextRequest } from 'next/server';
import { chatModel } from '@/lib/ai';
import { tools } from '@/ai/tools';



export async function POST(req: NextRequest) {
  const { messages, chatId }: { messages: UIMessage[], chatId?: string } = await req.json();

  try {
    const result = streamText({
      model: chatModel,
      system: `You are a helpful AI assistant that can have natural conversations and use tools when needed.

When using tools:
- textToSql: Handles database queries and formats results automatically
- displayWeather: Provides weather information

For database results:
- If the tool returns a table format, the frontend will display it nicely
- If the tool returns raw data, provide a natural explanation
- Avoid duplicating data that's already formatted by tools

You can have normal conversations about any topic, not just database queries.`,
      prompt: convertToModelMessages(messages),
      stopWhen: stepCountIs(5),
      tools,
    });

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      onFinish: async ({ messages }) => {


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

              if (existChatHistory) {
                await prisma.chatHistory.update({
                  where: {
                    id: chatId,
                    userId: user.id
                  },
                  data: {
                    messages: JSON.parse(JSON.stringify(messages))
                  }
                });
              } else {
                await prisma.chatHistory.create({
                  data: {
                    title: `${messages[0]?.parts[0]?.type === 'text' ? messages[0].parts[0].text.slice(0, 20) : 'Chat' + new Date().toLocaleDateString()}...`,
                    id: chatId,
                    userId: user.id,
                    messages: JSON.parse(JSON.stringify(messages))
                  }
                })
              }

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