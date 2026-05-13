-- Autenticazione admin (database dedicato al servizio auth).
-- L'utente applicativo `assezero` viene creato in 01_schema_and_seed.sql: qui si aggiungono solo i permessi sul nuovo schema.

CREATE DATABASE IF NOT EXISTS auth_svc CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON auth_svc.* TO 'assezero'@'%';
FLUSH PRIVILEGES;

USE auth_svc;

CREATE TABLE IF NOT EXISTS admins (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admins_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
