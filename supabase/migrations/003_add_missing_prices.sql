-- Add base prices for properties that were missing them
UPDATE properties SET base_price_cents = 18000 WHERE id = 'nuit-insolite';
UPDATE properties SET base_price_cents = 19000 WHERE id = 'suite-nordique';
UPDATE properties SET base_price_cents = 20000 WHERE id = 'larguez-amarres';
UPDATE properties SET base_price_cents = 12000 WHERE id = 'chambres-hotes';

-- Add seasonal pricing for Une Nuit Insolite
INSERT INTO seasonal_pricing (property_id, label, start_month, end_month, price_per_night_cents, min_nights) VALUES
  ('nuit-insolite', 'Basse saison', 11, 3, 18000, 1),
  ('nuit-insolite', 'Moyenne saison', 4, 6, 20000, 2),
  ('nuit-insolite', 'Haute saison', 7, 10, 23000, 2);

-- Add seasonal pricing for La Suite Nordique
INSERT INTO seasonal_pricing (property_id, label, start_month, end_month, price_per_night_cents, min_nights) VALUES
  ('suite-nordique', 'Basse saison', 11, 3, 19000, 1),
  ('suite-nordique', 'Moyenne saison', 4, 6, 22000, 2),
  ('suite-nordique', 'Haute saison', 7, 10, 25000, 2);

-- Add seasonal pricing for Larguez les Amarres
INSERT INTO seasonal_pricing (property_id, label, start_month, end_month, price_per_night_cents, min_nights) VALUES
  ('larguez-amarres', 'Basse saison', 11, 3, 20000, 1),
  ('larguez-amarres', 'Moyenne saison', 4, 6, 24000, 2),
  ('larguez-amarres', 'Haute saison', 7, 10, 27000, 2);

-- Add seasonal pricing for Les Chambres d'Hôtes
INSERT INTO seasonal_pricing (property_id, label, start_month, end_month, price_per_night_cents, min_nights) VALUES
  ('chambres-hotes', 'Basse saison', 11, 3, 12000, 1),
  ('chambres-hotes', 'Moyenne saison', 4, 6, 14000, 1),
  ('chambres-hotes', 'Haute saison', 7, 10, 16000, 2);
