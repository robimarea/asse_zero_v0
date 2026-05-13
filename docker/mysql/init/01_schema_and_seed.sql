-- Schema + dati iniziali (eseguito solo al primo avvio del volume MySQL).
-- Due database separati per allinearsi ai due microservizi (database-per-service, stesso server).

CREATE DATABASE IF NOT EXISTS photos_svc CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS videos_svc CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'assezero'@'%' IDENTIFIED BY 'appsecret';
GRANT ALL PRIVILEGES ON photos_svc.* TO 'assezero'@'%';
GRANT ALL PRIVILEGES ON videos_svc.* TO 'assezero'@'%';
FLUSH PRIVILEGES;

USE photos_svc;

CREATE TABLE IF NOT EXISTS photos (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(512) NOT NULL,
  category VARCHAR(128) NOT NULL,
  date_label VARCHAR(64) NOT NULL,
  src VARCHAR(1024) NOT NULL,
  description TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_photos_sort (sort_order, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO photos (title, category, date_label, src, description, sort_order) VALUES
('Campagna Autunnale', 'Pubblicità', 'Gennaio 2026', '/photos/1.webp', 'Una campagna visiva autunnale per brand identity, giocata su luce calda e ombre cinematografiche.', 0),
('Brand Identity Shoot', 'Pubblicità', 'Dicembre 2025', '/photos/2.webp', 'Ritratti editoriali in studio per campagna di lancio prodotto.', 1),
('Luce di Mezzogiorno', 'Cortometraggio', 'Novembre 2025', '/photos/3.webp', 'Still dal set del cortometraggio. Luce naturale, emotività pura.', 2),
('Il Confine', 'Cortometraggio', 'Ottobre 2025', '/photos/4.webp', 'Frame emblematico del confine psicologico del personaggio principale.', 3),
('Neon Nights', 'Video Musicale', 'Settembre 2025', '/photos/5.webp', 'Set fotografico notturno per videoclip. Luce artificiale al neon su pelle.', 4),
('Scena Finale', 'Cortometraggio', 'Agosto 2025', '/photos/1.webp', 'L''ultima inquadratura del film: silenzio, nostalgia e luce di taglio.', 5);

USE videos_svc;

CREATE TABLE IF NOT EXISTS videos (
  id INT UNSIGNED NOT NULL,
  label VARCHAR(512) NOT NULL,
  date_label VARCHAR(64) NOT NULL,
  url VARCHAR(2048) NOT NULL,
  description TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_videos_sort (sort_order, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO videos (id, label, date_label, url, description, sort_order) VALUES
(1, 'VIDEO CREATIVO 1', 'Gennaio 2026', 'https://www.instagram.com/reel/DOa-1TnDNvi/', 'Un''esplorazione visiva tra architettura e movimento, catturata con estetica minimale.', 0),
(2, 'VIDEO CREATIVO 2', 'Gennaio 2026', 'https://www.instagram.com/reel/EXAMPLE2/', 'Sound design immersivo e dinamiche veloci per raccontare l''energia urbana.', 1),
(3, 'VIDEO CREATIVO 3', 'Dicembre 2025', 'https://www.instagram.com/reel/EXAMPLE3/', 'Studio sulla luce naturale e riflessi in un ambiente industriale dismesso.', 2),
(4, 'VIDEO CREATIVO 4', 'Dicembre 2025', 'https://www.instagram.com/reel/EXAMPLE4/', 'Frammenti di vita quotidiana rielaborati in chiave sognante e cinematografica.', 3),
(5, 'VIDEO CREATIVO 5', 'Novembre 2025', 'https://www.instagram.com/reel/EXAMPLE5/', 'Texture organiche e macro-riprese per un''esperienza visiva tattile.', 4),
(6, 'VIDEO CREATIVO 6', 'Novembre 2025', 'https://www.instagram.com/reel/EXAMPLE6/', 'Un viaggio notturno attraverso le luci della città e il ritmo del battito urbano.', 5),
(7, 'VIDEO CREATIVO 7', 'Ottobre 2025', 'https://www.instagram.com/reel/EXAMPLE7/', 'Contrasti netti e bianco e nero per un''estetica noir contemporanea.', 6),
(8, 'VIDEO CREATIVO 8', 'Ottobre 2025', 'https://www.instagram.com/reel/EXAMPLE8/', 'La natura incontra il digitale in un montaggio sperimentale e psichedelico.', 7);
