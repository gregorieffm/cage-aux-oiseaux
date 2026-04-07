import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const properties = defineCollection({
  loader: glob({ pattern: '*.json', base: 'src/content/properties' }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    order: z.number(),
    category: z.enum(['chambre', 'gite']).default('chambre'),
    featured: z.boolean().default(false),
    badge: z.string().optional(),
    capacity: z.string(),
    description: z.string(),
    features: z.array(z.string()),
    price: z.string().optional(),
    priceNote: z.string().optional(),
    image: z.string().optional(),
    gallery: z.array(z.string()).default([]),
    icalFeeds: z.array(z.object({
      platform: z.string(),
      url: z.string(),
    })).default([]),
    seasonalPricing: z.array(z.object({
      label: z.string(),
      startMonth: z.number(),
      endMonth: z.number(),
      pricePerNight: z.number(),
      minNights: z.number().default(1),
    })).default([]),
  }),
});

const sections = defineCollection({
  loader: glob({ pattern: '*.json', base: 'src/content/sections' }),
  schema: z.any(),
});

const extras = defineCollection({
  loader: glob({ pattern: '*.json', base: 'src/content/extras' }),
  schema: z.object({
    name: z.string(),
    price: z.string(),
    icon: z.string(),
    order: z.number(),
  }),
});

export const collections = { properties, sections, extras };
