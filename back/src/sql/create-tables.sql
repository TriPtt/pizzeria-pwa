DROP TABLE IF EXISTS order_item_customizations CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS product_supplements CASCADE;
DROP TABLE IF EXISTS product_ingredients CASCADE;
DROP TABLE IF EXISTS ingredients CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS wishlists CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'client',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(6,2) NOT NULL,
  type TEXT CHECK (type IN ('pizza','boisson','dessert')) NOT NULL,
  image TEXT,
  available BOOLEAN DEFAULT TRUE,
  vegetarian BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ingredients
CREATE TABLE ingredients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('base', 'supplement')) NOT NULL,
  price NUMERIC(4,2) DEFAULT 0.00,
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product Ingredients (ingrédients inclus)
CREATE TABLE product_ingredients (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  ingredient_id INTEGER REFERENCES ingredients(id) ON DELETE CASCADE,
  removable BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, ingredient_id)
);

-- Product Supplements (suppléments disponibles)
CREATE TABLE product_supplements (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  ingredient_id INTEGER REFERENCES ingredients(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, ingredient_id)
);

-- Orders
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  total_price NUMERIC(6,2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items (avec prix)
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  base_price NUMERIC(6,2) NOT NULL, -- Prix de base du produit
  unit_price NUMERIC(6,2) NOT NULL, -- Prix unitaire avec customisations
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Item Customizations
CREATE TABLE order_item_customizations (
  id SERIAL PRIMARY KEY,
  order_item_id INTEGER REFERENCES order_items(id) ON DELETE CASCADE,
  ingredient_id INTEGER REFERENCES ingredients(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('supplement', 'removed')) NOT NULL,
  price NUMERIC(4,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reservations
CREATE TABLE reservations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  reservation_date TIMESTAMP NOT NULL,
  number_of_guests INTEGER NOT NULL CHECK (number_of_guests > 0),
  status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wishlists
CREATE TABLE wishlists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE (user_id, product_id)
);

-- Fonctions et Triggers
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_reservations_updated_at BEFORE UPDATE ON reservations FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_wishlists_updated_at BEFORE UPDATE ON wishlists FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Index pour les performances
CREATE INDEX idx_product_ingredients_product ON product_ingredients(product_id);
CREATE INDEX idx_product_supplements_product ON product_supplements(product_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_customizations_item ON order_item_customizations(order_item_id);
CREATE INDEX idx_wishlist_user ON wishlists(user_id);
CREATE INDEX idx_wishlist_product ON wishlists(product_id);
