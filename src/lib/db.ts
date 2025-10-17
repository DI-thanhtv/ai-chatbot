import { PrismaClient } from '@prisma/client'
import { readFileSync } from "fs";


const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}


export const prisma = globalForPrisma.prisma ?? new PrismaClient()

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

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

