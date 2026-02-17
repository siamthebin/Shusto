-- Pharmacies table
CREATE TABLE IF NOT EXISTS pharmacies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  license_number VARCHAR(100),
  owner_name VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Labs table  
CREATE TABLE IF NOT EXISTS labs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  license_number VARCHAR(100),
  owner_name VARCHAR(255),
  services TEXT[], -- Array of services offered
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pharmacy orders table (for medicine orders)
CREATE TABLE IF NOT EXISTS pharmacy_orders (
  id SERIAL PRIMARY KEY,
  pharmacy_id INTEGER REFERENCES pharmacies(id),
  order_id INTEGER,
  customer_name VARCHAR(255),
  customer_phone VARCHAR(20),
  items JSONB,
  total_amount DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lab test orders table
CREATE TABLE IF NOT EXISTS lab_orders (
  id SERIAL PRIMARY KEY,
  lab_id INTEGER REFERENCES labs(id),
  patient_name VARCHAR(255),
  patient_phone VARCHAR(20),
  tests JSONB,
  total_amount DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'pending',
  report_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
