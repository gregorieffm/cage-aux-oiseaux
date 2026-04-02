import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const properties = defineCollection({
  loader: glob({ pattern: '*.json', base: 'src/content/properties' }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    order: z.number(),
    featured: z.boolean().default(false),
    badge: z.string().optional(),
    capacity: z.string(),
    description: z.string(),
    features: z.array(z.string()),
    price: z.string().optional(),
    priceNote: z.string().optional(),
    image: z.string().optional(),
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
  schema: z.object({
    hero: z.object({
      subtitle: z.string(),
      title: z.string(),
      tagline: z.string(),
      cta: z.string(),
    }),
    domaine: z.object({
      label: z.string(),
      title: z.string(),
      paragraphs: z.array(z.string()),
    }),
    spa: z.object({
      label: z.string(),
      title: z.string(),
      paragraphs: z.array(z.string()),
      options: z.array(z.object({
        name: z.string(),
        description: z.string(),
        price: z.string().optional(),
      })),
    }),
    atelier: z.object({
      label: z.string(),
      title: z.string(),
      intro: z.string(),
      galleryText: z.array(z.string()),
      decoTitle: z.string(),
      decoDescription: z.string(),
    }),
    stages: z.object({
      label: z.string(),
      title: z.string(),
      description: z.string(),
      formulas: z.array(z.object({
        name: z.string(),
        hours: z.string(),
        price: z.string(),
        note: z.string(),
      })),
    }),
    reviews: z.object({
      label: z.string(),
      title: z.string(),
      subtitle: z.string(),
      items: z.array(z.object({
        text: z.string(),
        author: z.string(),
        rating: z.number().default(5),
      })),
    }),
    contact: z.object({
      label: z.string(),
      title: z.string(),
      intro: z.string(),
      address: z.array(z.string()),
      phone: z.string().optional(),
      email: z.string().optional(),
      facebook: z.string().optional(),
    }),
    location: z.object({
      label: z.string(),
      title: z.string(),
      address: z.array(z.string()),
      nearby: z.array(z.string()),
    }),
  }),
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
