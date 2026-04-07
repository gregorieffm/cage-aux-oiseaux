-- Add gîtes as properties
INSERT INTO properties (id, name, slug, capacity, base_price_cents, min_nights) VALUES
  ('maison-de-coco', 'La Maison de Coco', 'maison-de-coco', 8, 13100, 2),
  ('loft-de-coco', 'Le Loft de Coco', 'loft-de-coco', 6, 0, 2),
  ('valcoco', 'ValCoco', 'valcoco', 6, 0, 2),
  ('chez-coco', 'Chez Coco', 'chez-coco', 2, 5000, 1);

-- Add seasonal pricing for La Maison de Coco
INSERT INTO seasonal_pricing (property_id, label, start_month, end_month, price_per_night_cents, min_nights) VALUES
  ('maison-de-coco', 'Toute l''année', 1, 12, 13100, 2);

-- Add seasonal pricing for Chez Coco
INSERT INTO seasonal_pricing (property_id, label, start_month, end_month, price_per_night_cents, min_nights) VALUES
  ('chez-coco', 'Toute l''année', 1, 12, 5000, 1);
