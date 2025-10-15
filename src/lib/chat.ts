"server-only";

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { UIMessage } from "ai";


function getChatFile(id: string): string {
  const chatDir = path.join(process.cwd(), '.chats');
  if (!existsSync(chatDir)) mkdirSync(chatDir, { recursive: true });
  return path.join(chatDir, `${id}.json`);
}



export async function createChat(chatId: string): Promise<string> {
  try {
    const chatFile = getChatFile(chatId);
    await writeFileSync(chatFile, '[]'); // create an empty chat file
    return chatId;
  } catch (error) {
    console.error("Error creating chat file:", error);
  }
  return chatId;
}

export async function loadChat(id: string): Promise<UIMessage[]> {
  return JSON.parse(await readFileSync(getChatFile(id), 'utf8'));
}

export async function saveChat({
  chatId,
  messages,
}: {
  chatId: string;
  messages: UIMessage[];
}): Promise<void> {
  const content = JSON.stringify(messages, null, 2);
  await writeFileSync(getChatFile(chatId), content);
}