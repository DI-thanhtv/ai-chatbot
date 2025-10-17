import { z } from "zod";

export const listTableSchema = z.object({
  type: z.enum(["table", "raw"]),
  data: z.object({
    columns: z.array(z.string()),
    rows: z.array(z.record(z.string(), z.any())),
  })
})
