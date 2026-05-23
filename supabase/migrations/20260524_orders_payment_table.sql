-- Add payment method, payment status, and table association to orders.
-- Also creates decrement_stock RPC for safe atomic stock management.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS table_number  INTEGER NULL,
  ADD COLUMN IF NOT EXISTS table_slug    TEXT NULL,
  ADD COLUMN IF NOT EXISTS payment_method TEXT NULL
    CHECK (payment_method IN ('cash', 'transfer', 'mercadopago')),
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'refunded'));

-- Decrements product stock safely; never goes below 0.
-- SECURITY DEFINER so it can run with service role permissions.
CREATE OR REPLACE FUNCTION decrement_stock(p_product_id UUID, p_qty INTEGER)
RETURNS VOID LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE products
  SET stock = GREATEST(0, stock - p_qty)
  WHERE id = p_product_id;
$$;
