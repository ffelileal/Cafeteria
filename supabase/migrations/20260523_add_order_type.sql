ALTER TABLE orders
ADD COLUMN order_type TEXT NOT NULL DEFAULT 'menu'
CHECK (order_type IN ('menu', 'store'));

CREATE INDEX IF NOT EXISTS idx_orders_order_type ON orders(order_type);
