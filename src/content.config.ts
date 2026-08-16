import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string().default(''),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: z.optional(image()),
			tags: z.array(z.string()).default([]),
			author: z.string().default('齐晓宁'),
			originType: z.enum(['原文发布', '轻编辑', '综合提炼']),
			originNote: z.string(),
			originSources: z.array(z.string()).min(1),
			topic: z
				.enum([
					'personal-ai',
					'frontier',
					'enterprise-ai-foundations',
					'enterprise-agent-architecture',
					'enterprise-ai-implementation',
				])
				.optional(),
			topicOrder: z.number().int().positive().optional(),
		}),
});

export const collections = { blog };
