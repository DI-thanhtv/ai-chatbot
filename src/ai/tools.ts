import { getSchemaDatabase } from '@/lib/prisma-adapters';
import { listTableSchema } from '@/schemas';
import { chatModel } from '@/lib/ai';
import { tool as createTool, generateObject } from 'ai';
import { z } from 'zod';

export const weatherTool = createTool({
  description: 'Display the weather for a location',
  inputSchema: z.object({
    location: z.string().describe('The location to get the weather for'),
  }),
  execute: async function ({ location }) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { weather: 'Sunny', temperature: 75, location };
  },
});

export const textToSqlTool = createTool({
  description: `
Convert natural language into SQL queries and execute them through Prisma ORM, schema database of system ${JSON.stringify(getSchemaDatabase(), null, 2)}.
Use this tool when the user asks about database content, data analysis, or information retrieval from the system.
This tool automatically formats the response for optimal display.
`,
  inputSchema: z.object({
    userInput: z.string().describe('The natural language query of the user'),
  }),
  execute: async function ({ userInput }: { userInput: string }) {
    const { execute } = await import("../lib/prisma-adapters");
    const result = await execute(userInput, 'orm');
    if (result || (Array.isArray(result) && result?.length !== 0)) {

      //console.log("🚀 ~ textToSqlTool ~ raw result:", result);

      const { object } = await generateObject({
        model: chatModel,
        schema: listTableSchema,
        messages: [
          {
            role: "system",
            content: `You are a data formatter that decides how to present database query results.
                      CRITICAL DECISION RULES:
                        1. Use type: "table" ONLY when:
                          - Data has multiple records (2+ items in array)
                          - Data has multiple fields per record (3+ fields)
                          - User asks for "list", "show", "display", "danh sách", "hiển thị"
                          - Examples: "danh sách người dùng", "show all products", "list orders"

                        2. Use type: "raw" for:
                          - Single values: {"_count": 5}, {"success": true}
                          - Count queries: "có bao nhiêu", "how many", "số lượng"
                          - Update/Insert/Delete results
                          - Simple aggregations: sum, average, min, max
                          - Boolean results: true/false

                      FORMATTING RULES:
                          - For type: "table": Extract field names as columns, convert records to rows
                          - For type: "raw": Return data as-is for AI to generate natural text
                          - NEVER add explanatory text - the AI will handle that
                        The user's question was: "${userInput}"
                        The raw data is: ${JSON.stringify(result, null, 2)}`,
          },
        ],
      });

      //console.log("🚀 ~ textToSqlTool ~ formatted object:", object);
      return object;
    }
    return "No data found for the given query.";
  },
})


export const tools = {
  displayWeather: weatherTool,
  textToSql: textToSqlTool,
};