import { z } from 'zod';

const WorkflowNodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  position: z.tuple([z.number(), z.number()]),
  parameters: z.record(z.string(), z.any()),
  credentials: z.record(z.string(), z.string()).optional(),
});

const WorkflowConnectionSchema = z.record(
  z.string(),
  z.record(
    z.string(),
    z.array(
      z.array(
        z.object({
          node: z.string(),
          type: z.string(),
          index: z.number(),
        })
      )
    )
  )
);

export const WorkflowDataSchema = z.object({
  name: z.string(),
  nodes: z.array(WorkflowNodeSchema),
  connections: WorkflowConnectionSchema,
  active: z.boolean(),
  __preview: z.string().optional(),
  __testPayload: z.record(z.string(), z.any()).optional(),
  __notes: z.array(z.string()).optional(),
});


