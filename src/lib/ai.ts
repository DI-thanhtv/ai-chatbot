import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});
const chatModelName = process.env.OPENROUTER_CHAT_MODEL ?? "";
const chatModel = openrouter.chat(chatModelName);


export async function llmGenerateSQL(userInput: string, schema: any) {
  const prompt = `
  You are a SQL generator for PostgreSQL using Prisma schema.
  Schema:
  ${JSON.stringify(schema, null, 2)}

  User request: "${userInput}"
  Generate the most accurate SQL query to fulfill the request.
  Output only the SQL.
  `;
  const { text } = await generateText({
    model: chatModel,
    messages: [{ role: "user", content: prompt }],
  });
  return text?.trim();
}

export async function llmGenerateORM(userInput: string, schema: any) {
  const prompt = `
  You are a Prisma ORM query generator.
  Schema:
  ${JSON.stringify(schema, null, 2)}

  User request: "${userInput}"
  Generate a valid Prisma query (TypeScript), using "prisma.<model>.<method>()"
  Output only the executable code.
  `
  const { text } = await generateText({
    model: chatModel,
    messages: [{ role: "user", content: prompt }],
  });
  return text?.trim();
}


export { chatModel };