// SQLite query to be used with Get-Content
SELECT 
  COUNT(*) as total,
  (SELECT COUNT(*) FROM Article WHERE category = 'Daur Ulang') as daur_ulang,
  (SELECT COUNT(*) FROM Article WHERE category = 'Pengomposan') as pengomposan,
  (SELECT COUNT(*) FROM Article WHERE category = 'Pengelolaan Plastik') as pengelolaan_plastik,
  (SELECT COUNT(*) FROM Article WHERE category = 'Zero Waste') as zero_waste,
  (SELECT COUNT(*) FROM Article WHERE category = 'Teknologi') as teknologi
FROM Article;
