import { defineConfig } from 'tinacms';

const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  'main';

export default defineConfig({
  branch,
  clientId: process.env.TINA_CLIENT_ID || '',
  token: process.env.TINA_TOKEN || '',

  build: {
    outputFolder: 'admin-cms',
    publicFolder: 'public',
  },

  media: {
    tina: {
      mediaRoot: 'images',
      publicFolder: 'public',
    },
  },

  schema: {
    collections: [
      {
        name: 'siteContent',
        label: 'Contenu du site',
        path: 'src/content/sections',
        format: 'json',
        ui: {
          allowedActions: { create: false, delete: false },
          global: true,
        },
        fields: [
          {
            type: 'object',
            name: 'hero',
            label: 'Accueil (Hero)',
            fields: [
              { type: 'string', name: 'subtitle', label: 'Sous-titre' },
              { type: 'string', name: 'title', label: 'Titre principal' },
              { type: 'string', name: 'tagline', label: 'Accroche', ui: { component: 'textarea' } },
              { type: 'string', name: 'cta', label: 'Bouton (texte)' },
            ],
          },
          {
            type: 'object',
            name: 'domaine',
            label: 'Le Domaine',
            fields: [
              { type: 'string', name: 'label', label: 'Label section' },
              { type: 'string', name: 'title', label: 'Titre' },
              { type: 'string', name: 'paragraphs', label: 'Paragraphes', list: true, ui: { component: 'textarea' } },
            ],
          },
          {
            type: 'object',
            name: 'spa',
            label: 'Spa & Bien-être',
            fields: [
              { type: 'string', name: 'label', label: 'Label section' },
              { type: 'string', name: 'title', label: 'Titre' },
              { type: 'string', name: 'paragraphs', label: 'Paragraphes', list: true, ui: { component: 'textarea' } },
              {
                type: 'object',
                name: 'options',
                label: 'Options bien-être',
                list: true,
                fields: [
                  { type: 'string', name: 'name', label: 'Nom' },
                  { type: 'string', name: 'description', label: 'Description' },
                  { type: 'string', name: 'price', label: 'Tarif' },
                ],
              },
            ],
          },
          {
            type: 'object',
            name: 'atelier',
            label: 'Atelier & Galerie',
            fields: [
              { type: 'string', name: 'label', label: 'Label section' },
              { type: 'string', name: 'title', label: 'Titre' },
              { type: 'string', name: 'intro', label: 'Introduction', ui: { component: 'textarea' } },
              { type: 'string', name: 'galleryText', label: 'Texte galerie', list: true, ui: { component: 'textarea' } },
              { type: 'string', name: 'decoTitle', label: 'Titre déco' },
              { type: 'string', name: 'decoDescription', label: 'Description déco' },
            ],
          },
          {
            type: 'object',
            name: 'stages',
            label: 'Stages de céramique',
            fields: [
              { type: 'string', name: 'label', label: 'Label section' },
              { type: 'string', name: 'title', label: 'Titre' },
              { type: 'string', name: 'description', label: 'Description', ui: { component: 'textarea' } },
              {
                type: 'object',
                name: 'formulas',
                label: 'Formules',
                list: true,
                fields: [
                  { type: 'string', name: 'name', label: 'Nom' },
                  { type: 'string', name: 'hours', label: 'Horaires' },
                  { type: 'string', name: 'price', label: 'Prix' },
                  { type: 'string', name: 'note', label: 'Note' },
                ],
              },
            ],
          },
          {
            type: 'object',
            name: 'reviews',
            label: 'Avis clients',
            fields: [
              { type: 'string', name: 'label', label: 'Label section' },
              { type: 'string', name: 'title', label: 'Titre' },
              { type: 'string', name: 'subtitle', label: 'Sous-titre' },
              {
                type: 'object',
                name: 'items',
                label: 'Avis',
                list: true,
                fields: [
                  { type: 'string', name: 'text', label: 'Texte', ui: { component: 'textarea' } },
                  { type: 'string', name: 'author', label: 'Auteur' },
                  { type: 'number', name: 'rating', label: 'Note (1-5)' },
                ],
              },
            ],
          },
          {
            type: 'object',
            name: 'contact',
            label: 'Contact',
            fields: [
              { type: 'string', name: 'label', label: 'Label section' },
              { type: 'string', name: 'title', label: 'Titre' },
              { type: 'string', name: 'intro', label: 'Introduction', ui: { component: 'textarea' } },
              { type: 'string', name: 'address', label: 'Adresse (lignes)', list: true },
              { type: 'string', name: 'phone', label: 'Téléphone' },
              { type: 'string', name: 'email', label: 'Email' },
              { type: 'string', name: 'facebook', label: 'Lien Facebook' },
            ],
          },
          {
            type: 'object',
            name: 'location',
            label: 'Localisation',
            fields: [
              { type: 'string', name: 'label', label: 'Label section' },
              { type: 'string', name: 'title', label: 'Titre' },
              { type: 'string', name: 'address', label: 'Adresse complète', list: true },
              { type: 'string', name: 'nearby', label: 'À proximité', list: true },
            ],
          },
        ],
      },
      {
        name: 'properties',
        label: 'Hébergements',
        path: 'src/content/properties',
        format: 'json',
        fields: [
          { type: 'string', name: 'name', label: 'Nom', required: true },
          { type: 'string', name: 'slug', label: 'Slug (URL)', required: true },
          { type: 'number', name: 'order', label: 'Ordre d\'affichage', required: true },
          { type: 'boolean', name: 'featured', label: 'Mise en avant' },
          { type: 'string', name: 'badge', label: 'Badge (ex: Coup de coeur)' },
          { type: 'string', name: 'capacity', label: 'Capacité', required: true },
          { type: 'string', name: 'description', label: 'Description', required: true, ui: { component: 'textarea' } },
          { type: 'string', name: 'features', label: 'Caractéristiques', list: true },
          { type: 'string', name: 'price', label: 'Prix affiché (ex: 225 €)' },
          { type: 'string', name: 'priceNote', label: 'Note tarifaire' },
          { type: 'image', name: 'image', label: 'Photo principale' },
          {
            type: 'object',
            name: 'icalFeeds',
            label: 'Flux iCal (OTAs)',
            list: true,
            fields: [
              { type: 'string', name: 'platform', label: 'Plateforme (Airbnb, Booking...)' },
              { type: 'string', name: 'url', label: 'URL du flux iCal' },
            ],
          },
          {
            type: 'object',
            name: 'seasonalPricing',
            label: 'Tarifs saisonniers',
            list: true,
            fields: [
              { type: 'string', name: 'label', label: 'Saison (ex: Haute saison)' },
              { type: 'number', name: 'startMonth', label: 'Mois début (1-12)' },
              { type: 'number', name: 'endMonth', label: 'Mois fin (1-12)' },
              { type: 'number', name: 'pricePerNight', label: 'Prix / nuit (€)' },
              { type: 'number', name: 'minNights', label: 'Nuits minimum' },
            ],
          },
        ],
      },
      {
        name: 'extras',
        label: 'Options & Extras',
        path: 'src/content/extras',
        format: 'json',
        fields: [
          { type: 'string', name: 'name', label: 'Nom', required: true },
          { type: 'string', name: 'price', label: 'Prix', required: true },
          { type: 'string', name: 'icon', label: 'Icône', required: true },
          { type: 'number', name: 'order', label: 'Ordre', required: true },
        ],
      },
    ],
  },
});
