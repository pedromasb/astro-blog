import { SITE } from "@config";
import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: ({ image }) =>
    z.object({
      author: z.string().default(SITE.author),
      pubDatetime: z.date(),
      modDatetime: z.date().optional().nullable(),
      title: z.string(),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).default(["others"]),
      ogImage: image()
        .refine(img => img.width >= 1200 && img.height >= 630, {
          message: "OpenGraph image must be at least 1200 X 630 pixels!",
        })
        .or(z.string())
        .optional(),
      description: z.string(),
      canonicalURL: z.string().optional(),
      isPaper: z.boolean().default(false),
      authors: z
        .array(z.object({
          name: z.string(),
          orcid: z.string().optional(),
        }))
        .optional(),
      doi: z.string().optional(),
      arxiv: z.string().optional(),
      journal: z.string().optional(),
      volume: z.union([z.string(), z.number()]).optional(),
      pages: z.string().optional(),
      bibtex: z.string().optional(),
    }),
});

const software = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/software" }),
  schema: ({ image }) =>
    z.object({
      author: z.string().default(SITE.author),
      pubDatetime: z.date(),
      modDatetime: z.date().optional().nullable(),
      title: z.string(),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).default(["software"]),
      ogImage: image()
        .refine(img => img.width >= 1200 && img.height >= 630, {
          message: "OpenGraph image must be at least 1200 X 630 pixels!",
        })
        .or(z.string())
        .optional(),
      description: z.string(),
      canonicalURL: z.string().optional(),
      repo: z.string().url().optional(),
      // Product or project homepage, shown as a "Website" button.
      website: z.string().url().optional(),
      docs: z.string().url().optional(),
      demo: z.string().url().or(z.literal("")).optional(),
      pypi: z.string().optional(),
      npm: z.string().optional(),
      // Chrome Web Store listing URL, shown as a "Chrome Web Store" button.
      chromeWebStore: z.string().url().optional(),
      license: z.string().optional(),
      catalogue: z.string().optional(),
      // Path to an stlite manifest, to run the app in the browser on its page.
      app: z.string().optional(),
    }),
});

export const collections = { blog, software};
