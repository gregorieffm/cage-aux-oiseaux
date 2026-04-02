import type { APIRoute } from 'astro';

const cmsConfig = {
  local_backend: true,
  backend: { name: 'github', repo: 'gregorieffm/cage-aux-oiseaux', branch: 'main' },
  media_folder: 'public/images',
  public_folder: '/images',
  collections: [
    {
      name: 'site-content', label: 'Contenu du site',
      files: [{
        name: 'site-content', label: 'Textes du site', file: 'src/content/sections/site-content.json',
        fields: [
          { label: 'Accueil (Hero)', name: 'hero', widget: 'object', fields: [
            { label: 'Sous-titre', name: 'subtitle', widget: 'string' },
            { label: 'Titre principal', name: 'title', widget: 'string' },
            { label: 'Accroche', name: 'tagline', widget: 'text' },
            { label: 'Bouton (texte)', name: 'cta', widget: 'string' },
          ]},
          { label: 'Le Domaine', name: 'domaine', widget: 'object', fields: [
            { label: 'Label', name: 'label', widget: 'string' },
            { label: 'Titre', name: 'title', widget: 'string' },
            { label: 'Paragraphes', name: 'paragraphs', widget: 'list', field: { label: 'Paragraphe', name: 'paragraph', widget: 'text' } },
          ]},
          { label: 'Spa & Bien-être', name: 'spa', widget: 'object', fields: [
            { label: 'Label', name: 'label', widget: 'string' },
            { label: 'Titre', name: 'title', widget: 'string' },
            { label: 'Paragraphes', name: 'paragraphs', widget: 'list', field: { label: 'Paragraphe', name: 'paragraph', widget: 'text' } },
            { label: 'Options', name: 'options', widget: 'list', fields: [
              { label: 'Nom', name: 'name', widget: 'string' },
              { label: 'Description', name: 'description', widget: 'string' },
              { label: 'Tarif', name: 'price', widget: 'string', required: false },
            ]},
          ]},
          { label: 'Atelier & Galerie', name: 'atelier', widget: 'object', fields: [
            { label: 'Label', name: 'label', widget: 'string' },
            { label: 'Titre', name: 'title', widget: 'string' },
            { label: 'Introduction', name: 'intro', widget: 'text' },
            { label: 'Texte galerie', name: 'galleryText', widget: 'list', field: { label: 'Paragraphe', name: 'paragraph', widget: 'text' } },
            { label: 'Titre déco', name: 'decoTitle', widget: 'string' },
            { label: 'Description déco', name: 'decoDescription', widget: 'string' },
          ]},
          { label: 'Stages de céramique', name: 'stages', widget: 'object', fields: [
            { label: 'Label', name: 'label', widget: 'string' },
            { label: 'Titre', name: 'title', widget: 'string' },
            { label: 'Description', name: 'description', widget: 'text' },
            { label: 'Formules', name: 'formulas', widget: 'list', fields: [
              { label: 'Nom', name: 'name', widget: 'string' },
              { label: 'Horaires', name: 'hours', widget: 'string' },
              { label: 'Prix', name: 'price', widget: 'string' },
              { label: 'Note', name: 'note', widget: 'string' },
            ]},
          ]},
          { label: 'Avis clients', name: 'reviews', widget: 'object', fields: [
            { label: 'Label', name: 'label', widget: 'string' },
            { label: 'Titre', name: 'title', widget: 'string' },
            { label: 'Sous-titre', name: 'subtitle', widget: 'string' },
            { label: 'Avis', name: 'items', widget: 'list', fields: [
              { label: 'Texte', name: 'text', widget: 'text' },
              { label: 'Auteur', name: 'author', widget: 'string' },
              { label: 'Note (1-5)', name: 'rating', widget: 'number', value_type: 'int', min: 1, max: 5 },
            ]},
          ]},
          { label: 'Contact', name: 'contact', widget: 'object', fields: [
            { label: 'Label', name: 'label', widget: 'string' },
            { label: 'Titre', name: 'title', widget: 'string' },
            { label: 'Introduction', name: 'intro', widget: 'text' },
            { label: 'Adresse', name: 'address', widget: 'list', field: { label: 'Ligne', name: 'line', widget: 'string' } },
            { label: 'Téléphone', name: 'phone', widget: 'string', required: false },
            { label: 'Email', name: 'email', widget: 'string', required: false },
            { label: 'Lien Facebook', name: 'facebook', widget: 'string', required: false },
          ]},
          { label: 'Localisation', name: 'location', widget: 'object', fields: [
            { label: 'Label', name: 'label', widget: 'string' },
            { label: 'Titre', name: 'title', widget: 'string' },
            { label: 'Adresse', name: 'address', widget: 'list', field: { label: 'Ligne', name: 'line', widget: 'string' } },
            { label: 'À proximité', name: 'nearby', widget: 'list', field: { label: 'Lieu', name: 'place', widget: 'string' } },
          ]},
        ],
      }],
    },
    {
      name: 'properties', label: 'Hébergements', folder: 'src/content/properties', format: 'json', create: true, slug: '{{slug}}',
      fields: [
        { label: 'Nom', name: 'name', widget: 'string' },
        { label: 'Slug (URL)', name: 'slug', widget: 'string' },
        { label: "Ordre d'affichage", name: 'order', widget: 'number', value_type: 'int' },
        { label: 'Mise en avant', name: 'featured', widget: 'boolean', default: false },
        { label: 'Badge', name: 'badge', widget: 'string', required: false },
        { label: 'Capacité', name: 'capacity', widget: 'string' },
        { label: 'Description', name: 'description', widget: 'text' },
        { label: 'Caractéristiques', name: 'features', widget: 'list', field: { label: 'Feature', name: 'feature', widget: 'string' } },
        { label: 'Prix affiché', name: 'price', widget: 'string', required: false },
        { label: 'Photo', name: 'image', widget: 'image', required: false },
        { label: 'Flux iCal', name: 'icalFeeds', widget: 'list', fields: [
          { label: 'Plateforme', name: 'platform', widget: 'string' },
          { label: 'URL iCal', name: 'url', widget: 'string' },
        ]},
        { label: 'Tarifs saisonniers', name: 'seasonalPricing', widget: 'list', fields: [
          { label: 'Saison', name: 'label', widget: 'string' },
          { label: 'Mois début (1-12)', name: 'startMonth', widget: 'number', value_type: 'int', min: 1, max: 12 },
          { label: 'Mois fin (1-12)', name: 'endMonth', widget: 'number', value_type: 'int', min: 1, max: 12 },
          { label: 'Prix / nuit (€)', name: 'pricePerNight', widget: 'number', value_type: 'int' },
          { label: 'Nuits minimum', name: 'minNights', widget: 'number', value_type: 'int', default: 1 },
        ]},
      ],
    },
    {
      name: 'extras', label: 'Options & Extras', folder: 'src/content/extras', format: 'json', create: true, slug: '{{slug}}',
      fields: [
        { label: 'Nom', name: 'name', widget: 'string' },
        { label: 'Prix', name: 'price', widget: 'string' },
        { label: 'Icône', name: 'icon', widget: 'string' },
        { label: 'Ordre', name: 'order', widget: 'number', value_type: 'int' },
      ],
    },
  ],
};

export const GET: APIRoute = () => {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex" />
  <title>CMS — La Cage aux Oiseaux</title>
</head>
<body>
  <script src="https://unpkg.com/decap-cms@%5E3.0.0/dist/decap-cms.js"></script>
  <script>
    CMS.init({ config: ${JSON.stringify(cmsConfig)} });
  </script>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
};
