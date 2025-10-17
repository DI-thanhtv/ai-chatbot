import { PrismaClient } from "@prisma/client";
import { llmGenerateSQL, llmGenerateORM } from "../lib/ai";
import { readFileSync } from "fs";

const prisma = new PrismaClient();

export const getSchemaDatabase = async (schemaPath = "src/prisma/schema.prisma") => {
  try {

    const schemaContent = readFileSync(schemaPath, 'utf-8');


    const models = [];
    const modelRegex = /model\s+(\w+)\s*\{([^}]+)\}/g;
    let match;

    while ((match = modelRegex.exec(schemaContent)) !== null) {
      const modelName = match[1];
      const modelBody = match[2];

      const fields = [];

      const lines = modelBody.split('\n');

      for (const line of lines) {
        const trimmedLine = line.trim();

        if (!trimmedLine || trimmedLine.startsWith('//')) continue;


        const fieldMatch = trimmedLine.match(/^(\w+)\s+([^{}\s]+)(?:\s+@[^{}]+)*/);
        if (fieldMatch) {
          const fieldName = fieldMatch[1];
          const fieldType = fieldMatch[2];

          if (!trimmedLine.includes('@relation')) {
            fields.push({
              name: fieldName,
              type: fieldType,
              isList: fieldType.includes('[]'),
              isRequired: !fieldType.includes('?'),
              relation: null,
            });
          }
        }
      }

      models.push({
        name: modelName,
        fields: fields,
      });
    }

    return models;
  } catch (error) {
    console.error('Error reading schema file:', error);
    throw new Error(`Failed to read schema file at ${schemaPath}`);
  }
}


export async function generateRawSQL(userInput: string) {
  const schema = await getSchemaDatabase();
  return llmGenerateSQL(userInput, schema);
}

export async function generateORMMethod(userInput: string) {
  const schema = await getSchemaDatabase();
  return llmGenerateORM(userInput, schema);
}

async function executeORMQuery(query: string) {
  try {
    // Clean the query
    const cleanQuery = query
      .replace(/```typescript\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/```javascript\n?/g, '')
      .replace(/```js\n?/g, '')
      .trim();


    const queryMatch = cleanQuery.match(/prisma\.(\w+)\.(\w+)\(\s*(\{[\s\S]*?\})\s*\)/);
    if (!queryMatch) {
      // Try without parameters for methods like findMany()
      const simpleMatch = cleanQuery.match(/prisma\.(\w+)\.(\w+)\(\s*\)/);
      if (simpleMatch) {
        const [, model, method] = simpleMatch;
        const modelName = model.toLowerCase();

        const prismaModel = (prisma as any)[modelName];
        if (!prismaModel) {
          throw new Error(`Model ${modelName} not found`);
        }

        return await prismaModel[method]();
      }
      throw new Error("Invalid ORM query format");
    }


    const [, model, method, params] = queryMatch;
    const modelName = model.toLowerCase();

    const prismaModel = (prisma as any)[modelName];
    if (!prismaModel) {
      throw new Error(`Model ${modelName} not found`);
    }

    // Parse parameters safely
    let parsedParams = {};
    if (params && params.trim()) {
      try {
        // Use Function constructor for safer evaluation than eval
        const paramString = params.trim();
        parsedParams = new Function('return ' + paramString)();
      } catch (parseError) {
        console.error("Error parsing parameters:", parseError);
        throw new Error("Invalid parameter format");
      }
    }

    return await prismaModel[method](parsedParams);

  } catch (error) {
    console.error("Error executing ORM query:", error);
    throw error;
  }
}

export async function execute(userInput: string, mode: "raw" | "orm" = "orm") {
  let query: any;

  if (mode === "raw") {
    query = await generateRawSQL(userInput);
    const result = await prisma.$queryRawUnsafe(query);
    return result;
  } else {
    query = await generateORMMethod(userInput);
    const result = await executeORMQuery(query);
    return result;
  }
}
