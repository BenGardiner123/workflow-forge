import { z } from 'zod';

const WorkflowNodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  position: z.tuple([z.number(), z.number()]),
  parameters: z.record(z.any()),
  credentials: z.record(z.string()).optional(),
});

const WorkflowConnectionSchema = z.record(
  z.record(
    z.array(z.object({
      node: z.string(),
      type: z.string(),
      index: z.number(),
    }))
  )
);

export const WorkflowDataSchema = z.object({
  name: z.string(),
  nodes: z.array(WorkflowNodeSchema),
  connections: WorkflowConnectionSchema,
  active: z.boolean(),
  __preview: z.string().optional(),
  __testPayload: z.record(z.any()).optional(),
  __notes: z.array(z.string()).optional(),
});

export const validateWorkflow = (data: any) => {
  return WorkflowDataSchema.safeParse(data);
};

export const extractCredentialPlaceholders = (workflow: any): string[] => {
  const placeholders = new Set<string>();
  
  const searchForPlaceholders = (obj: any) => {
    if (typeof obj === 'string') {
      const matches = obj.match(/\{\{CRED:([^}]+)\}\}/g);
      if (matches) {
        matches.forEach(match => {
          const placeholder = match.replace(/^\{\{CRED:/, '').replace(/\}\}$/, '');
          placeholders.add(placeholder);
        });
      }
    } else if (Array.isArray(obj)) {
      obj.forEach(searchForPlaceholders);
    } else if (obj && typeof obj === 'object') {
      Object.values(obj).forEach(searchForPlaceholders);
    }
  };

  searchForPlaceholders(workflow);
  return Array.from(placeholders);
};

export const replaceCredentialPlaceholders = (workflow: any, mapping: Record<string, string>) => {
  const replaceInObject = (obj: any): any => {
    if (typeof obj === 'string') {
      let result = obj;
      Object.entries(mapping).forEach(([placeholder, credentialName]) => {
        result = result.replace(
          new RegExp(`\\{\\{CRED:${placeholder}\\}\\}`, 'g'),
          credentialName
        );
      });
      return result;
    } else if (Array.isArray(obj)) {
      return obj.map(replaceInObject);
    } else if (obj && typeof obj === 'object') {
      const result: any = {};
      Object.entries(obj).forEach(([key, value]) => {
        result[key] = replaceInObject(value);
      });
      return result;
    }
    return obj;
  };

  return replaceInObject(workflow);
};