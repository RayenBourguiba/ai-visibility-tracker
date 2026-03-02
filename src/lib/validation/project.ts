import { z } from "zod";

export const createProjectSchema = z.object({
  domain: z
    .string()
    .min(3)
    .transform((s) => s.trim().toLowerCase())
    .refine((s) => !s.startsWith("http://") && !s.startsWith("https://"), {
      message: "Entre uniquement le domaine (ex: example.com), sans http(s).",
    }),
  brandName: z.string().min(2).transform((s) => s.trim()),
  language: z.enum(["fr", "en"]).default("fr"),
  sector: z.string().trim().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;