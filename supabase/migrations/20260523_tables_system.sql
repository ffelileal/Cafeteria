-- ── Tables ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tables (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number  INTEGER      NOT NULL UNIQUE,
  name          TEXT         NOT NULL,
  capacity      INTEGER      NOT NULL CHECK (capacity IN (2, 4, 6)),
  sector        TEXT         NOT NULL CHECK (sector IN ('Terraza', 'Interior', 'Ventana', 'VIP')),
  qr_slug       TEXT         NOT NULL UNIQUE,
  status        TEXT         NOT NULL DEFAULT 'available'
                             CHECK (status IN ('available', 'reserved', 'occupied')),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Table reservations ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS table_reservations (
  id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id          UUID         NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
  customer_name     TEXT         NOT NULL,
  customer_phone    TEXT         NOT NULL,
  customer_email    TEXT         NOT NULL,
  reservation_date  TIMESTAMPTZ  NOT NULL,
  people_count      INTEGER      NOT NULL CHECK (people_count > 0),
  notes             TEXT,
  status            TEXT         NOT NULL DEFAULT 'pending'
                                 CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_tables_status       ON tables(status);
CREATE INDEX IF NOT EXISTS idx_tables_sector       ON tables(sector);
CREATE INDEX IF NOT EXISTS idx_tables_qr_slug      ON tables(qr_slug);
CREATE INDEX IF NOT EXISTS idx_table_res_table_id  ON table_reservations(table_id);
CREATE INDEX IF NOT EXISTS idx_table_res_date      ON table_reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_table_res_status    ON table_reservations(status);

-- ── Triggers (reuse existing function) ───────────────────────────────────────

CREATE TRIGGER trg_tables_updated_at
  BEFORE UPDATE ON tables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_table_reservations_updated_at
  BEFORE UPDATE ON table_reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
