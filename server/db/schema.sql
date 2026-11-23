-- BookIt database schema (PostgreSQL)
CREATE TABLE IF NOT EXISTS services (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  duration    INTEGER NOT NULL CHECK (duration > 0), -- minutes
  price       NUMERIC(10, 2) NOT NULL CHECK (price >= 0)
);

CREATE TABLE IF NOT EXISTS bookings (
  id             TEXT PRIMARY KEY,
  service_id     TEXT NOT NULL REFERENCES services(id),
  customer_name  TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  start_at       TIMESTAMPTZ NOT NULL,
  end_at         TIMESTAMPTZ NOT NULL,
  status         TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS bookings_start_idx ON bookings (start_at);

INSERT INTO services (id, name, duration, price) VALUES
  ('haircut', 'Haircut', 30, 60),
  ('beard', 'Beard trim', 20, 35),
  ('massage', 'Relax massage', 60, 150),
  ('consult', 'Style consultation', 45, 90)
ON CONFLICT (id) DO NOTHING;
